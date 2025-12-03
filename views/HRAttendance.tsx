import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Attendance, Shift } from '../types';
import {
  Clock,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  X,
  MapPin
} from 'lucide-react';

const HRAttendance: React.FC = () => {
  const {
    attendances,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    shifts,
    addShift,
    updateShift,
    deleteShift,
    employees,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Form state for attendance
  const [newAttendance, setNewAttendance] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present' as const,
    notes: '',
    location: ''
  });

  // Form state for shift
  const [newShift, setNewShift] = useState({
    employeeId: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    type: 'morning' as const,
    location: '',
    notes: ''
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = attendances.filter(a => a.date === today);

    const present = todayAttendances.filter(a => a.status === 'present').length;
    const absent = todayAttendances.filter(a => a.status === 'absent').length;
    const late = todayAttendances.filter(a => a.status === 'late').length;
    const onLeave = todayAttendances.filter(a => a.status === 'on_leave').length;

    const totalEmployees = employees.filter(e => e.status === 'active').length;
    const attendanceRate = totalEmployees > 0 ? (present / totalEmployees) * 100 : 0;

    // Calculate average hours for the filtered date
    const dateAttendances = attendances.filter(a => a.date === filterDate && a.checkIn && a.checkOut);
    let totalHours = 0;
    dateAttendances.forEach(a => {
      if (a.checkIn && a.checkOut) {
        const checkIn = new Date(`${a.date}T${a.checkIn}`);
        const checkOut = new Date(`${a.date}T${a.checkOut}`);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });
    const avgHours = dateAttendances.length > 0 ? totalHours / dateAttendances.length : 0;

    return { present, absent, late, onLeave, attendanceRate, avgHours };
  }, [attendances, employees, filterDate]);

  // Filter attendances
  const filteredAttendances = useMemo(() => {
    return attendances.filter(attendance => {
      const emp = employees.find(e => e.id === attendance.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';

      const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp?.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || attendance.status === filterStatus;
      const matchesDate = attendance.date === filterDate;

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      const empA = employees.find(e => e.id === a.employeeId);
      const empB = employees.find(e => e.id === b.employeeId);
      return (empA?.firstName || '').localeCompare(empB?.firstName || '');
    });
  }, [attendances, employees, searchTerm, filterStatus, filterDate]);

  // Filter shifts
  const filteredShifts = useMemo(() => {
    const allShifts = shifts || [];
    const allEmployees = employees || [];
    return allShifts.filter(shift => {
      const emp = allEmployees.find(e => e.id === shift.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';

      const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shift.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = shift.date === filterDate;

      return matchesSearch && matchesDate;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [shifts, employees, searchTerm, filterDate]);

  // Calculate work hours
  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Handle create/update attendance
  const handleSaveAttendance = () => {
    if (!newAttendance.employeeId || !newAttendance.date) {
      alert('Veuillez renseigner l\'employé et la date');
      return;
    }

    const emp = employees.find(e => e.id === newAttendance.employeeId);
    if (!emp) return;

    const hours = calculateHours(newAttendance.checkIn, newAttendance.checkOut);

    if (editingAttendance) {
      updateAttendance({
        ...editingAttendance,
        ...newAttendance,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeMatricule: emp.matricule,
        hoursWorked: hours
      });
    } else {
      const attendance: Attendance = {
        id: `att-${Date.now()}`,
        employeeId: newAttendance.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeMatricule: emp.matricule,
        date: newAttendance.date,
        checkIn: newAttendance.checkIn || undefined,
        checkOut: newAttendance.checkOut || undefined,
        status: newAttendance.status,
        hoursWorked: hours,
        overtime: Math.max(0, hours - 8),
        notes: newAttendance.notes || undefined,
        location: newAttendance.location || undefined
      };
      addAttendance(attendance);
    }

    setShowCreateModal(false);
    setEditingAttendance(null);
    setNewAttendance({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: '',
      location: ''
    });
  };

  // Handle create/update shift
  const handleSaveShift = () => {
    if (!newShift.employeeId || !newShift.date || !newShift.name) {
      alert('Veuillez renseigner tous les champs obligatoires');
      return;
    }

    const emp = employees.find(e => e.id === newShift.employeeId);
    if (!emp) return;

    if (editingShift) {
      updateShift({
        ...editingShift,
        ...newShift,
        employeeName: `${emp.firstName} ${emp.lastName}`
      });
    } else {
      const shift: Shift = {
        id: `shift-${Date.now()}`,
        employeeId: newShift.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        name: newShift.name,
        date: newShift.date,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        type: newShift.type,
        location: newShift.location || undefined,
        notes: newShift.notes || undefined
      };
      addShift(shift);
    }

    setShowShiftModal(false);
    setEditingShift(null);
    setNewShift({
      employeeId: '',
      name: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      type: 'morning',
      location: '',
      notes: ''
    });
  };

  // Handle edit attendance
  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setNewAttendance({
      employeeId: attendance.employeeId,
      date: attendance.date,
      checkIn: attendance.checkIn || '',
      checkOut: attendance.checkOut || '',
      status: attendance.status,
      notes: attendance.notes || '',
      location: attendance.location || ''
    });
    setShowCreateModal(true);
  };

  // Handle edit shift
  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setNewShift({
      employeeId: shift.employeeId,
      name: shift.name,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.type,
      location: shift.location || '',
      notes: shift.notes || ''
    });
    setShowShiftModal(true);
  };

  // Handle delete
  const handleDeleteAttendance = (id: string) => {
    if (confirm('Supprimer ce pointage ?')) {
      deleteAttendance(id);
    }
  };

  const handleDeleteShift = (id: string) => {
    if (confirm('Supprimer cette vacation ?')) {
      deleteShift(id);
    }
  };

  // Get status badge
  const getStatusBadge = (status: Attendance['status']) => {
    const badges = {
      present: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Présent' },
      absent: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Absent' },
      late: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Retard' },
      on_leave: { color: 'bg-blue-100 text-blue-700', icon: Calendar, label: 'En Congé' },
      remote: { color: 'bg-purple-100 text-purple-700', icon: MapPin, label: 'Télétravail' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Get shift type badge
  const getShiftTypeBadge = (type: Shift['type']) => {
    const badges = {
      morning: { color: 'bg-yellow-100 text-yellow-700', label: 'Matin' },
      afternoon: { color: 'bg-orange-100 text-orange-700', label: 'Après-midi' },
      night: { color: 'bg-indigo-100 text-indigo-700', label: 'Nuit' },
      full_day: { color: 'bg-green-100 text-green-700', label: 'Journée' }
    };
    const badge = badges[type];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Temps & Présence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestion des pointages et vacations
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'attendance') {
              setShowCreateModal(true);
            } else {
              setShowShiftModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'attendance' ? 'Nouveau Pointage' : 'Nouvelle Vacation'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Présents</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.present}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Absents</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.absent}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Retards</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.late}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Congé</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.onLeave}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux Présence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.attendanceRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Heures Moy.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.avgHours.toFixed(1)}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pointages
            </div>
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'shifts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Vacations
            </div>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {activeTab === 'attendance' && (
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="late">Retard</option>
                <option value="on_leave">En Congé</option>
                <option value="remote">Télétravail</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'attendance' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entrée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sortie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.employeeMatricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {attendance.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.checkIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {attendance.hoursWorked?.toFixed(2) || '-'}h
                      {attendance.overtime && attendance.overtime > 0 && (
                        <span className="ml-1 text-xs text-orange-600">
                          (+{attendance.overtime.toFixed(1)}h sup.)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(attendance.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditAttendance(attendance)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(attendance.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAttendances.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun pointage</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Aucun pointage pour cette date.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vacation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Horaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {shift.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {shift.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {shift.startTime} - {shift.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getShiftTypeBadge(shift.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {shift.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditShift(shift)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredShifts.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune vacation</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Aucune vacation planifiée pour cette date.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Attendance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAttendance ? 'Modifier Pointage' : 'Nouveau Pointage'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAttendance(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employé *
                  </label>
                  <select
                    value={newAttendance.employeeId}
                    onChange={(e) => setNewAttendance({ ...newAttendance, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={!!editingAttendance}
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.matricule} - {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newAttendance.date}
                    onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure d'Entrée
                    </label>
                    <input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => setNewAttendance({ ...newAttendance, checkIn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure de Sortie
                    </label>
                    <input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) => setNewAttendance({ ...newAttendance, checkOut: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut *
                  </label>
                  <select
                    value={newAttendance.status}
                    onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="present">Présent</option>
                    <option value="absent">Absent</option>
                    <option value="late">Retard</option>
                    <option value="on_leave">En Congé</option>
                    <option value="remote">Télétravail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={newAttendance.location}
                    onChange={(e) => setNewAttendance({ ...newAttendance, location: e.target.value })}
                    placeholder="Bureau, Site client, Domicile..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newAttendance.notes}
                    onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAttendance(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAttendance ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingShift ? 'Modifier Vacation' : 'Nouvelle Vacation'}
                </h2>
                <button
                  onClick={() => {
                    setShowShiftModal(false);
                    setEditingShift(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employé *
                  </label>
                  <select
                    value={newShift.employeeId}
                    onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de la Vacation *
                  </label>
                  <input
                    type="text"
                    value={newShift.name}
                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                    placeholder="Service Client, Garde, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure Début *
                    </label>
                    <input
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure Fin *
                    </label>
                    <input
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={newShift.type}
                    onChange={(e) => setNewShift({ ...newShift, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="morning">Matin</option>
                    <option value="afternoon">Après-midi</option>
                    <option value="night">Nuit</option>
                    <option value="full_day">Journée Complète</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={newShift.location}
                    onChange={(e) => setNewShift({ ...newShift, location: e.target.value })}
                    placeholder="Bureau principal, Succursale..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newShift.notes}
                    onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowShiftModal(false);
                    setEditingShift(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveShift}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingShift ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAttendance;

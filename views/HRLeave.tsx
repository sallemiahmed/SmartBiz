
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar, Plus, Search, CheckCircle, XCircle, Clock, AlertTriangle,
  Eye, ThumbsUp, ThumbsDown, Filter, Users
} from 'lucide-react';
import { LeaveRequest } from '../types';

const HRLeave: React.FC = () => {
  const {
    leaves, employees, addLeaveRequest, updateLeaveRequest,
    leavePolicies, formatCurrency, t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    employeeId: '',
    employeeName: '',
    type: 'Paid Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    status: 'pending',
    reason: ''
  });

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchesSearch =
        leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || leave.type === filterType;
      const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaves, searchTerm, filterType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    // Total days approved
    const totalDaysApproved = leaves
      .filter(l => l.status === 'approved')
      .reduce((sum, l) => sum + l.days, 0);

    return { total, pending, approved, rejected, totalDaysApproved };
  }, [leaves]);

  // Calculate leave balance per employee
  const employeeBalances = useMemo(() => {
    return employees
      .filter(emp => emp.status === 'active')
      .map(emp => {
        // Calculate working days since hire date
        const hireDate = new Date(emp.hireDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - hireDate.getTime());
        const workingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Days accrued: Working days × 1.25
        const daysAccrued = Math.floor(workingDays * 1.25);

        // Days taken (approved leaves only)
        const daysTaken = leaves
          .filter(l => l.employeeId === emp.id && l.status === 'approved')
          .reduce((sum, l) => sum + l.days, 0);

        // Days remaining
        const daysRemaining = daysAccrued - daysTaken;

        return {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          workingDays,
          daysAccrued,
          daysTaken,
          daysRemaining
        };
      })
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [employees, leaves]);

  // Calculate days between dates
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleAddNew = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      type: 'Paid Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      days: 1,
      status: 'pending',
      reason: ''
    });
    setSelectedLeave(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleView = (leave: LeaveRequest) => {
    alert(`Détails congé:\nEmployé: ${leave.employeeName}\nType: ${leave.type}\nDates: ${new Date(leave.startDate).toLocaleDateString('fr-FR')} - ${new Date(leave.endDate).toLocaleDateString('fr-FR')}\nDurée: ${leave.days} jour(s)\nMotif: ${leave.reason || 'N/A'}\nStatut: ${leave.status}`);
  };

  const handleApprove = (leave: LeaveRequest) => {
    if (confirm(`Approuver la demande de congé de ${leave.employeeName} ?`)) {
      updateLeaveRequest({ ...leave, status: 'approved' });
    }
  };

  const handleReject = (leave: LeaveRequest) => {
    const reason = prompt(`Motif de refus pour ${leave.employeeName} :`);
    if (reason !== null) {
      updateLeaveRequest({ ...leave, status: 'rejected', reason: reason || leave.reason });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const days = calculateDays(formData.startDate!, formData.endDate!);

    if (isEditing && selectedLeave) {
      updateLeaveRequest({ ...selectedLeave, ...formData, days });
    } else {
      const newLeave: LeaveRequest = {
        id: `l${Date.now()}`,
        ...formData as Required<Omit<LeaveRequest, 'id'>>,
        days
      };
      addLeaveRequest(newLeave);
    }

    setShowModal(false);
    setFormData({});
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const labels = {
      pending: 'En Attente',
      approved: 'Approuvé',
      rejected: 'Refusé'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('leave_management') || 'Gestion des Congés'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredLeaves.length} {t('requests_found') || 'demande(s) trouvée(s)'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('new_request') || 'Nouvelle Demande'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('total') || 'Total'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Calendar className="w-10 h-10 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pending') || 'En Attente'}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('approved') || 'Approuvés'}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('rejected') || 'Refusés'}</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('days_approved') || 'Jours Approuvés'}</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalDaysApproved}</p>
            </div>
            <Calendar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Alert for pending requests */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                {stats.pending} demande(s) de congé en attente d'approbation
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Pensez à traiter les demandes rapidement pour permettre aux employés de planifier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Employee Leave Balances */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                {t('employee_leave_balances') || 'Soldes de Congé des Employés'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Formule : (Jours travaillés × 1,25) - Jours pris
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('employee') || 'Employé'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('department') || 'Département'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('working_days') || 'Jours Travaillés'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('days_accrued') || 'Jours Acquis'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('days_taken') || 'Jours Pris'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('days_remaining') || 'Jours Restants'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {employeeBalances.map((balance) => (
                <tr key={balance.employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {balance.employeeName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {balance.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {balance.workingDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {balance.daysAccrued}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {balance.daysTaken}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${
                      balance.daysRemaining > 10
                        ? 'text-green-600 dark:text-green-400'
                        : balance.daysRemaining > 0
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {balance.daysRemaining}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employeeBalances.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('no_employees') || 'Aucun employé actif'}
            </h3>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_leaves') || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('all_types') || 'Tous les types'}</option>
              <option value="Paid Leave">Congé Payé</option>
              <option value="Sick Leave">Congé Maladie</option>
              <option value="Unpaid">Sans Solde</option>
              <option value="Remote">Télétravail</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('all_status') || 'Tous les statuts'}</option>
              <option value="pending">{t('pending') || 'En Attente'}</option>
              <option value="approved">{t('approved') || 'Approuvé'}</option>
              <option value="rejected">{t('rejected') || 'Refusé'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('employee') || 'Employé'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('type') || 'Type'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('start_date') || 'Date Début'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('end_date') || 'Date Fin'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('days') || 'Jours'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('status') || 'Statut'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {leave.employeeName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">{leave.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {leave.days} {t('days') || 'jours'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(leave.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(leave)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                        title="Voir"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {leave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(leave)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400"
                            title="Approuver"
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(leave)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                            title="Refuser"
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeaves.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('no_leaves') || 'Aucune demande'}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('no_leave_requests_yet') || 'Aucune demande de congé pour le moment'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Add Leave Request */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('new_leave_request') || 'Nouvelle Demande de Congé'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('employee') || 'Employé'} *
                  </label>
                  <select
                    required
                    value={formData.employeeId || ''}
                    onChange={(e) => {
                      const employee = employees.find(emp => emp.id === e.target.value);
                      setFormData({
                        ...formData,
                        employeeId: e.target.value,
                        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('select_employee') || 'Sélectionner un employé...'}</option>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('leave_type') || 'Type de Congé'} *
                  </label>
                  <select
                    required
                    value={formData.type || 'Paid Leave'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveRequest['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Paid Leave">Congé Payé</option>
                    <option value="Sick Leave">Congé Maladie</option>
                    <option value="Unpaid">Sans Solde</option>
                    <option value="Remote">Télétravail</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('start_date') || 'Date Début'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate || ''}
                      onChange={(e) => {
                        const days = formData.endDate ? calculateDays(e.target.value, formData.endDate) : 1;
                        setFormData({ ...formData, startDate: e.target.value, days });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('end_date') || 'Date Fin'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate || ''}
                      onChange={(e) => {
                        const days = formData.startDate ? calculateDays(formData.startDate, e.target.value) : 1;
                        setFormData({ ...formData, endDate: e.target.value, days });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('duration') || 'Durée'}
                  </label>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {formData.days || 1} {t('days') || 'jour(s)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reason') || 'Motif'} (optionnel)
                  </label>
                  <textarea
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Précisez le motif de la demande..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel') || 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {t('submit') || 'Soumettre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRLeave;

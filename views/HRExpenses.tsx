import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseReport } from '../types';
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Camera,
  ThumbsUp,
  ThumbsDown,
  FileText
} from 'lucide-react';

const HRExpenses: React.FC = () => {
  const {
    expenseReports,
    addExpenseReport,
    updateExpenseReport,
    deleteExpenseReport,
    employees,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null);
  const [editingReport, setEditingReport] = useState<ExpenseReport | null>(null);

  // Form state
  const [newReport, setNewReport] = useState({
    employeeId: '',
    title: '',
    category: 'travel' as ExpenseReport['category'],
    amount: 0,
    currency: 'TND',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: ''
  });

  // Expense categories
  const categories = [
    { value: 'travel', label: 'Déplacement', icon: '✈️' },
    { value: 'meal', label: 'Repas', icon: '🍽️' },
    { value: 'accommodation', label: 'Hébergement', icon: '🏨' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'communication', label: 'Communication', icon: '📱' },
    { value: 'supplies', label: 'Fournitures', icon: '📦' },
    { value: 'training', label: 'Formation', icon: '📚' },
    { value: 'other', label: 'Autre', icon: '📄' }
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = expenseReports.length;
    const pending = expenseReports.filter(r => r.status === 'pending').length;
    const approved = expenseReports.filter(r => r.status === 'approved').length;
    const rejected = expenseReports.filter(r => r.status === 'rejected').length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthReports = expenseReports.filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalAmount = monthReports
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);

    const avgAmount = approved > 0
      ? expenseReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0) / approved
      : 0;

    return { total, pending, approved, rejected, totalAmount, avgAmount };
  }, [expenseReports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return expenseReports.filter(report => {
      const emp = employees.find(e => e.id === report.employeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : '';

      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || report.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
  }, [expenseReports, employees, searchTerm, filterStatus, filterCategory]);

  // Generate reference
  const generateReference = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EXP-${year}${month}-${random}`;
  };

  // Handle create/update
  const handleSaveReport = () => {
    if (!newReport.employeeId || !newReport.title || newReport.amount <= 0) {
      alert('Veuillez renseigner tous les champs obligatoires');
      return;
    }

    const emp = employees.find(e => e.id === newReport.employeeId);
    if (!emp) return;

    if (editingReport) {
      updateExpenseReport({
        ...editingReport,
        ...newReport,
        employeeName: `${emp.firstName} ${emp.lastName}`
      });
    } else {
      const report: ExpenseReport = {
        id: `exp-${Date.now()}`,
        reference: generateReference(),
        employeeId: newReport.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        title: newReport.title,
        category: newReport.category,
        amount: newReport.amount,
        currency: newReport.currency,
        date: newReport.date,
        submittedDate: new Date().toISOString(),
        status: 'pending',
        description: newReport.description || undefined,
        receiptUrl: newReport.receiptUrl || undefined
      };
      addExpenseReport(report);
    }

    setShowCreateModal(false);
    setEditingReport(null);
    setNewReport({
      employeeId: '',
      title: '',
      category: 'travel',
      amount: 0,
      currency: 'TND',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptUrl: ''
    });
  };

  // Handle approve
  const handleApprove = (report: ExpenseReport) => {
    if (confirm(`Approuver la note de frais "${report.title}" ?`)) {
      updateExpenseReport({
        ...report,
        status: 'approved',
        approvedDate: new Date().toISOString(),
        approvedBy: 'Admin User'
      });
    }
  };

  // Handle reject
  const handleReject = (report: ExpenseReport) => {
    const reason = prompt(`Motif de rejet pour "${report.title}" :`);
    if (reason !== null && reason.trim()) {
      updateExpenseReport({
        ...report,
        status: 'rejected',
        rejectionReason: reason
      });
    }
  };

  // Handle edit
  const handleEdit = (report: ExpenseReport) => {
    if (report.status !== 'pending') {
      alert('Seules les notes de frais en attente peuvent être modifiées');
      return;
    }
    setEditingReport(report);
    setNewReport({
      employeeId: report.employeeId,
      title: report.title,
      category: report.category,
      amount: report.amount,
      currency: report.currency,
      date: report.date,
      description: report.description || '',
      receiptUrl: report.receiptUrl || ''
    });
    setShowCreateModal(true);
  };

  // Handle delete
  const handleDelete = (id: string, report: ExpenseReport) => {
    if (report.status !== 'pending') {
      alert('Seules les notes de frais en attente peuvent être supprimées');
      return;
    }
    if (confirm('Supprimer cette note de frais ?')) {
      deleteExpenseReport(id);
    }
  };

  // Handle view
  const handleView = (report: ExpenseReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: ExpenseReport['status']) => {
    const badges = {
      pending: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'En Attente' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approuvée' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejetée' }
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

  // Get category label
  const getCategoryLabel = (category: ExpenseReport['category']) => {
    const cat = categories.find(c => c.value === category);
    return cat ? `${cat.icon} ${cat.label}` : category;
  };

  // Simulate OCR
  const handleOCRScan = () => {
    alert('📷 Fonctionnalité OCR à venir\n\nCette fonctionnalité permettra de scanner les reçus automatiquement et d\'extraire les données (montant, date, marchand) via reconnaissance optique de caractères.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes de Frais</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestion des dépenses professionnelles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Note de Frais
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Attente</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approuvées</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.approved}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejetées</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.rejected}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Montant (Mois)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalAmount.toLocaleString()} TND
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Montant Moy.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.avgAmount.toFixed(0)} TND
              </p>
            </div>
            <FileText className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Alert for pending approvals */}
      {stats.pending > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                {stats.pending} note{stats.pending > 1 ? 's' : ''} de frais en attente d'approbation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par titre, employé, référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En Attente</option>
              <option value="approved">Approuvée</option>
              <option value="rejected">Rejetée</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.reference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.employeeName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryLabel(report.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {report.amount.toLocaleString()} {report.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(report)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(report)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400"
                            title="Approuver"
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(report)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                            title="Rejeter"
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(report)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id, report)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune note de frais</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Commencez par créer une nouvelle note de frais.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingReport ? 'Modifier Note de Frais' : 'Nouvelle Note de Frais'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
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
                    value={newReport.employeeId}
                    onChange={(e) => setNewReport({ ...newReport, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={!!editingReport}
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
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="ex: Déplacement client Paris"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={newReport.category}
                      onChange={(e) => setNewReport({ ...newReport, category: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
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
                      value={newReport.date}
                      onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newReport.amount}
                      onChange={(e) => setNewReport({ ...newReport, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Devise
                    </label>
                    <select
                      value={newReport.currency}
                      onChange={(e) => setNewReport({ ...newReport, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="TND">TND</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Détails de la dépense..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reçu / Justificatif
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOCRScan}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      Scanner avec OCR
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Upload de fichier à implémenter')}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Importer
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newReport.receiptUrl}
                    onChange={(e) => setNewReport({ ...newReport, receiptUrl: e.target.value })}
                    placeholder="URL du reçu (optionnel)"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveReport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingReport ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedReport.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedReport.reference}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Employé</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {selectedReport.employeeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Catégorie</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {getCategoryLabel(selectedReport.category)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date de dépense</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(selectedReport.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date de soumission</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(selectedReport.submittedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Montant</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedReport.amount.toLocaleString()} {selectedReport.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {selectedReport.approvedBy && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Approuvé par</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {selectedReport.approvedBy} le {selectedReport.approvedDate && new Date(selectedReport.approvedDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                {selectedReport.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Motif de rejet
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedReport.rejectionReason}
                    </p>
                  </div>
                )}

                {selectedReport.receiptUrl && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Justificatif</p>
                    <a
                      href={selectedReport.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Voir le reçu
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedReport);
                        setShowViewModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReport);
                        setShowViewModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Rejeter
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRExpenses;

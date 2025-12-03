
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, Plus, Search, Filter, Edit, Trash2, Eye, Download,
  AlertTriangle, CheckCircle, Clock, Calendar, Users
} from 'lucide-react';
import { Contract } from '../types';

const HRContracts: React.FC = () => {
  const {
    contracts, employees, addContract, updateContract, deleteContract,
    formatCurrency, t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Contract>>({
    employeeId: '',
    employeeName: '',
    type: 'CDI',
    startDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    baseSalary: 0,
    currency: 'TND',
    workingHours: 40
  });

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch =
        contract.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || contract.type === filterType;
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contracts, searchTerm, filterType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const draft = contracts.filter(c => c.status === 'draft').length;
    const expired = contracts.filter(c => c.status === 'expired').length;

    // Contracts ending soon (CDD within 60 days)
    const endingSoon = contracts.filter(c => {
      if (c.type === 'CDI' || !c.endDate || c.status !== 'active') return false;
      const endDate = new Date(c.endDate);
      const daysUntilEnd = Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd >= 0 && daysUntilEnd <= 60;
    }).length;

    return { total, active, draft, expired, endingSoon };
  }, [contracts]);

  const handleAddNew = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      type: 'CDI',
      startDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      baseSalary: 0,
      currency: 'TND',
      workingHours: 40
    });
    setSelectedContract(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (contract: Contract) => {
    setFormData(contract);
    setSelectedContract(contract);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (contract: Contract) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le contrat de ${contract.employeeName} ?`)) {
      deleteContract(contract.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.startDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isEditing && selectedContract) {
      updateContract({ ...selectedContract, ...formData });
    } else {
      const newContract: Contract = {
        id: `cnt${Date.now()}`,
        ...formData as Required<Omit<Contract, 'id'>>
      };
      addContract(newContract);
    }

    setShowModal(false);
    setFormData({});
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      suspended: 'Suspendu',
      expired: 'Expiré',
      terminated: 'Terminé'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      CDI: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CDD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      Stage: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Internship: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Freelance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Part-time': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[type as keyof typeof styles] || styles.CDI}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('contracts') || 'Contrats'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredContracts.length} {t('contracts_found') || 'contrat(s) trouvé(s)'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('new_contract') || 'Nouveau Contrat'}
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
            <FileText className="w-10 h-10 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('active') || 'Actifs'}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('draft') || 'Brouillon'}</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</p>
            </div>
            <Clock className="w-10 h-10 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ending_soon') || 'À échéance'}</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.endingSoon}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('expired') || 'Expirés'}</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</p>
            </div>
            <FileText className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Alert for ending contracts */}
      {stats.endingSoon > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                {stats.endingSoon} contrat(s) CDD arrivent à échéance dans les 60 jours
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                Pensez à préparer les renouvellements ou les procédures de fin de contrat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_contracts') || 'Rechercher un contrat...'}
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
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Part-time">Part-time</option>
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
              <option value="draft">{t('draft') || 'Brouillon'}</option>
              <option value="active">{t('active') || 'Actif'}</option>
              <option value="suspended">{t('suspended') || 'Suspendu'}</option>
              <option value="expired">{t('expired') || 'Expiré'}</option>
              <option value="terminated">{t('terminated') || 'Terminé'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
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
                  {t('salary') || 'Salaire'}
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
              {filteredContracts.map((contract) => {
                const daysUntilEnd = contract.endDate
                  ? Math.floor((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                const showWarning = daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 60;

                return (
                  <tr key={contract.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${showWarning ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {contract.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(contract.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        {contract.endDate ? (
                          <>
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                            {showWarning && (
                              <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" title={`${daysUntilEnd} jours restants`} />
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(contract.baseSalary)} / {t('month') || 'mois'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert(`Détails contrat: ${contract.employeeName}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(contract)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => alert('Génération PDF en cours...')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400"
                          title="Télécharger PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('no_contracts') || 'Aucun contrat'}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('start_by_creating_contract') || 'Commencez par créer un nouveau contrat'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Contract */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isEditing ? (t('edit_contract') || 'Modifier Contrat') : (t('new_contract') || 'Nouveau Contrat')}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('contract_type') || 'Type de Contrat'} *
                    </label>
                    <select
                      required
                      value={formData.type || 'CDI'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Contract['type'] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('status') || 'Statut'} *
                    </label>
                    <select
                      required
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Contract['status'] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">{t('draft') || 'Brouillon'}</option>
                      <option value="active">{t('active') || 'Actif'}</option>
                      <option value="suspended">{t('suspended') || 'Suspendu'}</option>
                      <option value="expired">{t('expired') || 'Expiré'}</option>
                      <option value="terminated">{t('terminated') || 'Terminé'}</option>
                    </select>
                  </div>
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
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('end_date') || 'Date Fin'} {formData.type === 'CDD' && '*'}
                    </label>
                    <input
                      type="date"
                      required={formData.type === 'CDD'}
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('base_salary') || 'Salaire de Base'} *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.baseSalary || 0}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('working_hours') || 'Heures/Semaine'} *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.workingHours || 40}
                      onChange={(e) => setFormData({ ...formData, workingHours: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
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
                    {isEditing ? (t('save') || 'Enregistrer') : (t('create') || 'Créer')}
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

export default HRContracts;

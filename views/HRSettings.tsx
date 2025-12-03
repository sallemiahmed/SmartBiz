import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  Shield,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

const HRSettings: React.FC = () => {
  const {
    departments,
    positions,
    leavePolicies,
    addLeavePolicy,
    updateLeavePolicy,
    deleteLeavePolicy,
    payrollElements,
    addPayrollElement,
    updatePayrollElement,
    deletePayrollElement,
    hrSettings,
    updateHRSettings,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'departments' | 'leave' | 'payroll' | 'compliance'>('general');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [editingElement, setEditingElement] = useState<any>(null);

  // Form state for leave policy
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    type: 'annual' as const,
    daysPerYear: 20,
    maxCarryover: 5,
    requiresApproval: true,
    paidLeave: true
  });

  // Form state for payroll element
  const [newElement, setNewElement] = useState({
    code: '',
    name: '',
    type: 'earning' as const,
    formula: '',
    taxable: true,
    socialSecurityApplicable: true
  });

  // General settings form
  const [generalSettings, setGeneralSettings] = useState(hrSettings || {
    id: 'hr-settings-1',
    leaveYearStart: '01-01',
    carryoverAllowed: true,
    maxCarryoverDays: 5,
    payrollFrequency: 'monthly' as const,
    payrollCutoffDay: 25,
    paymentDay: 1,
    overtimeRateMultiplier: 1.5,
    standardWorkingHoursPerWeek: 40,
    weekendDays: ['saturday', 'sunday'] as const,
    dataRetentionYears: 10,
    anonymizeOnExit: true,
    alertDocumentExpiryDays: 30
  });

  // Save general settings
  const handleSaveGeneralSettings = () => {
    updateHRSettings(generalSettings);
    alert('Paramètres généraux sauvegardés avec succès');
  };

  // Handle save policy
  const handleSavePolicy = () => {
    if (!newPolicy.name) {
      alert('Veuillez renseigner le nom de la politique');
      return;
    }

    if (editingPolicy) {
      updateLeavePolicy({ ...editingPolicy, ...newPolicy });
    } else {
      const policy: any = {
        id: `lp-${Date.now()}`,
        ...newPolicy
      };
      addLeavePolicy(policy);
    }

    setShowPolicyModal(false);
    setEditingPolicy(null);
    setNewPolicy({
      name: '',
      type: 'annual',
      daysPerYear: 20,
      maxCarryover: 5,
      requiresApproval: true,
      paidLeave: true
    });
  };

  // Handle save payroll element
  const handleSaveElement = () => {
    if (!newElement.code || !newElement.name) {
      alert('Veuillez renseigner le code et le nom');
      return;
    }

    if (editingElement) {
      updatePayrollElement({ ...editingElement, ...newElement });
    } else {
      const element: any = {
        id: `pe-${Date.now()}`,
        ...newElement,
        isSystemGenerated: false
      };
      addPayrollElement(element);
    }

    setShowElementModal(false);
    setEditingElement(null);
    setNewElement({
      code: '',
      name: '',
      type: 'earning',
      formula: '',
      taxable: true,
      socialSecurityApplicable: true
    });
  };

  // Render General Settings
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Année de Congés
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Début Année de Congés
            </label>
            <input
              type="text"
              value={generalSettings.leaveYearStart}
              onChange={(e) => setGeneralSettings({ ...generalSettings, leaveYearStart: e.target.value })}
              placeholder="MM-DD (ex: 01-01)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Maximum (jours)
            </label>
            <input
              type="number"
              value={generalSettings.maxCarryoverDays}
              onChange={(e) => setGeneralSettings({ ...generalSettings, maxCarryoverDays: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generalSettings.carryoverAllowed}
              onChange={(e) => setGeneralSettings({ ...generalSettings, carryoverAllowed: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Autoriser le report de congés</span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Paramètres de Paie
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fréquence de Paie
            </label>
            <select
              value={generalSettings.payrollFrequency}
              onChange={(e) => setGeneralSettings({ ...generalSettings, payrollFrequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="weekly">Hebdomadaire</option>
              <option value="bi_weekly">Bi-mensuel</option>
              <option value="monthly">Mensuel</option>
              <option value="quarterly">Trimestriel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jour de Clôture
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={generalSettings.payrollCutoffDay}
              onChange={(e) => setGeneralSettings({ ...generalSettings, payrollCutoffDay: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jour de Paiement
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={generalSettings.paymentDay}
              onChange={(e) => setGeneralSettings({ ...generalSettings, paymentDay: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          Horaires de Travail
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heures Hebdomadaires Standard
            </label>
            <input
              type="number"
              value={generalSettings.standardWorkingHoursPerWeek}
              onChange={(e) => setGeneralSettings({ ...generalSettings, standardWorkingHoursPerWeek: parseInt(e.target.value) || 40 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taux Heures Supplémentaires (multiplicateur)
            </label>
            <input
              type="number"
              step="0.1"
              value={generalSettings.overtimeRateMultiplier}
              onChange={(e) => setGeneralSettings({ ...generalSettings, overtimeRateMultiplier: parseFloat(e.target.value) || 1.5 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Conformité & Sécurité
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rétention Données (années)
            </label>
            <input
              type="number"
              value={generalSettings.dataRetentionYears}
              onChange={(e) => setGeneralSettings({ ...generalSettings, dataRetentionYears: parseInt(e.target.value) || 10 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alerte Expiration Documents (jours)
            </label>
            <input
              type="number"
              value={generalSettings.alertDocumentExpiryDays}
              onChange={(e) => setGeneralSettings({ ...generalSettings, alertDocumentExpiryDays: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generalSettings.anonymizeOnExit}
              onChange={(e) => setGeneralSettings({ ...generalSettings, anonymizeOnExit: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Anonymiser les données au départ de l'employé</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveGeneralSettings}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          Sauvegarder les Paramètres
        </button>
      </div>
    </div>
  );

  // Render Departments
  const renderDepartments = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Départements</h3>
          <button
            onClick={() => alert('Ajout de département à implémenter')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manager: {dept.managerId || 'Non assigné'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Leave Policies
  const renderLeavePolicies = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Politiques de Congés</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérer les types de congés et leurs règles
          </p>
        </div>
        <button
          onClick={() => setShowPolicyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Politique
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Jours/An
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Report Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Payé
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leavePolicies.map(policy => (
              <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {policy.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {policy.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {policy.daysPerYear}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {policy.maxCarryover}
                </td>
                <td className="px-6 py-4 text-sm">
                  {policy.paidLeave ? (
                    <span className="text-green-600">Oui</span>
                  ) : (
                    <span className="text-red-600">Non</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => {
                      setEditingPolicy(policy);
                      setNewPolicy(policy);
                      setShowPolicyModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette politique ?')) {
                        deleteLeavePolicy(policy.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Payroll Elements
  const renderPayrollElements = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Éléments de Paie</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configurer les gains et déductions
          </p>
        </div>
        <button
          onClick={() => setShowElementModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel Élément
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Formule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Système
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(payrollElements || []).map(element => (
              <tr key={element.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {element.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {element.name}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    element.type === 'earning'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {element.type === 'earning' ? 'Gain' : 'Déduction'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {element.formula || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {element.isSystemGenerated && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      Système
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {!element.isSystemGenerated && (
                    <>
                      <button
                        onClick={() => {
                          setEditingElement(element);
                          setNewElement(element);
                          setShowElementModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cet élément ?')) {
                            deletePayrollElement(element.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Variables disponibles dans les formules:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li><code>base</code> - Salaire de base</li>
              <li><code>gross</code> - Salaire brut</li>
              <li><code>days</code> - Jours travaillés</li>
              <li><code>hours</code> - Heures travaillées</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-gray-600" />
            Paramètres RH
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configuration du module Ressources Humaines
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {[
            { id: 'general', label: 'Général', icon: SettingsIcon },
            { id: 'departments', label: 'Départements', icon: Building },
            { id: 'leave', label: 'Congés', icon: Calendar },
            { id: 'payroll', label: 'Paie', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'departments' && renderDepartments()}
        {activeTab === 'leave' && renderLeavePolicies()}
        {activeTab === 'payroll' && renderPayrollElements()}
      </div>

      {/* Leave Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPolicy ? 'Modifier Politique' : 'Nouvelle Politique de Congés'}
                </h2>
                <button
                  onClick={() => {
                    setShowPolicyModal(false);
                    setEditingPolicy(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={newPolicy.type}
                      onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="annual">Congé Annuel</option>
                      <option value="sick">Congé Maladie</option>
                      <option value="unpaid">Sans Solde</option>
                      <option value="parental">Parental</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jours par An
                    </label>
                    <input
                      type="number"
                      value={newPolicy.daysPerYear}
                      onChange={(e) => setNewPolicy({ ...newPolicy, daysPerYear: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Maximum (jours)
                  </label>
                  <input
                    type="number"
                    value={newPolicy.maxCarryover}
                    onChange={(e) => setNewPolicy({ ...newPolicy, maxCarryover: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPolicy.requiresApproval}
                      onChange={(e) => setNewPolicy({ ...newPolicy, requiresApproval: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nécessite approbation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPolicy.paidLeave}
                      onChange={(e) => setNewPolicy({ ...newPolicy, paidLeave: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Congé payé</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPolicyModal(false);
                    setEditingPolicy(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePolicy}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPolicy ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Element Modal */}
      {showElementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingElement ? 'Modifier Élément' : 'Nouvel Élément de Paie'}
                </h2>
                <button
                  onClick={() => {
                    setShowElementModal(false);
                    setEditingElement(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={newElement.code}
                      onChange={(e) => setNewElement({ ...newElement, code: e.target.value.toUpperCase() })}
                      placeholder="PRIME_PROD"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={newElement.type}
                      onChange={(e) => setNewElement({ ...newElement, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="earning">Gain</option>
                      <option value="deduction">Déduction</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newElement.name}
                    onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                    placeholder="Prime de Productivité"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Formule (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newElement.formula}
                    onChange={(e) => setNewElement({ ...newElement, formula: e.target.value })}
                    placeholder="base * 0.10"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Variables: base, gross, days, hours
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newElement.taxable}
                      onChange={(e) => setNewElement({ ...newElement, taxable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Soumis à l'impôt</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newElement.socialSecurityApplicable}
                      onChange={(e) => setNewElement({ ...newElement, socialSecurityApplicable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Soumis aux cotisations sociales</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowElementModal(false);
                    setEditingElement(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveElement}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingElement ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSettings;

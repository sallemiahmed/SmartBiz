
import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, User, Shield, Bell, Building, CreditCard, 
  CheckCircle, Plus, Trash2, Star, List, Type
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings, TaxRate, CustomFieldDefinition } from '../types';

type SettingsTab = 'general' | 'profile' | 'security' | 'billing' | 'notifications' | 'custom_fields';

interface SettingsProps {
  view?: string;
}

const Settings: React.FC<SettingsProps> = ({ view }) => {
  const { settings, updateSettings, t } = useApp();
  
  // Initialize active tab based on the view prop if present
  const getTabFromView = (v?: string): SettingsTab => {
    if (!v || v === 'settings') return 'general';
    return v.replace('settings-', '') as SettingsTab;
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getTabFromView(view));
  const [showSuccess, setShowSuccess] = useState(false);

  // Update active tab when view prop changes
  useEffect(() => {
    setActiveTab(getTabFromView(view));
  }, [view]);

  // Local state for General/Profile form handling
  const [formData, setFormData] = useState<AppSettings>(settings);

  // Local state for Security form handling
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    is2FAEnabled: false
  });

  // Local state for new tax rate input
  const [newTaxRate, setNewTaxRate] = useState<{name: string, rate: string}>({ name: '', rate: '' });

  // Local state for custom fields
  const [newField, setNewField] = useState<{label: string, type: 'text'|'number'|'date'|'boolean', entity: 'clients'|'suppliers'}>({ 
    label: '', type: 'text', entity: 'clients' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const toggle2FA = () => {
    setSecurityData(prev => ({ ...prev, is2FAEnabled: !prev.is2FAEnabled }));
  };

  // Tax Rate Handlers
  const handleAddTaxRate = () => {
    if (newTaxRate.name && newTaxRate.rate) {
      const rateNum = parseFloat(newTaxRate.rate);
      if (!isNaN(rateNum)) {
        const newRate: TaxRate = {
          id: Date.now().toString(),
          name: newTaxRate.name,
          rate: rateNum,
          isDefault: formData.taxRates.length === 0 // First one is default
        };
        setFormData(prev => ({
          ...prev,
          taxRates: [...prev.taxRates, newRate]
        }));
        setNewTaxRate({ name: '', rate: '' });
      }
    }
  };

  const handleDeleteTaxRate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      taxRates: prev.taxRates.filter(r => r.id !== id)
    }));
  };

  const handleSetDefaultTaxRate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      taxRates: prev.taxRates.map(r => ({ ...r, isDefault: r.id === id }))
    }));
  };

  // Custom Field Handlers
  const handleAddCustomField = () => {
    if (newField.label) {
      const fieldDef: CustomFieldDefinition = {
        id: Date.now().toString(),
        key: newField.label.toLowerCase().replace(/\s+/g, '_'),
        label: newField.label,
        type: newField.type,
        required: false
      };
      
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [newField.entity]: [...prev.customFields[newField.entity], fieldDef]
        }
      }));
      setNewField(prev => ({ ...prev, label: '' }));
    }
  };

  const handleDeleteCustomField = (id: string, entity: 'clients' | 'suppliers') => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [entity]: prev.customFields[entity].filter(f => f.id !== id)
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'security') {
      console.log("Updating security settings:", securityData);
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } else {
      updateSettings(formData);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'general', label: t('general'), icon: Building },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'custom_fields', label: 'Custom Fields', icon: List },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'billing', label: t('billing'), icon: CreditCard },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings')} ⚙️</h1>
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          {showSuccess && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg animate-fade-in text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{t('settings_saved')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto">
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_name')}</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_email')}</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_phone')}</label>
                  <input
                    type="text"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_vat_id')}</label>
                  <input
                    type="text"
                    name="companyVatId"
                    value={formData.companyVatId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                  <textarea
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">{t('localization')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('language')}</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français (French)</option>
                      <option value="ar">العربية (Arabic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('currency')}</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="TND">TND (DT)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="SAR">SAR (﷼)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('timezone')}</label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="UTC-5">Eastern Time (US & Canada)</option>
                      <option value="UTC+0">London</option>
                      <option value="UTC+1">Paris / Tunis</option>
                      <option value="UTC+3">Riyadh / Moscow</option>
                      <option value="UTC+4">Dubai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tax Configuration */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">{t('tax_configuration')}</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {/* Add New Rate */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('rate_name')}</label>
                        <input 
                          type="text" 
                          value={newTaxRate.name}
                          onChange={(e) => setNewTaxRate(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          placeholder="e.g. VAT Standard"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('rate_value')}</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={newTaxRate.rate}
                          onChange={(e) => setNewTaxRate(prev => ({ ...prev, rate: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          placeholder="0"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddTaxRate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" /> {t('add_rate')}
                      </button>
                    </div>

                    {/* Rate List */}
                    <div className="mt-4 space-y-2">
                      {formData.taxRates.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No tax rates configured.</p>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                              <tr>
                                <th className="px-4 py-2">{t('rate_name')}</th>
                                <th className="px-4 py-2">{t('rate_value')}</th>
                                <th className="px-4 py-2 text-center">Default</th>
                                <th className="px-4 py-2 text-right">{t('actions')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                              {formData.taxRates.map(rate => (
                                <tr key={rate.id}>
                                  <td className="px-4 py-2 text-gray-900 dark:text-white">{rate.name}</td>
                                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300 font-mono">{rate.rate}%</td>
                                  <td className="px-4 py-2 text-center">
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDefaultTaxRate(rate.id)}
                                      className={`p-1 rounded-full transition-colors ${rate.isDefault ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                    >
                                      <Star className={`w-4 h-4 ${rate.isDefault ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteTaxRate(rate.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CUSTOM FIELDS TAB --- */}
          {activeTab === 'custom_fields' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-800 dark:text-blue-300 text-sm mb-6">
                Define extra fields to track custom data for your Clients and Suppliers. These fields will appear in the creation forms and details views.
              </div>

              {/* Clients Fields */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" /> Client Fields
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
                  {/* Add Field */}
                  <div className="flex gap-3 items-end mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Field Label</label>
                      <input 
                        type="text" 
                        value={newField.entity === 'clients' ? newField.label : ''}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value, entity: 'clients' })}
                        onFocus={() => setNewField(prev => ({...prev, entity: 'clients'}))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="e.g. Member ID"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                      <select 
                        value={newField.entity === 'clients' ? newField.type : 'text'}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as any, entity: 'clients' })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddCustomField}
                      disabled={newField.entity !== 'clients' || !newField.label}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* List */}
                  {formData.customFields.clients.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No custom fields defined for clients.</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.customFields.clients.map(field => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Type className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{field.label}</p>
                              <p className="text-xs text-gray-500 uppercase">{field.type}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteCustomField(field.id, 'clients')}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suppliers Fields */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-600" /> Supplier Fields
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  {/* Add Field */}
                  <div className="flex gap-3 items-end mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Field Label</label>
                      <input 
                        type="text" 
                        value={newField.entity === 'suppliers' ? newField.label : ''}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value, entity: 'suppliers' })}
                        onFocus={() => setNewField(prev => ({...prev, entity: 'suppliers'}))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                        placeholder="e.g. Tax ID Type"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                      <select 
                        value={newField.entity === 'suppliers' ? newField.type : 'text'}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as any, entity: 'suppliers' })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddCustomField}
                      disabled={newField.entity !== 'suppliers' || !newField.label}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* List */}
                  {formData.customFields.suppliers.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No custom fields defined for suppliers.</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.customFields.suppliers.map(field => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Type className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{field.label}</p>
                              <p className="text-xs text-gray-500 uppercase">{field.type}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteCustomField(field.id, 'suppliers')}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* --- PROFILE TAB --- */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {t('personal_information')}
              </h3>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl overflow-hidden border-4 border-white dark:border-gray-600 shadow-sm">
                  <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button type="button" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  {t('change_avatar')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                  <input type="text" defaultValue="Alex Morgan" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_address')}</label>
                  <input type="email" defaultValue="alex.morgan@company.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role')}</label>
                  <input type="text" defaultValue="Administrator" disabled className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {t('password_auth')}
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password')}</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={securityData.currentPassword}
                    onChange={handleSecurityChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password')}</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                  />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('two_factor_auth')}</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{t('secure_account')}</p>
                    <p className="text-xs text-gray-500">{t('secure_account_desc')}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={toggle2FA}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      securityData.is2FAEnabled 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                    }`}
                  >
                    {securityData.is2FAEnabled ? t('disable_2fa') : t('enable_2fa')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- BILLING TAB (Mock) --- */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Billing management is handled by the super-admin portal.</p>
              </div>
            </div>
          )}

          {/* --- NOTIFICATIONS TAB (Mock) --- */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {t('email_notifications')}
              </h3>
              <div className="space-y-3">
                {['New Order Received', 'Low Stock Alerts', 'Invoice Payment Received', 'Weekly Reports'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 py-4">
            <button 
              type="button"
              onClick={() => { setFormData(settings); setSecurityData({currentPassword: '', newPassword: '', confirmPassword: '', is2FAEnabled: false}); }}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

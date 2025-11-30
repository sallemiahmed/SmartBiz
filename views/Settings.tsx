import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppSettings } from '../types';
import { Save, Plus, Trash2, Stamp } from 'lucide-react';

const Settings: React.FC<{ view: string }> = ({ view }) => {
  const { settings, setSettings, t } = useApp();
  const [formData, setFormData] = useState<AppSettings>(settings);

  const activeTab = view.split('-')[1] || 'general';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    alert(t('success') || 'Settings saved successfully');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <form onSubmit={handleSave}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">General Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_name')}</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_email')}</label>
                    <input name="companyEmail" value={formData.companyEmail} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_phone')}</label>
                    <input name="companyPhone" value={formData.companyPhone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('currency')}</label>
                    <input name="currency" value={formData.currency} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('address')}</label>
                    <textarea name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" rows={3} />
                </div>
                
                {/* Fiscal Stamp Settings */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                      <Stamp className="w-4 h-4" /> {t('fiscal_stamp_settings')}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="enableFiscalStamp"
                            checked={formData.enableFiscalStamp || false} 
                            onChange={handleChange}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('enable_fiscal_stamp')}</span>
                        </label>
                      </div>
                      
                      {formData.enableFiscalStamp && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                          <label className="text-sm text-gray-600 dark:text-gray-400">{t('fiscal_stamp_value')}:</label>
                          <input 
                            type="number" 
                            name="fiscalStampValue"
                            step="0.001"
                            value={formData.fiscalStampValue || 0}
                            onChange={handleChange}
                            className="w-24 px-3 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formData.currency}</span>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">API Keys</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gemini API Key</label>
                        <input name="geminiApiKey" type="password" value={formData.geminiApiKey} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
                        <p className="text-xs text-gray-500 mt-1">Used for AI Assistant functionality.</p>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Save className="w-4 h-4" />
                    {t('save_changes')}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
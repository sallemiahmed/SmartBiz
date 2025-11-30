
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppSettings, TaxRate } from '../types';
import { Save, Plus, Trash2, Stamp, Globe, Shield, Bell, CreditCard, User, Building, Image as ImageIcon, Upload } from 'lucide-react';
import { allCurrencies } from '../utils/currencyList';
import SearchableSelect from '../components/SearchableSelect';

const Settings: React.FC<{ view: string }> = ({ view }) => {
  const { settings, setSettings, t } = useApp();
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Sync internal state if global settings change
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const activeTab = view.split('-')[1] || 'general';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Type guard for checkbox
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
  };

  const handleAddTaxRate = () => {
    const newRate: TaxRate = {
      id: Date.now().toString(),
      name: 'New Tax',
      rate: 0
    };
    setFormData(prev => ({
      ...prev,
      taxRates: [...prev.taxRates, newRate]
    }));
  };

  const handleRemoveTaxRate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      taxRates: prev.taxRates.filter(r => r.id !== id)
    }));
  };

  const handleTaxRateChange = (id: string, field: keyof TaxRate, value: any) => {
    setFormData(prev => ({
      ...prev,
      taxRates: prev.taxRates.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update context - AppContext listener will handle persistence and language/RTL updates
    setSettings(formData);

    // Show success feedback
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Helper to render section title
  const getSectionTitle = () => {
      switch(activeTab) {
          case 'profile': return t('profile');
          case 'security': return t('security');
          case 'billing': return t('billing');
          case 'notifications': return t('notifications');
          default: return t('general');
      }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300">{getSectionTitle()}</h2>
        </div>
        {isSaved && (
            <div className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {t('settings_saved')}
            </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <form onSubmit={handleSave}>
                    {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Company Logo Section */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Branding</h2>
                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 relative group">
                                    {formData.companyLogo ? (
                                        <img src={formData.companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        Upload Logo
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Recommended: PNG or JPG, max 2MB. Used in invoices and reports.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Company Details */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('company_details')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_name')}</label>
                                    <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_email')}</label>
                                    <input name="companyEmail" value={formData.companyEmail} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_phone')}</label>
                                    <input name="companyPhone" value={formData.companyPhone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company_vat_id')}</label>
                                    <input name="companyVatId" value={formData.companyVatId || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 123456789" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('address')}</label>
                                <textarea name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} />
                            </div>
                        </section>

                        {/* Localization */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                                <Globe className="w-5 h-5" /> {t('localization')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('language')}</label>
                                    <select name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="ar">العربية</option>
                                        <option value="zh">中文 (Chinese)</option>
                                        <option value="ja">日本語</option>
                                        <option value="he">עברית</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('currency')}</label>
                                    <SearchableSelect
                                        value={formData.currency}
                                        onChange={handleCurrencyChange}
                                        options={allCurrencies.map(c => ({ value: c.code, label: `${c.code} - ${c.name} (${c.symbol})` }))}
                                        className="w-full rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('timezone')}</label>
                                    <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="UTC">UTC</option>
                                        <option value="UTC-5">EST (UTC-5)</option>
                                        <option value="UTC+1">CET (UTC+1)</option>
                                        <option value="UTC+4">GST (UTC+4)</option>
                                        <option value="Asia/Tokyo">JST (UTC+9)</option>
                                        <option value="Asia/Jerusalem">IDT (UTC+3)</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        
                        {/* Fiscal Stamp Settings */}
                        <section className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
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
                        </section>

                        {/* Tax Configuration */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('tax_configuration')}</h2>
                                <button type="button" onClick={handleAddTaxRate} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> {t('add_rate')}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.taxRates.map((rate, index) => (
                                    <div key={rate.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 block mb-1">{t('rate_name')}</label>
                                            <input 
                                                value={rate.name}
                                                onChange={(e) => handleTaxRateChange(rate.id, 'name', e.target.value)}
                                                className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs text-gray-500 block mb-1">{t('rate_value')}</label>
                                            <input 
                                                type="number"
                                                value={rate.rate}
                                                onChange={(e) => handleTaxRateChange(rate.id, 'rate', parseFloat(e.target.value))}
                                                className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                                            />
                                        </div>
                                        <div className="pt-5">
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTaxRate(rate.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                disabled={formData.taxRates.length <= 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('ai_integration')}</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('gemini_api_key')}</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            name="geminiApiKey" 
                                            type="password" 
                                            value={formData.geminiApiKey} 
                                            onChange={handleChange} 
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                                            placeholder="sk-..."
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Required for AI Assistant and smart insights.</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('password_auth')}</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('current_password')}</label>
                                    <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('new_password')}</label>
                                        <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('confirm_password')}</label>
                                        <input type="password" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {(activeTab === 'profile' || activeTab === 'billing' || activeTab === 'notifications') && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                {activeTab === 'profile' && <User className="w-8 h-8" />}
                                {activeTab === 'billing' && <CreditCard className="w-8 h-8" />}
                                {activeTab === 'notifications' && <Bell className="w-8 h-8" />}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 capitalize">{activeTab} Settings</h3>
                            <p>This module is under development.</p>
                        </div>
                    )}

                    {/* Save Button Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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

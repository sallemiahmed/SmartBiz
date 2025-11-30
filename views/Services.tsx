
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceJob } from '../types';
import { ArrowLeft, Save, User, Wrench, Package, Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

interface ServicesProps {
  mode?: string;
  onCancel?: () => void;
}

const CreateServiceJobInline: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const { addServiceJob, clients, technicians, products, formatCurrency, t } = useApp();
    const [formData, setFormData] = useState<Partial<ServiceJob>>({
        status: 'pending',
        priority: 'medium',
        services: [],
        usedParts: []
    });

    // Local state for the part adder inputs
    const [selectedPartId, setSelectedPartId] = useState('');
    const [selectedPartQty, setSelectedPartQty] = useState(1);

    const handleAddPart = () => {
        if (!selectedPartId) return;
        const product = products.find(p => p.id === selectedPartId);
        if (!product) return;

        const newPart = {
            productId: product.id,
            name: product.name,
            quantity: selectedPartQty,
            price: product.price
        };

        setFormData(prev => ({
            ...prev,
            usedParts: [...(prev.usedParts || []), newPart]
        }));

        // Reset inputs
        setSelectedPartId('');
        setSelectedPartQty(1);
    };

    const handleRemovePart = (index: number) => {
        setFormData(prev => {
            const newParts = [...(prev.usedParts || [])];
            newParts.splice(index, 1);
            return { ...prev, usedParts: newParts };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.id === formData.clientId);
        
        const newJob: ServiceJob = {
            id: `job-${Date.now()}`,
            ticketNumber: `JOB-${Date.now().toString().slice(-6)}`,
            clientId: formData.clientId || '',
            clientName: client?.company || 'Unknown',
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            priority: formData.priority as any,
            technicianId: formData.technicianId,
            technicianName: technicians.find(t => t.id === formData.technicianId)?.name,
            deviceInfo: formData.deviceInfo || '',
            problemDescription: formData.problemDescription || '',
            estimatedCost: (formData.usedParts || []).reduce((acc, part) => acc + (part.price * part.quantity), 0),
            services: [],
            usedParts: formData.usedParts || []
        };
        addServiceJob(newJob);
        onCancel();
    };

    return (
        <div className="p-6 h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-indigo-600" />
                        {t('new_job')}
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Customer Info</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('client')}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select 
                                        required 
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        onChange={e => setFormData({...formData, clientId: e.target.value})}
                                    >
                                        <option value="">Select Client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('priority')}</label>
                                <div className="flex gap-4">
                                    {['low', 'medium', 'high', 'critical'].map(p => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="priority" 
                                                value={p} 
                                                checked={formData.priority === p}
                                                onChange={() => setFormData({...formData, priority: p as any})}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Device & Assignment</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('device_info')}</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Make, Model, Serial Number..."
                                    onChange={e => setFormData({...formData, deviceInfo: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('technician')}</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    onChange={e => setFormData({...formData, technicianId: e.target.value})}
                                >
                                    <option value="">Assign Later (Pending)</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name} • {t.specialty}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{t('problem_description')}</label>
                        <textarea 
                            required 
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                            placeholder="Describe the issue in detail..."
                            onChange={e => setFormData({...formData, problemDescription: e.target.value})}
                        />
                    </div>

                    {/* Initial Parts Section */}
                    <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            <Package className="w-4 h-4" />
                            Initial Parts Required (Optional)
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                             <div className="flex-1">
                                <SearchableSelect 
                                    options={products.map(p => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }))}
                                    value={selectedPartId}
                                    onChange={setSelectedPartId}
                                    placeholder="Search product inventory..."
                                    className="w-full rounded-lg bg-white"
                                />
                             </div>
                             <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={selectedPartQty}
                                    onChange={(e) => setSelectedPartQty(parseInt(e.target.value) || 1)}
                                    className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Qty"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddPart}
                                    disabled={!selectedPartId}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                             </div>
                        </div>

                        {/* List of added parts */}
                        {formData.usedParts && formData.usedParts.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {formData.usedParts.map((part, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
                                        <div className="flex gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">{part.name}</span>
                                            <span className="text-gray-500">x{part.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-900 dark:text-white">{formatCurrency(part.price * part.quantity)}</span>
                                            <button type="button" onClick={() => handleRemovePart(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Services: React.FC<ServicesProps> = ({ mode, onCancel }) => {
  // Only handle create mode here, other views are handled in App.tsx
  const handleCancel = onCancel || (() => window.history.back());
  return <CreateServiceJobInline onCancel={handleCancel} />;
};

export default Services;

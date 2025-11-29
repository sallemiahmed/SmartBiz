
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceJob } from '../types';
import ServiceDashboard from './ServiceDashboard';
import ServiceJobs from './ServiceJobs';
import ServiceCatalog from './ServiceCatalog';
import Technicians from './Technicians';
import CreateServiceJob from './CreateServiceJob'; // We'll assume this for the create action

interface ServicesProps {
  mode?: string;
}

// Temporary inline Create Component for simplicity, usually in a separate file
const CreateServiceJobInline: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const { addServiceJob, clients, serviceCatalog, technicians, products, t } = useApp();
    const [formData, setFormData] = useState<Partial<ServiceJob>>({
        status: 'pending',
        priority: 'medium',
        services: [],
        usedParts: []
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.id === formData.clientId);
        
        const newJob: ServiceJob = {
            id: `job-${Date.now()}`,
            ticketNumber: `JOB-${Date.now().toString().slice(-4)}`,
            clientId: formData.clientId || '',
            clientName: client?.company || 'Unknown',
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            priority: formData.priority as any,
            technicianId: formData.technicianId,
            technicianName: technicians.find(t => t.id === formData.technicianId)?.name,
            deviceInfo: formData.deviceInfo || '',
            problemDescription: formData.problemDescription || '',
            estimatedCost: 0, // Should calc
            services: formData.services || [],
            usedParts: formData.usedParts || []
        };
        addServiceJob(newJob);
        onCancel(); // Go back
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('new_job')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('client')}</label>
                        <select 
                            required 
                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            onChange={e => setFormData({...formData, clientId: e.target.value})}
                        >
                            <option value="">Select Client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('technician')}</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            onChange={e => setFormData({...formData, technicianId: e.target.value})}
                        >
                            <option value="">Assign Later</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('device_info')}</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="e.g. iPhone 13 Pro, Ford Fiesta 2019..."
                        onChange={e => setFormData({...formData, deviceInfo: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('problem_description')}</label>
                    <textarea 
                        required 
                        rows={3}
                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        onChange={e => setFormData({...formData, problemDescription: e.target.value})}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{t('save')}</button>
                </div>
            </form>
        </div>
    );
};

const Services: React.FC<ServicesProps> = ({ mode }) => {
  const [subView, setSubView] = useState('list'); // used for internal nav if needed

  if (mode === 'create') {
      return <CreateServiceJobInline onCancel={() => window.history.back()} />;
  }

  if (mode === 'catalog') return <ServiceCatalog />;
  if (mode === 'technicians') return <Technicians />;
  if (mode === 'jobs') return <ServiceJobs onAddNew={() => {}} />; // Add New handled by routing usually
  
  // Default to Dashboard
  return <ServiceDashboard />;
};

export default Services;

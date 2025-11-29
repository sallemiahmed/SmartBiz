
import React, { useState } from 'react';
import { Search, Plus, Filter, Wrench, User, Calendar, DollarSign, Eye, Trash2, X, CheckCircle, Receipt, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceJob, InvoiceItem } from '../types';

interface ServiceJobsProps {
  onAddNew: () => void;
}

const ServiceJobs: React.FC<ServiceJobsProps> = ({ onAddNew }) => {
  const { serviceJobs, updateServiceJob, deleteServiceJob, technicians, clients, serviceCatalog, products, createSalesDocument, formatCurrency, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State for creating/editing job
  const [formData, setFormData] = useState<Partial<ServiceJob>>({});

  const filteredJobs = serviceJobs.filter(job => {
    const matchesSearch = job.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.deviceInfo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'invoiced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-600 font-medium';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const handleGenerateInvoice = () => {
    if (!selectedJob) return;

    // Convert Service Items to Invoice Items
    const serviceItems: InvoiceItem[] = selectedJob.services.map(s => ({
        id: s.serviceId,
        description: s.name,
        quantity: 1,
        price: s.price
    }));

    // Convert Used Parts to Invoice Items
    const partItems: InvoiceItem[] = selectedJob.usedParts.map(p => ({
        id: p.productId,
        description: p.name,
        quantity: p.quantity,
        price: p.price
    }));

    const allItems = [...serviceItems, ...partItems];
    const totalAmount = allItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    createSalesDocument('invoice', {
        clientId: selectedJob.clientId,
        clientName: selectedJob.clientName,
        date: new Date().toISOString().split('T')[0],
        amount: totalAmount,
        status: 'pending',
        notes: `Invoice for Service Job ${selectedJob.ticketNumber}. \nDevice: ${selectedJob.deviceInfo}`,
        linkedDocumentId: selectedJob.id
    }, allItems);

    updateServiceJob({ ...selectedJob, status: 'invoiced' });
    setIsModalOpen(false);
    alert(t('success'));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('job_cards')} 🛠️</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('service_jobs_desc')}</p>
        </div>
        <button onClick={onAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> {t('new_job')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_jobs')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          >
            <option value="all">{t('all_status')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('in_progress')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="invoiced">{t('invoiced')}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ticket_num')}</th>
                <th className="px-6 py-4">{t('client')}</th>
                <th className="px-6 py-4">{t('device_info')}</th>
                <th className="px-6 py-4">{t('technician')}</th>
                <th className="px-6 py-4">{t('priority')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">{job.ticketNumber}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{job.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{job.deviceInfo}</td>
                  <td className="px-6 py-4 text-gray-500">{job.technicianName || '-'}</td>
                  <td className={`px-6 py-4 capitalize ${getPriorityColor(job.priority)}`}>{t(job.priority)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(job.status)}`}>
                      {t(job.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Delete job?")) deleteServiceJob(job.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('job_details')}</h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">{selectedJob.ticketNumber}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase">{t('client')}</span>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedJob.clientName}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">{t('device_info')}</span>
                  <div className="text-sm text-gray-900 dark:text-white">{selectedJob.deviceInfo}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">{t('problem_description')}</span>
                  <div className="text-sm text-gray-700 dark:text-gray-300 italic p-2 border border-gray-100 dark:border-gray-700 rounded bg-yellow-50 dark:bg-yellow-900/10">
                    "{selectedJob.problemDescription}"
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('status')}</label>
                        <select 
                            value={selectedJob.status}
                            onChange={(e) => {
                                updateServiceJob({ ...selectedJob, status: e.target.value as any });
                                setSelectedJob(prev => prev ? ({ ...prev, status: e.target.value as any }) : null);
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                        >
                            <option value="pending">{t('pending')}</option>
                            <option value="in_progress">{t('in_progress')}</option>
                            <option value="completed">{t('completed')}</option>
                            <option value="invoiced" disabled>{t('invoiced')}</option>
                            <option value="cancelled">{t('cancelled')}</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('technician')}</label>
                        <select 
                            value={selectedJob.technicianId || ''}
                            onChange={(e) => {
                                const tech = technicians.find(t => t.id === e.target.value);
                                const updated = { ...selectedJob, technicianId: e.target.value, technicianName: tech?.name };
                                updateServiceJob(updated);
                                setSelectedJob(updated);
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                        >
                            <option value="">Unassigned</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('resolution_notes')}</label>
                    <textarea 
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white h-24"
                        placeholder="Enter resolution details..."
                        value={selectedJob.resolutionNotes || ''}
                        onChange={(e) => {
                            updateServiceJob({ ...selectedJob, resolutionNotes: e.target.value });
                            setSelectedJob(prev => prev ? ({ ...prev, resolutionNotes: e.target.value }) : null);
                        }}
                    />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Costing</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2 text-sm">
                    {selectedJob.services.map((s, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{s.name} (Service)</span>
                            <span>{formatCurrency(s.price)}</span>
                        </div>
                    ))}
                    {selectedJob.usedParts.map((p, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{p.name} (Part x{p.quantity})</span>
                            <span>{formatCurrency(p.price * p.quantity)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span>Total Estimated</span>
                        <span>{formatCurrency(selectedJob.services.reduce((a,b)=>a+b.price,0) + selectedJob.usedParts.reduce((a,b)=>a+(b.price*b.quantity),0))}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">{t('close')}</button>
                {selectedJob.status === 'completed' && (
                    <button 
                        onClick={handleGenerateInvoice}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Receipt className="w-4 h-4" /> {t('generate_invoice')}
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceJobs;

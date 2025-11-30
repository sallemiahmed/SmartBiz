
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Wrench, User, Calendar, DollarSign, 
  Eye, Trash2, X, CheckCircle, Receipt, Clock, LayoutGrid, List,
  AlertCircle, Package, MoreHorizontal, ChevronRight, PenTool, Printer, Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceJob, InvoiceItem, Product, ServiceItem } from '../types';
import SearchableSelect from '../components/SearchableSelect';
import { printJobCard } from '../utils/printGenerator';

interface ServiceJobsProps {
  onAddNew: () => void;
}

const ServiceJobs: React.FC<ServiceJobsProps> = ({ onAddNew }) => {
  const { serviceJobs, updateServiceJob, deleteServiceJob, technicians, clients, serviceCatalog, products, createSalesDocument, formatCurrency, warehouses, t, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');
  const [invoiceWarehouseId, setInvoiceWarehouseId] = useState('');

  // Dropdown States for Add Items
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState('');
  const [selectedPartToAdd, setSelectedPartToAdd] = useState('');

  // Filtering
  const filteredJobs = useMemo(() => serviceJobs.filter(job => {
    const matchesSearch = job.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.deviceInfo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [serviceJobs, searchTerm, statusFilter]);

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'invoiced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded';
    }
  };

  // --- Actions ---

  const handleGenerateInvoice = () => {
    if (!selectedJob) return;
    
    // Check if parts are used, we need warehouse
    if (selectedJob.usedParts.length > 0 && !invoiceWarehouseId) {
        alert("Please select a source warehouse for the parts.");
        return;
    }

    // Convert Service Items
    const serviceItems: InvoiceItem[] = selectedJob.services.map(s => ({
        id: s.serviceId,
        description: s.name,
        quantity: 1,
        price: s.price
    }));

    // Convert Parts
    const partItems: InvoiceItem[] = selectedJob.usedParts.map(p => ({
        id: p.productId,
        description: p.name,
        quantity: p.quantity,
        price: p.price
    }));

    const allItems = [...serviceItems, ...partItems];
    
    if (allItems.length === 0) {
        alert("Cannot generate invoice: No services or parts added.");
        return;
    }

    const totalAmount = allItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    createSalesDocument('invoice', {
        clientId: selectedJob.clientId,
        clientName: selectedJob.clientName,
        date: new Date().toISOString().split('T')[0],
        amount: totalAmount,
        status: 'pending', // Pending Payment
        warehouseId: invoiceWarehouseId || warehouses[0]?.id, // Use selected or default for services only
        notes: `Service Job: ${selectedJob.ticketNumber}\nDevice: ${selectedJob.deviceInfo}`,
        linkedDocumentId: selectedJob.id
    }, allItems);

    updateServiceJob({ ...selectedJob, status: 'invoiced' });
    setIsModalOpen(false);
    alert(t('success'));
  };

  const addServiceToJob = () => {
    if (!selectedJob || !selectedServiceToAdd) return;
    const service = serviceCatalog.find(s => s.id === selectedServiceToAdd);
    if (!service) return;

    const newService = { serviceId: service.id, name: service.name, price: service.basePrice };
    const updatedJob = { ...selectedJob, services: [...selectedJob.services, newService] };
    
    updateServiceJob(updatedJob);
    setSelectedJob(updatedJob);
    setSelectedServiceToAdd('');
  };

  const addPartToJob = () => {
    if (!selectedJob || !selectedPartToAdd) return;
    const product = products.find(p => p.id === selectedPartToAdd);
    if (!product) return;

    const existingPart = selectedJob.usedParts.find(p => p.productId === product.id);
    let updatedParts;
    if (existingPart) {
        updatedParts = selectedJob.usedParts.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
    } else {
        updatedParts = [...selectedJob.usedParts, { productId: product.id, name: product.name, quantity: 1, price: product.price }];
    }

    const updatedJob = { ...selectedJob, usedParts: updatedParts };
    updateServiceJob(updatedJob);
    setSelectedJob(updatedJob);
    setSelectedPartToAdd('');
  };

  const removeService = (index: number) => {
    if (!selectedJob) return;
    const updatedServices = [...selectedJob.services];
    updatedServices.splice(index, 1);
    const updatedJob = { ...selectedJob, services: updatedServices };
    updateServiceJob(updatedJob);
    setSelectedJob(updatedJob);
  };

  const removePart = (index: number) => {
    if (!selectedJob) return;
    const updatedParts = [...selectedJob.usedParts];
    updatedParts.splice(index, 1);
    const updatedJob = { ...selectedJob, usedParts: updatedParts };
    updateServiceJob(updatedJob);
    setSelectedJob(updatedJob);
  };

  const deleteJob = (id: string) => {
      if (confirm("Delete this job card?")) {
          deleteServiceJob(id);
          setIsModalOpen(false);
      }
  };

  // --- Kanban Renderer ---
  const renderKanbanColumn = (status: string, title: string, colorClass: string) => {
    const jobs = filteredJobs.filter(j => j.status === status);
    
    return (
      <div className="flex-1 min-w-[300px] flex flex-col h-full bg-gray-100 dark:bg-gray-800/50 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
        <div className={`p-3 mb-2 rounded-lg font-bold flex justify-between items-center ${colorClass} bg-opacity-20 text-gray-800 dark:text-white`}>
          <span>{title}</span>
          <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs opacity-70">{jobs.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
          {jobs.map(job => (
            <div 
              key={job.id} 
              onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{job.ticketNumber}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(job.priority)}`}>{t(job.priority)}</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{job.clientName}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> {job.deviceInfo}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300 overflow-hidden">
                        {job.technicianName ? job.technicianName.charAt(0) : <User className="w-3 h-3" />}
                    </div>
                    <span className="text-xs text-gray-500 max-w-[80px] truncate">{job.technicianName || 'Unassigned'}</span>
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {formatCurrency(job.services.reduce((a,b)=>a+b.price,0) + job.usedParts.reduce((a,b)=>a+(b.price*b.quantity),0))}
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
              <div className="h-20 flex items-center justify-center text-gray-400 text-xs italic border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  No jobs
              </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('job_cards')} 🛠️</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('service_jobs_desc')}</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('board')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
            <button onClick={onAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> {t('new_job')}
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
        <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder={t('search_jobs')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
        </div>
        <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white min-w-[140px]"
        >
            <option value="all">{t('all_status')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('in_progress')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="invoiced">{t('invoiced')}</option>
        </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'board' ? (
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
                {renderKanbanColumn('pending', t('pending'), 'bg-orange-100')}
                {renderKanbanColumn('in_progress', t('in_progress'), 'bg-blue-100')}
                {renderKanbanColumn('completed', t('completed'), 'bg-green-100')}
                {/* Group others */}
                <div className="flex-1 min-w-[300px] flex flex-col h-full bg-gray-100 dark:bg-gray-800/50 rounded-xl p-2 border border-gray-200 dark:border-gray-700 opacity-75">
                    <div className="p-3 mb-2 rounded-lg font-bold flex justify-between items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <span>Archive (Invoiced/Cancelled)</span>
                        <span className="bg-white dark:bg-gray-600 px-2 py-0.5 rounded text-xs">{filteredJobs.filter(j => j.status === 'invoiced' || j.status === 'cancelled').length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 p-1 custom-scrollbar">
                        {filteredJobs.filter(j => j.status === 'invoiced' || j.status === 'cancelled').map(job => (
                            <div 
                                key={job.id} 
                                onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-gray-500">{job.ticketNumber}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(job.status)}`}>{t(job.status)}</span>
                                </div>
                                <div className="font-bold text-gray-800 dark:text-white mt-1">{job.clientName}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            // List View
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
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
                            <td className="px-6 py-4"><span className={getPriorityColor(job.priority)}>{t(job.priority)}</span></td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase border ${getStatusColor(job.status)}`}>
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
                                    onClick={() => deleteJob(job.id)}
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
        )}
      </div>

      {/* JOB CARD MODAL */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/30">
              <div>
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('job_details')}</h3>
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-sm font-mono font-bold">
                        {selectedJob.ticketNumber}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedJob.clientName} • {selectedJob.deviceInfo}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button>
            </div>

            {/* Modal Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    Overview & Resolution
                </button>
                <button 
                    onClick={() => setActiveTab('items')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    Services & Parts (Costing)
                </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                {activeTab === 'details' ? (
                    <div className="space-y-6">
                        {/* Top Controls Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Client */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('client')}</label>
                                <SearchableSelect 
                                    options={clients.map(c => ({ value: c.id, label: c.company }))}
                                    value={selectedJob.clientId}
                                    onChange={(val) => {
                                        const client = clients.find(c => c.id === val);
                                        if (client) {
                                            const updated = { ...selectedJob, clientId: client.id, clientName: client.company };
                                            updateServiceJob(updated);
                                            setSelectedJob(updated);
                                        }
                                    }}
                                    className="w-full rounded-lg text-sm"
                                    placeholder="Select Client..."
                                />
                            </div>

                            {/* Date */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date In</label>
                                <input 
                                    type="date"
                                    value={selectedJob.date}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, date: e.target.value };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                                />
                            </div>

                            {/* Status */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Status</label>
                                <select 
                                    value={selectedJob.status}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, status: e.target.value as any };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                                >
                                    <option value="pending">{t('pending')}</option>
                                    <option value="in_progress">{t('in_progress')}</option>
                                    <option value="completed">{t('completed')}</option>
                                    <option value="invoiced" disabled>{t('invoiced')}</option>
                                    <option value="cancelled">{t('cancelled')}</option>
                                </select>
                            </div>

                            {/* Technician */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Technician</label>
                                <select 
                                    value={selectedJob.technicianId || ''}
                                    onChange={(e) => {
                                        const tech = technicians.find(t => t.id === e.target.value);
                                        const updated = { ...selectedJob, technicianId: e.target.value, technicianName: tech?.name };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                                >
                                    <option value="">Unassigned</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            {/* Priority */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Priority</label>
                                <select
                                    value={selectedJob.priority}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, priority: e.target.value as any };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white font-medium"
                                >
                                    <option value="low">{t('low')}</option>
                                    <option value="medium">{t('medium')}</option>
                                    <option value="high">{t('high')}</option>
                                    <option value="critical">{t('critical')}</option>
                                </select>
                            </div>

                            {/* Estimated Cost */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Est. Cost</label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={selectedJob.estimatedCost}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, estimatedCost: parseFloat(e.target.value) || 0 };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white text-right"
                                />
                            </div>
                        </div>

                        {/* Device Info - Full Width */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                <Smartphone className="w-4 h-4" /> {t('device_info')}
                            </label>
                            <input 
                                type="text"
                                value={selectedJob.deviceInfo}
                                onChange={(e) => {
                                    const updated = { ...selectedJob, deviceInfo: e.target.value };
                                    updateServiceJob(updated);
                                    setSelectedJob(updated);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                            />
                        </div>

                        {/* Problem & Resolution */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <h4 className="font-bold text-sm uppercase">Reported Issue</h4>
                                </div>
                                <textarea 
                                    className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-sm dark:text-white resize-none"
                                    rows={3}
                                    value={selectedJob.problemDescription}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, problemDescription: e.target.value };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                />
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                                    <PenTool className="w-4 h-4" />
                                    <h4 className="font-bold text-sm uppercase">{t('resolution_notes')}</h4>
                                </div>
                                <textarea 
                                    className="flex-1 w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white min-h-[120px] focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                    placeholder="Enter technical notes and resolution details..."
                                    value={selectedJob.resolutionNotes || ''}
                                    onChange={(e) => {
                                        const updated = { ...selectedJob, resolutionNotes: e.target.value };
                                        updateServiceJob(updated);
                                        setSelectedJob(updated);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Add Items Control */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Add Service (Labor)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <SearchableSelect 
                                            options={serviceCatalog.map(s => ({ value: s.id, label: `${s.name} (${formatCurrency(s.basePrice)})` }))}
                                            value={selectedServiceToAdd}
                                            onChange={setSelectedServiceToAdd}
                                            placeholder="Select Service..."
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                    <button 
                                        onClick={addServiceToJob}
                                        disabled={!selectedServiceToAdd}
                                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Add Part (Inventory)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <SearchableSelect 
                                            options={products.map(p => ({ value: p.id, label: `${p.name} - Stock: ${p.stock}` }))}
                                            value={selectedPartToAdd}
                                            onChange={setSelectedPartToAdd}
                                            placeholder="Select Part..."
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                    <button 
                                        onClick={addPartToJob}
                                        disabled={!selectedPartToAdd}
                                        className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tables */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-sm flex justify-between">
                                <span>Billable Items</span>
                                <span>{formatCurrency(
                                    selectedJob.services.reduce((a,b)=>a+b.price,0) + 
                                    selectedJob.usedParts.reduce((a,b)=>a+(b.price*b.quantity),0)
                                )}</span>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                {/* Services List */}
                                {selectedJob.services.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Services</h5>
                                        <div className="space-y-2">
                                            {selectedJob.services.map((s, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded border border-indigo-100 dark:border-indigo-900/30">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-bold">{formatCurrency(s.price)}</span>
                                                        <button onClick={() => removeService(idx)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Parts List */}
                                {selectedJob.usedParts.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Parts</h5>
                                        <div className="space-y-2">
                                            {selectedJob.usedParts.map((p, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded border border-orange-100 dark:border-orange-900/30">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-orange-500" />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white block">{p.name}</span>
                                                            <span className="text-xs text-gray-500">Qty: {p.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-bold">{formatCurrency(p.price * p.quantity)}</span>
                                                        <button onClick={() => removePart(idx)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.services.length === 0 && selectedJob.usedParts.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 italic">No items added to this job card yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                <button 
                    onClick={() => deleteJob(selectedJob.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    Delete Job
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => printJobCard(selectedJob, settings)}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print Card
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                        {t('save')} & Close
                    </button>
                    {selectedJob.status !== 'invoiced' && selectedJob.status !== 'cancelled' && (
                        <div className="flex items-center gap-2">
                            {/* Simple warehouse select inside footer if parts exist */}
                            {selectedJob.usedParts.length > 0 && (
                                <select 
                                    value={invoiceWarehouseId} 
                                    onChange={(e) => setInvoiceWarehouseId(e.target.value)}
                                    className="px-2 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            )}
                            <button 
                                onClick={handleGenerateInvoice}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg shadow-green-200 dark:shadow-none transition-colors"
                            >
                                <Receipt className="w-4 h-4" /> Invoice Job
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceJobs;

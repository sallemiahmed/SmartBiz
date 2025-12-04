
import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, Mail, Phone, Users, Pencil, X, Save, Trash2, Eye, ArrowUp, ArrowDown,
  AlertTriangle, RotateCcw, Target, TrendingUp, Calendar, DollarSign, UserPlus, MessageSquare,
  PhoneCall, Video, FileText, ChevronRight, Clock, Building2, Globe, Tag
} from 'lucide-react';
import { Client, Prospect, ProspectInteraction } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

type ViewTab = 'clients' | 'prospects';

const Clients: React.FC = () => {
  const {
    clients, addClient, updateClient, deleteClient,
    prospects, addProspect, updateProspect, deleteProspect, convertProspectToClient, addProspectInteraction,
    employees, formatCurrency, settings, t
  } = useApp();

  // Active tab
  const [activeTab, setActiveTab] = useState<ViewTab>('clients');
  
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>({ key: 'company', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selection States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form State
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'active',
    category: 'Corporate',
    totalSpent: 0,
    address: '',
    taxId: '',
    customFields: {}
  });

  // --- Handlers ---

  const handleSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    setSortConfig({ key: 'company', direction: 'asc' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${Date.now()}`;
    const clientToAdd = { ...newClient, id } as Client;
    addClient(clientToAdd);
    setIsAddModalOpen(false);
    // Reset form
    setNewClient({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'active',
      category: 'Corporate',
      totalSpent: 0,
      address: '',
      taxId: '',
      customFields: {}
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      updateClient(selectedClient);
      setIsEditModalOpen(false);
      setSelectedClient(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isNew: boolean = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewClient(prev => ({ ...prev, [name]: value }));
    } else if (selectedClient) {
      setSelectedClient({ ...selectedClient, [name]: value });
    }
  };

  const handleCustomFieldChange = (key: string, value: any, isNew: boolean = false) => {
    if (isNew) {
      setNewClient(prev => ({ 
        ...prev, 
        customFields: { ...prev.customFields, [key]: value }
      }));
    } else if (selectedClient) {
      setSelectedClient(prev => prev ? ({
        ...prev,
        customFields: { ...prev.customFields, [key]: value }
      }) : null);
    }
  };

  // --- Process Data ---

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const sortedClients = useMemo(() => {
    let sortableItems = [...filteredClients];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const { key, direction } = sortConfig;
        const aValue = a[key];
        const bValue = b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredClients, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const SortIcon = ({ columnKey }: { columnKey: keyof Client }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  const renderCustomFields = (data: Partial<Client>, isNew: boolean) => {
    if (settings.customFields.clients.length === 0) return null;
    
    return (
      <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Additional Details</h4>
        {settings.customFields.clients.map(field => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
            {field.type === 'boolean' ? (
              <select
                value={data.customFields?.[field.key] === true ? 'true' : 'false'}
                onChange={(e) => handleCustomFieldChange(field.key, e.target.value === 'true', isNew)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            ) : (
              <input
                type={field.type}
                value={data.customFields?.[field.key] || ''}
                onChange={(e) => handleCustomFieldChange(field.key, e.target.value, isNew)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // =====================================================
  // PROSPECTS SECTION
  // =====================================================
  const [prospectSearch, setProspectSearch] = useState('');
  const [prospectStatusFilter, setProspectStatusFilter] = useState<string>('all');
  const [prospectPage, setProspectPage] = useState(1);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [isProspectViewOpen, setIsProspectViewOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  const [prospectForm, setProspectForm] = useState<Partial<Prospect>>({
    source: 'website',
    status: 'new',
    priority: 'medium',
    probability: 20
  });

  const [interactionForm, setInteractionForm] = useState<Partial<ProspectInteraction>>({
    type: 'call',
    date: new Date().toISOString().split('T')[0],
    summary: ''
  });

  const resetProspectForm = () => {
    setProspectForm({
      source: 'website',
      status: 'new',
      priority: 'medium',
      probability: 20
    });
    setEditingProspect(null);
  };

  const handleSaveProspect = () => {
    if (!prospectForm.company || !prospectForm.contactName || !prospectForm.email) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const assignee = employees.find(e => e.id === prospectForm.assignedTo);

    if (editingProspect) {
      updateProspect({
        ...editingProspect,
        ...prospectForm,
        assignedToName: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined
      } as Prospect);
    } else {
      const newProspect: Prospect = {
        id: `prospect-${Date.now()}`,
        company: prospectForm.company!,
        contactName: prospectForm.contactName!,
        email: prospectForm.email!,
        phone: prospectForm.phone || '',
        source: prospectForm.source as Prospect['source'],
        status: prospectForm.status as Prospect['status'],
        priority: prospectForm.priority as Prospect['priority'],
        estimatedValue: prospectForm.estimatedValue,
        probability: prospectForm.probability,
        assignedTo: prospectForm.assignedTo,
        assignedToName: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined,
        industry: prospectForm.industry,
        website: prospectForm.website,
        address: prospectForm.address,
        notes: prospectForm.notes,
        nextFollowUp: prospectForm.nextFollowUp,
        tags: prospectForm.tags,
        interactions: [],
        createdAt: new Date().toISOString()
      };
      addProspect(newProspect);
    }

    setIsProspectModalOpen(false);
    resetProspectForm();
  };

  const handleAddInteraction = () => {
    if (!selectedProspect || !interactionForm.summary) return;

    const newInteraction: ProspectInteraction = {
      id: `int-${Date.now()}`,
      prospectId: selectedProspect.id,
      type: interactionForm.type as ProspectInteraction['type'],
      date: interactionForm.date!,
      summary: interactionForm.summary!,
      outcome: interactionForm.outcome,
      nextAction: interactionForm.nextAction,
      createdBy: 'Current User'
    };

    addProspectInteraction(selectedProspect.id, newInteraction);
    setInteractionForm({ type: 'call', date: new Date().toISOString().split('T')[0], summary: '' });
    setIsInteractionModalOpen(false);
  };

  const handleConvertToClient = (prospect: Prospect) => {
    if (confirm(`Convertir "${prospect.company}" en client ?`)) {
      const newClient = convertProspectToClient(prospect.id);
      if (newClient) {
        alert(`Client "${newClient.company}" créé avec succès !`);
        setIsProspectViewOpen(false);
        setActiveTab('clients');
      }
    }
  };

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = p.company.toLowerCase().includes(prospectSearch.toLowerCase()) ||
        p.contactName.toLowerCase().includes(prospectSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(prospectSearch.toLowerCase());
      const matchesStatus = prospectStatusFilter === 'all' || p.status === prospectStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [prospects, prospectSearch, prospectStatusFilter]);

  const prospectStats = useMemo(() => {
    const total = prospects.length;
    const newProspects = prospects.filter(p => p.status === 'new').length;
    const qualified = prospects.filter(p => p.status === 'qualified' || p.status === 'proposal' || p.status === 'negotiation').length;
    const won = prospects.filter(p => p.status === 'won').length;
    const totalValue = prospects.filter(p => p.status !== 'lost' && p.status !== 'won')
      .reduce((acc, p) => acc + (p.estimatedValue || 0) * ((p.probability || 0) / 100), 0);
    return { total, newProspects, qualified, won, totalValue };
  }, [prospects]);

  const getProspectStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'contacted': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'qualified': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'proposal': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'negotiation': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'won': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const paginatedProspects = filteredProspects.slice((prospectPage - 1) * itemsPerPage, prospectPage * itemsPerPage);
  const totalProspectPages = Math.ceil(filteredProspects.length / itemsPerPage);

  return (
    <div className="p-6 relative">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('client_management')} 👥</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('client_desc')}</p>
        </div>
        <button
          onClick={() => activeTab === 'clients' ? setIsAddModalOpen(true) : (resetProspectForm(), setIsProspectModalOpen(true))}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'clients' ? t('add_client') : 'Nouveau Prospect'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'clients'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" /> Clients ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('prospects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'prospects'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <Target className="w-4 h-4" /> Prospects ({prospects.length})
        </button>
      </div>

      {/* CLIENTS TAB */}
      {activeTab === 'clients' && (
        <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-260px)]">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_clients')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
            
            {(searchTerm || statusFilter !== 'all') && (
              <button 
                onClick={handleResetFilters}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  onClick={() => handleSort('company')}
                >
                  {t('company_contact')} <SortIcon columnKey="company" />
                </th>
                <th className="px-6 py-4">{t('contact_details')}</th>
                <th className="px-6 py-4">Category</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('totalSpent')}
                >
                  {t('total_spent')} <SortIcon columnKey="totalSpent" />
                </th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {client.company.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{client.company}</div>
                        <div className="text-xs text-gray-500">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {client.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {client.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(client.totalSpent)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {t(client.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedClient(client); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedClient(client); setIsEditModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedClient(client); setIsDeleteModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{t('no_clients')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* --- MODALS --- */}
      {/* ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_client')}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_name')}</label>
                  <input
                    type="text"
                    name="company"
                    value={newClient.company}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newClient.email}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={newClient.phone}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tax_id')}</label>
                  <input
                    type="text"
                    name="taxId"
                    value={newClient.taxId}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Matricule Fiscal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                  <input
                    type="text"
                    name="address"
                    value={newClient.address}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Full Address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                    <select
                      name="status"
                      value={newClient.status}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="active">{t('active')}</option>
                      <option value="inactive">{t('inactive')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      name="category"
                      value={newClient.category}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                </div>
                {renderCustomFields(newClient, true)}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('add_client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_client')}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_name')}</label>
                  <input
                    type="text"
                    name="company"
                    value={selectedClient.company}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={selectedClient.name}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={selectedClient.email}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={selectedClient.phone}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tax_id')}</label>
                  <input
                    type="text"
                    name="taxId"
                    value={selectedClient.taxId || ''}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Matricule Fiscal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                  <input
                    type="text"
                    name="address"
                    value={selectedClient.address || ''}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Full Address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                    <select
                      name="status"
                      value={selectedClient.status}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="active">{t('active')}</option>
                      <option value="inactive">{t('inactive')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      name="category"
                      value={selectedClient.category}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                </div>
                {renderCustomFields(selectedClient, false)}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('client_details')}</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    {selectedClient.company.substring(0,2).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClient.company}</h3>
                   <div className="flex gap-2 mt-1">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedClient.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {t(selectedClient.status)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {selectedClient.category}
                      </span>
                   </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">Contact Person</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedClient.name}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">Email</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedClient.email}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">Phone</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedClient.phone}</span>
                 </div>
                 {selectedClient.taxId && (
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">{t('tax_id')}</span>
                      <span className="font-medium text-gray-900 dark:text-white font-mono">{selectedClient.taxId}</span>
                    </div>
                 )}
                 {selectedClient.address && (
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">{t('address')}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px]">{selectedClient.address}</span>
                    </div>
                 )}
                 {/* Render Custom Fields in View */}
                 {settings.customFields.clients.map(field => {
                   const val = selectedClient.customFields?.[field.key];
                   if (val === undefined || val === '') return null;
                   return (
                     <div key={field.id} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                       <span className="text-gray-500 dark:text-gray-400">{field.label}</span>
                       <span className="font-medium text-gray-900 dark:text-white">
                         {field.type === 'boolean' ? (val ? 'Yes' : 'No') : val}
                       </span>
                     </div>
                   );
                 })}
                 <div className="flex justify-between pt-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('total_spent')}</span>
                   <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedClient.totalSpent)}</span>
                 </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE Confirmation Modal */}
      {isDeleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_confirm_msg')} <span className="font-bold text-gray-900 dark:text-white">{selectedClient.company}</span>
             </p>
             <div className="flex gap-3 justify-center">
               <button 
                 onClick={() => setIsDeleteModalOpen(false)}
                 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
               >
                 {t('cancel')}
               </button>
               <button 
                 onClick={handleDeleteConfirm}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
               >
                 {t('yes_delete')}
               </button>
             </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* PROSPECTS TAB */}
      {activeTab === 'prospects' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_prospects')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prospectStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('new_prospects')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prospectStats.newProspects}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('qualified_prospects')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{prospectStats.qualified}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('pipeline_value')}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(prospectStats.totalValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prospects List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-420px)]">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search_prospects')}
                  value={prospectSearch}
                  onChange={(e) => setProspectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={prospectStatusFilter}
                  onChange={(e) => setProspectStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  <option value="all">{t('all_statuses')}</option>
                  <option value="new">{t('status_new')}</option>
                  <option value="contacted">{t('status_contacted')}</option>
                  <option value="qualified">{t('status_qualified')}</option>
                  <option value="proposal">{t('status_proposal')}</option>
                  <option value="negotiation">{t('status_negotiation')}</option>
                  <option value="won">{t('status_won')}</option>
                  <option value="lost">{t('status_lost')}</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-4">{t('company')} / {t('contact')}</th>
                    <th className="px-6 py-4">{t('source')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4">{t('priority')}</th>
                    <th className="px-6 py-4">{t('estimated_value')}</th>
                    <th className="px-6 py-4">{t('next_follow_up')}</th>
                    <th className="px-6 py-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedProspects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {prospect.company.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{prospect.company}</div>
                            <div className="text-xs text-gray-500">{prospect.contactName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {t(`source_${prospect.source}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProspectStatusColor(prospect.status)}`}>
                          {t(`status_${prospect.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(prospect.priority)}`}></div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">{t(`priority_${prospect.priority}`)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {prospect.estimatedValue ? formatCurrency(prospect.estimatedValue) : '-'}
                        {prospect.probability && <span className="text-xs text-gray-500 ml-1">({prospect.probability}%)</span>}
                      </td>
                      <td className="px-6 py-4">
                        {prospect.nextFollowUp ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(prospect.nextFollowUp).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedProspect(prospect); setIsProspectViewOpen(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title={t('view_details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingProspect(prospect); setProspectForm(prospect); setIsProspectModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {prospect.status !== 'won' && prospect.status !== 'lost' && (
                            <button
                              onClick={() => handleConvertToClient(prospect)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title={t('convert_to_client')}
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { if (confirm(t('delete_prospect'))) deleteProspect(prospect.id); }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedProspects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('no_prospects')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={prospectPage}
              totalPages={totalProspectPages}
              onPageChange={setProspectPage}
              totalItems={filteredProspects.length}
              itemsPerPage={itemsPerPage}
            />
          </div>

          {/* Prospect Modal (Add/Edit) */}
          {isProspectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingProspect ? t('edit_prospect') : t('new_prospect')}
                  </h2>
                  <button onClick={() => { setIsProspectModalOpen(false); resetProspectForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company')} *</label>
                      <input
                        type="text"
                        value={prospectForm.company || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, company: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact')} *</label>
                      <input
                        type="text"
                        value={prospectForm.contactName || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, contactName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')} *</label>
                      <input
                        type="email"
                        value={prospectForm.email || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                      <input
                        type="text"
                        value={prospectForm.phone || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('source')}</label>
                      <select
                        value={prospectForm.source || 'website'}
                        onChange={(e) => setProspectForm({ ...prospectForm, source: e.target.value as Prospect['source'] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="website">{t('source_website')}</option>
                        <option value="referral">{t('source_referral')}</option>
                        <option value="social_media">{t('source_social_media')}</option>
                        <option value="cold_call">{t('source_cold_call')}</option>
                        <option value="trade_show">{t('source_trade_show')}</option>
                        <option value="advertising">{t('source_advertising')}</option>
                        <option value="other">{t('source_other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                      <select
                        value={prospectForm.status || 'new'}
                        onChange={(e) => setProspectForm({ ...prospectForm, status: e.target.value as Prospect['status'] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="new">{t('status_new')}</option>
                        <option value="contacted">{t('status_contacted')}</option>
                        <option value="qualified">{t('status_qualified')}</option>
                        <option value="proposal">{t('status_proposal')}</option>
                        <option value="negotiation">{t('status_negotiation')}</option>
                        <option value="won">{t('status_won')}</option>
                        <option value="lost">{t('status_lost')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('priority')}</label>
                      <select
                        value={prospectForm.priority || 'medium'}
                        onChange={(e) => setProspectForm({ ...prospectForm, priority: e.target.value as Prospect['priority'] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="low">{t('priority_low')}</option>
                        <option value="medium">{t('priority_medium')}</option>
                        <option value="high">{t('priority_high')}</option>
                        <option value="hot">{t('priority_hot')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('estimated_value')}</label>
                      <input
                        type="number"
                        value={prospectForm.estimatedValue || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, estimatedValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('probability')} (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prospectForm.probability || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, probability: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('industry')}</label>
                      <input
                        type="text"
                        value={prospectForm.industry || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, industry: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('website')}</label>
                      <input
                        type="url"
                        value={prospectForm.website || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, website: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('assigned_to')}</label>
                      <select
                        value={prospectForm.assignedTo || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="">{t('not_assigned')}</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('next_follow_up')}</label>
                      <input
                        type="date"
                        value={prospectForm.nextFollowUp || ''}
                        onChange={(e) => setProspectForm({ ...prospectForm, nextFollowUp: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                    <input
                      type="text"
                      value={prospectForm.address || ''}
                      onChange={(e) => setProspectForm({ ...prospectForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                    <textarea
                      value={prospectForm.notes || ''}
                      onChange={(e) => setProspectForm({ ...prospectForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsProspectModalOpen(false); resetProspectForm(); }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSaveProspect}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingProspect ? t('save_changes') : t('create')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prospect View Modal */}
          {isProspectViewOpen && selectedProspect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedProspect.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProspect.company}</h2>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProspectStatusColor(selectedProspect.status)}`}>
                          {t(`status_${selectedProspect.status}`)}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedProspect.priority)}`}></div>
                          <span className="text-xs text-gray-500">{t(`priority_${selectedProspect.priority}`)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsProspectViewOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4" /> {t('contact_info')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" /> {selectedProspect.contactName}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" /> {selectedProspect.email}
                        </div>
                        {selectedProspect.phone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" /> {selectedProspect.phone}
                          </div>
                        )}
                        {selectedProspect.website && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Globe className="w-4 h-4" /> {selectedProspect.website}
                          </div>
                        )}
                        {selectedProspect.address && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="w-4 h-4" /> {selectedProspect.address}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Opportunity Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {t('opportunity')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedProspect.estimatedValue && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('estimated_value')}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedProspect.estimatedValue)}</span>
                          </div>
                        )}
                        {selectedProspect.probability !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('probability')}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedProspect.probability}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('source')}:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{t(`source_${selectedProspect.source}`)}</span>
                        </div>
                        {selectedProspect.industry && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('industry')}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedProspect.industry}</span>
                          </div>
                        )}
                        {selectedProspect.assignedToName && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('assigned_to')}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedProspect.assignedToName}</span>
                          </div>
                        )}
                        {selectedProspect.nextFollowUp && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('next_follow_up')}:</span>
                            <span className="font-medium text-indigo-600">{new Date(selectedProspect.nextFollowUp).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedProspect.notes && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" /> {t('notes')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        {selectedProspect.notes}
                      </p>
                    </div>
                  )}

                  {/* Interactions */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> {t('interaction_history')}
                      </h3>
                      <button
                        onClick={() => setIsInteractionModalOpen(true)}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> {t('add')}
                      </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {(selectedProspect.interactions || []).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">{t('no_interactions')}</p>
                      ) : (
                        selectedProspect.interactions?.map((interaction) => (
                          <div key={interaction.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              {interaction.type === 'call' && <PhoneCall className="w-4 h-4 text-green-500" />}
                              {interaction.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                              {interaction.type === 'meeting' && <Video className="w-4 h-4 text-purple-500" />}
                              {interaction.type === 'note' && <FileText className="w-4 h-4 text-gray-500" />}
                              <span className="text-xs text-gray-500">{new Date(interaction.date).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-400">• {t(`interaction_${interaction.type}`)}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{interaction.summary}</p>
                            {interaction.outcome && (
                              <p className="text-xs text-gray-500 mt-1">{t('outcome')}: {interaction.outcome}</p>
                            )}
                            {interaction.nextAction && (
                              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                <ChevronRight className="w-3 h-3" /> {interaction.nextAction}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingProspect(selectedProspect); setProspectForm(selectedProspect); setIsProspectModalOpen(true); setIsProspectViewOpen(false); }}
                      className="px-4 py-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> {t('edit')}
                    </button>
                    {selectedProspect.status !== 'won' && selectedProspect.status !== 'lost' && (
                      <button
                        onClick={() => handleConvertToClient(selectedProspect)}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" /> {t('convert_to_client')}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setIsProspectViewOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interaction Modal */}
          {isInteractionModalOpen && selectedProspect && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('new_interaction')}</h2>
                  <button onClick={() => setIsInteractionModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('interaction_type')}</label>
                      <select
                        value={interactionForm.type || 'call'}
                        onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as ProspectInteraction['type'] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="call">{t('interaction_call')}</option>
                        <option value="email">{t('interaction_email')}</option>
                        <option value="meeting">{t('interaction_meeting')}</option>
                        <option value="note">{t('interaction_note')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                      <input
                        type="date"
                        value={interactionForm.date || ''}
                        onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('summary')} *</label>
                    <textarea
                      value={interactionForm.summary || ''}
                      onChange={(e) => setInteractionForm({ ...interactionForm, summary: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('outcome')}</label>
                    <input
                      type="text"
                      value={interactionForm.outcome || ''}
                      onChange={(e) => setInteractionForm({ ...interactionForm, outcome: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('next_action')}</label>
                    <input
                      type="text"
                      value={interactionForm.nextAction || ''}
                      onChange={(e) => setInteractionForm({ ...interactionForm, nextAction: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setIsInteractionModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddInteraction}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> {t('add_interaction')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Clients;


import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, Mail, Phone, Users, Pencil, X, Save, Trash2, Eye, ArrowUp, ArrowDown,
  AlertTriangle, RotateCcw, Target, TrendingUp, Calendar, DollarSign, UserPlus, MessageSquare,
  PhoneCall, Video, FileText, ChevronRight, Clock, Building2, Globe, Tag, UserCheck, Briefcase,
  Star, Smartphone, User, History, BarChart3, Receipt, Handshake, CheckCircle, XCircle, PlayCircle
} from 'lucide-react';
import { Client, ClientContact, ClientInteraction, Opportunity, Prospect, ProspectInteraction } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

type ViewTab = 'clients' | 'prospects' | 'pipeline';

const Clients: React.FC = () => {
  const {
    clients, addClient, updateClient, deleteClient,
    addClientContact, updateClientContact, deleteClientContact, setClientPrimaryContact, assignSalesRep,
    prospects, addProspect, updateProspect, deleteProspect, convertProspectToClient, addProspectInteraction,
    opportunities, addOpportunity, updateOpportunity, deleteOpportunity, updateOpportunityStage, getClientOpportunities, getClientInteractions, getProspectOpportunities,
    clientInteractions, addClientInteraction,
    invoices,
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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSalesRepModalOpen, setIsSalesRepModalOpen] = useState(false);

  // Selection States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);
  const [viewTab, setViewTab] = useState<'info' | 'contacts' | 'history' | 'opportunities' | 'revenue'>('info');
  const [isClientInteractionModalOpen, setIsClientInteractionModalOpen] = useState(false);
  const [isClientOpportunityModalOpen, setIsClientOpportunityModalOpen] = useState(false);

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

  // Contact Form State
  const [contactForm, setContactForm] = useState<Partial<ClientContact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    role: 'other',
    jobTitle: '',
    department: '',
    isPrimary: false,
    notes: ''
  });

  const resetContactForm = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile: '',
      role: 'other',
      jobTitle: '',
      department: '',
      isPrimary: false,
      notes: ''
    });
    setSelectedContact(null);
  };

  // Client Interaction Form State
  const [clientInteractionForm, setClientInteractionForm] = useState<Partial<ClientInteraction>>({
    type: 'call',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    description: '',
    outcome: '',
    nextAction: '',
    nextActionDate: '',
    duration: 30
  });

  const resetClientInteractionForm = () => {
    setClientInteractionForm({
      type: 'call',
      date: new Date().toISOString().split('T')[0],
      subject: '',
      description: '',
      outcome: '',
      nextAction: '',
      nextActionDate: '',
      duration: 30
    });
  };

  // Client Opportunity Form State
  const [clientOpportunityForm, setClientOpportunityForm] = useState<Partial<Opportunity>>({
    title: '',
    amount: 0,
    probability: 50,
    currency: settings.currency,
    stage: 'new',
    expectedCloseDate: '',
    salesRepId: '',
    salesRepName: '',
    nextAction: '',
    nextActionDate: '',
    source: '',
    notes: ''
  });

  const resetClientOpportunityForm = () => {
    setClientOpportunityForm({
      title: '',
      amount: 0,
      probability: 50,
      currency: settings.currency,
      stage: 'new',
      expectedCloseDate: '',
      salesRepId: '',
      salesRepName: '',
      nextAction: '',
      nextActionDate: '',
      source: '',
      notes: ''
    });
  };

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

  // Contact Handlers
  const handleSaveContact = () => {
    if (!selectedClient || !contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      return;
    }

    if (selectedContact) {
      // Update existing contact
      updateClientContact(selectedClient.id, {
        ...selectedContact,
        ...contactForm,
        updatedAt: new Date().toISOString()
      } as ClientContact);
    } else {
      // Add new contact
      const newContact: ClientContact = {
        id: `contact-${Date.now()}`,
        clientId: selectedClient.id,
        firstName: contactForm.firstName!,
        lastName: contactForm.lastName!,
        email: contactForm.email!,
        phone: contactForm.phone,
        mobile: contactForm.mobile,
        role: contactForm.role as ClientContact['role'],
        jobTitle: contactForm.jobTitle,
        department: contactForm.department,
        isPrimary: contactForm.isPrimary || false,
        notes: contactForm.notes,
        createdAt: new Date().toISOString()
      };
      addClientContact(selectedClient.id, newContact);
    }

    // Refresh the selected client from state
    const updatedClient = clients.find(c => c.id === selectedClient.id);
    if (updatedClient) {
      setSelectedClient(updatedClient);
    }

    setIsContactModalOpen(false);
    resetContactForm();
  };

  const handleEditContact = (contact: ClientContact) => {
    setSelectedContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      role: contact.role,
      jobTitle: contact.jobTitle,
      department: contact.department,
      isPrimary: contact.isPrimary,
      notes: contact.notes
    });
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (!selectedClient) return;
    if (confirm(t('delete_contact_confirm') || 'Are you sure you want to delete this contact?')) {
      deleteClientContact(selectedClient.id, contactId);
      // Refresh selected client
      setTimeout(() => {
        const updatedClient = clients.find(c => c.id === selectedClient.id);
        if (updatedClient) setSelectedClient(updatedClient);
      }, 100);
    }
  };

  const handleSetPrimaryContact = (contactId: string) => {
    if (!selectedClient) return;
    setClientPrimaryContact(selectedClient.id, contactId);
    // Refresh selected client
    setTimeout(() => {
      const updatedClient = clients.find(c => c.id === selectedClient.id);
      if (updatedClient) setSelectedClient(updatedClient);
    }, 100);
  };

  const handleAssignSalesRep = (employeeId: string) => {
    if (!selectedClient) return;
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      assignSalesRep(selectedClient.id, employeeId, `${employee.firstName} ${employee.lastName}`);
      // Refresh selected client
      setTimeout(() => {
        const updatedClient = clients.find(c => c.id === selectedClient.id);
        if (updatedClient) setSelectedClient(updatedClient);
      }, 100);
    }
    setIsSalesRepModalOpen(false);
  };

  const getRoleLabel = (role: ClientContact['role']) => {
    const labels: Record<ClientContact['role'], string> = {
      decision_maker: t('role_decision_maker') || 'Decision Maker',
      technical: t('role_technical') || 'Technical',
      purchasing: t('role_purchasing') || 'Purchasing',
      accounting: t('role_accounting') || 'Accounting',
      operations: t('role_operations') || 'Operations',
      other: t('role_other') || 'Other'
    };
    return labels[role] || role;
  };

  const getInteractionTypeLabel = (type: ClientInteraction['type']) => {
    const labels: Record<ClientInteraction['type'], string> = {
      call: t('interaction_call') || 'Call',
      email: t('interaction_email') || 'Email',
      meeting: t('interaction_meeting') || 'Meeting',
      note: t('interaction_note') || 'Note',
      task: t('interaction_task') || 'Task',
      demo: t('interaction_demo') || 'Demo'
    };
    return labels[type] || type;
  };

  const getInteractionTypeIcon = (type: ClientInteraction['type']) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'task': return <CheckCircle className="w-4 h-4" />;
      case 'demo': return <PlayCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStageLabel = (stage: Opportunity['stage']) => {
    const labels: Record<Opportunity['stage'], string> = {
      new: t('stage_new') || 'New',
      qualified: t('stage_qualified') || 'Qualified',
      proposal: t('stage_proposal') || 'Proposal',
      negotiation: t('stage_negotiation') || 'Negotiation',
      won: t('stage_won') || 'Won',
      lost: t('stage_lost') || 'Lost'
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: Opportunity['stage']) => {
    switch (stage) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'qualified': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'proposal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'negotiation': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'won': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Handlers for Client Interactions
  const handleAddClientInteraction = () => {
    if (!selectedClient || !clientInteractionForm.subject) return;
    const newInteraction: ClientInteraction = {
      id: `ci-${Date.now()}`,
      clientId: selectedClient.id,
      type: clientInteractionForm.type as ClientInteraction['type'],
      date: clientInteractionForm.date || new Date().toISOString().split('T')[0],
      subject: clientInteractionForm.subject,
      description: clientInteractionForm.description,
      outcome: clientInteractionForm.outcome,
      nextAction: clientInteractionForm.nextAction,
      nextActionDate: clientInteractionForm.nextActionDate,
      performedById: employees[0]?.id || 'system',
      performedByName: employees[0]?.firstName + ' ' + employees[0]?.lastName || 'System',
      duration: clientInteractionForm.duration,
      createdAt: new Date().toISOString()
    };
    addClientInteraction(newInteraction);
    resetClientInteractionForm();
    setIsClientInteractionModalOpen(false);
  };

  // Handlers for Client Opportunities
  const handleAddClientOpportunity = () => {
    if (!selectedClient || !clientOpportunityForm.title || !clientOpportunityForm.amount) return;
    const newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      title: clientOpportunityForm.title,
      clientId: selectedClient.id,
      clientName: selectedClient.company,
      amount: clientOpportunityForm.amount,
      probability: clientOpportunityForm.probability || 50,
      weightedAmount: (clientOpportunityForm.amount * (clientOpportunityForm.probability || 50)) / 100,
      currency: clientOpportunityForm.currency || settings.currency,
      stage: clientOpportunityForm.stage as Opportunity['stage'] || 'new',
      expectedCloseDate: clientOpportunityForm.expectedCloseDate || '',
      salesRepId: clientOpportunityForm.salesRepId || selectedClient.salesRepId || '',
      salesRepName: clientOpportunityForm.salesRepName || selectedClient.salesRepName || '',
      nextAction: clientOpportunityForm.nextAction,
      nextActionDate: clientOpportunityForm.nextActionDate,
      source: clientOpportunityForm.source,
      notes: clientOpportunityForm.notes,
      createdAt: new Date().toISOString()
    };
    addOpportunity(newOpportunity);
    resetClientOpportunityForm();
    setIsClientOpportunityModalOpen(false);
  };

  // Get client stats
  const getClientStats = (clientId: string) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId && inv.type === 'invoice');
    const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = clientInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = totalRevenue - paidAmount;
    const invoiceCount = clientInvoices.length;
    const clientOpps = getClientOpportunities(clientId);
    const openOpportunities = clientOpps.filter(o => !['won', 'lost'].includes(o.stage));
    const totalPipeline = openOpportunities.reduce((sum, o) => sum + (o.weightedAmount || 0), 0);
    return { totalRevenue, paidAmount, pendingAmount, invoiceCount, openOpportunities: openOpportunities.length, totalPipeline };
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

  // Prospect Opportunity Modal State
  const [isProspectOpportunityModalOpen, setIsProspectOpportunityModalOpen] = useState(false);
  const [prospectViewTab, setProspectViewTab] = useState<'info' | 'interactions' | 'opportunities'>('info');
  const [prospectOpportunityForm, setProspectOpportunityForm] = useState<Partial<Opportunity>>({
    title: '',
    amount: 0,
    probability: 50,
    currency: settings.currency,
    stage: 'new',
    expectedCloseDate: '',
    salesRepId: '',
    salesRepName: '',
    nextAction: '',
    nextActionDate: '',
    source: '',
    notes: ''
  });

  const resetProspectOpportunityForm = () => {
    setProspectOpportunityForm({
      title: '',
      amount: 0,
      probability: 50,
      currency: settings.currency,
      stage: 'new',
      expectedCloseDate: '',
      salesRepId: '',
      salesRepName: '',
      nextAction: '',
      nextActionDate: '',
      source: '',
      notes: ''
    });
  };

  // =====================================================
  // PIPELINE SECTION
  // =====================================================
  const [pipelineView, setPipelineView] = useState<'kanban' | 'list'>('kanban');
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>('all');
  const [pipelineSalesRepFilter, setPipelineSalesRepFilter] = useState<string>('all');
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isOpportunityDetailModalOpen, setIsOpportunityDetailModalOpen] = useState(false);
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);

  // Define stages for the Kanban pipeline
  const pipelineStages: { key: Opportunity['stage']; label: string; color: string }[] = [
    { key: 'new', label: t('stage_new') || 'New', color: 'bg-blue-500' },
    { key: 'qualified', label: t('stage_qualified') || 'Qualified', color: 'bg-cyan-500' },
    { key: 'proposal', label: t('stage_proposal') || 'Proposal', color: 'bg-purple-500' },
    { key: 'negotiation', label: t('stage_negotiation') || 'Negotiation', color: 'bg-orange-500' },
    { key: 'won', label: t('stage_won') || 'Won', color: 'bg-green-500' },
    { key: 'lost', label: t('stage_lost') || 'Lost', color: 'bg-red-500' }
  ];

  // Filter opportunities for the pipeline
  const filteredPipelineOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = pipelineSearch === '' ||
        opp.title.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        (opp.clientName?.toLowerCase().includes(pipelineSearch.toLowerCase())) ||
        (opp.prospectName?.toLowerCase().includes(pipelineSearch.toLowerCase()));
      const matchesStage = pipelineStageFilter === 'all' || opp.stage === pipelineStageFilter;
      const matchesSalesRep = pipelineSalesRepFilter === 'all' || opp.salesRepId === pipelineSalesRepFilter;
      return matchesSearch && matchesStage && matchesSalesRep;
    });
  }, [opportunities, pipelineSearch, pipelineStageFilter, pipelineSalesRepFilter]);

  // Calculate pipeline stats
  const pipelineStats = useMemo(() => {
    const activeOpps = opportunities.filter(o => !['won', 'lost'].includes(o.stage));
    const totalValue = activeOpps.reduce((sum, o) => sum + o.amount, 0);
    const weightedValue = activeOpps.reduce((sum, o) => sum + (o.weightedAmount || 0), 0);
    const wonValue = opportunities.filter(o => o.stage === 'won').reduce((sum, o) => sum + o.amount, 0);
    const lostValue = opportunities.filter(o => o.stage === 'lost').reduce((sum, o) => sum + o.amount, 0);
    const activeCount = activeOpps.length;
    const wonCount = opportunities.filter(o => o.stage === 'won').length;
    const lostCount = opportunities.filter(o => o.stage === 'lost').length;
    const conversionRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;
    return { totalValue, weightedValue, wonValue, lostValue, activeCount, wonCount, lostCount, conversionRate };
  }, [opportunities]);

  // Handle drag and drop for Kanban
  const handleDragStart = (opp: Opportunity) => {
    setDraggedOpportunity(opp);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: Opportunity['stage']) => {
    if (draggedOpportunity && draggedOpportunity.stage !== stage) {
      updateOpportunityStage(draggedOpportunity.id, stage);
    }
    setDraggedOpportunity(null);
  };

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

  // Handler for adding prospect opportunity
  const handleAddProspectOpportunity = () => {
    if (!selectedProspect || !prospectOpportunityForm.title || !prospectOpportunityForm.amount) return;
    const newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      title: prospectOpportunityForm.title,
      prospectId: selectedProspect.id,
      prospectName: selectedProspect.company,
      amount: prospectOpportunityForm.amount,
      probability: prospectOpportunityForm.probability || 50,
      weightedAmount: (prospectOpportunityForm.amount * (prospectOpportunityForm.probability || 50)) / 100,
      currency: prospectOpportunityForm.currency || settings.currency,
      stage: prospectOpportunityForm.stage as Opportunity['stage'] || 'new',
      expectedCloseDate: prospectOpportunityForm.expectedCloseDate || '',
      salesRepId: prospectOpportunityForm.salesRepId || selectedProspect.assignedTo || '',
      salesRepName: prospectOpportunityForm.salesRepName || selectedProspect.assignedToName || '',
      nextAction: prospectOpportunityForm.nextAction,
      nextActionDate: prospectOpportunityForm.nextActionDate,
      source: prospectOpportunityForm.source || selectedProspect.source,
      notes: prospectOpportunityForm.notes,
      createdAt: new Date().toISOString()
    };
    addOpportunity(newOpportunity);
    resetProspectOpportunityForm();
    setIsProspectOpportunityModalOpen(false);
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
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pipeline'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Pipeline ({opportunities.filter(o => !['won', 'lost'].includes(o.stage)).length})
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

      {/* VIEW Modal - Enhanced with Tabs */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    {selectedClient.company.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClient.company}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
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
                      {selectedClient.salesRepName && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {selectedClient.salesRepName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setIsViewModalOpen(false); setViewTab('info'); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
                <button
                  onClick={() => setViewTab('info')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewTab === 'info'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-1" />
                  {t('info') || 'Info'}
                </button>
                <button
                  onClick={() => setViewTab('contacts')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewTab === 'contacts'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('contacts') || 'Contacts'} ({selectedClient.contacts?.length || 0})
                </button>
                <button
                  onClick={() => setViewTab('history')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewTab === 'history'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <History className="w-4 h-4 inline mr-1" />
                  {t('history') || 'History'}
                </button>
                <button
                  onClick={() => setViewTab('opportunities')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewTab === 'opportunities'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Handshake className="w-4 h-4 inline mr-1" />
                  {t('opportunities') || 'Opportunities'}
                </button>
                <button
                  onClick={() => setViewTab('revenue')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewTab === 'revenue'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  {t('revenue') || 'Revenue'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {viewTab === 'info' ? (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('contact_person') || 'Contact Person'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedClient.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedClient.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('phone') || 'Phone'}</span>
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
                      <span className="font-medium text-gray-900 dark:text-white text-right max-w-[250px]">{selectedClient.address}</span>
                    </div>
                  )}

                  {/* Sales Representative */}
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('sales_rep') || 'Sales Representative'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedClient.salesRepName || t('not_assigned') || 'Not assigned'}
                      </span>
                      <button
                        onClick={() => setIsSalesRepModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        title={t('assign_sales_rep') || 'Assign Sales Rep'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Custom Fields */}
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
              ) : (
                /* Contacts Tab */
                <div className="space-y-4">
                  {/* Add Contact Button */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('manage_contacts') || 'Manage Contacts'}
                    </h4>
                    <button
                      onClick={() => { resetContactForm(); setIsContactModalOpen(true); }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('add_contact') || 'Add Contact'}
                    </button>
                  </div>

                  {/* Contacts List */}
                  {(!selectedClient.contacts || selectedClient.contacts.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('no_contacts') || 'No contacts added yet'}</p>
                      <p className="text-sm">{t('add_contact_hint') || 'Add contacts to manage multiple people for this client'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.contacts.map(contact => (
                        <div
                          key={contact.id}
                          className={`p-4 rounded-lg border ${
                            contact.isPrimary
                              ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {contact.firstName} {contact.lastName}
                                  </span>
                                  {contact.isPrimary && (
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 text-xs rounded-full flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      {t('primary') || 'Primary'}
                                    </span>
                                  )}
                                </div>
                                {contact.jobTitle && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.jobTitle}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                    {getRoleLabel(contact.role)}
                                  </span>
                                  {contact.department && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                      {contact.department}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-indigo-600">
                                    <Mail className="w-3 h-3" />
                                    {contact.email}
                                  </a>
                                  {contact.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {contact.phone}
                                    </span>
                                  )}
                                  {contact.mobile && (
                                    <span className="flex items-center gap-1">
                                      <Smartphone className="w-3 h-3" />
                                      {contact.mobile}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!contact.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimaryContact(contact.id)}
                                  className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                  title={t('set_as_primary') || 'Set as Primary'}
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                                title={t('edit') || 'Edit'}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title={t('delete') || 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {viewTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('interaction_history') || 'Interaction History'}
                    </h4>
                    <button
                      onClick={() => { resetClientInteractionForm(); setIsClientInteractionModalOpen(true); }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('add_interaction') || 'Add Interaction'}
                    </button>
                  </div>

                  {getClientInteractions(selectedClient.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('no_interactions') || 'No interactions recorded yet'}</p>
                      <p className="text-sm">{t('add_interaction_hint') || 'Track calls, meetings, emails, and notes'}</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-4">
                        {getClientInteractions(selectedClient.id).map((interaction) => (
                          <div key={interaction.id} className="relative pl-10">
                            <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                              interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' :
                              interaction.type === 'call' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                              interaction.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                              interaction.type === 'demo' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {getInteractionTypeIcon(interaction.type)}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-white">{interaction.subject}</span>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                                      {getInteractionTypeLabel(interaction.type)}
                                    </span>
                                    {interaction.duration && <span><Clock className="w-3 h-3 inline" /> {interaction.duration}min</span>}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(interaction.date).toLocaleDateString()}
                                </span>
                              </div>
                              {interaction.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{interaction.description}</p>
                              )}
                              {interaction.outcome && (
                                <div className="text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">{t('outcome') || 'Outcome'}: </span>
                                  <span className="text-gray-700 dark:text-gray-300">{interaction.outcome}</span>
                                </div>
                              )}
                              {interaction.nextAction && (
                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                                  <span className="text-yellow-700 dark:text-yellow-400 font-medium">{t('next_action') || 'Next Action'}: </span>
                                  <span className="text-yellow-600 dark:text-yellow-300">{interaction.nextAction}</span>
                                  {interaction.nextActionDate && (
                                    <span className="text-yellow-500 dark:text-yellow-400 ml-2">({interaction.nextActionDate})</span>
                                  )}
                                </div>
                              )}
                              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                {t('by') || 'By'}: {interaction.performedByName}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Opportunities Tab */}
              {viewTab === 'opportunities' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('client_opportunities') || 'Client Opportunities'}
                    </h4>
                    <button
                      onClick={() => { resetClientOpportunityForm(); setIsClientOpportunityModalOpen(true); }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t('add_opportunity') || 'Add Opportunity'}
                    </button>
                  </div>

                  {getClientOpportunities(selectedClient.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Handshake className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('no_opportunities') || 'No opportunities yet'}</p>
                      <p className="text-sm">{t('add_opportunity_hint') || 'Track sales opportunities for this client'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getClientOpportunities(selectedClient.id).map((opp) => (
                        <div key={opp.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{opp.title}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStageColor(opp.stage)}`}>
                                  {getStageLabel(opp.stage)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {opp.probability}% {t('probability') || 'probability'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(opp.amount)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {t('weighted') || 'Weighted'}: {formatCurrency(opp.weightedAmount || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {t('expected_close') || 'Expected close'}: {opp.expectedCloseDate}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              <UserCheck className="w-3 h-3 inline mr-1" />
                              {opp.salesRepName}
                            </span>
                          </div>
                          {opp.nextAction && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                              <span className="text-blue-700 dark:text-blue-400">{t('next_action') || 'Next'}: </span>
                              <span className="text-blue-600 dark:text-blue-300">{opp.nextAction}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Revenue Tab */}
              {viewTab === 'revenue' && (() => {
                const stats = getClientStats(selectedClient.id);
                const clientInvoices = invoices.filter(inv => inv.clientId === selectedClient.id && inv.type === 'invoice');
                return (
                  <div className="space-y-4">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xs text-green-600 dark:text-green-400">{t('total_revenue') || 'Total Revenue'}</div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(stats.totalRevenue)}</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xs text-blue-600 dark:text-blue-400">{t('paid') || 'Paid'}</div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stats.paidAmount)}</div>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-xs text-orange-600 dark:text-orange-400">{t('pending') || 'Pending'}</div>
                        <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatCurrency(stats.pendingAmount)}</div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-xs text-purple-600 dark:text-purple-400">{t('pipeline') || 'Pipeline'}</div>
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(stats.totalPipeline)}</div>
                      </div>
                    </div>

                    {/* Recent Invoices */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('recent_invoices') || 'Recent Invoices'}</h4>
                      {clientInvoices.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{t('no_invoices') || 'No invoices yet'}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {clientInvoices.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                              <div>
                                <span className="font-mono text-sm text-gray-900 dark:text-white">{inv.number}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{inv.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {t(inv.status) || inv.status}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => { setIsViewModalOpen(false); setViewTab('info'); }}
                className="w-full py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Interaction Form Modal */}
      {isClientInteractionModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('add_interaction') || 'Add Interaction'}
              </h3>
              <button onClick={() => { setIsClientInteractionModalOpen(false); resetClientInteractionForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('type') || 'Type'}</label>
                  <select
                    value={clientInteractionForm.type}
                    onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, type: e.target.value as ClientInteraction['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="call">{t('interaction_call') || 'Call'}</option>
                    <option value="email">{t('interaction_email') || 'Email'}</option>
                    <option value="meeting">{t('interaction_meeting') || 'Meeting'}</option>
                    <option value="demo">{t('interaction_demo') || 'Demo'}</option>
                    <option value="task">{t('interaction_task') || 'Task'}</option>
                    <option value="note">{t('interaction_note') || 'Note'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date') || 'Date'}</label>
                  <input
                    type="date"
                    value={clientInteractionForm.date}
                    onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject') || 'Subject'} *</label>
                <input
                  type="text"
                  value={clientInteractionForm.subject}
                  onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, subject: e.target.value })}
                  placeholder={t('interaction_subject_placeholder') || 'Brief description of the interaction'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description') || 'Description'}</label>
                <textarea
                  value={clientInteractionForm.description}
                  onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, description: e.target.value })}
                  rows={3}
                  placeholder={t('interaction_description_placeholder') || 'Detailed notes...'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('outcome') || 'Outcome'}</label>
                <input
                  type="text"
                  value={clientInteractionForm.outcome}
                  onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, outcome: e.target.value })}
                  placeholder={t('interaction_outcome_placeholder') || 'Result of the interaction'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('next_action') || 'Next Action'}</label>
                  <input
                    type="text"
                    value={clientInteractionForm.nextAction}
                    onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, nextAction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('next_action_date') || 'Next Action Date'}</label>
                  <input
                    type="date"
                    value={clientInteractionForm.nextActionDate}
                    onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, nextActionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {(clientInteractionForm.type === 'call' || clientInteractionForm.type === 'meeting' || clientInteractionForm.type === 'demo') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('duration_minutes') || 'Duration (minutes)'}</label>
                  <input
                    type="number"
                    value={clientInteractionForm.duration}
                    onChange={(e) => setClientInteractionForm({ ...clientInteractionForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => { setIsClientInteractionModalOpen(false); resetClientInteractionForm(); }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleAddClientInteraction}
                disabled={!clientInteractionForm.subject}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Opportunity Form Modal */}
      {isClientOpportunityModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('add_opportunity') || 'Add Opportunity'}
              </h3>
              <button onClick={() => { setIsClientOpportunityModalOpen(false); resetClientOpportunityForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title') || 'Title'} *</label>
                <input
                  type="text"
                  value={clientOpportunityForm.title}
                  onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, title: e.target.value })}
                  placeholder={t('opportunity_title_placeholder') || 'e.g., ERP Implementation'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount') || 'Amount'} *</label>
                  <input
                    type="number"
                    value={clientOpportunityForm.amount}
                    onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('probability') || 'Probability'} %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={clientOpportunityForm.probability}
                    onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stage') || 'Stage'}</label>
                  <select
                    value={clientOpportunityForm.stage}
                    onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, stage: e.target.value as Opportunity['stage'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="new">{t('stage_new') || 'New'}</option>
                    <option value="qualified">{t('stage_qualified') || 'Qualified'}</option>
                    <option value="proposal">{t('stage_proposal') || 'Proposal'}</option>
                    <option value="negotiation">{t('stage_negotiation') || 'Negotiation'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expected_close_date') || 'Expected Close'}</label>
                  <input
                    type="date"
                    value={clientOpportunityForm.expectedCloseDate}
                    onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sales_rep') || 'Sales Rep'}</label>
                <select
                  value={clientOpportunityForm.salesRepId}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === e.target.value);
                    setClientOpportunityForm({
                      ...clientOpportunityForm,
                      salesRepId: e.target.value,
                      salesRepName: emp ? `${emp.firstName} ${emp.lastName}` : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('select_sales_rep') || 'Select Sales Rep'}</option>
                  {employees.filter(e => e.department === 'Commercial' || e.department === 'Ventes' || e.department === 'Marketing').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('source') || 'Source'}</label>
                <input
                  type="text"
                  value={clientOpportunityForm.source}
                  onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, source: e.target.value })}
                  placeholder={t('opportunity_source_placeholder') || 'e.g., Referral, Website, Trade Show'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes') || 'Notes'}</label>
                <textarea
                  value={clientOpportunityForm.notes}
                  onChange={(e) => setClientOpportunityForm({ ...clientOpportunityForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => { setIsClientOpportunityModalOpen(false); resetClientOpportunityForm(); }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleAddClientOpportunity}
                disabled={!clientOpportunityForm.title || !clientOpportunityForm.amount}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {isContactModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedContact ? t('edit_contact') || 'Edit Contact' : t('add_contact') || 'Add Contact'}
              </h3>
              <button onClick={() => { setIsContactModalOpen(false); resetContactForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('first_name') || 'First Name'} *</label>
                  <input
                    type="text"
                    value={contactForm.firstName || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('last_name') || 'Last Name'} *</label>
                  <input
                    type="text"
                    value={contactForm.lastName || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={contactForm.email || ''}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone') || 'Phone'}</label>
                  <input
                    type="tel"
                    value={contactForm.phone || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('mobile') || 'Mobile'}</label>
                  <input
                    type="tel"
                    value={contactForm.mobile || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role') || 'Role'}</label>
                <select
                  value={contactForm.role || 'other'}
                  onChange={(e) => setContactForm(prev => ({ ...prev, role: e.target.value as ClientContact['role'] }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                >
                  <option value="decision_maker">{t('role_decision_maker') || 'Decision Maker'}</option>
                  <option value="technical">{t('role_technical') || 'Technical'}</option>
                  <option value="purchasing">{t('role_purchasing') || 'Purchasing'}</option>
                  <option value="accounting">{t('role_accounting') || 'Accounting'}</option>
                  <option value="operations">{t('role_operations') || 'Operations'}</option>
                  <option value="other">{t('role_other') || 'Other'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('job_title') || 'Job Title'}</label>
                  <input
                    type="text"
                    value={contactForm.jobTitle || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('department') || 'Department'}</label>
                  <input
                    type="text"
                    value={contactForm.department || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes') || 'Notes'}</label>
                <textarea
                  value={contactForm.notes || ''}
                  onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={contactForm.isPrimary || false}
                  onChange={(e) => setContactForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('set_as_primary_contact') || 'Set as primary contact'}
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setIsContactModalOpen(false); resetContactForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveContact}
                disabled={!contactForm.firstName || !contactForm.lastName || !contactForm.email}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Rep Assignment Modal */}
      {isSalesRepModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('assign_sales_rep') || 'Assign Sales Representative'}</h3>
              <button onClick={() => setIsSalesRepModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {employees.filter(e => e.status === 'active').map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleAssignSalesRep(emp.id)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                      selectedClient.salesRepId === emp.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{emp.position}</p>
                    </div>
                    {selectedClient.salesRepId === emp.id && (
                      <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-auto" />
                    )}
                  </button>
                ))}
                {employees.filter(e => e.status === 'active').length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    {t('no_employees') || 'No active employees found'}
                  </p>
                )}
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
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
                  <button onClick={() => { setIsProspectViewOpen(false); setProspectViewTab('info'); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                  <div className="flex gap-6">
                    <button
                      onClick={() => setProspectViewTab('info')}
                      className={`py-3 border-b-2 transition-colors ${prospectViewTab === 'info' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {t('information')}</span>
                    </button>
                    <button
                      onClick={() => setProspectViewTab('interactions')}
                      className={`py-3 border-b-2 transition-colors ${prospectViewTab === 'interactions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {t('interactions')} ({(selectedProspect.interactions || []).length})</span>
                    </button>
                    <button
                      onClick={() => setProspectViewTab('opportunities')}
                      className={`py-3 border-b-2 transition-colors ${prospectViewTab === 'opportunities' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      <span className="flex items-center gap-2"><Target className="w-4 h-4" /> {t('opportunities')} ({getProspectOpportunities(selectedProspect.id).length})</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  {/* Info Tab */}
                  {prospectViewTab === 'info' && (
                    <>
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

                      {/* Opportunity Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 dark:text-blue-400">{t('open_opportunities')}</div>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {getProspectOpportunities(selectedProspect.id).filter(o => !['won', 'lost'].includes(o.stage)).length}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <div className="text-sm text-green-600 dark:text-green-400">{t('total_pipeline')}</div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {formatCurrency(getProspectOpportunities(selectedProspect.id).filter(o => !['won', 'lost'].includes(o.stage)).reduce((sum, o) => sum + (o.weightedAmount || 0), 0))}
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 dark:text-purple-400">{t('won_opportunities')}</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {formatCurrency(getProspectOpportunities(selectedProspect.id).filter(o => o.stage === 'won').reduce((sum, o) => sum + o.amount, 0))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Interactions Tab */}
                  {prospectViewTab === 'interactions' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> {t('interaction_history')}
                        </h3>
                        <button
                          onClick={() => setIsInteractionModalOpen(true)}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> {t('add_interaction')}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(selectedProspect.interactions || []).length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('no_interactions')}</p>
                          </div>
                        ) : (
                          selectedProspect.interactions?.map((interaction) => (
                            <div key={interaction.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                {interaction.type === 'call' && <PhoneCall className="w-5 h-5 text-green-500" />}
                                {interaction.type === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                                {interaction.type === 'meeting' && <Video className="w-5 h-5 text-purple-500" />}
                                {interaction.type === 'note' && <FileText className="w-5 h-5 text-gray-500" />}
                                <span className="font-medium text-gray-900 dark:text-white">{t(`interaction_${interaction.type}`)}</span>
                                <span className="text-sm text-gray-500 ml-auto">{new Date(interaction.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{interaction.summary}</p>
                              {interaction.outcome && (
                                <p className="text-sm text-gray-500 mt-2"><span className="font-medium">{t('outcome')}:</span> {interaction.outcome}</p>
                              )}
                              {interaction.nextAction && (
                                <p className="text-sm text-indigo-600 mt-2 flex items-center gap-1">
                                  <ChevronRight className="w-4 h-4" /> {interaction.nextAction}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Opportunities Tab */}
                  {prospectViewTab === 'opportunities' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Target className="w-4 h-4" /> {t('opportunities')}
                        </h3>
                        <button
                          onClick={() => setIsProspectOpportunityModalOpen(true)}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> {t('add_opportunity')}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {getProspectOpportunities(selectedProspect.id).length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('no_opportunities')}</p>
                          </div>
                        ) : (
                          getProspectOpportunities(selectedProspect.id).map((opp) => (
                            <div key={opp.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{opp.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(opp.stage)}`}>
                                      {getStageLabel(opp.stage)}
                                    </span>
                                    {opp.salesRepName && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {opp.salesRepName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(opp.amount)}</div>
                                  <div className="text-xs text-gray-500">{opp.probability}% → {formatCurrency(opp.weightedAmount || 0)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                {opp.expectedCloseDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {t('expected')}: {new Date(opp.expectedCloseDate).toLocaleDateString()}
                                  </span>
                                )}
                                {opp.nextAction && (
                                  <span className="flex items-center gap-1 text-indigo-600">
                                    <ChevronRight className="w-3 h-3" /> {opp.nextAction}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
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
                    onClick={() => { setIsProspectViewOpen(false); setProspectViewTab('info'); }}
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

          {/* Prospect Opportunity Modal */}
          {isProspectOpportunityModalOpen && selectedProspect && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('new_opportunity')}</h2>
                  <button onClick={() => { setIsProspectOpportunityModalOpen(false); resetProspectOpportunityForm(); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')} *</label>
                    <input
                      type="text"
                      value={prospectOpportunityForm.title || ''}
                      onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')} *</label>
                      <input
                        type="number"
                        value={prospectOpportunityForm.amount || ''}
                        onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('probability')} (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prospectOpportunityForm.probability || 50}
                        onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, probability: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stage')}</label>
                      <select
                        value={prospectOpportunityForm.stage || 'new'}
                        onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, stage: e.target.value as Opportunity['stage'] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="new">{t('stage_new')}</option>
                        <option value="qualified">{t('stage_qualified')}</option>
                        <option value="proposal">{t('stage_proposal')}</option>
                        <option value="negotiation">{t('stage_negotiation')}</option>
                        <option value="won">{t('stage_won')}</option>
                        <option value="lost">{t('stage_lost')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expected_close_date')}</label>
                      <input
                        type="date"
                        value={prospectOpportunityForm.expectedCloseDate || ''}
                        onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, expectedCloseDate: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sales_rep')}</label>
                    <select
                      value={prospectOpportunityForm.salesRepId || ''}
                      onChange={(e) => {
                        const emp = employees.find(emp => emp.id === e.target.value);
                        setProspectOpportunityForm({
                          ...prospectOpportunityForm,
                          salesRepId: e.target.value,
                          salesRepName: emp ? `${emp.firstName} ${emp.lastName}` : ''
                        });
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="">{t('select_sales_rep')}</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('next_action')}</label>
                    <input
                      type="text"
                      value={prospectOpportunityForm.nextAction || ''}
                      onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, nextAction: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                    <textarea
                      value={prospectOpportunityForm.notes || ''}
                      onChange={(e) => setProspectOpportunityForm({ ...prospectOpportunityForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => { setIsProspectOpportunityModalOpen(false); resetProspectOpportunityForm(); }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddProspectOpportunity}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> {t('add_opportunity')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <>
          {/* Pipeline Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('active_opportunities') || 'Active Opportunities'}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{pipelineStats.activeCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('pipeline_value') || 'Pipeline Value'}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(pipelineStats.totalValue)}</p>
                  <p className="text-xs text-gray-500">{t('weighted')}: {formatCurrency(pipelineStats.weightedValue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('won') || 'Won'}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(pipelineStats.wonValue)}</p>
                  <p className="text-xs text-gray-500">{pipelineStats.wonCount} {t('opportunities')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('conversion_rate') || 'Conversion Rate'}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{pipelineStats.conversionRate}%</p>
                  <p className="text-xs text-gray-500">{pipelineStats.lostCount} {t('lost')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_opportunities') || 'Search opportunities...'}
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <select
              value={pipelineStageFilter}
              onChange={(e) => setPipelineStageFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_stages') || 'All Stages'}</option>
              {pipelineStages.map(stage => (
                <option key={stage.key} value={stage.key}>{stage.label}</option>
              ))}
            </select>
            <select
              value={pipelineSalesRepFilter}
              onChange={(e) => setPipelineSalesRepFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_sales_reps') || 'All Sales Reps'}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setPipelineView('kanban')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${pipelineView === 'kanban' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setPipelineView('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${pipelineView === 'list' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500'}`}
              >
                {t('list') || 'List'}
              </button>
            </div>
          </div>

          {/* Kanban View */}
          {pipelineView === 'kanban' && (
            <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4" style={{ minWidth: '1200px' }}>
              {pipelineStages.map(stage => {
                const stageOpps = filteredPipelineOpportunities.filter(o => o.stage === stage.key);
                const stageTotal = stageOpps.reduce((sum, o) => sum + o.amount, 0);
                return (
                  <div
                    key={stage.key}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 min-h-[500px]"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(stage.key)}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{stage.label}</span>
                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-400">
                          {stageOpps.length}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{formatCurrency(stageTotal)}</div>

                    {/* Opportunity Cards */}
                    <div className="space-y-2">
                      {stageOpps.map(opp => (
                        <div
                          key={opp.id}
                          draggable
                          onDragStart={() => handleDragStart(opp)}
                          onClick={() => { setSelectedOpportunity(opp); setIsOpportunityDetailModalOpen(true); }}
                          className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">{opp.title}</div>
                          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            {opp.clientName ? (
                              <>
                                <Users className="w-3 h-3" />
                                <span className="truncate">{opp.clientName}</span>
                              </>
                            ) : opp.prospectName ? (
                              <>
                                <Target className="w-3 h-3" />
                                <span className="truncate">{opp.prospectName}</span>
                              </>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(opp.amount)}</div>
                            <div className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                              {opp.probability}%
                            </div>
                          </div>
                          {opp.expectedCloseDate && (
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(opp.expectedCloseDate).toLocaleDateString()}
                            </div>
                          )}
                          {opp.salesRepName && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {opp.salesRepName}
                            </div>
                          )}
                        </div>
                      ))}
                      {stageOpps.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          {t('no_opportunities') || 'No opportunities'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {pipelineView === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                      <th className="px-6 py-4">{t('opportunity') || 'Opportunity'}</th>
                      <th className="px-6 py-4">{t('client_prospect') || 'Client / Prospect'}</th>
                      <th className="px-6 py-4">{t('stage')}</th>
                      <th className="px-6 py-4">{t('amount')}</th>
                      <th className="px-6 py-4">{t('probability')}</th>
                      <th className="px-6 py-4">{t('weighted')}</th>
                      <th className="px-6 py-4">{t('sales_rep')}</th>
                      <th className="px-6 py-4">{t('expected_close_date')}</th>
                      <th className="px-6 py-4">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPipelineOpportunities.map(opp => (
                      <tr key={opp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{opp.title}</div>
                          {opp.nextAction && (
                            <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                              <ChevronRight className="w-3 h-3" /> {opp.nextAction}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {opp.clientName ? (
                              <>
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-900 dark:text-white">{opp.clientName}</span>
                              </>
                            ) : opp.prospectName ? (
                              <>
                                <Target className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-900 dark:text-white">{opp.prospectName}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opp.stage)}`}>
                            {getStageLabel(opp.stage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(opp.amount)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {opp.probability}%
                        </td>
                        <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(opp.weightedAmount || 0)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {opp.salesRepName || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedOpportunity(opp); setIsOpportunityDetailModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPipelineOpportunities.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-500">
                          <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>{t('no_opportunities') || 'No opportunities'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Opportunity Detail Modal */}
          {isOpportunityDetailModalOpen && selectedOpportunity && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedOpportunity.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(selectedOpportunity.stage)}`}>
                        {getStageLabel(selectedOpportunity.stage)}
                      </span>
                      {selectedOpportunity.clientName && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {selectedOpportunity.clientName}
                        </span>
                      )}
                      {selectedOpportunity.prospectName && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Target className="w-3 h-3" /> {selectedOpportunity.prospectName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setIsOpportunityDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">{t('amount')}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedOpportunity.amount)}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">{t('probability')}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedOpportunity.probability}%</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-sm text-green-600">{t('weighted')}</div>
                      <div className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(selectedOpportunity.weightedAmount || 0)}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-gray-500">{t('sales_rep')}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedOpportunity.salesRepName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('expected_close_date')}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedOpportunity.expectedCloseDate ? new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('source')}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedOpportunity.source || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('created_at')}:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedOpportunity.createdAt ? new Date(selectedOpportunity.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Next Action */}
                  {selectedOpportunity.nextAction && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
                      <div className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">{t('next_action')}</div>
                      <div className="text-gray-900 dark:text-white">{selectedOpportunity.nextAction}</div>
                      {selectedOpportunity.nextActionDate && (
                        <div className="text-sm text-indigo-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(selectedOpportunity.nextActionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOpportunity.notes && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('notes')}</div>
                      <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedOpportunity.notes}</div>
                    </div>
                  )}

                  {/* Stage Change Buttons */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('change_stage') || 'Change Stage'}</div>
                    <div className="flex flex-wrap gap-2">
                      {pipelineStages.filter(s => s.key !== selectedOpportunity.stage).map(stage => (
                        <button
                          key={stage.key}
                          onClick={() => {
                            updateOpportunityStage(selectedOpportunity.id, stage.key);
                            setSelectedOpportunity({ ...selectedOpportunity, stage: stage.key });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${stage.color} hover:opacity-90 transition-opacity`}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => setIsOpportunityDetailModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {t('close')}
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

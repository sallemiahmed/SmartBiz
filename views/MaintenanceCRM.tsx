
import React, { useState, useMemo } from 'react';
import { 
  Users, ShieldCheck, Calendar, Clock, Search, Filter, Plus, MapPin, Phone, Mail, 
  Wrench, FileText, AlertTriangle, MessageSquare, History, X, Check, Send, DollarSign, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, MaintenanceContract, ServiceJob, ContactInteraction } from '../types';
import SearchableSelect from '../components/SearchableSelect';

const MaintenanceCRM: React.FC = () => {
  const { 
    clients, updateClient, maintenanceContracts, addMaintenanceContract, updateMaintenanceContract, 
    serviceJobs, contactInteractions, addContactInteraction, formatCurrency, t 
  } = useApp();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients'>('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [contractFilter, setContractFilter] = useState('all');

  // --- DERIVED DATA ---
  const activeContracts = maintenanceContracts.filter(c => c.status === 'active');
  const expiringContracts = maintenanceContracts.filter(c => {
      if(c.status !== 'active') return false;
      const endDate = new Date(c.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
  });
  const upcomingInterventions = serviceJobs.filter(j => j.status === 'pending');
  
  const filteredClients = clients.filter(c => {
      const matchesSearch = c.company.toLowerCase().includes(clientSearch.toLowerCase()) || c.name.toLowerCase().includes(clientSearch.toLowerCase());
      const hasContract = maintenanceContracts.some(mc => mc.clientId === c.id && mc.status === 'active');
      
      if (contractFilter === 'active') return matchesSearch && hasContract;
      if (contractFilter === 'none') return matchesSearch && !hasContract;
      return matchesSearch;
  });

  // --- COMPONENTS ---

  const DashboardView = () => (
      <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-sm text-gray-500">Active Contracts</p>
                          <h3 className="text-2xl font-bold dark:text-white">{activeContracts.length}</h3>
                      </div>
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-sm text-gray-500">Expiring Soon</p>
                          <h3 className="text-2xl font-bold dark:text-white text-orange-500">{expiringContracts.length}</h3>
                      </div>
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Clock className="w-6 h-6" /></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Renewals needed in 30 days</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-sm text-gray-500">Planned Visits</p>
                          <h3 className="text-2xl font-bold dark:text-white">{upcomingInterventions.length}</h3>
                      </div>
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar className="w-6 h-6" /></div>
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-sm text-gray-500">Contract Value</p>
                          <h3 className="text-xl font-bold dark:text-white">{formatCurrency(activeContracts.reduce((acc, c) => acc + (c.value || 0), 0))}</h3>
                      </div>
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                  </div>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Expiring Contracts Alert</h3>
              {expiringContracts.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No contracts expiring soon.</p>
              ) : (
                  <div className="space-y-3">
                      {expiringContracts.map(c => {
                          const client = clients.find(cl => cl.id === c.clientId);
                          return (
                              <div key={c.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
                                  <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{client?.company} - {c.title}</p>
                                      <p className="text-xs text-orange-600">Expires: {c.endDate}</p>
                                  </div>
                                  <button className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Renew</button>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      </div>
  );

  const ClientDetailModal = () => {
      if (!selectedClient) return null;
      
      const [modalTab, setModalTab] = useState<'overview' | 'contracts' | 'interventions' | 'history'>('overview');
      const clientContracts = maintenanceContracts.filter(c => c.clientId === selectedClient.id);
      const clientJobs = serviceJobs.filter(j => j.clientId === selectedClient.id);
      const clientHistory = contactInteractions.filter(i => i.clientId === selectedClient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Interaction Form State
      const [newInteraction, setNewInteraction] = useState({ type: 'call', summary: '', date: new Date().toISOString().split('T')[0] });

      // Contract Form State (Simplified)
      const [showContractForm, setShowContractForm] = useState(false);
      const [newContract, setNewContract] = useState<Partial<MaintenanceContract>>({
          type: 'preventive', status: 'active', visitsPerYear: 4, slaResponseHours: 24
      });

      const handleAddInteraction = () => {
          if(!newInteraction.summary) return;
          addContactInteraction({
              id: `ci-${Date.now()}`,
              clientId: selectedClient.id,
              ...newInteraction as any
          });
          setNewInteraction({ type: 'call', summary: '', date: new Date().toISOString().split('T')[0] });
      };

      const handleAddContract = () => {
          if(!newContract.title || !newContract.startDate || !newContract.endDate) return alert("Fill required fields");
          addMaintenanceContract({
              id: `mc-${Date.now()}`,
              clientId: selectedClient.id,
              ...newContract as any
          });
          setShowContractForm(false);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xl">
                            {selectedClient.company.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClient.company}</h2>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {selectedClient.name}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedClient.address || 'No address'}</span>
                                {selectedClient.zone && <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{selectedClient.zone}</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    {['overview', 'contracts', 'interventions', 'history'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setModalTab(tab as any)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${modalTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                    
                    {/* OVERVIEW TAB */}
                    {modalTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold mb-3 dark:text-white">Contact Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Phone className="w-4 h-4" /> {selectedClient.phone}</div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Mail className="w-4 h-4" /> {selectedClient.email}</div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold mb-3 dark:text-white">Contract Status</h4>
                                {clientContracts.length > 0 ? (
                                    clientContracts.map(c => (
                                        <div key={c.id} className="mb-2 pb-2 border-b last:border-0 border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between"><span className="text-sm font-medium">{c.title}</span><span className={`text-xs px-2 rounded ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span></div>
                                            <div className="text-xs text-gray-500 mt-1">{c.startDate} to {c.endDate}</div>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-gray-400">No contracts.</p>}
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold mb-3 dark:text-white">Quick Stats</h4>
                                <div className="flex justify-between text-sm mb-2"><span>Total Interventions:</span> <span className="font-bold">{clientJobs.length}</span></div>
                                <div className="flex justify-between text-sm"><span>Last Interaction:</span> <span className="font-bold text-gray-600">{clientHistory[0]?.date || 'N/A'}</span></div>
                            </div>
                        </div>
                    )}

                    {/* CONTRACTS TAB */}
                    {modalTab === 'contracts' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setShowContractForm(!showContractForm)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> New Contract
                                </button>
                            </div>

                            {showContractForm && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 mb-4 animate-in slide-in-from-top-2">
                                    <h4 className="font-bold text-sm mb-3 dark:text-white">New Contract Details</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input placeholder="Contract Title" className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.title || ''} onChange={e => setNewContract({...newContract, title: e.target.value})} />
                                        <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.type} onChange={e => setNewContract({...newContract, type: e.target.value as any})}>
                                            <option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="full">Full Service</option>
                                        </select>
                                        <input type="date" className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.startDate || ''} onChange={e => setNewContract({...newContract, startDate: e.target.value})} />
                                        <input type="date" className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.endDate || ''} onChange={e => setNewContract({...newContract, endDate: e.target.value})} />
                                        <input type="number" placeholder="Visits/Year" className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.visitsPerYear} onChange={e => setNewContract({...newContract, visitsPerYear: parseInt(e.target.value)})} />
                                        <input type="number" placeholder="Value" className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newContract.value} onChange={e => setNewContract({...newContract, value: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowContractForm(false)} className="px-3 py-1 bg-gray-200 rounded text-sm">Cancel</button>
                                        <button onClick={handleAddContract} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save Contract</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {clientContracts.map(c => (
                                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                                        <div>
                                            <h5 className="font-bold dark:text-white flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-indigo-500" /> {c.title}
                                            </h5>
                                            <p className="text-sm text-gray-500">{c.startDate} → {c.endDate} • {c.visitsPerYear} Visits/Yr</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{c.status.toUpperCase()}</div>
                                            <div className="text-sm font-bold">{formatCurrency(c.value)}</div>
                                        </div>
                                    </div>
                                ))}
                                {clientContracts.length === 0 && <div className="text-center text-gray-400 py-8">No contracts found.</div>}
                            </div>
                        </div>
                    )}

                    {/* INTERVENTIONS TAB */}
                    {modalTab === 'interventions' && (
                         <div className="space-y-3">
                             {clientJobs.map(job => (
                                 <div key={job.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between">
                                     <div>
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{job.ticketNumber}</span>
                                             <span className="font-bold text-sm dark:text-white">{job.deviceInfo}</span>
                                         </div>
                                         <p className="text-xs text-gray-500">{job.problemDescription}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className={`px-2 py-0.5 rounded text-xs ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                                         <div className="text-xs text-gray-400 mt-1">{job.date}</div>
                                     </div>
                                 </div>
                             ))}
                             {clientJobs.length === 0 && <div className="text-center text-gray-400 py-8">No service history.</div>}
                         </div>
                    )}

                    {/* HISTORY TAB */}
                    {modalTab === 'history' && (
                        <div className="h-full flex flex-col">
                            <div className="flex gap-2 mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <select 
                                    className="bg-gray-50 dark:bg-gray-700 border-none rounded text-sm dark:text-white" 
                                    value={newInteraction.type} 
                                    onChange={e => setNewInteraction({...newInteraction, type: e.target.value as any})}
                                >
                                    <option value="call">Call</option><option value="email">Email</option><option value="meeting">Meeting</option><option value="note">Note</option>
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Log a new interaction..." 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-white"
                                    value={newInteraction.summary}
                                    onChange={e => setNewInteraction({...newInteraction, summary: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && handleAddInteraction()}
                                />
                                <button onClick={handleAddInteraction} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"><Send className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                                {clientHistory.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-[21px] top-0 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full p-1">
                                            {item.type === 'call' ? <Phone className="w-3 h-3 text-blue-500" /> : item.type === 'email' ? <Mail className="w-3 h-3 text-orange-500" /> : <FileText className="w-3 h-3 text-gray-500" />}
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span className="capitalize">{item.type}</span>
                                                <span>{item.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200">{item.summary}</p>
                                            {item.contactPerson && <p className="text-xs text-gray-400 mt-1">With: {item.contactPerson}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Users className="w-6 h-6 text-indigo-600" /> Contact Maintenance CRM
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage maintenance contracts, interventions, and client relationships.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
             <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Dashboard</button>
             <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'clients' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Clients List</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          
          {activeTab === 'clients' && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                  {/* Filters */}
                  <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                              type="text" placeholder="Search clients..." 
                              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                              value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                          />
                      </div>
                      <select 
                          className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white"
                          value={contractFilter} onChange={e => setContractFilter(e.target.value)}
                      >
                          <option value="all">All Clients</option>
                          <option value="active">Has Active Contract</option>
                          <option value="none">No Contract</option>
                      </select>
                  </div>

                  {/* Client Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredClients.map(client => {
                          const hasContract = maintenanceContracts.some(c => c.clientId === client.id && c.status === 'active');
                          return (
                              <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 cursor-pointer transition-all shadow-sm group">
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                          {client.company.charAt(0)}
                                      </div>
                                      {hasContract && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Contract</span>}
                                  </div>
                                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{client.company}</h4>
                                  <p className="text-sm text-gray-500 truncate">{client.name}</p>
                                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                                      <span>{client.zone || 'Unknown Zone'}</span>
                                      <span className="group-hover:text-indigo-600 flex items-center gap-1">View Details <ChevronRight className="w-3 h-3" /></span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}
      </div>

      {selectedClient && <ClientDetailModal />}
    </div>
  );
};

export default MaintenanceCRM;

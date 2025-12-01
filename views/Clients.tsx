
import React, { useState } from 'react';
import { Search, Plus, Filter, Mail, Phone, MapPin, Pencil, Trash2, X, Eye, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { Client } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, formatCurrency, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>({ key: 'company', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // New Client Form State
  const [newClient, setNewClient] = useState<Partial<Client>>({
    company: '',
    name: '',
    email: '',
    phone: '',
    status: 'active',
    category: 'General',
    totalSpent: 0,
    region: '',
    address: '',
    taxId: ''
  });

  const handleSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `c${Date.now()}`;
    addClient({ ...newClient, id } as Client);
    setIsAddModalOpen(false);
    setNewClient({
      company: '', name: '', email: '', phone: '', status: 'active', category: 'General', totalSpent: 0, region: '', address: '', taxId: ''
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

  const handleDelete = (id: string) => {
    if (confirm(t('delete_client_confirm'))) {
      deleteClient(id);
      setIsViewModalOpen(false);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Client }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('client_management')} 👥</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('client_desc')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('add_client')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_clients')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('company')}>
                  {t('company')} <SortIcon columnKey="company" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('name')}>
                  {t('contact_person')} <SortIcon columnKey="name" />
                </th>
                <th className="px-6 py-4">{t('contact_details')}</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('totalSpent')}>
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
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {client.company.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{client.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{client.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 gap-1">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</div>
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(client.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {t(client.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedClient(client); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedClient(client); setIsEditModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
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
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {t('client_details')}
              </h3>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  {selectedClient.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedClient.company}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.category}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">{t('contact_person')}</span>
                  <span className="font-medium dark:text-white">{selectedClient.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium dark:text-white">{selectedClient.email}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium dark:text-white">{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">{t('tax_id')}</span>
                  <span className="font-medium dark:text-white font-mono">{selectedClient.taxId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">{t('address')}</span>
                  <span className="font-medium dark:text-white text-right max-w-[200px]">{selectedClient.address}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">{t('total_spent')}</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(selectedClient.totalSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Simplified for brevity, would ideally be full form) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditModalOpen ? t('edit_client') : t('add_new_client')}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company')}</label>
                  <input required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" 
                    value={isEditModalOpen ? selectedClient?.company : newClient.company}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, company: e.target.value}) : setNewClient({...newClient, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('contact_person')}</label>
                  <input required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    value={isEditModalOpen ? selectedClient?.name : newClient.name}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, name: e.target.value}) : setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                  <input type="email" required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    value={isEditModalOpen ? selectedClient?.email : newClient.email}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, email: e.target.value}) : setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('phone')}</label>
                  <input required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    value={isEditModalOpen ? selectedClient?.phone : newClient.phone}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, phone: e.target.value}) : setNewClient({...newClient, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('address')}</label>
                <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                  value={isEditModalOpen ? selectedClient?.address : newClient.address}
                  onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, address: e.target.value}) : setNewClient({...newClient, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('tax_id')}</label>
                  <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    value={isEditModalOpen ? selectedClient?.taxId : newClient.taxId}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, taxId: e.target.value}) : setNewClient({...newClient, taxId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('category')}</label>
                  <input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    value={isEditModalOpen ? selectedClient?.category : newClient.category}
                    onChange={e => isEditModalOpen ? setSelectedClient({...selectedClient!, category: e.target.value}) : setNewClient({...newClient, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

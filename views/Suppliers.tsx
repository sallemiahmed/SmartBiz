import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Mail, Phone, Store, Pencil, X, Save, Trash2, Eye, ArrowUp, ArrowDown, AlertTriangle, RotateCcw } from 'lucide-react';
import { Supplier } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, formatCurrency, t } = useApp();
  
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Supplier; direction: 'asc' | 'desc' } | null>({ key: 'company', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selection States
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    company: '',
    contactName: '',
    category: '',
    email: '',
    phone: '',
    status: 'active',
    totalPurchased: 0
  });

  // Unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(suppliers.map(s => s.category));
    return Array.from(cats).sort();
  }, [suppliers]);

  // --- Handlers ---

  const handleSort = (key: keyof Supplier) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setCurrentPage(1);
    setSortConfig({ key: 'company', direction: 'asc' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `s${Date.now()}`;
    const supplierToAdd = { ...newSupplier, id } as Supplier;
    addSupplier(supplierToAdd);
    setIsAddModalOpen(false);
    // Reset form
    setNewSupplier({
      company: '',
      contactName: '',
      category: '',
      email: '',
      phone: '',
      status: 'active',
      totalPurchased: 0
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier) {
      updateSupplier(selectedSupplier);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSupplier) {
      deleteSupplier(selectedSupplier.id);
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isNew: boolean = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewSupplier(prev => ({ ...prev, [name]: value }));
    } else if (selectedSupplier) {
      setSelectedSupplier({ ...selectedSupplier, [name]: value });
    }
  };

  // --- Process Data ---

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = 
        s.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  const sortedSuppliers = useMemo(() => {
    const sortable = [...filteredSuppliers];
    if (sortConfig) {
      sortable.sort((a, b) => {
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
    return sortable;
  }, [filteredSuppliers, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);
  const paginatedSuppliers = sortedSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const SortIcon = ({ columnKey }: { columnKey: keyof Supplier }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  return (
    <div className="p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('supplier_management')} 🏪</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('supplier_desc')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('add_supplier')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_suppliers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Filter className="w-4 h-4 text-gray-500" />
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white max-w-[150px]"
            >
              <option value="all">{t('all_categories')}</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>

            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
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
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  {t('category')} <SortIcon columnKey="category" />
                </th>
                <th className="px-6 py-4">{t('contact_details')}</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('totalPurchased')}
                >
                  {t('total_purchased')} <SortIcon columnKey="totalPurchased" />
                </th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                        {supplier.company.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{supplier.company}</div>
                        <div className="text-xs text-gray-500">{supplier.contactName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {supplier.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {supplier.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(supplier.totalPurchased)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {t(supplier.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedSupplier(supplier); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedSupplier(supplier); setIsEditModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedSupplier(supplier); setIsDeleteModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedSuppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {t('no_suppliers')}
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
          totalItems={filteredSuppliers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* --- MODALS --- */}
      {/* ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_new_supplier')}</h2>
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
                    value={newSupplier.company}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_name')}</label>
                    <input
                      type="text"
                      name="contactName"
                      value={newSupplier.contactName}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                    <input
                      type="text"
                      name="category"
                      value={newSupplier.category}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={newSupplier.email}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_phone')}</label>
                    <input
                      type="text"
                      name="phone"
                      value={newSupplier.phone}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                  <select
                    name="status"
                    value={newSupplier.status}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
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
                  {t('add_supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {isEditModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit')} {t('suppliers')}</h2>
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
                    value={selectedSupplier.company}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_name')}</label>
                    <input
                      type="text"
                      name="contactName"
                      value={selectedSupplier.contactName}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                    <input
                      type="text"
                      name="category"
                      value={selectedSupplier.category}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={selectedSupplier.email}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_phone')}</label>
                    <input
                      type="text"
                      name="phone"
                      value={selectedSupplier.phone}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                  <select
                    name="status"
                    value={selectedSupplier.status}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
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
      {isViewModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('supplier_management')}</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    <Store className="w-8 h-8" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSupplier.company}</h3>
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSupplier.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {t(selectedSupplier.status)}
                    </span>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('contact_name')}</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedSupplier.contactName}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('company_email')}</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedSupplier.email}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('company_phone')}</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedSupplier.phone}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('category')}</span>
                   <span className="font-medium text-gray-900 dark:text-white">{selectedSupplier.category}</span>
                 </div>
                 <div className="flex justify-between pt-2">
                   <span className="text-gray-500 dark:text-gray-400">{t('total_purchased')}</span>
                   <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedSupplier.totalPurchased)}</span>
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
      {isDeleteModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_supplier_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_supplier_msg')}
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

    </div>
  );
};

export default Suppliers;
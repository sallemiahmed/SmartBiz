
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Download, AlertCircle, Filter, 
  Pencil, Trash2, X, Save, Package, ArrowUp, ArrowDown,
  LayoutGrid, RotateCcw, Building, ArrowRightLeft, MapPin
} from 'lucide-react';
import { Product, Warehouse } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

type InventoryTab = 'products' | 'warehouses';

const Inventory: React.FC = () => {
  const { products, warehouses, addProduct, updateProduct, deleteProduct, addWarehouse, updateWarehouse, deleteWarehouse, transferStock, formatCurrency, t } = useApp();

  // --- State ---
  const [activeTab, setActiveTab] = useState<InventoryTab>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  // Warehouse Modal States
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State
  const initialFormState: Partial<Product> = {
    name: '',
    sku: '',
    category: '',
    stock: 0,
    price: 0,
    cost: 0,
    status: 'in_stock',
    warehouseStock: {}
  };
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: 1,
    notes: ''
  });

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // --- Helpers ---
  
  const determineStatus = (stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= 10) return 'low_stock';
    return 'in_stock';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_stock': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'low_stock': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'out_of_stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // --- Handlers ---

  const handleSort = (key: keyof Product) => {
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
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['stock', 'price', 'cost'];
    const parsedValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: parsedValue };
      return updated;
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default new stock goes to default warehouse
    const defaultWh = warehouses.find(w => w.isDefault)?.id || warehouses[0].id;
    const stockMap: Record<string, number> = {};
    if (defaultWh) stockMap[defaultWh] = formData.stock || 0;

    const newProduct: Product = {
      ...formData,
      id: `p${Date.now()}`,
      status: determineStatus(formData.stock || 0),
      warehouseStock: stockMap
    } as Product;
    
    addProduct(newProduct);
    setIsAddModalOpen(false);
    setFormData(initialFormState);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    const updatedProduct = { 
      ...selectedProduct, 
      ...formData,
      status: determineStatus(formData.stock || 0)
    } as Product;

    updateProduct(updatedProduct);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setFormData(initialFormState);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.productId || !transferData.fromWarehouseId || !transferData.toWarehouseId) return;
    if (transferData.fromWarehouseId === transferData.toWarehouseId) {
      alert("Source and Destination warehouses must be different.");
      return;
    }

    transferStock(transferData);
    setIsTransferModalOpen(false);
    // Reset form
    setTransferData({ productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: 1, notes: '' });
  };

  const handleWarehouseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const location = data.get('location') as string;

    if (selectedWarehouse) {
      updateWarehouse({ ...selectedWarehouse, name, location });
    } else {
      addWarehouse({ id: `w${Date.now()}`, name, location });
    }
    setIsWhModalOpen(false);
    setSelectedWarehouse(null);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openTransferModal = (product?: Product) => {
    setTransferData({
      productId: product ? product.id : (products[0]?.id || ''),
      fromWarehouseId: warehouses[0]?.id || '',
      toWarehouseId: warehouses[1]?.id || '',
      quantity: 1,
      notes: ''
    });
    setIsTransferModalOpen(true);
  };

  // --- Processing ---

  const processedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const aValue = a[key];
        const bValue = b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, statusFilter, categoryFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  const SortIcon = ({ columnKey }: { columnKey: keyof Product }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inventory_management')} 📦</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('inventory_desc')}</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => openTransferModal()}
             className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
           >
             <ArrowRightLeft className="w-4 h-4" /> {t('transfer_stock')}
           </button>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
           >
             <Plus className="w-4 h-4" /> {t('add_product')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_products')}</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{products.length}</h4>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('needs_attention')}</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {lowStockCount + outOfStockCount} <span className="text-sm font-normal text-gray-400">(Low/Out)</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_value')}</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</h4>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {t('products_list')}
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'warehouses'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {t('warehouses')}
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col flex-1">
        
        {activeTab === 'products' && (
          <>
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('search_products')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
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
                  <option value="in_stock">{t('in_stock')}</option>
                  <option value="low_stock">{t('low_stock')}</option>
                  <option value="out_of_stock">{t('out_of_stock')}</option>
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
            
            {/* Product Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('name')}>
                      {t('product_name')} <SortIcon columnKey="name" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('sku')}>
                      {t('sku')} <SortIcon columnKey="sku" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('category')}>
                      {t('category')} <SortIcon columnKey="category" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('stock')}>
                      {t('stock_level')} <SortIcon columnKey="stock" />
                    </th>
                    <th className="px-6 py-4">{t('warehouses')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('price')}>
                      {t('price')} <SortIcon columnKey="price" />
                    </th>
                    <th className="px-6 py-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.sku}</td>
                      <td className="px-6 py-4 text-gray-500">{item.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-right font-mono">{item.stock}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(item.status)}`}>
                            {t(item.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {Object.entries(item.warehouseStock).map(([wId, qty]) => {
                            const quantity = qty as number;
                            if (quantity <= 0) return null;
                            const whName = warehouses.find(w => w.id === wId)?.name || wId;
                            return (
                              <div key={wId} className="text-xs text-gray-500 flex justify-between w-32">
                                <span className="truncate pr-2">{whName}:</span>
                                <span className="font-mono">{quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openTransferModal(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Transfer"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(item)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('no_products')}</p>
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
              totalItems={processedProducts.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}

        {activeTab === 'warehouses' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('warehouse_locations')}</h3>
              <button 
                onClick={() => setIsWhModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                {t('add_warehouse')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map(wh => (
                <div key={wh.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 group relative">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Building className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{wh.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" /> {wh.location}
                        </div>
                      </div>
                    </div>
                    {wh.isDefault && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{t('default_warehouse')}</span>}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={() => { setSelectedWarehouse(wh); setIsWhModalOpen(true); }}
                      className="p-1.5 bg-white dark:bg-gray-800 hover:text-indigo-600 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    {!wh.isDefault && (
                      <button 
                        onClick={() => deleteWarehouse(wh.id)}
                        className="p-1.5 bg-white dark:bg-gray-800 hover:text-red-600 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Transfer Stock Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" /> {t('stock_transfer')}
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product')}</label>
                <select 
                  value={transferData.productId}
                  onChange={(e) => setTransferData({...transferData, productId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label>
                  <select 
                    value={transferData.fromWarehouseId}
                    onChange={(e) => setTransferData({...transferData, fromWarehouseId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label>
                  <select 
                    value={transferData.toWarehouseId}
                    onChange={(e) => setTransferData({...transferData, toWarehouseId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity')}</label>
                <input 
                  type="number" 
                  min="1"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                <input 
                  type="text" 
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  placeholder={t('transfer_reason')}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('confirm_transfer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Add/Edit Modal */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedWarehouse ? t('edit_warehouse') : t('add_warehouse')}
            </h3>
            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('warehouse_name')}</label>
                <input name="name" defaultValue={selectedWarehouse?.name} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('location')}</label>
                <input name="location" defaultValue={selectedWarehouse?.location} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setIsWhModalOpen(false); setSelectedWarehouse(null); }} className="px-4 py-2 bg-gray-100 rounded-lg">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_product')}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_name')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sku')}</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      list="categories"
                      required
                    />
                    <datalist id="categories">
                      <option value="Electronics" />
                      <option value="Furniture" />
                      <option value="Office Supplies" />
                      <option value="Accessories" />
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('cost')}</label>
                    <input
                      type="number"
                      step="0.01"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stock_qty')}</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                    <p className="text-[10px] text-gray-500 mt-1">{t('added_to_default_warehouse')}</p>
                  </div>
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
                  {t('add_product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal (Simplified for now, editing total stock manually is tricky with warehouses, prefer transfers) */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('edit_product')}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_name')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sku')}</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('cost')}</label>
                    <input
                      type="number"
                      step="0.01"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  <p>{t('stock_edit_warning')}</p>
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

      {/* DELETE Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertCircle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_confirm_msg')} <span className="font-bold text-gray-900 dark:text-white">{selectedProduct.name}</span>
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

export default Inventory;

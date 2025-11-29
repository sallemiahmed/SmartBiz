
import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Pencil, Trash2, History, X, Package, AlertCircle, LayoutGrid, ImageIcon, Upload, ArrowUp, ArrowDown, RotateCcw, ShoppingBag, CheckSquare, Truck } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

const Inventory: React.FC = () => {
  const { products, warehouses, suppliers, stockMovements, addProduct, updateProduct, deleteProduct, createPurchaseDocument, addStockMovement, formatCurrency, t } = useApp();
  
  // State initialization
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false); // New Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Restock State
  const [selectedRestockSupplier, setSelectedRestockSupplier] = useState<string>('');
  const [restockSelection, setRestockSelection] = useState<Record<string, number>>({}); // productId -> qty

  // Form state
  const initialFormState: Partial<Product> = {
    name: '', sku: '', category: '', price: 0, cost: 0, stock: 0, warehouseStock: {}, image: ''
  };
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  // Categories
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  // Helpers
  const determineStatus = (stock: number) => {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= 10) return 'low_stock';
    return 'in_stock';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'low_stock': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'out_of_stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'cost' ? parseFloat(value) : value }));
  };

  const handleWarehouseStockChange = (whId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      warehouseStock: { ...prev.warehouseStock, [whId]: qty }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
  };

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
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  // Restock Handlers
  const openRestockModal = () => {
    // Initialize restock selection with products needing restock
    const needsRestock = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
    const initialSelection: Record<string, number> = {};
    needsRestock.forEach(p => {
        // Default to ordering 10 units, or logic to reach safety stock of 20
        const defaultOrderQty = Math.max(10, 20 - p.stock);
        initialSelection[p.id] = defaultOrderQty;
    });
    setRestockSelection(initialSelection);
    setSelectedRestockSupplier(suppliers[0]?.id || '');
    setIsRestockModalOpen(true);
  };

  const handleRestockSelectionChange = (productId: string, qty: number) => {
      setRestockSelection(prev => {
          if (qty <= 0) {
              const newState = { ...prev };
              delete newState[productId];
              return newState;
          }
          return { ...prev, [productId]: qty };
      });
  };

  const toggleRestockItem = (productId: string) => {
      setRestockSelection(prev => {
          const newState = { ...prev };
          if (newState[productId]) {
              delete newState[productId];
          } else {
              // Add back with default qty
              const prod = products.find(p => p.id === productId);
              newState[productId] = prod ? Math.max(10, 20 - prod.stock) : 10;
          }
          return newState;
      });
  };

  const handleRestockSubmit = () => {
      if (!selectedRestockSupplier) {
          alert('Please select a supplier');
          return;
      }

      const selectedProductIds = Object.keys(restockSelection);
      if (selectedProductIds.length === 0) {
          alert('Please select products to restock');
          return;
      }

      const orderItems = selectedProductIds.map(id => {
          const prod = products.find(p => p.id === id);
          return {
              id: id,
              description: prod?.name || 'Unknown',
              quantity: restockSelection[id],
              price: prod?.cost || 0
          };
      });

      // Calculate approximate total
      const amount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const supplierName = suppliers.find(s => s.id === selectedRestockSupplier)?.company || 'Unknown';

      // Create PO
      createPurchaseDocument('order', {
          supplierId: selectedRestockSupplier,
          supplierName: supplierName,
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          status: 'pending',
          warehouseId: warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id, // Default WH
          notes: 'Generated via Restock Wizard'
      }, orderItems);

      setIsRestockModalOpen(false);
      alert(t('success'));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalStock = (Object.values(formData.warehouseStock || {}) as any[]).reduce((a: number, b: any) => a + Number(b), 0);
    
    // Calculate margin
    const price = formData.price || 0;
    const cost = formData.cost || 0;
    const margin = price - cost;
    const marginPercent = price > 0 ? (margin / price) * 100 : 0;

    const newProduct: Product = {
      ...formData as Product,
      id: `p-${Date.now()}`,
      stock: totalStock,
      status: determineStatus(totalStock),
      warehouseStock: formData.warehouseStock || {},
      marginPercent: marginPercent
    };
    
    addProduct(newProduct);
    
    // Log initial stock movement if any
    Object.entries(newProduct.warehouseStock).forEach(([whId, qty]) => {
      if (qty > 0) {
        addStockMovement({
          id: `sm-${Date.now()}-${whId}`,
          productId: newProduct.id,
          productName: newProduct.name,
          warehouseId: whId,
          warehouseName: warehouses.find(w => w.id === whId)?.name || 'Unknown',
          date: new Date().toISOString(),
          quantity: qty,
          type: 'initial',
          reference: 'INIT',
          notes: 'Initial Stock',
          unitCost: newProduct.cost,
          costBefore: 0,
          costAfter: newProduct.cost
        });
      }
    });

    setIsAddModalOpen(false);
    setFormData(initialFormState);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    const currentWhStock: Record<string, number> = { ...(formData.warehouseStock || {}) };
    const totalStock = (Object.values(currentWhStock) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

    // 1. Calculate Quantity Deltas for Stock Movements
    Object.entries(currentWhStock).forEach(([whId, newQty]) => {
      const oldQty = selectedProduct.warehouseStock[whId] || 0;
      const diff = newQty - oldQty;
      
      if (diff !== 0) {
        addStockMovement({
          id: `sm-adj-${Date.now()}-${whId}`,
          productId: selectedProduct.id,
          productName: formData.name || selectedProduct.name,
          warehouseId: whId,
          warehouseName: warehouses.find(w => w.id === whId)?.name || 'Unknown',
          date: new Date().toISOString(),
          quantity: diff,
          type: 'adjustment',
          reference: 'MANUAL-ADJ',
          notes: 'Manual Inventory Adjustment',
          unitCost: selectedProduct.cost,
          costBefore: selectedProduct.cost,
          costAfter: selectedProduct.cost
        });
      }
    });

    // 2. Calculate Cost Change (Manual Revaluation)
    const newCost = Number(formData.cost) || 0;
    if (newCost !== selectedProduct.cost) {
        addStockMovement({
            id: `sm-cost-${Date.now()}`,
            productId: selectedProduct.id,
            productName: formData.name || selectedProduct.name,
            warehouseId: warehouses.find(w => w.isDefault)?.id || Object.keys(currentWhStock)[0] || 'Unknown',
            warehouseName: 'System', // Cost is global usually
            date: new Date().toISOString(),
            quantity: 0, // No quantity change
            type: 'adjustment',
            reference: 'COST-REV',
            notes: 'Manual Cost Revaluation',
            unitCost: 0,
            costBefore: selectedProduct.cost,
            costAfter: newCost
        });
    }

    // Calculate margin
    const price = formData.price !== undefined ? formData.price : selectedProduct.price;
    const cost = formData.cost !== undefined ? formData.cost : selectedProduct.cost;
    const margin = price - cost;
    const marginPercent = price > 0 ? (margin / price) * 100 : 0;

    const updatedProduct = { 
      ...selectedProduct, 
      ...formData,
      stock: totalStock,
      warehouseStock: currentWhStock,
      status: determineStatus(totalStock),
      marginPercent: marginPercent
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

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openHistoryModal = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };

  // --- Process Data ---

  const processedProducts = useMemo(() => {
    return products
      .filter(p => {
        // Robust Search: Split by space and ensure all terms are found in name, sku, or category
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(t => t.trim() !== '');
        const matchesSearch = searchTerms.every(term => 
          p.name.toLowerCase().includes(term) || 
          p.sku.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
        );

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        
        // Price Range Filter
        const minP = parseFloat(priceRange.min);
        const maxP = parseFloat(priceRange.max);
        const matchesMinPrice = isNaN(minP) || p.price >= minP;
        const matchesMaxPrice = isNaN(maxP) || p.price <= maxP;

        return matchesSearch && matchesStatus && matchesCategory && matchesMinPrice && matchesMaxPrice;
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
  }, [products, searchTerm, statusFilter, categoryFilter, priceRange, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, priceRange]);

  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  const SortIcon = ({ columnKey }: { columnKey: keyof Product }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  const renderStockDistribution = () => (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Stock Distribution (Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.stock || 0}</span>)
        </label>
        <span className="text-xs text-gray-400">Edit quantities per warehouse</span>
      </div>
      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
        {warehouses.map(wh => (
          <div key={wh.id} className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={wh.name}>{wh.name}</span>
                {wh.isDefault && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1 rounded flex-shrink-0">Def</span>}
              </div>
              <span className="text-[10px] text-gray-400 truncate block">{wh.location}</span>
            </div>
            <input 
              type="number"
              min="0"
              value={formData.warehouseStock?.[wh.id] ?? 0}
              onChange={(e) => handleWarehouseStockChange(wh.id, e.target.value)}
              className="w-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderImageUpload = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
      <div className="flex items-start gap-4">
        <div className={`
          w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 
          flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 relative group
        `}>
          {formData.image ? (
            <>
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={handleRemoveImage}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2">
            <Upload className="w-4 h-4" />
            Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recommended: Square JPG/PNG, Max 2MB.
          </p>
        </div>
      </div>
    </div>
  );

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
             onClick={openRestockModal}
             className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
           >
             <ShoppingBag className="w-4 h-4" /> {t('restock')}
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

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col flex-1">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
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

            {/* Price Range Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('price')}:</span>
              <input 
                type="number" 
                placeholder={t('min')} 
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-16 bg-transparent text-sm outline-none dark:text-white"
                min="0"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder={t('max')} 
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-16 bg-transparent text-sm outline-none dark:text-white"
                min="0"
              />
            </div>

            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priceRange.min || priceRange.max) && (
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white line-clamp-2">{item.name}</span>
                    </div>
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
                        onClick={() => openHistoryModal(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('product_history')}
                      >
                        <History className="w-4 h-4" />
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
      </div>

      {/* --- MODALS --- */}
      
      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('restock_low_stock')}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('select_products_restock')}</p>
                </div>
              </div>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
                {/* Supplier Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('supplier_management')}</label>
                    <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                            value={selectedRestockSupplier}
                            onChange={(e) => setSelectedRestockSupplier(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        >
                            <option value="">{t('select_supplier')}</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.company}</option>)}
                        </select>
                    </div>
                </div>

                {/* Product List */}
                <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-1 text-center"></div>
                        <div className="col-span-5">{t('product')}</div>
                        <div className="col-span-3 text-center">Current Stock</div>
                        <div className="col-span-3 text-right">{t('order_qty')}</div>
                    </div>
                    {products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length === 0 ? (
                        <p className="text-center text-gray-500 py-4 italic">No items currently need restocking.</p>
                    ) : (
                        products
                        .filter(p => p.status === 'low_stock' || p.status === 'out_of_stock')
                        .map(p => (
                            <div key={p.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border transition-colors ${restockSelection[p.id] !== undefined ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                <div className="col-span-1 text-center">
                                    <button 
                                        onClick={() => toggleRestockItem(p.id)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${restockSelection[p.id] !== undefined ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-400 hover:border-indigo-500'}`}
                                    >
                                        {restockSelection[p.id] !== undefined && <CheckSquare className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="col-span-5">
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.sku}</div>
                                </div>
                                <div className="col-span-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(p.status)}`}>
                                        {p.stock}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    {restockSelection[p.id] !== undefined ? (
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={restockSelection[p.id]}
                                            onChange={(e) => handleRestockSelectionChange(p.id, parseInt(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 text-sm text-right bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleRestockSubmit}
                  disabled={!selectedRestockSupplier || Object.keys(restockSelection).length === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('generate_order')}
                </button>
            </div>
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
                {renderImageUpload()}
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
                {renderStockDistribution()}
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

      {/* EDIT Modal */}
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
                {renderImageUpload()}
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
                    <p className="text-[10px] text-gray-400 mt-1">Manual edits will log a "Cost Revaluation".</p>
                  </div>
                </div>
                {renderStockDistribution()}
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
                  <Pencil className="w-4 h-4" />
                  {t('save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedProduct.image && (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('product_history')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProduct.name} ({selectedProduct.sku})</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('movement_type')}</th>
                    <th className="px-6 py-4">{t('reference')}</th>
                    <th className="px-6 py-4">{t('warehouse')}</th>
                    <th className="px-6 py-4 text-right">{t('quantity')}</th>
                    <th className="px-6 py-4 text-right">{t('unit_cost')} (In)</th>
                    <th className="px-6 py-4 text-right">WAC Impact</th>
                    <th className="px-6 py-4">{t('notes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stockMovements
                    .filter(m => m.productId === selectedProduct.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(movement => {
                      const relatedInfo = movement.relatedWarehouseName 
                        ? (movement.type === 'transfer_in' ? `From: ${movement.relatedWarehouseName}` : `To: ${movement.relatedWarehouseName}`)
                        : '';
                      
                      const isRevaluation = movement.quantity === 0 && movement.costBefore !== movement.costAfter;

                      return (
                        <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-gray-500">{new Date(movement.date).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                              ${movement.type === 'purchase' || movement.type === 'return' || movement.type === 'initial' || movement.type === 'transfer_in' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : isRevaluation 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                            `}>
                              {isRevaluation ? 'Revaluation' : t(movement.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{movement.reference}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{movement.warehouseName}</td>
                          <td className={`px-6 py-4 text-right font-mono font-bold ${movement.quantity > 0 ? 'text-green-600' : movement.quantity < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                            {movement.unitCost ? formatCurrency(movement.unitCost) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {movement.costBefore !== undefined && movement.costAfter !== undefined && movement.costBefore !== movement.costAfter ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs line-through text-gray-400">{formatCurrency(movement.costBefore)}</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(movement.costAfter)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500 italic truncate max-w-xs" title={movement.notes}>
                            {movement.notes}
                            {relatedInfo && <span className="text-xs text-indigo-500 block not-italic font-medium">{relatedInfo}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  {stockMovements.filter(m => m.productId === selectedProduct.id).length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No movement history found for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                {t('close')}
              </button>
            </div>
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

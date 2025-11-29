
import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, Plus, Trash2, Store, Truck, 
  X, Minus, Package, ChevronRight, CheckCircle, FileText, Printer, Building, FilePenLine, DollarSign, RefreshCcw, ArrowDownCircle
} from 'lucide-react';
import { Product, PurchaseDocumentType, Purchase } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface POItem extends Product {
  cartId: string;
  quantity: number;
  unitCost: number; 
  isCustom?: boolean;
}

interface PurchasesProps {
  mode: PurchaseDocumentType;
}

const Purchases: React.FC<PurchasesProps> = ({ mode }) => {
  const { products, suppliers, warehouses, purchases, createPurchaseDocument, formatCurrency, settings, t } = useApp();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastDocNumber, setLastDocNumber] = useState('');
  const [lastCreatedDoc, setLastCreatedDoc] = useState<Purchase | null>(null);
  
  // Transaction State
  const [cart, setCart] = useState<POItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
  const [linkedOrderId, setLinkedOrderId] = useState<string>('');
  
  // Currency State
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);
  const [exchangeRate, setExchangeRate] = useState(1);

  // New Fields
  const [paymentTerms, setPaymentTerms] = useState('Due on Receipt');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState<number>(0);

  // Initialize tax rate
  const defaultRate = settings.taxRates.find(r => r.isDefault)?.rate || 0;
  const [taxRate, setTaxRate] = useState<number>(defaultRate); 
  
  useEffect(() => {
    setCart([]);
    setSelectedSupplier('');
    setLinkedOrderId('');
    setTaxRate(defaultRate);
    setPaymentTerms('Due on Receipt');
    setPaymentMethod('Bank Transfer');
    setNotes('');
    setAdditionalCosts(0);
    setShowSuccessModal(false);
    setLastCreatedDoc(null);
    setSelectedCurrency(settings.currency);
    setExchangeRate(1);
  }, [mode, defaultRate, settings.currency]);

  // Helpers
  const getPageTitle = () => {
    switch(mode) {
      case 'order': return 'New Supplier Order';
      case 'delivery': return 'Receive Goods (GRN)';
      default: return 'Register Supplier Invoice';
    }
  };

  const getButtonLabel = () => {
    switch(mode) {
      case 'order': return 'Create Order';
      case 'delivery': return 'Confirm Receipt';
      default: return 'Save Invoice';
    }
  };

  const getButtonColor = () => {
    switch(mode) {
      case 'order': return 'bg-orange-600 hover:bg-orange-700';
      case 'delivery': return 'bg-emerald-600 hover:bg-emerald-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };
  
  // Pending Orders for GRN
  const pendingOrders = mode === 'delivery' 
    ? purchases.filter(p => p.type === 'order' && p.status === 'pending')
    : [];

  const handleOrderSelect = (orderId: string) => {
    setLinkedOrderId(orderId);
    const order = purchases.find(p => p.id === orderId);
    if (order) {
      setSelectedSupplier(order.supplierId);
      if (order.warehouseId) setSelectedWarehouse(order.warehouseId);
      setNotes(`Received against PO: ${order.number}`);
      
      // Populate Cart
      const newCart: POItem[] = order.items.map(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          return {
            ...product,
            cartId: `${product.id}-${Date.now()}`,
            quantity: item.quantity,
            unitCost: item.price
          };
        } else {
          // Handle non-inventory items if necessary
          return {
            id: item.id,
            sku: 'N/A',
            name: item.description,
            category: 'General',
            stock: 0,
            warehouseStock: {},
            price: 0,
            cost: item.price,
            status: 'in_stock',
            cartId: `${item.id}-${Date.now()}`,
            quantity: item.quantity,
            unitCost: item.price
          } as POItem;
        }
      });
      setCart(newCart);
    } else {
      // Clear selection
      setCart([]);
      setSelectedSupplier('');
      setNotes('');
    }
  };

  // Custom Item Form State
  const [customItem, setCustomItem] = useState({ name: '', cost: '' });

  // Derived Data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount + additionalCosts;

  // Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && !item.isCustom);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && !item.isCustom
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      // Auto-convert cost if currency differs from base
      const convertedCost = selectedCurrency !== settings.currency 
        ? product.cost / exchangeRate // Base Cost / Rate = Foreign Cost
        : product.cost;

      return [...prev, { 
        ...product, 
        cartId: `${product.id}-${Date.now()}`, 
        quantity: 1,
        unitCost: convertedCost
      }];
    });
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.name || !customItem.cost) return;
    
    const cost = parseFloat(customItem.cost);
    const newItem: POItem = {
      id: `custom-${Date.now()}`,
      cartId: `custom-${Date.now()}`,
      sku: 'NON-INV',
      name: customItem.name,
      category: 'Expensed',
      stock: 0,
      warehouseStock: {},
      price: 0,
      cost: cost,
      status: 'in_stock',
      quantity: 1,
      unitCost: cost,
      isCustom: true,
      marginPercent: 0 // No margin for expensed items
    };
    
    setCart(prev => [...prev, newItem]);
    setCustomItem({ name: '', cost: '' });
    setShowCustomItemModal(false);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateCost = (cartId: string, newCost: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, unitCost: newCost };
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleCreateDoc = () => {
    if (cart.length === 0) return;
    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }
    if (!selectedWarehouse) {
      alert("Please select a destination warehouse.");
      return;
    }

    const purchaseItems = cart.map(item => ({
      id: item.id,
      description: item.name,
      quantity: item.quantity,
      price: item.unitCost
    }));

    const supplierName = suppliers.find(s => s.id === selectedSupplier)?.company || 'Unknown Supplier';

    const createdDoc = createPurchaseDocument(mode, {
      supplierId: selectedSupplier,
      supplierName: supplierName,
      date: new Date().toISOString().split('T')[0],
      amount: total,
      currency: selectedCurrency,
      exchangeRate: exchangeRate,
      additionalCosts: additionalCosts,
      status: mode === 'order' ? 'pending' : 'completed', // GRN and Invoice are completed immediately here
      warehouseId: selectedWarehouse,
      paymentTerms,
      paymentMethod,
      notes,
      taxRate: taxRate,
      subtotal: subtotal,
      linkedDocumentId: linkedOrderId || undefined
    }, purchaseItems);

    setLastCreatedDoc(createdDoc);
    setLastDocNumber(createdDoc.number);
    setShowSuccessModal(true);
  };

  const handlePrint = () => {
    if (lastCreatedDoc) {
      printInvoice(lastCreatedDoc, settings);
    }
  };

  const resetForm = () => {
    setCart([]);
    setSelectedSupplier('');
    setLinkedOrderId('');
    setNotes('');
    setAdditionalCosts(0);
    setLastCreatedDoc(null);
    setShowSuccessModal(false);
    setSelectedCurrency(settings.currency);
    setExchangeRate(1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* LEFT COLUMN: CATALOG */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {getPageTitle()} <span className="text-sm font-normal text-gray-400">| Catalog</span>
            </h2>
            <button 
              onClick={() => setShowCustomItemModal(true)}
              className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" /> Non-Inventory Item
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search items to purchase..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white min-w-[120px]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
                // Calculate display cost
                const displayCost = selectedCurrency !== settings.currency 
                  ? product.cost / exchangeRate 
                  : product.cost;

                return (
                  <div 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                        {product.stock <= 10 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{product.category}</span>
                        <span>Total Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase">Est. Cost</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(displayCost, selectedCurrency)}
                        </span>
                      </div>
                      <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PURCHASE ORDER */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 shadow-xl flex flex-col h-[40vh] lg:h-full z-20 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Draft
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>

          {/* Pending Order Selector (Only for Deliveries) */}
          {mode === 'delivery' && (
            <div className="relative">
              <ArrowDownCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <select
                value={linkedOrderId}
                onChange={(e) => handleOrderSelect(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none cursor-pointer"
              >
                <option value="">-- Select Pending Order (Optional) --</option>
                {pendingOrders.map(p => (
                  <option key={p.id} value={p.id}>{p.number} - {p.supplierName} ({formatCurrency(p.amount)})</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none rotate-90" />
            </div>
          )}
          
          {/* Warehouse Select */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none cursor-pointer"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
          </div>

          {/* Supplier Select */}
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              disabled={!!linkedOrderId} // Disable if linked to an order to prevent mismatch
              className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${!selectedSupplier ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`}
            >
              <option value="">Select Supplier...</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.company}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
          </div>

          {/* Currency Selection */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              >
                <option value="TND">TND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            {selectedCurrency !== settings.currency && (
              <div className="relative flex-1 animate-in fade-in zoom-in duration-200">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">1 {selectedCurrency} =</span>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                  className="w-full pl-12 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="Rate"
                />
              </div>
            )}
          </div>
        </div>

        {/* PO Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Truck className="w-12 h-12 opacity-20" />
              <p className="text-sm">Draft is empty</p>
              <p className="text-xs text-center px-8">Add items to build a {mode === 'order' ? 'purchase order' : mode === 'delivery' ? 'receipt note' : 'invoice'}.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg group">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.unitCost * item.quantity, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Cost:</span>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateCost(item.cartId, parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-20 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white text-right"
                      />
                    </div>
                    
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                      <button 
                        onClick={() => item.quantity > 1 ? updateQuantity(item.cartId, -1) : removeFromCart(item.cartId)}
                        className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-l-md transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="text-xs font-medium w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartId, 1)}
                        className="p-1 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-r-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Conditions - New Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('payment_terms')}</label>
              <select 
                value={paymentTerms} 
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
              >
                <option value="Due on Receipt">{t('due_on_receipt')}</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('payment_method')}</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
              >
                <option value="Bank Transfer">{t('bank_transfer')}</option>
                <option value="Cash">{t('cash')}</option>
                <option value="Check">{t('check')}</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('notes_conditions')}</label>
            <div className="relative">
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Delivery dock instructions..."
                className="w-full pl-2 pr-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white resize-none h-12"
              />
              <FilePenLine className="absolute right-2 bottom-2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, selectedCurrency)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {t('additional_expenses')}
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(parseFloat(e.target.value) || 0)}
                  className="w-20 px-1 py-0.5 ml-2 text-right text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                />
              </span>
              <span>{formatCurrency(additionalCosts, selectedCurrency)}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                Tax (VAT)
                <div className="flex items-center bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 ml-2">
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-24 px-1 py-0.5 text-xs bg-transparent outline-none cursor-pointer appearance-none dark:text-white"
                  >
                    {settings.taxRates.map(rate => (
                      <option key={rate.id} value={rate.rate}>
                        {rate.name} ({rate.rate}%)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 pointer-events-none">
                    <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                  </div>
                </div>
              </span>
              <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-end">
              <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(total, selectedCurrency)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
             <button 
               onClick={() => setCart([])}
               className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               Clear
             </button>
             <button 
               onClick={handleCreateDoc}
               disabled={cart.length === 0}
               className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 ${getButtonColor()}`}
             >
               <FileText className="w-4 h-4" />
               {getButtonLabel()}
             </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* Custom Item Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Non-Inventory Item</h3>
              <button onClick={() => setShowCustomItemModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={addCustomItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name / Description</label>
                <input 
                  autoFocus
                  type="text" 
                  value={customItem.name}
                  onChange={(e) => setCustomItem({...customItem, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="e.g. Office Chairs, Delivery Fee"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Cost ({selectedCurrency})</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={customItem.cost}
                  onChange={(e) => setCustomItem({...customItem, cost: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="0.00"
                  required 
                />
              </div>
              <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
                Add to PO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {mode === 'order' ? 'Supplier Order created.' : mode === 'delivery' ? 'Goods Received Note logged & Stock updated.' : 'Invoice logged & expenses updated.'}<br/>
              Ref <span className="font-mono font-medium text-gray-900 dark:text-white">{lastDocNumber}</span>
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 text-left space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Supplier:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{selectedSupplierData?.company || 'General Purchase'}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Warehouse:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{warehouses.find(w => w.id === selectedWarehouse)?.name}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Items:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{cart.length}</span>
               </div>
               {additionalCosts > 0 && (
                 <div className="flex justify-between text-sm text-gray-500">
                   <span>Extra Costs:</span>
                   <span>{formatCurrency(additionalCosts, selectedCurrency)}</span>
                 </div>
               )}
               <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                 <span className="text-gray-900 dark:text-white">Total Amount:</span>
                 <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total, selectedCurrency)}</span>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={resetForm}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                New {mode}
              </button>
              <button 
                onClick={handlePrint} 
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Purchases;

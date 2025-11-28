
import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Trash2, User, CreditCard, 
  X, Minus, Package, ChevronRight, CheckCircle, FileText, Send, Printer, Building, FilePenLine
} from 'lucide-react';
import { Product, SalesDocumentType, Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  isCustom?: boolean;
}

interface SalesProps {
  mode: SalesDocumentType;
}

const Sales: React.FC<SalesProps> = ({ mode }) => {
  const { products, clients, warehouses, createSalesDocument, formatCurrency, settings, t } = useApp();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastDocNumber, setLastDocNumber] = useState('');
  const [lastCreatedDoc, setLastCreatedDoc] = useState<Invoice | null>(null);
  
  // Transaction State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
  const [discount, setDiscount] = useState<number>(0);
  
  // New Fields
  const [paymentTerms, setPaymentTerms] = useState('Due on Receipt');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  
  // Initialize tax rate with default from settings
  const defaultRate = settings.taxRates.find(r => r.isDefault)?.rate || 0;
  const [taxRate, setTaxRate] = useState<number>(defaultRate);
  
  // Reset state when mode changes
  useEffect(() => {
    setCart([]);
    setSelectedClient('');
    setDiscount(0);
    setTaxRate(defaultRate);
    setPaymentTerms('Due on Receipt');
    setPaymentMethod('Bank Transfer');
    setNotes('');
    setShowSuccessModal(false);
    setLastCreatedDoc(null);
  }, [mode, defaultRate]);

  // UI Helpers
  const getPageTitle = () => {
    switch (mode) {
      case 'estimate': return t('new_estimate');
      case 'order': return t('new_order');
      case 'delivery': return t('new_delivery');
      case 'issue': return t('new_issue');
      default: return t('new_invoice');
    }
  };

  const getButtonLabel = () => {
    switch (mode) {
      case 'estimate': return t('save_estimate');
      case 'order': return t('confirm_order');
      case 'delivery': return t('create_delivery');
      default: return t('charge_create');
    }
  };

  const getButtonColor = () => {
    switch (mode) {
      case 'estimate': return 'bg-blue-600 hover:bg-blue-700';
      case 'order': return 'bg-orange-600 hover:bg-orange-700';
      case 'delivery': return 'bg-slate-700 hover:bg-slate-800';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  // Custom Item Form State
  const [customItem, setCustomItem] = useState({ name: '', price: '' });

  // Derived Data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + taxAmount - discountAmount;

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
      return [...prev, { ...product, cartId: `${product.id}-${Date.now()}`, quantity: 1 }];
    });
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.name || !customItem.price) return;
    
    const price = parseFloat(customItem.price);
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      cartId: `custom-${Date.now()}`,
      sku: 'CUSTOM',
      name: customItem.name,
      category: 'Custom',
      stock: 999,
      warehouseStock: {},
      price: price,
      cost: 0,
      status: 'in_stock',
      quantity: 1,
      isCustom: true
    };
    
    setCart(prev => [...prev, newItem]);
    setCustomItem({ name: '', price: '' });
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

  const updatePrice = (cartId: string, newPrice: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, price: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleSubmit = () => {
    if (cart.length === 0) return;
    if (!selectedClient) {
      alert("Please select a customer first.");
      return;
    }
    if (!selectedWarehouse) {
      alert("Please select a source warehouse.");
      return;
    }

    // Prepare Data for Context
    const invoiceItems = cart.map(item => ({
      id: item.id,
      description: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const clientName = clients.find(c => c.id === selectedClient)?.company || 'Unknown Client';
    const dueDate = new Date();
    
    // Simple logic for due date based on terms
    if (paymentTerms === 'Net 15') dueDate.setDate(dueDate.getDate() + 15);
    else if (paymentTerms === 'Net 30') dueDate.setDate(dueDate.getDate() + 30);
    else if (paymentTerms === 'Net 60') dueDate.setDate(dueDate.getDate() + 60);

    const status = mode === 'estimate' ? 'draft' : mode === 'order' ? 'pending' : mode === 'invoice' ? 'paid' : 'completed';

    const createdDoc = createSalesDocument(mode, {
      clientId: selectedClient,
      clientName: clientName,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      amount: total,
      status: status,
      warehouseId: selectedWarehouse,
      paymentTerms,
      paymentMethod,
      notes,
      taxRate: taxRate,
      subtotal: subtotal,
      discount: discountAmount
    }, invoiceItems);

    setLastCreatedDoc(createdDoc);
    setLastDocNumber(createdDoc.number); 
    setShowSuccessModal(true);
  };

  const handlePrint = () => {
    if (lastCreatedDoc) {
      printInvoice(lastCreatedDoc, settings);
    }
  };

  const resetSale = () => {
    setCart([]);
    setSelectedClient('');
    setDiscount(0);
    setNotes('');
    setShowSuccessModal(false);
    setLastCreatedDoc(null);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* LEFT COLUMN: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-700">
        {/* Header / Search */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              {getPageTitle()} <span className="text-sm font-normal text-gray-400">| {t('catalog')}</span>
            </h2>
            <button 
              onClick={() => setShowCustomItemModal(true)}
              className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" /> {t('custom_item')}
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('search_products')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white min-w-[120px]"
            >
              <option value="All">{t('all_categories')}</option>
              {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const stockInSelected = product.warehouseStock?.[selectedWarehouse] || 0;
              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {product.sku}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${stockInSelected > 10 ? 'bg-green-500' : stockInSelected > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(product.price)}
                    </span>
                    <div className="text-xs text-gray-400">
                      Stock: {stockInSelected} 
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <p>{t('no_products')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CART / CHECKOUT */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 shadow-xl flex flex-col h-[40vh] lg:h-full z-20 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t('cart')}
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>
          
          {/* Warehouse Select */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
          </div>

          {/* Customer Select */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${!selectedClient ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer`}
            >
              <option value="">{t('select_customer')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company} ({client.name})</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p className="text-sm">List is empty</p>
              <p className="text-xs text-center px-8">Add items from the catalog.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg group">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">@</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePrice(item.cartId, parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-20 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white text-right"
                        min="0"
                        step="0.01"
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
                        className="p-1 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-r-md transition-colors"
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
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
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
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
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
                placeholder="E.g. Delivery between 9am-5pm..."
                className="w-full pl-2 pr-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white resize-none h-12"
              />
              <FilePenLine className="absolute right-2 bottom-2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {t('discount')}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 ml-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-10 px-1 py-0.5 text-center text-xs bg-transparent outline-none dark:text-white" 
                  />
                  <span className="text-xs px-1 text-gray-400">%</span>
                </div>
              </span>
              <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {t('tax')}
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
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-end">
              <span className="font-bold text-gray-900 dark:text-white">{t('total')}</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
             <button 
               onClick={() => setCart([])}
               className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
             >
               {t('clear')}
             </button>
             <button 
               onClick={handleSubmit}
               disabled={cart.length === 0}
               className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 ${getButtonColor()}`}
             >
               <CreditCard className="w-4 h-4" />
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('add_custom_item')}</h3>
              <button onClick={() => setShowCustomItemModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={addCustomItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('item_name')}</label>
                <input 
                  autoFocus
                  type="text" 
                  value={customItem.name}
                  onChange={(e) => setCustomItem({...customItem, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="e.g. Service Fee"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')} ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={customItem.price}
                  onChange={(e) => setCustomItem({...customItem, price: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  placeholder="0.00"
                  required 
                />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                {t('add_custom_item')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('success')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {mode === 'estimate' ? 'Estimate saved.' : mode === 'order' ? 'Order confirmed.' : mode === 'delivery' ? 'Stock deducted.' : 'Invoice generated & revenue updated.'}<br/>
              Ref <span className="font-mono font-medium text-gray-900 dark:text-white">{lastDocNumber}</span>
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 text-left space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">{t('client')}:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{selectedClientData?.company || 'Walk-in Customer'}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Warehouse:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{warehouses.find(w => w.id === selectedWarehouse)?.name}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Items:</span>
                 <span className="font-medium text-gray-900 dark:text-white">{cart.length}</span>
               </div>
               <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                 <span className="text-gray-900 dark:text-white">{t('total')}:</span>
                 <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={resetSale}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> {t('new')} {mode === 'order' ? 'Order' : 'Sale'}
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> {t('print')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sales;

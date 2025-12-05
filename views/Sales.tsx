
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Save, User, Calendar, 
  ShoppingCart, DollarSign, FileText, ChevronRight, Calculator,
  Search, X, Package, Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InvoiceItem, Product, SalesDocumentType } from '../types';
import SearchableSelect from '../components/SearchableSelect';
import { allCurrencies } from '../utils/currencyList';

interface SalesProps {
  mode: SalesDocumentType;
  onCancel?: () => void;
  onDocumentCreated?: (documentId: string, documentType: SalesDocumentType) => void;
}

const Sales: React.FC<SalesProps> = ({ mode = 'invoice', onCancel, onDocumentCreated }) => {
  const { clients, products, serviceCatalog, warehouses, projects, createSalesDocument, formatCurrency, settings, t } = useApp();

  // Form State
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
  const [currency, setCurrency] = useState(settings.currency);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [status, setStatus] = useState<string>('draft');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // Payment Details
  const [paymentTerms, setPaymentTerms] = useState<string>('Due on Receipt');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  
  // Catalog Filter State
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'product' | 'service'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Tax & Discounts
  const [taxRate, setTaxRate] = useState(settings.taxRates.find(r => r.isDefault)?.rate || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState(0);

  // Helper to handle cancel/back
  const handleBack = () => {
    if (onCancel) onCancel();
    else window.history.back();
  };

  // Helper to reset form (for Cancel button in estimates)
  const resetForm = () => {
    setClientId('');
    setProjectId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setWarehouseId(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
    setCurrency(settings.currency);
    setExchangeRate(1);
    setStatus('draft');
    setNotes('');
    setItems([]);
    setPaymentTerms('Due on Receipt');
    setPaymentMethod('Bank Transfer');
    setTaxRate(settings.taxRates.find(r => r.isDefault)?.rate || 0);
    setDiscountType('percent');
    setDiscountValue(0);
    setCatalogFilter('all');
    setSearchTerm('');
  };

  // Item Management
  const addItem = (item: any) => {
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { 
        id: item.id, 
        description: item.name, 
        quantity: 1, 
        price: item.price // mapped from either product.price or service.basePrice
      }]);
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);
  const fiscalStampAmount = (mode === 'invoice' && settings.enableFiscalStamp) ? settings.fiscalStampValue : 0;
  const total = taxableAmount + taxAmount + fiscalStampAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return alert(t('select_client_error'));
    if (items.length === 0) return alert(t('add_items_error'));

    const client = clients.find(c => c.id === clientId);
    const project = projectId ? projects.find(p => p.id === projectId) : undefined;

    const createdDoc = createSalesDocument(mode, {
      clientId,
      clientName: client?.company || 'Unknown',
      projectId: projectId || undefined,
      projectName: project?.name,
      date,
      dueDate: dueDate || date,
      amount: total,
      currency,
      exchangeRate,
      status: status as any,
      warehouseId,
      subtotal,
      taxRate,
      discount: discountAmount,
      discountType,
      discountValue,
      fiscalStamp: fiscalStampAmount,
      paymentTerms,
      paymentMethod,
      notes
    }, items);

    // If onDocumentCreated callback exists, call it with the created document ID
    if (onDocumentCreated && (mode === 'order' || mode === 'delivery' || mode === 'invoice' || mode === 'estimate')) {
      onDocumentCreated(createdDoc.id, mode);
    } else {
      handleBack();
    }
  };

  // --- Unified Catalog Logic ---
  const unifiedCatalog = useMemo(() => {
    const prodItems = products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        type: 'product'
    }));

    const servItems = serviceCatalog.map(s => ({
        id: s.id,
        name: s.name,
        sku: 'SRV',
        category: 'Service',
        price: s.basePrice,
        stock: null, // Services have no stock
        type: 'service'
    }));

    return [...prodItems, ...servItems];
  }, [products, serviceCatalog]);

  const filteredCatalog = unifiedCatalog.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = catalogFilter === 'all' || item.type === catalogFilter;
      return matchesSearch && matchesType;
  });

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* LEFT: Product/Service Catalog */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              {t('catalog')}
            </h2>
            <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 lg:hidden">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
             <button 
                onClick={() => setCatalogFilter('all')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${catalogFilter === 'all' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
                 All
             </button>
             <button 
                onClick={() => setCatalogFilter('product')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${catalogFilter === 'product' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
                 <Package className="w-3 h-3" /> {t('products')}
             </button>
             <button 
                onClick={() => setCatalogFilter('service')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${catalogFilter === 'service' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
                 <Wrench className="w-3 h-3" /> {t('services')}
             </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 align-content-start">
          {filteredCatalog.map(item => (
            <button 
              key={item.id}
              onClick={() => addItem(item)}
              className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col h-full group"
            >
              <div className="flex justify-between items-start w-full mb-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate max-w-[80px] ${item.type === 'service' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {item.sku}
                </span>
                
                {item.type === 'product' ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.stock! > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.stock}
                    </span>
                ) : (
                    <Wrench className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-auto group-hover:text-indigo-600 transition-colors">
                {item.name}
              </h4>
              <div className="mt-3 font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(item.price)}
              </div>
            </button>
          ))}
          {filteredCatalog.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-10">
                  <Package className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">No items found</p>
              </div>
          )}
        </div>
      </div>

      {/* RIGHT: Document Form */}
      <div className="w-full lg:w-[450px] bg-white dark:bg-gray-800 shadow-xl flex flex-col h-full z-10">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{t(mode)}</h2>
            <p className="text-xs text-gray-500">New Document</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500">
               <ArrowLeft className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('client')}</label>
              <SearchableSelect
                options={clients.map(c => ({ value: c.id, label: c.company }))}
                value={clientId}
                onChange={setClientId}
                placeholder="Select Client..."
                className="w-full rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Projet (optionnel)</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'Aucun projet' },
                  ...projects
                    .filter(p => !clientId || p.clientId === clientId)
                    .map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))
                ]}
                value={projectId}
                onChange={setProjectId}
                placeholder="Sélectionner un projet..."
                className="w-full rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('date')}</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white" 
                />
              </div>
              {mode === 'invoice' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('due_date')}</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white" 
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency</label>
                 <select 
                   value={currency} 
                   onChange={e => setCurrency(e.target.value)}
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                 >
                   {allCurrencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                 <select 
                   value={status} 
                   onChange={e => setStatus(e.target.value)}
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white capitalize"
                 >
                   <option value="draft">Draft</option>
                   <option value="pending">Pending</option>
                   <option value="paid">Paid</option>
                   <option value="sent">Sent</option>
                 </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('payment_terms')}</label>
                 <select 
                   value={paymentTerms} 
                   onChange={e => setPaymentTerms(e.target.value)}
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none"
                 >
                   <option value="Due on Receipt">{t('due_on_receipt')}</option>
                   <option value="Net 15">Net 15</option>
                   <option value="Net 30">Net 30</option>
                   <option value="Net 60">Net 60</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('payment_method')}</label>
                 <select 
                   value={paymentMethod} 
                   onChange={e => setPaymentMethod(e.target.value)}
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none"
                 >
                   <option value="Bank Transfer">{t('bank_transfer')}</option>
                   <option value="Cash">{t('cash')}</option>
                   <option value="Check">{t('check')}</option>
                   <option value="Credit Card">Credit Card</option>
                 </select>
               </div>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Items</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col gap-2 group">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.description}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-center"
                    />
                    <span className="text-xs text-gray-500">x</span>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01" 
                      value={item.price} 
                      onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-right"
                    />
                    <span className="ml-auto font-bold text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  Select products or services from the left to add items
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            
            {/* Discount */}
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>Discount</span>
                <div className="flex bg-gray-100 dark:bg-gray-900 rounded p-0.5">
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={`px-1.5 py-0.5 text-xs rounded ${discountType === 'percent' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  >%</button>
                  <button 
                    onClick={() => setDiscountType('amount')}
                    className={`px-1.5 py-0.5 text-xs rounded ${discountType === 'amount' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  >$</button>
                </div>
                <input 
                  type="number" 
                  value={discountValue} 
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-right text-xs"
                />
              </div>
              <span className="text-red-500">-{formatCurrency(discountAmount, currency)}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {t('tax')}
                <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="ml-2 bg-transparent border-b border-gray-300 dark:border-gray-600 text-xs focus:outline-none"
                >
                    {settings.taxRates.map(r => <option key={r.id} value={r.rate}>{r.name} ({r.rate}%)</option>)}
                </select>
              </span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>

            {mode === 'invoice' && settings.enableFiscalStamp && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Fiscal Stamp</span>
                <span>{formatCurrency(fiscalStampAmount, currency)}</span>
              </div>
            )}

            <div className="flex justify-between items-end border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('notes')}</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white resize-none h-20"
              placeholder="Internal notes or terms..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Save className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;

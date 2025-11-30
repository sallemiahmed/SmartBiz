
import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Save, User, Calendar, 
  ShoppingCart, DollarSign, FileText, ChevronRight, Calculator 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InvoiceItem, Product, SalesDocumentType } from '../types';
import SearchableSelect from '../components/SearchableSelect';
import { allCurrencies } from '../utils/currencyList';

interface SalesProps {
  mode: SalesDocumentType;
  onCancel?: () => void;
}

const Sales: React.FC<SalesProps> = ({ mode = 'invoice', onCancel }) => {
  const { clients, products, warehouses, createSalesDocument, formatCurrency, settings, t } = useApp();
  
  // Form State
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id || '');
  const [currency, setCurrency] = useState(settings.currency);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [status, setStatus] = useState<string>('draft');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // Tax & Discounts
  const [taxRate, setTaxRate] = useState(settings.taxRates.find(r => r.isDefault)?.rate || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState(0);

  // Helper to handle cancel/back
  const handleBack = () => {
    if (onCancel) onCancel();
    else window.history.back();
  };

  // Item Management
  const addItem = (product: Product) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      setItems(items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { 
        id: product.id, 
        description: product.name, 
        quantity: 1, 
        price: product.price 
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
    
    createSalesDocument(mode, {
      clientId,
      clientName: client?.company || 'Unknown',
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
      notes
    }, items);

    handleBack();
  };

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* LEFT: Product Catalog */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              {t('product_catalog')}
            </h2>
            <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 lg:hidden">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_products')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 align-content-start">
          {products.map(product => (
            <button 
              key={product.id}
              onClick={() => addItem(product)}
              className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col h-full"
            >
              <div className="flex justify-between items-start w-full mb-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                  {product.sku}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.stock}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-auto">
                {product.name}
              </h4>
              <div className="mt-3 font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(product.price)}
              </div>
            </button>
          ))}
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
                  Select products from the left to add items
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

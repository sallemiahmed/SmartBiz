
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Search, Filter, Eye, Trash2, Printer, CheckCircle, X, 
  RotateCcw, AlertTriangle, FileText, Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, Purchase, InvoiceItem } from '../types';
import { printInvoice } from '../utils/printGenerator';

interface ReturnsProps {
  mode: 'client' | 'supplier';
  onAddNew?: () => void;
  isCreating?: boolean;
  onCancel?: () => void;
}

const Returns: React.FC<ReturnsProps> = ({ mode, onAddNew, isCreating, onCancel }) => {
  const { 
    invoices, purchases, createSalesDocument, createPurchaseDocument, 
    updateInvoice, updatePurchase, deleteInvoice, deletePurchase,
    products, warehouses, formatCurrency, t, settings 
  } = useApp();

  // --- LIST VIEW STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- CREATE VIEW STATE ---
  const [sourceDocId, setSourceDocId] = useState('');
  const [returnItems, setReturnItems] = useState<InvoiceItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [stockAction, setStockAction] = useState<'reintegrate' | 'quarantine'>('reintegrate');
  const [notes, setNotes] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');

  // --- Derived Data ---
  const documents = mode === 'client' ? invoices : purchases;
  const returns = documents.filter(d => d.type === 'return');

  // Available source documents (Invoices, Deliveries, Orders that are completed/paid/processed)
  const sourceDocuments = documents.filter(d => 
    (d.type === 'invoice' || d.type === 'delivery' || d.type === 'order') && 
    (d.status === 'paid' || d.status === 'completed' || d.status === 'received' || d.status === 'processed')
  );

  const filteredReturns = returns.filter(doc => {
    const name = mode === 'client' ? (doc as Invoice).clientName : (doc as Purchase).supplierName;
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- Handlers ---

  const handleSourceDocSelect = (id: string) => {
    setSourceDocId(id);
    const sourceDoc = sourceDocuments.find(d => d.id === id);
    if (sourceDoc) {
      // Initialize return items with 0 quantity, allowing user to select what to return
      setReturnItems(sourceDoc.items.map(item => ({
        ...item,
        quantity: 0 // Default to 0 to let user input return qty
      })));
      setSelectedWarehouseId(sourceDoc.warehouseId || warehouses[0]?.id);
    } else {
      setReturnItems([]);
    }
  };

  const handleItemQtyChange = (id: string, qty: number) => {
    const sourceDoc = sourceDocuments.find(d => d.id === sourceDocId);
    const originalItem = sourceDoc?.items.find(i => i.id === id);
    const maxQty = originalItem ? originalItem.quantity : 0;

    setReturnItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.min(Math.max(0, qty), maxQty) } : item
    ));
  };

  const handleSubmitReturn = () => {
    if (!sourceDocId) return alert("Please select a source document.");
    
    const itemsToReturn = returnItems.filter(i => i.quantity > 0);
    if (itemsToReturn.length === 0) return alert("Please specify quantities to return.");

    const sourceDoc = sourceDocuments.find(d => d.id === sourceDocId);
    if (!sourceDoc) return;

    const totalAmount = itemsToReturn.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxRate = sourceDoc.taxRate || 0;
    const totalWithTax = totalAmount * (1 + taxRate / 100);

    const commonData = {
      date: new Date().toISOString().split('T')[0],
      amount: totalWithTax,
      subtotal: totalAmount,
      taxRate: taxRate,
      status: 'processed' as const, // Auto-process for now
      warehouseId: selectedWarehouseId,
      returnReason,
      stockAction,
      notes,
      linkedDocumentId: sourceDoc.id
    };

    if (mode === 'client') {
      createSalesDocument('return', {
        ...commonData,
        clientId: (sourceDoc as Invoice).clientId,
        clientName: (sourceDoc as Invoice).clientName,
        currency: (sourceDoc as Invoice).currency,
        exchangeRate: (sourceDoc as Invoice).exchangeRate,
      }, itemsToReturn);
    } else {
      createPurchaseDocument('return', {
        ...commonData,
        supplierId: (sourceDoc as Purchase).supplierId,
        supplierName: (sourceDoc as Purchase).supplierName,
        currency: (sourceDoc as Purchase).currency,
        exchangeRate: (sourceDoc as Purchase).exchangeRate,
      }, itemsToReturn);
    }

    if (onCancel) onCancel();
    alert(t('success'));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this return note? This will NOT revert stock changes.")) return;
    if (mode === 'client') deleteInvoice(id);
    else deletePurchase(id);
    setIsViewModalOpen(false);
  };

  const handlePrint = (doc: Invoice | Purchase) => {
    printInvoice(doc, settings);
  };

  // --- RENDERERS ---

  if (isCreating) {
    return (
      <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
         <div className="max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-indigo-600" />
                    {t('new')} {mode === 'client' ? t('customer_returns') : t('supplier_returns')}
                </h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Source Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Source Document</label>
                        <select 
                            value={sourceDocId} 
                            onChange={(e) => handleSourceDocSelect(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="">-- Select Invoice/Order --</option>
                            {sourceDocuments.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.number} - {mode === 'client' ? (d as Invoice).clientName : (d as Purchase).supplierName} ({d.date})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Return Warehouse</label>
                        <select 
                            value={selectedWarehouseId}
                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('reason')}</label>
                        <select 
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="">-- Select Reason --</option>
                            <option value="defect">{t('defect')}</option>
                            <option value="wrong_item">{t('wrong_item')}</option>
                            <option value="no_longer_needed">{t('no_longer_needed')}</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('action')}</label>
                        <select 
                            value={stockAction}
                            onChange={(e) => setStockAction(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="reintegrate">{mode === 'client' ? t('reintegrate') : 'Return to Supplier'}</option>
                            <option value="quarantine">{t('quarantine')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                        <input 
                            type="text" 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>
                </div>

                {/* Items Table */}
                {sourceDocId && (
                    <div className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3 text-center">Original Qty</th>
                                    <th className="px-4 py-3 text-center">Return Qty</th>
                                    <th className="px-4 py-3 text-right">Refund Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {returnItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium dark:text-white">{item.description}</td>
                                        <td className="px-4 py-3 text-center text-gray-500">
                                            {sourceDocuments.find(d => d.id === sourceDocId)?.items.find(i => i.id === item.id)?.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleItemQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 text-center border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    {t('cancel')}
                </button>
                <button 
                    onClick={handleSubmitReturn}
                    disabled={!sourceDocId || returnItems.every(i => i.quantity === 0)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Confirm Return
                </button>
            </div>
         </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-indigo-600" />
            {mode === 'client' ? t('customer_returns') : t('supplier_returns')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage merchandise returns and tracking.</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {mode === 'client' ? 'New Return Note' : 'New Supplier Return'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                    <tr>
                        <th className="px-6 py-4">{t('ref_num')}</th>
                        <th className="px-6 py-4">{mode === 'client' ? t('client') : t('supplier_management')}</th>
                        <th className="px-6 py-4">{t('date')}</th>
                        <th className="px-6 py-4">{t('reason')}</th>
                        <th className="px-6 py-4 text-center">Action</th>
                        <th className="px-6 py-4 text-right">{t('amount')}</th>
                        <th className="px-6 py-4 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReturns.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                {doc.number}
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                                {mode === 'client' ? (doc as Invoice).clientName : (doc as Purchase).supplierName}
                            </td>
                            <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                            <td className="px-6 py-4 capitalize">{t(doc.returnReason || 'other')}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold
                                    ${doc.stockAction === 'quarantine' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
                                `}>
                                    {t(doc.stockAction || 'reintegrate')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                {formatCurrency(doc.amount)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredReturns.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('no_documents')}</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Return Note Details</h3>
                      <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between">
                          <span className="text-gray-500">Ref #:</span>
                          <span className="font-bold dark:text-white">{selectedDoc.number}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="dark:text-white">{selectedDoc.date}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">Reason:</span>
                          <span className="capitalize dark:text-white">{t(selectedDoc.returnReason || '')}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">Stock Action:</span>
                          <span className="capitalize font-medium dark:text-white">{t(selectedDoc.stockAction || '')}</span>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="font-bold mb-2 dark:text-white">Returned Items</h4>
                          <ul className="space-y-2 text-sm">
                              {selectedDoc.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">{item.description} (x{item.quantity})</span>
                                      <span className="font-medium dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between text-lg font-bold">
                          <span className="dark:text-white">Total Refund</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedDoc.amount)}</span>
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                      <button 
                        onClick={() => handlePrint(selectedDoc)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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

export default Returns;

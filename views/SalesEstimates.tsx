
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, CheckCircle, XCircle, ArrowRightCircle, RotateCcw, Pencil, Save, RefreshCw } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';
import SearchableSelect from '../components/SearchableSelect';

interface SalesEstimatesProps {
  onAddNew: () => void;
}

const SalesEstimates: React.FC<SalesEstimatesProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, updateInvoice, createSalesDocument, products, t, formatCurrency, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoc, setEditedDoc] = useState<Invoice | null>(null);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');

  const estimates = invoices.filter(inv => inv.type === 'estimate');

  const filteredDocs = estimates.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Reset edit state when opening a modal
  useEffect(() => {
    if (isViewModalOpen && selectedDoc) {
        setIsEditing(false);
        setEditedDoc(JSON.parse(JSON.stringify(selectedDoc))); // Deep copy
    }
  }, [isViewModalOpen, selectedDoc]);

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  const updateStatus = (status: 'accepted' | 'rejected' | 'draft') => {
    if (!selectedDoc) return;
    const updatedDoc = { ...selectedDoc, status };
    updateInvoice(updatedDoc);
    setSelectedDoc(updatedDoc);
  };

  const handleConvertToOrder = () => {
    if (!selectedDoc) return;
    
    // Create new Order
    const newOrder = createSalesDocument('order', {
        clientId: selectedDoc.clientId,
        clientName: selectedDoc.clientName,
        date: new Date().toISOString().split('T')[0],
        dueDate: selectedDoc.dueDate,
        amount: selectedDoc.amount,
        currency: selectedDoc.currency,
        exchangeRate: selectedDoc.exchangeRate,
        status: 'pending',
        warehouseId: selectedDoc.warehouseId,
        paymentTerms: selectedDoc.paymentTerms,
        paymentMethod: selectedDoc.paymentMethod,
        notes: `Converted from Estimate ${selectedDoc.number}. \n${selectedDoc.notes || ''}`,
        taxRate: selectedDoc.taxRate,
        subtotal: selectedDoc.subtotal,
        discount: selectedDoc.discount,
        discountValue: selectedDoc.discountValue,
        discountType: selectedDoc.discountType,
        fiscalStamp: selectedDoc.fiscalStamp,
        linkedDocumentId: selectedDoc.id
    }, selectedDoc.items);

    setIsViewModalOpen(false);
    alert(`${t('success')} Order ${newOrder.number} created.`);
  };

  // --- Edit Logic ---

  const handleEditItem = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!editedDoc) return;
    const newItems = [...editedDoc.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    recalculateTotals({ ...editedDoc, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (!editedDoc) return;
    const newItems = [...editedDoc.items];
    newItems.splice(index, 1);
    recalculateTotals({ ...editedDoc, items: newItems });
  };

  const handleAddItem = () => {
    if (!editedDoc || !selectedAddProductId) return;
    const product = products.find(p => p.id === selectedAddProductId);
    if (!product) return;

    const newItem: InvoiceItem = {
        id: product.id,
        description: product.name,
        quantity: 1,
        price: product.price
    };

    const newItems = [...editedDoc.items, newItem];
    recalculateTotals({ ...editedDoc, items: newItems });
    setSelectedAddProductId('');
  };

  const recalculateTotals = (doc: Invoice) => {
      const subtotal = doc.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Re-apply discount logic
      let discountAmount = 0;
      if (doc.discountType === 'percent') {
          discountAmount = subtotal * ((doc.discountValue || 0) / 100);
      } else {
          discountAmount = doc.discountValue || 0;
      }

      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxAmount = taxableAmount * ((doc.taxRate || 0) / 100);
      const total = taxableAmount + taxAmount + (doc.fiscalStamp || 0);

      setEditedDoc({
          ...doc,
          subtotal,
          discount: discountAmount,
          amount: total
      });
  };

  const saveEdits = () => {
      if (editedDoc) {
          updateInvoice(editedDoc);
          setSelectedDoc(editedDoc);
          setIsEditing(false);
          alert(t('settings_saved')); // Reusing 'Settings Saved' or could use 'success'
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
          case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
          case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
          case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('estimate')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage quotes and estimates</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_estimate')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_estimates')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('client')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('subtotal')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{formatCurrency(doc.subtotal || 0)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(doc.amount)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                       {t(doc.status)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteInvoice(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_documents')}</p>
            </div>
          )}
        </div>
      </div>

      {isViewModalOpen && selectedDoc && editedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? t('edit') : t('estimate_details')}
                </h3>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDoc.status)}`}>
                    {t(selectedDoc.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('client')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.clientName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t('date')}</span>
                {isEditing ? (
                    <input 
                        type="date" 
                        value={editedDoc.date}
                        onChange={(e) => setEditedDoc({...editedDoc, date: e.target.value})}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
                    />
                ) : (
                    <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
                )}
              </div>

              {isEditing && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('due_date')}</span>
                    <input 
                        type="date" 
                        value={editedDoc.dueDate || ''}
                        onChange={(e) => setEditedDoc({...editedDoc, dueDate: e.target.value})}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
                    />
                  </div>
              )}
              
              {/* ITEMS SECTION */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Items</h4>
                    {isEditing && (
                        <div className="flex gap-2 w-1/2">
                            <SearchableSelect 
                                options={products.map(p => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }))}
                                value={selectedAddProductId}
                                onChange={setSelectedAddProductId}
                                placeholder="Add product..."
                                className="w-full rounded text-xs"
                            />
                            <button 
                                onClick={handleAddItem}
                                disabled={!selectedAddProductId}
                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isEditing ? (
                      // EDIT MODE ITEMS
                      editedDoc.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                            <div className="flex-1">
                                <span className="text-sm font-medium dark:text-white block line-clamp-1">{item.description}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <input 
                                    type="number" 
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleEditItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-12 px-1 py-1 text-center text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                                <span className="text-xs text-gray-500">x</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleEditItem(idx, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-20 px-1 py-1 text-right text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="text-right w-20 text-sm font-bold dark:text-white">
                                {formatCurrency(item.quantity * item.price)}
                            </div>
                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      ))
                  ) : (
                      // VIEW MODE ITEMS
                      selectedDoc.items.length > 0 ? (
                        selectedDoc.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.description}</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No items recorded</p>
                      )
                  )}
                </div>
              </div>

              {/* PAYMENT TERMS & NOTES (Editable) */}
              {isEditing && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{t('payment_terms')}</label>
                          <input 
                              type="text" 
                              value={editedDoc.paymentTerms || ''}
                              onChange={(e) => setEditedDoc({...editedDoc, paymentTerms: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{t('notes_conditions')}</label>
                          <textarea 
                              value={editedDoc.notes || ''}
                              onChange={(e) => setEditedDoc({...editedDoc, notes: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white resize-none"
                              rows={2}
                          />
                      </div>
                  </div>
              )}

              {/* TOTALS */}
              {(isEditing ? editedDoc.subtotal : selectedDoc.subtotal) !== undefined && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span>{formatCurrency(isEditing ? editedDoc.subtotal : selectedDoc.subtotal)}</span>
                  </div>
                  
                  {/* Discount Display/Edit */}
                  <div className="flex justify-between text-sm text-red-500 items-center">
                      <span>{t('discount')}</span>
                      {isEditing ? (
                          <div className="flex items-center gap-1">
                              <select 
                                  value={editedDoc.discountType}
                                  onChange={(e) => {
                                      const type = e.target.value as 'percent' | 'amount';
                                      const val = editedDoc.discountValue || 0;
                                      // Re-run recalc manually or just update state and let handleEditItem trigger it? 
                                      // Better to update state then trigger recalc logic.
                                      const newDoc = { ...editedDoc, discountType: type };
                                      // Simple inline calc for UI update
                                      const discountAmount = type === 'percent' ? newDoc.subtotal * (val/100) : val;
                                      setEditedDoc({ ...newDoc, discount: discountAmount, amount: newDoc.subtotal - discountAmount + (newDoc.amount - newDoc.subtotal + (newDoc.discount||0)) }); 
                                  }}
                                  className="text-xs bg-gray-50 dark:bg-gray-900 border rounded"
                              >
                                  <option value="percent">%</option>
                                  <option value="amount">$</option>
                              </select>
                              <input 
                                  type="number" 
                                  value={editedDoc.discountValue || 0}
                                  onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const type = editedDoc.discountType;
                                      const discountAmount = type === 'percent' ? editedDoc.subtotal * (val/100) : val;
                                      // Update logic
                                      const taxable = Math.max(0, editedDoc.subtotal - discountAmount);
                                      const tax = taxable * ((editedDoc.taxRate||0)/100);
                                      const total = taxable + tax + (editedDoc.fiscalStamp||0);
                                      setEditedDoc({...editedDoc, discountValue: val, discount: discountAmount, amount: total});
                                  }}
                                  className="w-16 px-1 py-0.5 text-right text-xs bg-gray-50 dark:bg-gray-900 border rounded dark:text-white"
                              />
                          </div>
                      ) : (
                          <span>-{formatCurrency(selectedDoc.discount || 0)}</span>
                      )}
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 items-center">
                        <span>{t('tax')}</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <span className="text-xs">Rate %</span>
                                <input 
                                    type="number"
                                    value={editedDoc.taxRate || 0}
                                    onChange={(e) => {
                                        const rate = parseFloat(e.target.value) || 0;
                                        const taxable = Math.max(0, editedDoc.subtotal - (editedDoc.discount || 0));
                                        const tax = taxable * (rate/100);
                                        const total = taxable + tax + (editedDoc.fiscalStamp||0);
                                        setEditedDoc({...editedDoc, taxRate: rate, amount: total});
                                    }}
                                    className="w-12 px-1 py-0.5 text-right text-xs bg-gray-50 dark:bg-gray-900 border rounded dark:text-white"
                                />
                            </div>
                        ) : (
                            <span>{formatCurrency(selectedDoc.amount - (selectedDoc.subtotal - (selectedDoc.discount || 0)))}</span>
                        )}
                  </div>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t('total')}</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(isEditing ? editedDoc.amount : selectedDoc.amount)}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              
              {!isEditing ? (
                  <>
                    <button 
                        onClick={handlePrint}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> {t('print')}
                    </button>

                    {/* EDIT Button - Only if Draft */}
                    {selectedDoc.status === 'draft' && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Pencil className="w-4 h-4" /> {t('edit')}
                        </button>
                    )}

                    {/* Status Actions */}
                    {selectedDoc.status !== 'accepted' && selectedDoc.status !== 'rejected' && selectedDoc.status !== 'completed' && (
                        <>
                            <button 
                                onClick={() => updateStatus('accepted')}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                                title={t('mark_accepted')}
                            >
                                <CheckCircle className="w-4 h-4" /> {t('accept')}
                            </button>
                            <button 
                                onClick={() => updateStatus('rejected')}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                                title={t('mark_rejected')}
                            >
                                <XCircle className="w-4 h-4" /> {t('reject')}
                            </button>
                        </>
                    )}

                    {/* Convert/Revert Actions - Only if Accepted */}
                    {selectedDoc.status === 'accepted' && (
                        <>
                            <button
                                onClick={() => updateStatus('draft')}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                                title={t('revert_draft')}
                            >
                                <RotateCcw className="w-4 h-4" /> {t('revert_draft')}
                            </button>
                            <button 
                                onClick={handleConvertToOrder}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowRightCircle className="w-4 h-4" /> {t('convert_to_order')}
                            </button>
                        </>
                    )}
                    
                    <button 
                        onClick={() => setIsViewModalOpen(false)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        {t('close')}
                    </button>
                  </>
              ) : (
                  // EDIT MODE ACTIONS
                  <>
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={saveEdits}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" /> {t('save_changes')}
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEstimates;

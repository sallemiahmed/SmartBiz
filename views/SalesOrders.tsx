
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, CheckCircle, ArrowRight, RotateCcw, Pencil, Save, PackagePlus } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';
import SearchableSelect from '../components/SearchableSelect';

interface SalesOrdersProps {
  onAddNew: () => void;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, createSalesDocument, updateInvoice, products, t, formatCurrency, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoc, setEditedDoc] = useState<Invoice | null>(null);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');

  // Filter only sales orders
  const salesOrders = invoices.filter(inv => inv.type === 'order');

  const filteredDocs = salesOrders.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = (doc: Invoice) => {
    setSelectedDoc(doc);
    setIsEditing(false);
    setEditedDoc(JSON.parse(JSON.stringify(doc))); // Deep copy
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  // --- Status Workflow ---

  const updateStatus = (newStatus: string) => {
    if (!selectedDoc) return;
    const updated = { ...selectedDoc, status: newStatus as any };
    updateInvoice(updated);
    setSelectedDoc(updated);
    setEditedDoc(updated);
  };

  const handleValidate = () => updateStatus('pending'); // "Pending" implies Confirmed/Validated in Order context
  const handleRevertToDraft = () => updateStatus('draft');

  const handleGenerateInvoice = () => {
    if (!selectedDoc) return;

    createSalesDocument('invoice', {
      clientId: selectedDoc.clientId,
      clientName: selectedDoc.clientName,
      date: new Date().toISOString().split('T')[0],
      amount: selectedDoc.amount,
      currency: selectedDoc.currency,
      exchangeRate: selectedDoc.exchangeRate,
      warehouseId: selectedDoc.warehouseId,
      paymentTerms: selectedDoc.paymentTerms,
      paymentMethod: selectedDoc.paymentMethod,
      notes: `Invoice generated from Order ${selectedDoc.number}. \n${selectedDoc.notes || ''}`,
      taxRate: selectedDoc.taxRate,
      subtotal: selectedDoc.subtotal,
      discount: selectedDoc.discount,
      discountType: selectedDoc.discountType,
      discountValue: selectedDoc.discountValue,
      fiscalStamp: settings.enableFiscalStamp ? settings.fiscalStampValue : 0,
      linkedDocumentId: selectedDoc.id,
      status: 'pending'
    }, selectedDoc.items);

    setIsViewModalOpen(false);
    alert(t('success'));
  };

  // --- Edit Logic (Mirrored from Estimates) ---

  const handleSaveChanges = () => {
    if (editedDoc) {
      updateInvoice(editedDoc);
      setSelectedDoc(editedDoc);
      setIsEditing(false);
    }
  };

  const recalculateTotals = (doc: Invoice) => {
    const subtotal = doc.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    if (doc.discountType === 'percent') {
        discountAmount = subtotal * ((doc.discountValue || 0) / 100);
    } else {
        discountAmount = doc.discountValue || 0;
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * ((doc.taxRate || 0) / 100);
    const total = taxableAmount + taxAmount + (settings.enableFiscalStamp ? settings.fiscalStampValue : 0);

    setEditedDoc({
        ...doc,
        subtotal,
        discount: discountAmount,
        amount: total
    });
  };

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

  const handleAddProduct = () => {
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'; // Validated
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('client_order')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('sales_orders_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_order')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_orders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
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
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-orange-600 dark:text-orange-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(doc.amount)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                       {t(doc.status)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(doc)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg"
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
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? `Edit ${selectedDoc.number}` : t('order_details')}
                </h3>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('client')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
              </div>

              {/* Editable Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-gray-500 block text-xs uppercase mb-1">{t('payment_terms')}</label>
                          {isEditing ? (
                              <input 
                                  type="text"
                                  value={editedDoc.paymentTerms || ''}
                                  onChange={(e) => setEditedDoc({...editedDoc, paymentTerms: e.target.value})}
                                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
                              />
                          ) : (
                              <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.paymentTerms || '-'}</span>
                          )}
                      </div>
                      <div>
                          <label className="text-gray-500 block text-xs uppercase mb-1">{t('payment_method')}</label>
                          {isEditing ? (
                              <select 
                                  value={editedDoc.paymentMethod || ''}
                                  onChange={(e) => setEditedDoc({...editedDoc, paymentMethod: e.target.value})}
                                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white"
                              >
                                  <option value="Bank Transfer">{t('bank_transfer')}</option>
                                  <option value="Cash">{t('cash')}</option>
                                  <option value="Check">{t('check')}</option>
                                  <option value="Credit Card">Credit Card</option>
                              </select>
                          ) : (
                              <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.paymentMethod || '-'}</span>
                          )}
                      </div>
                  </div>
              </div>
              
              {/* Items Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                
                {isEditing && (
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                            <SearchableSelect 
                                options={products.map(p => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }))}
                                value={selectedAddProductId}
                                onChange={setSelectedAddProductId}
                                placeholder="Add product..."
                                className="w-full rounded text-sm"
                            />
                        </div>
                        <button 
                            onClick={handleAddProduct}
                            disabled={!selectedAddProductId}
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {isEditing ? (
                      editedDoc.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-2 rounded shadow-sm">
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
                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      ))
                  ) : (
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

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">{t('total')}</span>
                    <span className="text-orange-600 dark:text-orange-400">{formatCurrency(isEditing ? editedDoc.amount : selectedDoc.amount)}</span>
                  </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              
              {isEditing ? (
                  <div className="flex gap-3">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={handleSaveChanges}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium"
                    >
                        <Save className="w-4 h-4" /> {t('save_changes')}
                    </button>
                  </div>
              ) : (
                  <>
                    <div className="flex gap-2">
                        {/* Validation Logic */}
                        {selectedDoc.status === 'draft' ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" /> {t('edit')}
                                </button>
                                <button 
                                    onClick={handleValidate}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                                >
                                    <CheckCircle className="w-4 h-4" /> Validate
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex gap-2">
                                <button 
                                    onClick={handleRevertToDraft}
                                    className="flex-1 px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> {t('revert_draft')}
                                </button>
                                <button 
                                    onClick={handleGenerateInvoice}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-4 h-4" /> {t('generate_invoice')}
                                </button>
                            </div>
                        )}
                        
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                    </div>

                    <button 
                        onClick={() => setIsViewModalOpen(false)}
                        className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm mt-1"
                    >
                        {t('close')}
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

export default SalesOrders;

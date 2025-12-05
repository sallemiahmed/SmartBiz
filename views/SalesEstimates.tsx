
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, CheckCircle, ArrowRight, RotateCcw, Pencil, PackagePlus, Save } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';
import SearchableSelect from '../components/SearchableSelect';

interface SalesEstimatesProps {
  onAddNew: () => void;
}

const SalesEstimates: React.FC<SalesEstimatesProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, updateInvoice, createSalesDocument, products, clients, t, formatCurrency, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoc, setEditedDoc] = useState<Invoice | null>(null);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');
  
  // Custom Item State
  const [customItem, setCustomItem] = useState({ description: '', price: 0, quantity: 1 });
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Filter only estimates
  const estimates = invoices.filter(inv => inv.type === 'estimate');

  const filteredDocs = estimates.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = (doc: Invoice) => {
    setSelectedDoc(doc);
    // Reset edit state
    setIsEditing(false);
    setEditedDoc(JSON.parse(JSON.stringify(doc))); // Deep copy for editing
    setCustomItem({ description: '', price: 0, quantity: 1 });
    setIsAddingCustom(false);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    if (selectedDoc) {
      const client = clients.find(c => c.id === selectedDoc.clientId);
      printInvoice(selectedDoc, settings, client);
    }
  };

  // --- Status Workflow Handlers ---

  const updateStatus = (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
    if (!selectedDoc) return;
    const updated = { ...selectedDoc, status: newStatus };
    updateInvoice(updated);
    setSelectedDoc(updated);
    setEditedDoc(updated);
  };

  const handleValidate = () => updateStatus('sent'); // "Sent" acts as "Validé"
  const handleAccept = () => updateStatus('accepted');
  const handleReject = () => updateStatus('rejected');
  const handleRevertToDraft = () => updateStatus('draft');

  const handleConvertToOrder = () => {
    if (!selectedDoc) return;
    createSalesDocument('order', {
      clientId: selectedDoc.clientId,
      clientName: selectedDoc.clientName,
      projectId: selectedDoc.projectId,
      projectName: selectedDoc.projectName,
      date: new Date().toISOString().split('T')[0],
      amount: selectedDoc.amount,
      currency: selectedDoc.currency,
      exchangeRate: selectedDoc.exchangeRate,
      warehouseId: selectedDoc.warehouseId,
      paymentTerms: selectedDoc.paymentTerms,
      paymentMethod: selectedDoc.paymentMethod,
      notes: `Order generated from Estimate ${selectedDoc.number}. \n${selectedDoc.notes || ''}`,
      taxRate: selectedDoc.taxRate,
      subtotal: selectedDoc.subtotal,
      discount: selectedDoc.discount,
      discountType: selectedDoc.discountType,
      discountValue: selectedDoc.discountValue,
      linkedDocumentId: selectedDoc.id,
      status: 'pending'
    }, selectedDoc.items);
    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const handleConvertToInvoice = () => {
    if (!selectedDoc) return;
    createSalesDocument('invoice', {
      clientId: selectedDoc.clientId,
      clientName: selectedDoc.clientName,
      projectId: selectedDoc.projectId,
      projectName: selectedDoc.projectName,
      date: new Date().toISOString().split('T')[0],
      amount: selectedDoc.amount,
      currency: selectedDoc.currency,
      exchangeRate: selectedDoc.exchangeRate,
      warehouseId: selectedDoc.warehouseId,
      paymentTerms: selectedDoc.paymentTerms,
      paymentMethod: selectedDoc.paymentMethod,
      notes: `Invoice generated directly from Estimate ${selectedDoc.number}. \n${selectedDoc.notes || ''}`,
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

  // --- Editing Logic ---

  const handleSaveChanges = () => {
    if (editedDoc) {
      updateInvoice(editedDoc);
      setSelectedDoc(editedDoc);
      setIsEditing(false);
    }
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

  const handleAddCustomItem = () => {
    if (!editedDoc || !customItem.description) return;

    const newItem: InvoiceItem = {
        id: `custom-${Date.now()}`,
        description: customItem.description,
        quantity: customItem.quantity,
        price: customItem.price
    };

    const newItems = [...editedDoc.items, newItem];
    recalculateTotals({ ...editedDoc, items: newItems });
    
    // Reset custom item form
    setCustomItem({ description: '', price: 0, quantity: 1 });
    setIsAddingCustom(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; // Validé
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Helper to map system status to UI Label
  const getStatusLabel = (status: string) => {
      if (status === 'sent') return 'Validé';
      return t(status);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('estimate')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('sales_estimates_desc')}</p>
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
                <th className="px-6 py-4">Projet</th>
                <th className="px-6 py-4">{t('date')}</th>
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
                  <td className="px-6 py-4 text-gray-500 text-sm">{doc.projectName || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(doc.amount)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                       {getStatusLabel(doc.status)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(doc)}
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

      {/* Detail / Edit Modal */}
      {isViewModalOpen && selectedDoc && editedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? `Modifier ${selectedDoc.number}` : t('estimate_details')}
                </h3>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-6 flex-1">
              {/* Top Info */}
              <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-500 text-xs uppercase">{t('client')}</span>
                    <div className="font-medium text-gray-900 dark:text-white text-lg">{selectedDoc.clientName}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs uppercase">{t('status')}</span>
                    <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedDoc.status)}`}>
                            {getStatusLabel(selectedDoc.status)}
                        </span>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs uppercase">{t('date')}</span>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase">{t('valid_until')}</span>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedDoc.dueDate || '-'}</div>
                  </div>
              </div>
              
              {/* Items Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-900 dark:text-white">Articles</h4>
                </div>

                {isEditing && (
                    <div className="mb-4 space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        {/* 1. Add Existing Product */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SearchableSelect 
                                    options={products.map(p => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }))}
                                    value={selectedAddProductId}
                                    onChange={setSelectedAddProductId}
                                    placeholder="Search Product..."
                                    className="w-full rounded text-sm"
                                />
                            </div>
                            <button 
                                onClick={handleAddProduct}
                                disabled={!selectedAddProductId}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                            >
                                <Plus className="w-4 h-4 inline mr-1" /> Add
                            </button>
                        </div>

                        {/* 2. Custom Item Button/Form */}
                        {!isAddingCustom ? (
                            <button 
                                onClick={() => setIsAddingCustom(true)}
                                className="w-full py-1.5 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                                <PackagePlus className="w-3 h-3" /> {t('add_custom_item')}
                            </button>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <input 
                                    type="text"
                                    placeholder="Item Description"
                                    value={customItem.description}
                                    onChange={(e) => setCustomItem({...customItem, description: e.target.value})}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                        value={customItem.price}
                                        onChange={(e) => setCustomItem({...customItem, price: parseFloat(e.target.value) || 0})}
                                        className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                    <input 
                                        type="number"
                                        placeholder="Qty"
                                        min="1"
                                        value={customItem.quantity}
                                        onChange={(e) => setCustomItem({...customItem, quantity: parseInt(e.target.value) || 1})}
                                        className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                    <button 
                                        onClick={handleAddCustomItem}
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                    >
                                        Add
                                    </button>
                                    <button 
                                        onClick={() => setIsAddingCustom(false)}
                                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 text-xs"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
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
                            <div className="text-right w-20 text-sm font-bold dark:text-white">
                                {formatCurrency(item.quantity * item.price)}
                            </div>
                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      ))
                  ) : (
                      selectedDoc.items.length > 0 ? (
                        selectedDoc.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800 last:border-0">
                            <span className="text-gray-700 dark:text-gray-300"><span className="font-bold">{item.quantity}x</span> {item.description}</span>
                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No items recorded</p>
                      )
                  )}
                </div>
              </div>

              {/* Payment Terms & Method (Editable) */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t('payment_terms')}</label>
                              <input 
                                  type="text" 
                                  value={editedDoc.paymentTerms || ''}
                                  onChange={(e) => setEditedDoc({...editedDoc, paymentTerms: e.target.value})}
                                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:text-white"
                                  placeholder="e.g. 50% Upfront"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t('payment_method')}</label>
                              <select 
                                  value={editedDoc.paymentMethod || ''}
                                  onChange={(e) => setEditedDoc({...editedDoc, paymentMethod: e.target.value})}
                                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:text-white"
                              >
                                  <option value="">Select Method...</option>
                                  <option value="Bank Transfer">{t('bank_transfer')}</option>
                                  <option value="Cash">{t('cash')}</option>
                                  <option value="Check">{t('check')}</option>
                              </select>
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t('notes_conditions')}</label>
                              <textarea 
                                  value={editedDoc.notes || ''}
                                  onChange={(e) => setEditedDoc({...editedDoc, notes: e.target.value})}
                                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:text-white resize-none"
                                  rows={2}
                              />
                          </div>
                      </div>
                  ) : (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm mb-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="text-gray-500 text-xs block">{t('payment_terms')}</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.paymentTerms || '-'}</span>
                              </div>
                              <div>
                                  <span className="text-gray-500 text-xs block">{t('payment_method')}</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.paymentMethod || '-'}</span>
                              </div>
                          </div>
                          {selectedDoc.notes && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="text-gray-500 text-xs block">{t('notes_conditions')}</span>
                                  <span className="text-gray-700 dark:text-gray-300 italic">{selectedDoc.notes}</span>
                              </div>
                          )}
                      </div>
                  )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">{t('subtotal')}</span>
                      <span>{formatCurrency(isEditing ? editedDoc.subtotal : selectedDoc.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-blue-600 dark:text-blue-400 mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span>{t('total')}</span>
                    <span>{formatCurrency(isEditing ? editedDoc.amount : selectedDoc.amount)}</span>
                  </div>
              </div>
            </div>

            {/* Actions Footer - WORKFLOW BUTTONS */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
              
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
                        {/* EDIT Button - Only if Draft */}
                        {selectedDoc.status === 'draft' && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Pencil className="w-4 h-4" /> {t('edit')}
                            </button>
                        )}
                        
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            title={t('print')}
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                    </div>

                    {/* DRAFT ACTIONS */}
                    {selectedDoc.status === 'draft' && (
                        <button 
                            onClick={handleValidate}
                            className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Valider (Passer en Validé)
                        </button>
                    )}

                    {/* VALIDATED (SENT) ACTIONS */}
                    {selectedDoc.status === 'sent' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAccept}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                                >
                                    Accepter
                                </button>
                                <button 
                                    onClick={handleReject}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                                >
                                    Refuser
                                </button>
                            </div>
                            <button
                                onClick={handleRevertToDraft}
                                className="w-full px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> {t('revert_draft')}
                            </button>
                        </div>
                    )}

                    {/* ACCEPTED ACTIONS - CONVERT */}
                    {selectedDoc.status === 'accepted' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={handleConvertToOrder}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4" /> {t('convert_to_order')}
                            </button>
                            <button 
                                onClick={handleConvertToInvoice}
                                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> {t('convert_to_invoice')}
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => setIsViewModalOpen(false)}
                        className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm mt-2"
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

export default SalesEstimates;

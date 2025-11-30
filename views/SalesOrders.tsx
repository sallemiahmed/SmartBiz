
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Truck, CheckCircle, Receipt, Layers, Printer, RotateCcw, Pencil, Save } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';
import SearchableSelect from '../components/SearchableSelect';

interface SalesOrdersProps {
  onAddNew: () => void;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, t, formatCurrency, createSalesDocument, updateInvoice, settings, products } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryQuantities, setDeliveryQuantities] = useState<Record<string, number>>({});
  
  // Bulk Actions State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoc, setEditedDoc] = useState<Invoice | null>(null);
  const [selectedAddProductId, setSelectedAddProductId] = useState('');

  const orders = invoices.filter(inv => inv.type === 'order');

  const filteredOrders = orders.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Reset edit state when opening a modal
  useEffect(() => {
    if (isViewModalOpen && selectedOrder) {
        setIsEditing(false);
        setEditedDoc(JSON.parse(JSON.stringify(selectedOrder))); // Deep copy
    }
  }, [isViewModalOpen, selectedOrder]);

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
          setSelectedOrder(editedDoc);
          setIsEditing(false);
          alert(t('settings_saved'));
      }
  };

  // --- Bulk Selection Handlers ---

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleBulkInvoice = () => {
    if (selectedOrderIds.length === 0) return;

    const selectedOrdersList = orders.filter(o => selectedOrderIds.includes(o.id));
    
    if (selectedOrdersList.length === 0) return;

    const firstClient = selectedOrdersList[0].clientId;
    if (selectedOrdersList.some(o => o.clientId !== firstClient)) {
        alert(t('error_mixed_clients'));
        return;
    }

    const firstCurrency = selectedOrdersList[0].currency;
    if (selectedOrdersList.some(o => o.currency !== firstCurrency)) {
        alert(t('error_mixed_currencies'));
        return;
    }

    let aggregatedItems: InvoiceItem[] = [];
    selectedOrdersList.forEach(order => {
        aggregatedItems = [...aggregatedItems, ...order.items];
    });

    const totalAmount = selectedOrdersList.reduce((sum, o) => sum + o.amount, 0);
    const subtotal = selectedOrdersList.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const discount = selectedOrdersList.reduce((sum, o) => sum + (o.discount || 0), 0);
    
    const baseOrder = selectedOrdersList[0];
    const orderNumbers = selectedOrdersList.map(o => o.number).join(', ');

    createSalesDocument('invoice', {
        clientId: baseOrder.clientId,
        clientName: baseOrder.clientName,
        date: new Date().toISOString().split('T')[0],
        dueDate: baseOrder.dueDate, 
        amount: totalAmount,
        currency: baseOrder.currency,
        exchangeRate: baseOrder.exchangeRate,
        status: 'pending',
        warehouseId: baseOrder.warehouseId,
        paymentTerms: baseOrder.paymentTerms,
        paymentMethod: baseOrder.paymentMethod,
        notes: `Consolidated Invoice for Orders: ${orderNumbers}. \n${baseOrder.notes || ''}`,
        taxRate: baseOrder.taxRate,
        subtotal: subtotal,
        discount: discount,
    }, aggregatedItems);

    selectedOrdersList.forEach(order => {
        updateInvoice({
            ...order,
            status: 'completed',
            items: order.items.map(i => ({ ...i, fulfilledQuantity: i.quantity })) 
        });
    });

    setSelectedOrderIds([]);
    alert(t('success'));
  };

  // --- Existing Handlers ---

  const handleOpenDeliveryModal = () => {
    if (!selectedOrder) return;
    
    const initialQuantities: Record<string, number> = {};
    selectedOrder.items.forEach(item => {
      const remaining = item.quantity - (item.fulfilledQuantity || 0);
      initialQuantities[item.id] = remaining > 0 ? remaining : 0;
    });
    
    setDeliveryQuantities(initialQuantities);
    setIsViewModalOpen(false);
    setIsDeliveryModalOpen(true);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = parseInt(value) || 0;
    const item = selectedOrder?.items.find(i => i.id === itemId);
    if (!item) return;

    const remaining = item.quantity - (item.fulfilledQuantity || 0);
    const validQty = Math.max(0, Math.min(qty, remaining));
    
    setDeliveryQuantities(prev => ({
      ...prev,
      [itemId]: validQty
    }));
  };

  const submitDelivery = () => {
    if (!selectedOrder) return;

    const itemsToDeliver: InvoiceItem[] = selectedOrder.items
      .filter(item => (deliveryQuantities[item.id] || 0) > 0)
      .map(item => ({
        ...item,
        quantity: deliveryQuantities[item.id] || 0
      }));

    if (itemsToDeliver.length === 0) {
      alert(t('select_item_deliver'));
      return;
    }

    createSalesDocument('delivery', {
      clientId: selectedOrder.clientId,
      clientName: selectedOrder.clientName,
      warehouseId: selectedOrder.warehouseId,
      linkedDocumentId: selectedOrder.id, 
      notes: `Delivery for Order ${selectedOrder.number}`
    }, itemsToDeliver);

    const updatedItems = selectedOrder.items.map(item => {
      const deliveredNow = deliveryQuantities[item.id] || 0;
      return {
        ...item,
        fulfilledQuantity: (item.fulfilledQuantity || 0) + deliveredNow
      };
    });

    const isFullyCompleted = updatedItems.every(item => (item.fulfilledQuantity || 0) >= item.quantity);

    updateInvoice({
      ...selectedOrder,
      items: updatedItems,
      status: isFullyCompleted ? 'completed' : 'pending'
    });

    setIsDeliveryModalOpen(false);
    setSelectedOrder(null);
  };

  const handleGenerateInvoice = () => {
    if (!selectedOrder) return;

    createSalesDocument('invoice', {
      clientId: selectedOrder.clientId,
      clientName: selectedOrder.clientName,
      date: new Date().toISOString().split('T')[0],
      dueDate: selectedOrder.dueDate,
      amount: selectedOrder.amount,
      currency: selectedOrder.currency,
      exchangeRate: selectedOrder.exchangeRate,
      status: 'pending',
      warehouseId: selectedOrder.warehouseId,
      paymentTerms: selectedOrder.paymentTerms,
      paymentMethod: selectedOrder.paymentMethod,
      notes: selectedOrder.notes,
      taxRate: selectedOrder.taxRate,
      subtotal: selectedOrder.subtotal,
      discount: selectedOrder.discount,
      discountValue: selectedOrder.discountValue,
      discountType: selectedOrder.discountType,
      fiscalStamp: selectedOrder.fiscalStamp,
      linkedDocumentId: selectedOrder.id
    }, selectedOrder.items);

    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const updateStatus = (status: 'draft' | 'pending') => {
    if (!selectedOrder) return;
    const updatedDoc = { ...selectedOrder, status };
    updateInvoice(updatedDoc);
    setSelectedOrder(updatedDoc);
  };

  const handlePrint = () => {
    if (selectedOrder) {
      printInvoice(selectedOrder, settings);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('client_order')} 🛒</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage pending sales orders</p>
        </div>
        <div className="flex gap-2">
            {selectedOrderIds.length > 0 && (
                <button 
                    onClick={handleBulkInvoice}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors animate-in fade-in zoom-in duration-200"
                >
                    <Layers className="w-4 h-4" />
                    {t('create_invoice_from_selected')} ({selectedOrderIds.length})
                </button>
            )}
            <button 
            onClick={onAddNew}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
            >
            <Plus className="w-4 h-4" />
            {t('new_order')}
            </button>
        </div>
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
                <th className="px-6 py-4 w-10">
                    <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                </th>
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
              {filteredOrders.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input 
                        type="checkbox" 
                        checked={selectedOrderIds.includes(doc.id)}
                        onChange={() => toggleSelectOrder(doc.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-orange-600 dark:text-orange-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{formatCurrency(doc.subtotal || 0)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(doc.amount)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium 
                       ${doc.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                         doc.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                         'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}
                     `}>
                       {t(doc.status)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedOrder(doc); setIsViewModalOpen(true); }}
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
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_documents')}</p>
            </div>
          )}
        </div>
      </div>

      {isViewModalOpen && selectedOrder && editedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? t('edit') : t('order_details')}
                </h3>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-mono">{selectedOrder.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('client')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.clientName}</span>
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
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.date}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t(selectedOrder.status)}</span>
              </div>
              
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

                <div className="space-y-2 max-h-40 overflow-y-auto">
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
                      // VIEW MODE
                      selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => {
                        const fulfilled = item.fulfilledQuantity || 0;
                        const isComplete = fulfilled >= item.quantity;
                        const remaining = Math.max(0, item.quantity - fulfilled);
                        
                        return (
                            <div key={idx} className="flex justify-between items-center text-sm py-1">
                            <div className="flex flex-col">
                                <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                                <span className="text-xs text-gray-400">
                                {t('delivered')}: <span className={isComplete ? 'text-green-500 font-bold' : 'text-orange-500'}>{fulfilled}</span> / {item.quantity}
                                </span>
                                {remaining > 0 && (
                                <span className="text-xs text-gray-500">
                                    {t('remaining_qty')}: <span className="font-bold text-red-500">{remaining}</span>
                                </span>
                                )}
                            </div>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        );
                        })
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

              {(isEditing ? editedDoc.subtotal : selectedOrder.subtotal) !== undefined && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span>{formatCurrency(isEditing ? editedDoc.subtotal : selectedOrder.subtotal)}</span>
                  </div>
                  
                  {/* Discount */}
                  <div className="flex justify-between text-sm text-red-500 items-center">
                      <span>{t('discount')}</span>
                      {isEditing ? (
                          <div className="flex items-center gap-1">
                              <select 
                                  value={editedDoc.discountType}
                                  onChange={(e) => {
                                      const type = e.target.value as 'percent' | 'amount';
                                      const val = editedDoc.discountValue || 0;
                                      const newDoc = { ...editedDoc, discountType: type };
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
                                      const taxable = Math.max(0, editedDoc.subtotal - discountAmount);
                                      const tax = taxable * ((editedDoc.taxRate||0)/100);
                                      const total = taxable + tax + (editedDoc.fiscalStamp||0);
                                      setEditedDoc({...editedDoc, discountValue: val, discount: discountAmount, amount: total});
                                  }}
                                  className="w-16 px-1 py-0.5 text-right text-xs bg-gray-50 dark:bg-gray-900 border rounded dark:text-white"
                              />
                          </div>
                      ) : (
                          <span>-{formatCurrency(selectedOrder.discount || 0)}</span>
                      )}
                  </div>

                  {/* Tax */}
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
                            <span>{formatCurrency(selectedOrder.amount - (selectedOrder.subtotal - (selectedOrder.discount || 0)))}</span>
                        )}
                  </div>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t('total')}</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(isEditing ? editedDoc.amount : selectedOrder.amount)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 flex-wrap">
              
              {!isEditing ? (
                  <>
                    <button 
                        onClick={handlePrint}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        {t('print')}
                    </button>
                    
                    {/* EDIT Button - Only if Draft */}
                    {selectedOrder.status === 'draft' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Pencil className="w-4 h-4" /> {t('edit')}
                        </button>
                    )}

                    {selectedOrder.status === 'draft' && (
                        <button
                            onClick={() => updateStatus('pending')}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> {t('confirm_order')}
                        </button>
                    )}

                    {selectedOrder.status === 'pending' && (
                        <>
                            <button
                                onClick={() => updateStatus('draft')}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> {t('revert_draft')}
                            </button>
                            <button 
                                onClick={handleGenerateInvoice}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Receipt className="w-4 h-4" />
                                {t('generate_invoice')}
                            </button>
                            <button
                                onClick={handleOpenDeliveryModal}
                                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                {t('create_delivery')}
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

      {/* Partial Delivery Modal */}
      {isDeliveryModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('create_delivery_title')}</h3>
                <p className="text-xs text-gray-500">{t('for_order')}: {selectedOrder.number}</p>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">{t('item')}</th>
                    <th className="px-3 py-2 text-center">{t('ordered')}</th>
                    <th className="px-3 py-2 text-center">{t('delivered')}</th>
                    <th className="px-3 py-2 text-center font-bold text-red-500">{t('remaining_qty')}</th>
                    <th className="px-3 py-2 text-right">{t('deliver_now')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedOrder.items.map((item) => {
                    const fulfilled = item.fulfilledQuantity || 0;
                    const remaining = item.quantity - fulfilled;
                    const isFullyDelivered = remaining <= 0;

                    return (
                      <tr key={item.id} className={isFullyDelivered ? 'opacity-50' : ''}>
                        <td className="px-3 py-3 text-gray-900 dark:text-white">
                          <div className="font-medium">{item.description}</div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">{item.quantity}</td>
                        <td className="px-3 py-3 text-center text-green-600">{fulfilled}</td>
                        <td className="px-3 py-3 text-center font-bold text-red-500">{Math.max(0, remaining)}</td>
                        <td className="px-3 py-3 text-right">
                          <input 
                            type="number" 
                            min="0"
                            max={remaining}
                            disabled={isFullyDelivered}
                            value={deliveryQuantities[item.id] || 0}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setIsDeliveryModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={submitDelivery}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t('confirm_delivery')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;


import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Truck, CheckCircle, Receipt, Layers, Printer, RotateCcw } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface SalesOrdersProps {
  onAddNew: () => void;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, t, formatCurrency, createSalesDocument, updateInvoice, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryQuantities, setDeliveryQuantities] = useState<Record<string, number>>({});
  
  // Bulk Actions State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const orders = invoices.filter(inv => inv.type === 'order');

  const filteredOrders = orders.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

    // Get full order objects
    const selectedOrdersList = orders.filter(o => selectedOrderIds.includes(o.id));
    
    if (selectedOrdersList.length === 0) return;

    // Validation 1: Same Client
    const firstClient = selectedOrdersList[0].clientId;
    if (selectedOrdersList.some(o => o.clientId !== firstClient)) {
        alert(t('error_mixed_clients'));
        return;
    }

    // Validation 2: Same Currency
    const firstCurrency = selectedOrdersList[0].currency;
    if (selectedOrdersList.some(o => o.currency !== firstCurrency)) {
        alert(t('error_mixed_currencies'));
        return;
    }

    // Aggregate Items
    let aggregatedItems: InvoiceItem[] = [];
    selectedOrdersList.forEach(order => {
        aggregatedItems = [...aggregatedItems, ...order.items];
    });

    // Calculate Totals (simplified, usually recalculate tax per item line or total)
    const totalAmount = selectedOrdersList.reduce((sum, o) => sum + o.amount, 0);
    const subtotal = selectedOrdersList.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const discount = selectedOrdersList.reduce((sum, o) => sum + (o.discount || 0), 0);
    
    // Create Invoice
    const baseOrder = selectedOrdersList[0];
    const orderNumbers = selectedOrdersList.map(o => o.number).join(', ');

    createSalesDocument('invoice', {
        clientId: baseOrder.clientId,
        clientName: baseOrder.clientName,
        date: new Date().toISOString().split('T')[0],
        dueDate: baseOrder.dueDate, // Use first order due date or default
        amount: totalAmount,
        currency: baseOrder.currency,
        exchangeRate: baseOrder.exchangeRate,
        status: 'pending',
        warehouseId: baseOrder.warehouseId, // Assume primary warehouse or logic needs refinement
        paymentTerms: baseOrder.paymentTerms,
        paymentMethod: baseOrder.paymentMethod,
        notes: `Consolidated Invoice for Orders: ${orderNumbers}. \n${baseOrder.notes || ''}`,
        taxRate: baseOrder.taxRate, // Assuming consistent tax rate
        subtotal: subtotal,
        discount: discount,
        // fiscalStamp: ... (handled in context/logic usually)
    }, aggregatedItems);

    // Update Status of Orders to 'Completed' (assuming fully invoiced)
    selectedOrdersList.forEach(order => {
        updateInvoice({
            ...order,
            status: 'completed',
            // Update fulfilled quantity for traceability if needed, simplified here:
            items: order.items.map(i => ({ ...i, fulfilledQuantity: i.quantity })) 
        });
    });

    setSelectedOrderIds([]);
    alert(t('success'));
  };

  // --- Existing Handlers ---

  const handleOpenDeliveryModal = () => {
    if (!selectedOrder) return;
    
    // Initialize quantities with remaining amount
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
    // Clamp between 0 and remaining
    const validQty = Math.max(0, Math.min(qty, remaining));
    
    setDeliveryQuantities(prev => ({
      ...prev,
      [itemId]: validQty
    }));
  };

  const submitDelivery = () => {
    if (!selectedOrder) return;

    // Filter items that have quantity > 0
    const itemsToDeliver: InvoiceItem[] = selectedOrder.items
      .filter(item => (deliveryQuantities[item.id] || 0) > 0)
      .map(item => ({
        ...item,
        quantity: deliveryQuantities[item.id] || 0
      }));

    if (itemsToDeliver.length === 0) {
      alert("Please select at least one item to deliver.");
      return;
    }

    // 1. Create the Delivery Document
    createSalesDocument('delivery', {
      clientId: selectedOrder.clientId,
      clientName: selectedOrder.clientName,
      warehouseId: selectedOrder.warehouseId,
      linkedDocumentId: selectedOrder.id, // Ensure link
      notes: `Delivery for Order ${selectedOrder.number}`
    }, itemsToDeliver);

    // 2. Update the Source Order (Traceability & Fulfillment)
    const updatedItems = selectedOrder.items.map(item => {
      const deliveredNow = deliveryQuantities[item.id] || 0;
      return {
        ...item,
        fulfilledQuantity: (item.fulfilledQuantity || 0) + deliveredNow
      };
    });

    // Check if order is fully completed
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
      linkedDocumentId: selectedOrder.id // Ensure link
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

      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('order_details')}</h3>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-mono">{selectedOrder.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('client')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t(selectedOrder.status)}</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const fulfilled = item.fulfilledQuantity || 0;
                      const isComplete = fulfilled >= item.quantity;
                      const remaining = Math.max(0, item.quantity - fulfilled);
                      
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm py-1">
                          <div className="flex flex-col">
                            <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                            <span className="text-xs text-gray-400">
                              Delivered: <span className={isComplete ? 'text-green-500 font-bold' : 'text-orange-500'}>{fulfilled}</span> / {item.quantity}
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
                  )}
                </div>
              </div>

              {selectedOrder.subtotal !== undefined && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>
                        {t('discount')} 
                        {selectedOrder.discountType === 'percent' ? ` (${selectedOrder.discountValue}%)` : ''}
                      </span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.amount - (selectedOrder.subtotal - (selectedOrder.discount || 0)) > 0 && (
                     <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{t('tax')}</span>
                        <span>{formatCurrency(selectedOrder.amount - (selectedOrder.subtotal - (selectedOrder.discount || 0)))}</span>
                     </div>
                  )}
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t('total')}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedOrder.amount)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 flex-wrap">
              <button 
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {t('print')}
              </button>
              
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
                        <RotateCcw className="w-4 h-4" /> {t('draft')}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Delivery</h3>
                <p className="text-xs text-gray-500">For Order: {selectedOrder.number}</p>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Ordered</th>
                    <th className="px-3 py-2 text-center">Delivered</th>
                    <th className="px-3 py-2 text-center font-bold text-red-500">{t('remaining_qty')}</th>
                    <th className="px-3 py-2 text-right">Deliver Now</th>
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
                Cancel
              </button>
              <button 
                onClick={submitDelivery}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;

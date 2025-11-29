import React, { useState } from 'react';
import { Search, Plus, Filter, FileText, Eye, Trash2, AlertTriangle, X, CreditCard, Printer, Truck, CheckCircle, Receipt } from 'lucide-react';
import { Purchase, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface PurchaseOrdersProps {
  onAddNew: () => void;
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ onAddNew }) => {
  const { purchases, deletePurchase, createPurchaseDocument, updatePurchase, formatCurrency, settings, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Reception Modal State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});

  // Filter only purchase orders
  const purchaseOrders = purchases.filter(p => p.type === 'order');

  const processedOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedOrder) {
      deletePurchase(selectedOrder.id);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handlePrint = () => {
    if (selectedOrder) {
      printInvoice(selectedOrder, settings);
    }
  };

  const handleGenerateInvoice = () => {
    if (!selectedOrder) return;

    createPurchaseDocument('invoice', {
      supplierId: selectedOrder.supplierId,
      supplierName: selectedOrder.supplierName,
      date: new Date().toISOString().split('T')[0],
      amount: selectedOrder.amount,
      currency: selectedOrder.currency,
      exchangeRate: selectedOrder.exchangeRate,
      warehouseId: selectedOrder.warehouseId,
      paymentTerms: selectedOrder.paymentTerms,
      paymentMethod: selectedOrder.paymentMethod,
      notes: `Invoice generated from PO ${selectedOrder.number}. \n${selectedOrder.notes || ''}`,
      taxRate: selectedOrder.taxRate,
      subtotal: selectedOrder.subtotal,
      linkedDocumentId: selectedOrder.id
    }, selectedOrder.items);

    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const handleOpenReceiveModal = () => {
    if (!selectedOrder) return;
    
    const initialQtys: Record<string, number> = {};
    selectedOrder.items.forEach(item => {
      const remaining = item.quantity - (item.fulfilledQuantity || 0);
      initialQtys[item.id] = remaining > 0 ? remaining : 0;
    });
    
    setReceiveQuantities(initialQtys);
    setIsViewModalOpen(false);
    setIsReceiveModalOpen(true);
  };

  const handleQtyChange = (itemId: string, val: string) => {
    const qty = parseFloat(val) || 0;
    const item = selectedOrder?.items.find(i => i.id === itemId);
    if (!item) return;
    
    const remaining = item.quantity - (item.fulfilledQuantity || 0);
    const validQty = Math.max(0, Math.min(qty, remaining));
    
    setReceiveQuantities(prev => ({ ...prev, [itemId]: validQty }));
  };

  const submitReception = () => {
    if (!selectedOrder) return;

    // Filter items with qty > 0
    const itemsToReceive: InvoiceItem[] = selectedOrder.items
      .filter(item => (receiveQuantities[item.id] || 0) > 0)
      .map(item => ({
        ...item,
        quantity: receiveQuantities[item.id] || 0
      }));

    if (itemsToReceive.length === 0) {
      alert("Please select at least one item to receive.");
      return;
    }

    // 1. Create GRN (Purchase Delivery)
    createPurchaseDocument('delivery', {
      supplierId: selectedOrder.supplierId,
      supplierName: selectedOrder.supplierName,
      warehouseId: selectedOrder.warehouseId,
      linkedDocumentId: selectedOrder.id,
      notes: `Received from PO ${selectedOrder.number}`
    }, itemsToReceive);

    // 2. Update Source Order
    const updatedItems = selectedOrder.items.map(item => {
      const receivedNow = receiveQuantities[item.id] || 0;
      return {
        ...item,
        fulfilledQuantity: (item.fulfilledQuantity || 0) + receivedNow
      };
    });

    const isFullyReceived = updatedItems.every(item => (item.fulfilledQuantity || 0) >= item.quantity);

    updatePurchase({
      ...selectedOrder,
      items: updatedItems,
      status: isFullyReceived ? 'received' : 'pending' // 'received' implies fully completed for POs in this context
    });

    setIsReceiveModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'received': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('purchase_orders')} 🧾</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('purchase_orders_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_po')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_pos')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="received">{t('received')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('supplier_management')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">{order.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{order.supplierName}</td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(order.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }}
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
          {processedOrders.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_documents')}</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('po_details')}</h3>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">{selectedOrder.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('supplier_management')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {t(selectedOrder.status)}
                </span>
              </div>

              {/* Payment & Conditions - Read Only */}
              {(selectedOrder.paymentTerms || selectedOrder.paymentMethod || selectedOrder.notes) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                    <CreditCard className="w-4 h-4" /> Payment & Conditions
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedOrder.paymentTerms && (
                      <div>
                        <span className="text-gray-500 block">Terms:</span>
                        <span className="text-gray-900 dark:text-white">{selectedOrder.paymentTerms}</span>
                      </div>
                    )}
                    {selectedOrder.paymentMethod && (
                      <div>
                        <span className="text-gray-500 block">Method:</span>
                        <span className="text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                  {selectedOrder.notes && (
                    <div className="text-xs border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <span className="text-gray-500 block">Notes:</span>
                      <span className="text-gray-700 dark:text-gray-300 italic">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const fulfilled = item.fulfilledQuantity || 0;
                      const isFullyReceived = fulfilled >= item.quantity;
                      
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm py-1">
                          <div className="flex flex-col">
                            <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                            <span className="text-xs text-gray-400">
                              Received: <span className={isFullyReceived ? 'text-green-500 font-bold' : 'text-orange-500'}>{fulfilled}</span> / {item.quantity}
                            </span>
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

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t('total')}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedOrder.amount)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePrint}
                className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Order
              </button>
              
              <button
                onClick={handleGenerateInvoice}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                {t('generate_invoice')}
              </button>

              {selectedOrder.status !== 'received' && (
                <button
                  onClick={handleOpenReceiveModal}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  {t('receive_goods')}
                </button>
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

      {/* Reception Modal */}
      {isReceiveModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('receive_goods')}</h3>
                <p className="text-xs text-gray-500">PO: {selectedOrder.number}</p>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Ordered</th>
                    <th className="px-3 py-2 text-center">Received</th>
                    <th className="px-3 py-2 text-right">Receive Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedOrder.items.map((item) => {
                    const fulfilled = item.fulfilledQuantity || 0;
                    const remaining = item.quantity - fulfilled;
                    const isFullyReceived = remaining <= 0;

                    return (
                      <tr key={item.id} className={isFullyReceived ? 'opacity-50' : ''}>
                        <td className="px-3 py-3 text-gray-900 dark:text-white">
                          <div className="font-medium">{item.description}</div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">{item.quantity}</td>
                        <td className="px-3 py-3 text-center text-green-600">{fulfilled}</td>
                        <td className="px-3 py-3 text-right">
                          <input 
                            type="number" 
                            min="0"
                            max={remaining}
                            disabled={isFullyReceived}
                            value={receiveQuantities[item.id] || 0}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={submitReception}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_confirm_msg')} <span className="font-bold">{selectedOrder.number}</span>?
             </p>
             <div className="flex gap-3 justify-center">
               <button 
                 onClick={() => setIsDeleteModalOpen(false)}
                 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
               >
                 {t('cancel')}
               </button>
               <button 
                 onClick={handleDelete}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                 {t('yes_delete')}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
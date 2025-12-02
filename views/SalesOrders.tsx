
import React, { useState, useMemo } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, CheckCircle, ArrowRight, RotateCcw, Pencil, Save, PackagePlus, XCircle, Truck, PackageCheck } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';
import SearchableSelect from '../components/SearchableSelect';

interface SalesOrdersProps {
  onAddNew: () => void;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, createSalesDocument, updateInvoice, products, serviceCatalog, clients, t, formatCurrency, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoc, setEditedDoc] = useState<Invoice | null>(null);
  const [selectedAddItemId, setSelectedAddItemId] = useState('');
  
  // Custom Item State
  const [customItem, setCustomItem] = useState({ description: '', price: 0, quantity: 1 });
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryQuantities, setDeliveryQuantities] = useState<Record<string, number>>({});

  // Filter only sales orders
  const salesOrders = invoices.filter(inv => inv.type === 'order');

  const filteredDocs = salesOrders.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Combine Products and Services for selection
  const catalogOptions = useMemo(() => {
    const prodOpts = products.map(p => ({ value: p.id, label: `${p.name} (${formatCurrency(p.price)})` }));
    const servOpts = serviceCatalog.map(s => ({ value: s.id, label: `🔧 ${s.name} (${formatCurrency(s.basePrice)})` }));
    return [...prodOpts, ...servOpts];
  }, [products, serviceCatalog, formatCurrency]);

  const handleOpenModal = (doc: Invoice) => {
    setSelectedDoc(doc);
    setIsEditing(false);
    setEditedDoc(JSON.parse(JSON.stringify(doc))); // Deep copy
    // Reset add states
    setSelectedAddItemId('');
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
  
  const handleCancelOrder = () => {
    if (confirm(t('confirm_cancel') || "Are you sure you want to cancel this order?")) {
        updateStatus('cancelled');
    }
  };

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

  // --- Delivery Logic ---

  const handleOpenDeliveryModal = () => {
    if (!selectedDoc) return;
    const initialQtys: Record<string, number> = {};
    selectedDoc.items.forEach(item => {
        const remaining = item.quantity - (item.fulfilledQuantity || 0);
        initialQtys[item.id] = remaining > 0 ? remaining : 0;
    });
    setDeliveryQuantities(initialQtys);
    setIsViewModalOpen(false);
    setIsDeliveryModalOpen(true);
  };

  const handleAutoDelivery = () => {
    if (!selectedDoc) return;
    
    if (!confirm(t('confirm_deliver_all') || "Create delivery note for all remaining items?")) return;

    const itemsToDeliver = selectedDoc.items
        .map(item => ({
            ...item,
            quantity: item.quantity - (item.fulfilledQuantity || 0)
        }))
        .filter(item => item.quantity > 0);

    if (itemsToDeliver.length === 0) {
        alert(t('no_items_to_deliver') || "No items left to deliver.");
        return;
    }

    // 1. Create Delivery Note
    createSalesDocument('delivery', {
        clientId: selectedDoc.clientId,
        clientName: selectedDoc.clientName,
        date: new Date().toISOString().split('T')[0],
        warehouseId: selectedDoc.warehouseId,
        linkedDocumentId: selectedDoc.id,
        notes: `Full Delivery for Order ${selectedDoc.number}`,
        status: 'completed'
    }, itemsToDeliver);

    // 2. Update Order Fulfilled Qty & Status
    const updatedItems = selectedDoc.items.map(item => ({
        ...item,
        fulfilledQuantity: item.quantity
    }));

    updateInvoice({
        ...selectedDoc,
        items: updatedItems,
        status: 'completed'
    });

    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const handleDeliveryQtyChange = (id: string, value: string) => {
    const qty = parseFloat(value) || 0;
    const item = selectedDoc?.items.find(i => i.id === id);
    if (!item) return;
    const remaining = item.quantity - (item.fulfilledQuantity || 0);
    // Clamp between 0 and remaining
    const validQty = Math.max(0, Math.min(qty, remaining));
    setDeliveryQuantities(prev => ({ ...prev, [id]: validQty }));
  };

  const handleSubmitDelivery = () => {
    if (!selectedDoc) return;
    
    // Filter items to deliver
    const itemsToDeliver = selectedDoc.items
        .filter(item => (deliveryQuantities[item.id] || 0) > 0)
        .map(item => ({
            ...item,
            quantity: deliveryQuantities[item.id]
        }));

    if (itemsToDeliver.length === 0) {
        alert(t('select_item_deliver'));
        return;
    }

    // 1. Create Delivery Note
    createSalesDocument('delivery', {
        clientId: selectedDoc.clientId,
        clientName: selectedDoc.clientName,
        date: new Date().toISOString().split('T')[0],
        warehouseId: selectedDoc.warehouseId,
        linkedDocumentId: selectedDoc.id,
        notes: `Delivery for Order ${selectedDoc.number}`,
        status: 'completed'
    }, itemsToDeliver);

    // 2. Update Order Fulfilled Qty & Status
    const updatedItems = selectedDoc.items.map(item => {
        const deliveredNow = deliveryQuantities[item.id] || 0;
        return {
            ...item,
            fulfilledQuantity: (item.fulfilledQuantity || 0) + deliveredNow
        };
    });

    const isFullyDelivered = updatedItems.every(i => (i.fulfilledQuantity || 0) >= i.quantity);
    const newStatus = isFullyDelivered ? 'completed' : 'partial';

    updateInvoice({
        ...selectedDoc,
        items: updatedItems,
        status: newStatus as any
    });

    setIsDeliveryModalOpen(false);
    alert(t('success'));
  };

  // --- Edit Logic ---

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

  const handleAddCatalogItem = () => {
    if (!editedDoc || !selectedAddItemId) return;
    
    // Try finding in products
    let itemToAdd: any = products.find(p => p.id === selectedAddItemId);
    let price = itemToAdd ? itemToAdd.price : 0;
    
    // If not product, try service
    if (!itemToAdd) {
        itemToAdd = serviceCatalog.find(s => s.id === selectedAddItemId);
        if (itemToAdd) price = itemToAdd.basePrice;
    }

    if (!itemToAdd) return;

    const newItem: InvoiceItem = {
        id: itemToAdd.id,
        description: itemToAdd.name,
        quantity: 1,
        price: price
    };

    const newItems = [...editedDoc.items, newItem];
    recalculateTotals({ ...editedDoc, items: newItems });
    setSelectedAddItemId('');
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
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'; // Validated
      case 'partial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; // Partial Delivery
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; // Cancelled
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isFullyDelivered = selectedDoc?.items.every(i => (i.fulfilledQuantity || 0) >= i.quantity) || false;

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
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedDoc.status)}`}>
                    {t(selectedDoc.status)}
                </span>
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
                    <div className="mb-4 space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        {/* 1. Add Existing Product/Service */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SearchableSelect 
                                    options={catalogOptions}
                                    value={selectedAddItemId}
                                    onChange={setSelectedAddItemId}
                                    placeholder="Search Product or Service..."
                                    className="w-full rounded text-sm"
                                />
                            </div>
                            <button 
                                onClick={handleAddCatalogItem}
                                disabled={!selectedAddItemId}
                                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium"
                            >
                                <Plus className="w-4 h-4 inline mr-1" /> Add
                            </button>
                        </div>

                        {/* 2. Custom Item Button/Form */}
                        {!isAddingCustom ? (
                            <button 
                                onClick={() => setIsAddingCustom(true)}
                                className="w-full py-1.5 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 rounded text-xs flex items-center justify-center gap-1 transition-colors"
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
                        selectedDoc.items.map((item, idx) => {
                          const remaining = item.quantity - (item.fulfilledQuantity || 0);
                          const isFullyDelivered = remaining <= 0;
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.description}</span>
                                <span className={`text-xs ${isFullyDelivered ? 'text-green-500' : 'text-orange-500'}`}>
                                    {isFullyDelivered ? 'Fully Delivered' : `Remaining: ${remaining}`}
                                </span>
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
                        {/* EDIT Button - Only if Draft */}
                        {selectedDoc.status === 'draft' && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
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
                            <CheckCircle className="w-4 h-4" /> Validate
                        </button>
                    )}

                    {/* VALIDATED/PENDING ACTIONS */}
                    {(selectedDoc.status === 'pending' || selectedDoc.status === 'partial' || selectedDoc.status === 'completed') && (
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex gap-2">
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
                            <div className="flex gap-2">
                                {!isFullyDelivered && (
                                    <>
                                        <button 
                                            onClick={handleOpenDeliveryModal}
                                            className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium flex items-center justify-center gap-1.5"
                                        >
                                            <Truck className="w-4 h-4" /> {t('create_delivery')}
                                        </button>
                                        <button 
                                            onClick={handleAutoDelivery}
                                            className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-1.5"
                                            title={t('deliver_all')}
                                        >
                                            <PackageCheck className="w-4 h-4" /> {t('deliver_all') || 'Deliver All'}
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={handleCancelOrder}
                                    className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {selectedDoc.status === 'cancelled' && (
                        <div className="w-full px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default opacity-80">
                            <XCircle className="w-4 h-4" /> {t('order_cancelled') || 'Order Cancelled'}
                        </div>
                    )}

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

      {/* Delivery Modal */}
      {isDeliveryModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('create_delivery_title')}</h3>
                <p className="text-xs text-gray-500">{t('for_order')}: {selectedDoc.number}</p>
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
                    <th className="px-3 py-2 text-right">{t('deliver_now')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedDoc.items.map((item) => {
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
                        <td className="px-3 py-3 text-right">
                          <input 
                            type="number" 
                            min="0"
                            max={remaining}
                            disabled={isFullyDelivered}
                            value={deliveryQuantities[item.id] || 0}
                            onChange={(e) => handleDeliveryQtyChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-slate-500 outline-none dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
                onClick={handleSubmitDelivery}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
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

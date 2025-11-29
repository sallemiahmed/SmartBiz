
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Send, CheckCircle, Calculator, AlertCircle, Calendar } from 'lucide-react';
import { Purchase, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface RequestForQuotationProps {
  onAddNew: () => void;
}

const RequestForQuotation: React.FC<RequestForQuotationProps> = ({ onAddNew }) => {
  const { purchases, deletePurchase, createPurchaseDocument, updatePurchase, formatCurrency, settings, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRFQ, setSelectedRFQ] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Price Entry / Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quotedPrices, setQuotedPrices] = useState<Record<string, number>>({});

  // Filter only RFQs
  const rfqs = purchases.filter(p => p.type === 'rfq');

  const filteredRFQs = rfqs.filter(doc => {
    const matchesSearch = 
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedRFQ) {
      deletePurchase(selectedRFQ.id);
      setIsDeleteModalOpen(false);
      setSelectedRFQ(null);
    }
  };

  const handlePrint = () => {
    if (selectedRFQ) {
      printInvoice(selectedRFQ, settings);
    }
  };

  const handleOpenQuoteModal = () => {
    if (!selectedRFQ) return;
    
    // Initialize prices with existing or 0
    const initialPrices: Record<string, number> = {};
    selectedRFQ.items.forEach(item => {
      initialPrices[item.id] = item.price || 0;
    });
    
    setQuotedPrices(initialPrices);
    setIsViewModalOpen(false);
    setIsQuoteModalOpen(true);
  };

  const handlePriceChange = (itemId: string, val: string) => {
    const price = parseFloat(val) || 0;
    setQuotedPrices(prev => ({ ...prev, [itemId]: price }));
  };

  const submitQuote = () => {
    if (!selectedRFQ) return;

    // Update items with new prices
    const updatedItems = selectedRFQ.items.map(item => ({
      ...item,
      price: quotedPrices[item.id] || 0
    }));

    // Calculate new total
    const newAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    updatePurchase({
      ...selectedRFQ,
      items: updatedItems,
      amount: newAmount,
      subtotal: newAmount, // Simplified
      status: 'responded'
    });

    setIsQuoteModalOpen(false);
    setSelectedRFQ(null);
  };

  const convertToPO = () => {
    if (!selectedRFQ) return;

    // Create Purchase Order linked to this RFQ
    createPurchaseDocument('order', {
      supplierId: selectedRFQ.supplierId,
      supplierName: selectedRFQ.supplierName,
      date: new Date().toISOString().split('T')[0],
      amount: selectedRFQ.amount,
      currency: selectedRFQ.currency,
      exchangeRate: selectedRFQ.exchangeRate,
      warehouseId: selectedRFQ.warehouseId,
      notes: `Generated from RFQ ${selectedRFQ.number}`,
      linkedDocumentId: selectedRFQ.id
    }, selectedRFQ.items);

    // Update RFQ status
    updatePurchase({
      ...selectedRFQ,
      status: 'accepted'
    });

    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'responded': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('request_for_quotation')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('rfq_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_rfq')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_rfqs')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="sent">{t('sent')}</option>
              <option value="responded">{t('responded')}</option>
              <option value="accepted">{t('accepted')}</option>
              <option value="rejected">{t('rejected')}</option>
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
                <th className="px-6 py-4">{t('deadline')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRFQs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{rfq.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{rfq.supplierName}</td>
                  <td className="px-6 py-4 text-gray-500">{rfq.date}</td>
                  <td className="px-6 py-4 text-gray-500">{rfq.deadline || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                      {t(rfq.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedRFQ(rfq); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedRFQ(rfq); setIsDeleteModalOpen(true); }}
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
          {filteredRFQs.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_documents')}</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('rfq_details')}</h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">{selectedRFQ.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('supplier_management')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedRFQ.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedRFQ.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('deadline')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedRFQ.deadline || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedRFQ.status)}`}>
                  {t(selectedRFQ.status)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requested Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRFQ.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {item.price > 0 ? formatCurrency(item.price) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRFQ.amount > 0 && (
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4 font-bold text-lg">
                  <span className="text-gray-900 dark:text-white">{t('total')}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedRFQ.amount)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePrint}
                className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {t('print')}
              </button>
              
              {selectedRFQ.status !== 'accepted' && selectedRFQ.status !== 'rejected' && (
                <>
                  <button
                    onClick={handleOpenQuoteModal}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    {t('enter_prices')}
                  </button>
                  {selectedRFQ.status === 'responded' && (
                    <button
                      onClick={convertToPO}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('convert_to_po')}
                    </button>
                  )}
                </>
              )}
              
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Entry Modal */}
      {isQuoteModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('price_input')}</h3>
                <p className="text-xs text-gray-500">RFQ: {selectedRFQ.number}</p>
              </div>
              <button onClick={() => setIsQuoteModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedRFQ.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 text-gray-900 dark:text-white">
                        <div className="font-medium">{item.description}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500">{item.quantity}</td>
                      <td className="px-3 py-3 text-right">
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={quotedPrices[item.id] || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          className="w-24 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={submitQuote}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertCircle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_rfq_msg')} <span className="font-bold">{selectedRFQ.number}</span>?
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

export default RequestForQuotation;

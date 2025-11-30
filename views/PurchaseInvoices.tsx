
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Filter, CreditCard, Printer, CheckCircle, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { Purchase } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface PurchaseInvoicesProps {
  onAddNew: () => void;
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ onAddNew }) => {
  const { purchases, deletePurchase, formatCurrency, settings, t, recordDocPayment, bankAccounts, cashSessions } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('bank');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Filter only purchase invoices
  const purchaseInvoices = purchases.filter(p => p.type === 'invoice');

  const filteredDocs = purchaseInvoices.filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset payment amount when modal opens
  useEffect(() => {
    if (selectedDoc && isPaymentModalOpen) {
      const remaining = selectedDoc.amount - (selectedDoc.amountPaid || 0);
      setPaymentAmount(remaining);
    }
  }, [selectedDoc, isPaymentModalOpen]);

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'partial': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDoc) return;
      if (paymentMethod === 'bank' && !selectedAccountId) {
          alert("Please select a bank account.");
          return;
      }
      
      const remaining = selectedDoc.amount - (selectedDoc.amountPaid || 0);
      if (paymentAmount <= 0 || paymentAmount > remaining + 0.01) {
          alert("Invalid payment amount.");
          return;
      }
      
      if (paymentMethod === 'cash') {
          const activeSession = cashSessions.find(s => s.status === 'open');
          if (!activeSession) {
              alert(t('register_closed') + ". Please open register first.");
              return;
          }
      }

      recordDocPayment('purchase', selectedDoc.id, paymentAmount, selectedAccountId, paymentMethod);
      setIsPaymentModalOpen(false);
      setIsViewModalOpen(false);
      // Optional: Force refresh or update local state if needed, context usually handles it
      alert(t('success'));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('purchase_invoices')} 🧾</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('purchase_invoices_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('register_invoice')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_purchase_invoices')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="partial">{t('partial')}</option>
              <option value="completed">{t('completed')}</option>
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
              {filteredDocs.map((doc) => {
                const paid = doc.amountPaid || 0;
                const percentPaid = Math.min(100, (paid / doc.amount) * 100);

                return (
                <tr 
                  key={doc.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.supplierName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(doc.amount)}</div>
                    {paid > 0 && paid < doc.amount && (
                        <div className="text-xs text-gray-500 mt-1">
                            {t('paid')}: {formatCurrency(paid)}
                            <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${percentPaid}%` }}></div>
                            </div>
                        </div>
                    )}
                  </td>
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
                      
                      {doc.status !== 'completed' && (
                          <button 
                            onClick={() => { setSelectedDoc(doc); setIsPaymentModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                            title={t('pay_supplier')}
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                      )}

                      <button 
                        onClick={() => { deletePurchase(doc.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
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

      {/* View Modal */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('invoice_details')}</h3>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" /></button>
            </div>
            
            <div className="space-y-4">
              {/* Existing Fields */}
              <div className="flex justify-between">
                <span className="text-gray-500">{t('supplier_management')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedDoc.status)}`}>
                  {t(selectedDoc.status)}
                </span>
              </div>

              {/* Items List */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('received_items')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedDoc.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.description}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">{t('total')}</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(selectedDoc.amount)}</span>
                  </div>
                  {(selectedDoc.amountPaid || 0) > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                          <span>{t('amount_paid')}</span>
                          <span>{formatCurrency(selectedDoc.amountPaid || 0)}</span>
                      </div>
                  )}
                  {selectedDoc.amount - (selectedDoc.amountPaid || 0) > 0.01 && (
                      <div className="flex justify-between text-sm text-red-500 mt-1">
                          <span>{t('remaining')}</span>
                          <span>{formatCurrency(selectedDoc.amount - (selectedDoc.amountPaid || 0))}</span>
                      </div>
                  )}
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePrint}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> {t('print')}
              </button>
              {selectedDoc.status !== 'completed' && (
                  <button 
                    onClick={() => { setIsViewModalOpen(false); setIsPaymentModalOpen(true); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> {t('pay_supplier')}
                  </button>
              )}
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('record_payment')}</h3>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('payment_method')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('bank')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'bank' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                            >
                                <Landmark className="w-5 h-5" />
                                <span className="text-sm">{t('bank_transfer')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                            >
                                <Wallet className="w-5 h-5" />
                                <span className="text-sm">{t('cash')}</span>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'bank' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Account</label>
                            <select 
                                required
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                            >
                                <option value="">Select Account...</option>
                                {bankAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2 text-gray-500">
                                <span>{t('total')}:</span>
                                <span>{formatCurrency(selectedDoc.amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-4 text-orange-600 font-medium">
                                <span>{t('remaining')}:</span>
                                <span>{formatCurrency(selectedDoc.amount - (selectedDoc.amountPaid || 0))}</span>
                            </div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                            <input 
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={selectedDoc.amount - (selectedDoc.amountPaid || 0) + 0.01}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white text-lg font-bold"
                            />
                        </div>
                        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Confirm Payment
                        </button>
                        <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700">
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;

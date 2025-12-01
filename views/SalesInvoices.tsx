
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, CreditCard } from 'lucide-react';
import { Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface SalesInvoicesProps {
  onAddNew: () => void;
}

const SalesInvoices: React.FC<SalesInvoicesProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, t, formatCurrency, settings, recordDocPayment, bankAccounts, cashSessions, clients } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('cash');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Filter only sales invoices
  const salesInvoices = invoices.filter(i => i.type === 'invoice');

  const filteredDocs = salesInvoices.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handlePrint = () => {
    if (selectedDoc) {
      const client = clients.find(c => c.id === selectedDoc.clientId);
      printInvoice(selectedDoc, settings, client);
    }
  };

  const openPaymentModal = () => {
    if (!selectedDoc) return;
    setPaymentAmount(selectedDoc.amount - (selectedDoc.amountPaid || 0));
    setPaymentMethod('cash');
    setSelectedAccountId(bankAccounts[0]?.id || '');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (paymentMethod === 'bank' && !selectedAccountId) {
        alert("Please select a bank account");
        return;
    }
    
    recordDocPayment('invoice', selectedDoc.id, paymentAmount, selectedAccountId, paymentMethod);
    setIsPaymentModalOpen(false);
    setIsViewModalOpen(false);
    alert(t('success'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('invoice')} 💰</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('sales_invoices_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_invoice')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_invoices')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{doc.number}</td>
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
                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
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

      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('invoice_details')}</h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
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
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedDoc.status)}`}>
                  {t(selectedDoc.status)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDoc.items.length > 0 ? (
                    selectedDoc.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.description}</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No items recorded</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">{t('total')}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedDoc.amount)}</span>
                  </div>
                  {/* Show Fiscal Stamp if it exists */}
                  {selectedDoc.fiscalStamp && selectedDoc.fiscalStamp > 0 && (
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>Fiscal Stamp</span>
                          <span>{formatCurrency(selectedDoc.fiscalStamp)}</span>
                      </div>
                  )}
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

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> {t('print')}
              </button>
              
              {selectedDoc.status !== 'paid' && (
                <button
                  onClick={openPaymentModal}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('register_payment')}
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

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('register_payment')}</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('amount')}</label>
                <input 
                  type="number" 
                  step="0.01" 
                  max={selectedDoc.amount - (selectedDoc.amountPaid || 0)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('payment_method')}</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="bank">{t('bank_transfer')}</option>
                </select>
              </div>
              {paymentMethod === 'bank' && (
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('bank_account')}</label>
                  <select 
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                    required
                  >
                    <option value="">Select Account</option>
                    {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{t('confirm')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;

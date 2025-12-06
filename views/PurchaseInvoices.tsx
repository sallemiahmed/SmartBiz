
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Printer, DollarSign, Edit, Filter, CheckCircle } from 'lucide-react';
import { Purchase } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface PurchaseInvoicesProps {
  onAddNew: () => void;
  onEdit: (invoice: Purchase) => void;
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ onAddNew, onEdit }) => {
  const { purchases, deletePurchase, updatePurchase, t, formatCurrency, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const purchaseInvoices = purchases.filter(p => p.type === 'invoice');

  const filteredDocs = purchaseInvoices.filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  const handleOpenPaymentModal = () => {
    if (selectedDoc) {
      const remaining = selectedDoc.amount - (selectedDoc.amountPaid || 0);
      setPaymentAmount(remaining.toFixed(2));
      setIsPaymentModalOpen(true);
    }
  };

  const handleRecordPayment = () => {
    if (!selectedDoc || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t('invalid_amount'));
      return;
    }

    const currentPaid = selectedDoc.amountPaid || 0;
    const remaining = selectedDoc.amount - currentPaid;

    if (amount > remaining) {
      alert(t('payment_exceeds_remaining'));
      return;
    }

    const newPaid = currentPaid + amount;
    const newStatus = newPaid >= selectedDoc.amount ? 'completed' : 'partial';

    const updatedDoc = {
      ...selectedDoc,
      amountPaid: newPaid,
      status: newStatus as any
    };

    updatePurchase(updatedDoc);
    setSelectedDoc(updatedDoc);
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
  };

  const handleValidateInvoice = (doc: Purchase) => {
    if (doc.status !== 'draft') return;

    const updatedDoc = {
      ...doc,
      status: 'validated' as any
    };

    updatePurchase(updatedDoc);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'validated': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'partial': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'Brouillon';
      case 'validated': return 'Validée';
      case 'partial': return 'Payée partiellement';
      case 'completed': return 'Payée totalement';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('supplier_invoice')} 🧾</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('supplier_invoice_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
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
              <option value="draft">Brouillon</option>
              <option value="validated">Validée</option>
              <option value="partial">Payée partiellement</option>
              <option value="completed">Payée totalement</option>
            </select>
          </div>
        </div>

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
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.supplierName}</td>
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
                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {doc.status === 'draft' && (
                        <>
                          <button
                            onClick={() => onEdit(doc)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                            title={t('edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleValidateInvoice(doc)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"
                            title="Valider"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deletePurchase(doc.id)}
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
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('supplier_management')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
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
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(selectedDoc.amount)}</span>
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

            <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {selectedDoc.amount - (selectedDoc.amountPaid || 0) > 0.01 &&
                 (selectedDoc.status === 'validated' || selectedDoc.status === 'partial') && (
                  <button
                    onClick={handleOpenPaymentModal}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" /> {t('record_payment')}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> {t('print')}
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('record_payment')}</h3>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('total_amount')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedDoc.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('amount_paid')}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedDoc.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="font-medium text-gray-900 dark:text-white">{t('remaining')}</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedDoc.amount - (selectedDoc.amountPaid || 0))}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('payment_amount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('max_payment')}: {formatCurrency(selectedDoc.amount - (selectedDoc.amountPaid || 0))}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> {t('confirm_payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;

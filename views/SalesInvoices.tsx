
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, Filter, CheckCircle, Printer, RotateCcw, AlertCircle, CreditCard } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface SalesInvoicesProps {
  onAddNew: () => void;
}

const SalesInvoices: React.FC<SalesInvoicesProps> = ({ onAddNew }) => {
  const { invoices, deleteInvoice, updateInvoice, createSalesDocument, formatCurrency, settings, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  
  // Return Workflow State
  const [returnItems, setReturnItems] = useState<{id: string, quantity: number, max: number}[]>([]);

  const salesInvoices = invoices.filter(inv => inv.type === 'invoice' || inv.type === 'credit');

  const filteredDocs = salesInvoices.filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = () => {
    if (selectedDoc) {
      updateInvoice({ ...selectedDoc, status: 'paid' });
      setIsViewModalOpen(false);
    }
  };

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  const openReturnModal = () => {
    if (!selectedDoc) return;
    // Initialize return quantities to 0
    setReturnItems(selectedDoc.items.map(i => ({ id: i.id, quantity: 0, max: i.quantity })));
    setIsViewModalOpen(false);
    setIsReturnModalOpen(true);
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    const itemsToReturn = selectedDoc.items.map(item => {
      const returnInfo = returnItems.find(r => r.id === item.id);
      if (returnInfo && returnInfo.quantity > 0) {
        return { ...item, quantity: returnInfo.quantity };
      }
      return null;
    }).filter(Boolean) as InvoiceItem[];

    if (itemsToReturn.length === 0) {
      alert("Please select at least one item to return.");
      return;
    }

    const returnTotal = itemsToReturn.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. Create Return Note (Updates Stock)
    createSalesDocument('return', {
      clientId: selectedDoc.clientId,
      clientName: selectedDoc.clientName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      amount: returnTotal,
      status: 'completed', // Confirmed return
      linkedDocumentId: selectedDoc.id
    }, itemsToReturn);

    // 2. Create Credit Note (Financial Impact)
    createSalesDocument('credit', {
      clientId: selectedDoc.clientId,
      clientName: selectedDoc.clientName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      amount: returnTotal,
      status: 'paid', // Immediately valid credit
      linkedDocumentId: selectedDoc.id
    }, itemsToReturn);

    // 3. Update Original Invoice Status (Optional - strictly speaking it stays Paid, but maybe mark as returned?)
    // keeping it simple, maybe add a note or just leave as is.
    // If fully returned, maybe mark as Returned? Let's just create the linked docs for now.
    
    setIsReturnModalOpen(false);
    setSelectedDoc(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sales_invoices')} 💸</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('sales_invoices_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_invoice_btn')}
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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="overdue">{t('overdue')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('client')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('due_date')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">
                    {doc.number}
                    {doc.type === 'credit' && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">CR</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.dueDate}</td>
                  <td className={`px-6 py-4 font-bold ${doc.type === 'credit' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {doc.type === 'credit' ? '-' : ''}{formatCurrency(doc.amount)}
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

      {/* View Modal */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDoc.type === 'credit' ? 'Credit Note' : t('invoice_details')}
                </h3>
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
                <span className="text-gray-500">{t('issued_date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-gray-500">{t('due_date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.dueDate}</span>
              </div>

              {/* Payment & Conditions - Read Only */}
              {(selectedDoc.paymentTerms || selectedDoc.paymentMethod || selectedDoc.notes) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                    <CreditCard className="w-4 h-4" /> Payment & Conditions
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedDoc.paymentTerms && (
                      <div>
                        <span className="text-gray-500 block">Terms:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDoc.paymentTerms}</span>
                      </div>
                    )}
                    {selectedDoc.paymentMethod && (
                      <div>
                        <span className="text-gray-500 block">Method:</span>
                        <span className="text-gray-900 dark:text-white">{selectedDoc.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                  {selectedDoc.notes && (
                    <div className="text-xs border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <span className="text-gray-500 block">Notes:</span>
                      <span className="text-gray-700 dark:text-gray-300 italic">{selectedDoc.notes}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Line Items</h4>
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

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t('total')}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedDoc.amount)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
              {/* Return Button */}
              {selectedDoc.type === 'invoice' && selectedDoc.status === 'paid' && (
                <button 
                  onClick={openReturnModal}
                  className="col-span-2 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RotateCcw className="w-4 h-4" /> Create Return & Credit Note
                </button>
              )}

              {selectedDoc.status !== 'paid' && selectedDoc.type === 'invoice' && (
                <button 
                  onClick={handleMarkPaid}
                  className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> {t('mark_paid')}
                </button>
              )}
              <button 
                onClick={handlePrint}
                className={`py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium ${selectedDoc.status === 'paid' && selectedDoc.type !== 'invoice' ? 'col-span-2' : ''}`}
              >
                <Printer className="w-4 h-4" /> {t('print_invoice')}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
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

      {/* Return Modal */}
      {isReturnModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Process Return</h3>
                <p className="text-sm text-gray-500">For Invoice: {selectedDoc.number}</p>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300 mb-6 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>This action will generate a <strong>Return Note</strong> (restocking items) and a <strong>Credit Note</strong> (refunding amount).</p>
            </div>

            <form onSubmit={handleProcessReturn}>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {selectedDoc.items.map((item, idx) => {
                  const returnItem = returnItems.find(r => r.id === item.id) || { quantity: 0 };
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-xs text-gray-500">Sold: {item.quantity} | Price: {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Return Qty:</span>
                        <input 
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={returnItem.quantity}
                          onChange={(e) => {
                            const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), item.quantity);
                            setReturnItems(prev => prev.map(p => p.id === item.id ? { ...p, quantity: val } : p));
                          }}
                          className="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">Refund Total: </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(returnItems.reduce((sum, r) => {
                      const item = selectedDoc.items.find(i => i.id === r.id);
                      return sum + (item ? item.price * r.quantity : 0);
                    }, 0))}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Confirm Return
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;

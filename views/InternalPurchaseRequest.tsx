
import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, FileText, CheckCircle, XCircle, ArrowRightCircle } from 'lucide-react';
import { Purchase } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface InternalPurchaseRequestProps {
  onAddNew: () => void;
}

const InternalPurchaseRequest: React.FC<InternalPurchaseRequestProps> = ({ onAddNew }) => {
  const { purchases, deletePurchase, createPurchaseDocument, updatePurchase, settings, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPR, setSelectedPR] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter only PRs
  const prs = purchases.filter(p => p.type === 'pr');

  const filteredPRs = prs.filter(doc => {
    const matchesSearch = 
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.requesterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedPR) {
      deletePurchase(selectedPR.id);
      setIsDeleteModalOpen(false);
      setSelectedPR(null);
    }
  };

  const handlePrint = () => {
    if (selectedPR) {
      printInvoice(selectedPR, settings);
    }
  };

  const updateStatus = (status: 'approved' | 'rejected') => {
    if (!selectedPR) return;
    updatePurchase({
      ...selectedPR,
      status
    });
    setIsViewModalOpen(false);
  };

  const convertToRFQ = () => {
    if (!selectedPR) return;
    createPurchaseDocument('rfq', {
        date: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
        amount: 0,
        linkedDocumentId: selectedPR.id,
        notes: `Generated from Internal Request ${selectedPR.number} (${selectedPR.requesterName} - ${selectedPR.department})`
    }, selectedPR.items);
    
    // Update PR status if needed, or keep as approved
    alert(t('success'));
    setIsViewModalOpen(false);
  };

  const convertToPO = () => {
    if (!selectedPR) return;
    createPurchaseDocument('order', {
        date: new Date().toISOString().split('T')[0],
        amount: 0, // Needs pricing
        linkedDocumentId: selectedPR.id,
        notes: `Direct Order from Request ${selectedPR.number} (${selectedPR.requesterName})`
    }, selectedPR.items);
    
    alert(t('success'));
    setIsViewModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('internal_purchase_request')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('ipr_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_request')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_requests')}
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
              <option value="pending">{t('pending')}</option>
              <option value="approved">{t('approved')}</option>
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
                <th className="px-6 py-4">{t('requester')}</th>
                <th className="px-6 py-4">{t('department')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPRs.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{pr.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{pr.requesterName}</td>
                  <td className="px-6 py-4 text-gray-500">{pr.department}</td>
                  <td className="px-6 py-4 text-gray-500">{pr.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                      {t(pr.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedPR(pr); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedPR(pr); setIsDeleteModalOpen(true); }}
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
          {filteredPRs.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_documents')}</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('request_details')}</h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">{selectedPR.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('requester')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedPR.requesterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('department')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedPR.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedPR.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedPR.status)}`}>
                  {t(selectedPR.status)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('requested_items')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedPR.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                      <span className="text-gray-900 dark:text-white font-medium">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button 
                    onClick={handlePrint}
                    className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    {t('print')}
                </button>
                <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    {t('close')}
                </button>
              </div>

              {selectedPR.status === 'pending' && (
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={() => updateStatus('approved')}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        {t('approve')}
                    </button>
                    <button
                        onClick={() => updateStatus('rejected')}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <XCircle className="w-4 h-4" />
                        {t('reject')}
                    </button>
                </div>
              )}

              {selectedPR.status === 'approved' && (
                 <div className="flex gap-3 mt-2">
                    <button
                        onClick={convertToRFQ}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowRightCircle className="w-4 h-4" />
                        {t('convert_to_rfq')}
                    </button>
                    <button
                        onClick={convertToPO}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowRightCircle className="w-4 h-4" />
                        {t('convert_to_po')}
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <Trash2 className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_confirm_msg')}
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

export default InternalPurchaseRequest;


import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X, Truck, Link, Printer } from 'lucide-react';
import { Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { printInvoice } from '../utils/printGenerator';

interface SalesDeliveriesProps {
  onAddNew: () => void;
  autoOpenDocId?: string | null;
  onDocOpened?: () => void;
}

const SalesDeliveries: React.FC<SalesDeliveriesProps> = ({ onAddNew, autoOpenDocId, onDocOpened }) => {
  const { invoices, deleteInvoice, t, settings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const deliveries = invoices.filter(inv => inv.type === 'delivery');

  const filteredDocs = deliveries.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLinkedOrderRef = (doc: Invoice) => {
    if (!doc.linkedDocumentId) return null;
    const linkedOrder = invoices.find(i => i.id === doc.linkedDocumentId);
    return linkedOrder ? linkedOrder.number : doc.linkedDocumentId;
  };

  const handlePrint = () => {
    if (selectedDoc) {
      printInvoice(selectedDoc, settings);
    }
  };

  // Auto-open document modal after creation
  useEffect(() => {
    if (autoOpenDocId && !isViewModalOpen) {
      const docToOpen = deliveries.find(doc => doc.id === autoOpenDocId);
      if (docToOpen) {
        setSelectedDoc(docToOpen);
        setIsViewModalOpen(true);
        if (onDocOpened) {
          onDocOpened();
        }
      }
    }
  }, [autoOpenDocId, deliveries, isViewModalOpen]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('delivery_notes')} 🚚</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('delivery_notes_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('new_delivery')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_deliveries')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('client')}</th>
                <th className="px-6 py-4">Projet</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.clientName}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{doc.projectName || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.items.length} items</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                       Shipped
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/30 rounded-lg"
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
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('delivery_details')}</h3>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('client')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('shipped_date')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
              </div>
              
              {selectedDoc.linkedDocumentId && (
                <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1">
                    <Link className="w-3 h-3" /> Linked Order
                  </span>
                  <span className="font-medium text-indigo-700 dark:text-indigo-300 font-mono text-sm">
                    {getLinkedOrderRef(selectedDoc)}
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('shipped_items')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDoc.items.length > 0 ? (
                    selectedDoc.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                        <span className="font-mono text-gray-900 dark:text-white">x{item.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No items recorded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" /> {t('print')}
              </button>
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
    </div>
  );
};

export default SalesDeliveries;

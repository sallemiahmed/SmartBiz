import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, X, Truck, Link } from 'lucide-react';
import { Purchase } from '../types';
import { useApp } from '../context/AppContext';

interface PurchaseDeliveriesProps {
  onAddNew: () => void;
}

const PurchaseDeliveries: React.FC<PurchaseDeliveriesProps> = ({ onAddNew }) => {
  const { purchases, deletePurchase, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Purchase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const deliveries = purchases.filter(p => p.type === 'delivery');

  const filteredDocs = deliveries.filter(doc => {
    return doc.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLinkedOrderRef = (doc: Purchase) => {
    if (!doc.linkedDocumentId) return null;
    const linkedOrder = purchases.find(p => p.id === doc.linkedDocumentId);
    return linkedOrder ? linkedOrder.number : doc.linkedDocumentId;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('goods_received_grn')} 📦</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('goods_received_desc')}</p>
        </div>
        <button 
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('receive_goods')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_grns')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('supplier_management')}</th>
                <th className="px-6 py-4">{t('date_received')}</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">{doc.number}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{doc.supplierName}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-gray-500">{doc.items.length} items</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                       {t('received')}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"
                        title={t('view_details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('grn_details')}</h3>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">{selectedDoc.number}</span>
              </div>
              <button onClick={() => setIsViewModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('supplier_management')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('date_received')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoc.date}</span>
              </div>

              {selectedDoc.linkedDocumentId && (
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                    <Link className="w-3 h-3" /> Linked PO
                  </span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300 font-mono text-sm">
                    {getLinkedOrderRef(selectedDoc)}
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('received_items')}</h4>
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

            <div className="mt-6 flex justify-end">
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

export default PurchaseDeliveries;

import React, { useState } from 'react';
import { Building, MapPin, Pencil, Trash2, Plus, AlertCircle, X } from 'lucide-react';
import { Warehouse } from '../types';
import { useApp } from '../context/AppContext';

const InventoryWarehouses: React.FC = () => {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse, t } = useApp();

  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleWarehouseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const location = data.get('location') as string;

    if (selectedWarehouse) {
      updateWarehouse({ ...selectedWarehouse, name, location });
    } else {
      addWarehouse({ id: `w${Date.now()}`, name, location });
    }
    setIsWhModalOpen(false);
    setSelectedWarehouse(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedWarehouse) {
      deleteWarehouse(selectedWarehouse.id);
      setIsDeleteModalOpen(false);
      setSelectedWarehouse(null);
    }
  };

  const openDeleteModal = (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('warehouse_management')} 🏭</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('warehouse_locations')}</p>
        </div>
        <button 
          onClick={() => { setSelectedWarehouse(null); setIsWhModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('add_warehouse')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map(wh => (
          <div key={wh.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm group relative hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                  <Building className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{wh.name}</h4>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" /> {wh.location}
                  </div>
                </div>
              </div>
              {wh.isDefault && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-bold uppercase tracking-wide">{t('default_warehouse')}</span>}
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={() => { setSelectedWarehouse(wh); setIsWhModalOpen(true); }}
                className="p-2 bg-white dark:bg-gray-700 hover:text-indigo-600 text-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm transition-colors"
                title={t('edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
              {!wh.isDefault && (
                <button 
                  onClick={() => openDeleteModal(wh)}
                  className="p-2 bg-white dark:bg-gray-700 hover:text-red-600 text-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm transition-colors"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Add/Edit Modal */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedWarehouse ? t('edit_warehouse') : t('add_warehouse')}
                </h3>
                <button onClick={() => setIsWhModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('warehouse_name')}</label>
                <input name="name" defaultValue={selectedWarehouse?.name} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('location')}</label>
                <input name="location" defaultValue={selectedWarehouse?.location} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2">
                <button type="button" onClick={() => { setIsWhModalOpen(false); setSelectedWarehouse(null); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
               <AlertCircle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('delete_confirm_title')}</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
               {t('delete_confirm_msg')} <span className="font-bold text-gray-900 dark:text-white">{selectedWarehouse.name}</span>
             </p>
             <div className="flex gap-3 justify-center">
               <button 
                 onClick={() => setIsDeleteModalOpen(false)}
                 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
               >
                 {t('cancel')}
               </button>
               <button 
                 onClick={handleDeleteConfirm}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
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

export default InventoryWarehouses;

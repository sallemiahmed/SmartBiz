
import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Search, Filter, X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface TransferData {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reference: string;
  notes: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: TransferData;
  setTransferData: (data: TransferData) => void;
  onSubmit: (e: React.FormEvent) => void;
  products: Product[];
  warehouses: { id: string; name: string }[];
  t: (key: string) => string;
}

const TransferModal = React.memo<TransferModalProps>(({
  isOpen,
  onClose,
  transferData,
  setTransferData,
  onSubmit,
  products,
  warehouses,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> {t('stock_transfer')}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('ref_num')} (Optional)</label>
            <input
              type="text"
              id="transfer-reference"
              name="reference"
              value={transferData.reference}
              onChange={(e) => setTransferData({...transferData, reference: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
              placeholder="TR-..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product')}</label>
            <select
              id="transfer-product"
              name="productId"
              value={transferData.productId}
              onChange={(e) => setTransferData({...transferData, productId: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label>
              <select
                id="transfer-from-warehouse"
                name="fromWarehouseId"
                value={transferData.fromWarehouseId}
                onChange={(e) => setTransferData({...transferData, fromWarehouseId: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label>
              <select
                id="transfer-to-warehouse"
                name="toWarehouseId"
                value={transferData.toWarehouseId}
                onChange={(e) => setTransferData({...transferData, toWarehouseId: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity')}</label>
            <input
              type="number"
              id="transfer-quantity"
              name="quantity"
              min="1"
              value={transferData.quantity}
              onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
            <input
              type="text"
              id="transfer-notes"
              name="notes"
              value={transferData.notes}
              onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder={t('transfer_reason')}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">{t('confirm_transfer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

TransferModal.displayName = 'TransferModal';

const InventoryTransfers: React.FC = () => {
  const { stockTransfers, products, warehouses, transferStock, t } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  // Transfer Form State
  const [transferData, setTransferData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: 1,
    reference: '',
    notes: ''
  });

  const filteredTransfers = stockTransfers.filter(tr => 
    tr.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tr.reference && tr.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.productId || !transferData.fromWarehouseId || !transferData.toWarehouseId) return;
    if (transferData.fromWarehouseId === transferData.toWarehouseId) {
      alert("Source and Destination warehouses must be different.");
      return;
    }

    transferStock(transferData);
    setIsTransferModalOpen(false);
    // Reset form
    setTransferData({ productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: 1, reference: '', notes: '' });
  };

  const openTransferModal = () => {
    setTransferData({
      productId: products[0]?.id || '',
      fromWarehouseId: warehouses[0]?.id || '',
      toWarehouseId: warehouses[1]?.id || '',
      quantity: 1,
      reference: '',
      notes: ''
    });
    setIsTransferModalOpen(true);
  };

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || id;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('stock_transfers')} 🚛</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">History of stock movements between warehouses.</p>
        </div>
        <button 
          onClick={openTransferModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('stock_transfer')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
              <tr>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('product')}</th>
                <th className="px-6 py-4">{t('from')}</th>
                <th className="px-6 py-4"></th>
                <th className="px-6 py-4">{t('to')}</th>
                <th className="px-6 py-4">{t('quantity')}</th>
                <th className="px-6 py-4">{t('notes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransfers.map((tr) => (
                <tr key={tr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{new Date(tr.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">{tr.reference || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tr.productName}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getWarehouseName(tr.fromWarehouseId)}</td>
                  <td className="px-2 py-4 text-center">
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getWarehouseName(tr.toWarehouseId)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{tr.quantity}</td>
                  <td className="px-6 py-4 text-gray-500 italic truncate max-w-xs">{tr.notes}</td>
                </tr>
              ))}
              {filteredTransfers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No transfer history found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Stock Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        transferData={transferData}
        setTransferData={setTransferData}
        onSubmit={handleTransferSubmit}
        products={products}
        warehouses={warehouses}
        t={t}
      />
    </div>
  );
};

export default InventoryTransfers;

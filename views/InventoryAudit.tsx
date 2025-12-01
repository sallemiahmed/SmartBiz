
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Plus, Search, Filter, ChevronRight, 
  Save, CheckCircle, AlertTriangle, X, FileText, Printer, Calendar, Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventorySession, InventoryItem } from '../types';

const InventoryAudit: React.FC = () => {
  const { 
    inventorySessions, createInventorySession, updateInventorySession, commitInventorySession,
    warehouses, products, t 
  } = useApp();

  // Main View State
  const [viewMode, setViewMode] = useState<'list' | 'session'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Session State
  const [activeSession, setActiveSession] = useState<InventorySession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);

  // Create Modal State
  const [newSessionData, setNewSessionData] = useState({
    warehouseId: warehouses[0]?.id || '',
    categoryFilter: 'All',
    notes: ''
  });

  // Categories for filter
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  // --- Filtering Logic (List View) ---
  const filteredSessions = inventorySessions.filter(session => {
    const matchesSearch = session.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Handlers ---

  const handleCreateSession = () => {
    if (!newSessionData.warehouseId) return alert("Please select a warehouse");
    
    createInventorySession(newSessionData);
    setIsCreateModalOpen(false);
    // Switch to the newly created session (it's added to start of list)
    // We need a small delay or way to get the ID, but for now user can select it from list
    alert(t('success'));
  };

  const handleOpenSession = (session: InventorySession) => {
    setActiveSession(session);
    setViewMode('session');
  };

  const handleUpdateQty = (productId: string, qtyStr: string) => {
    if (!activeSession) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty)) return;

    const updatedItems = activeSession.items.map(item => {
      if (item.productId === productId) {
        return { ...item, physicalQty: qty, variance: qty - item.systemQty };
      }
      return item;
    });

    const updatedSession = { ...activeSession, items: updatedItems };
    setActiveSession(updatedSession);
  };

  const handleSaveProgress = () => {
    if (activeSession) {
      updateInventorySession(activeSession);
      alert("Progress saved.");
    }
  };

  const handleCommit = () => {
    if (activeSession) {
      commitInventorySession(activeSession);
      setIsCommitModalOpen(false);
      setViewMode('list');
      setActiveSession(null);
      alert("Inventory Audit Committed. Stock adjustments created.");
    }
  };

  // --- Renderers ---

  const renderStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">{t('completed')}</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">{t('in_progress')}</span>;
  };

  if (viewMode === 'session' && activeSession) {
    const totalVariance = activeSession.items.reduce((acc, item) => acc + item.variance, 0);
    const varianceValue = activeSession.items.reduce((acc, item) => acc + (item.variance * item.cost), 0);

    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Session Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                  {activeSession.reference}
                </h1>
                {renderStatusBadge(activeSession.status)}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {activeSession.warehouseName}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activeSession.date}</span>
                {activeSession.categoryFilter !== 'All' && <span className="bg-gray-100 dark:bg-gray-700 px-2 rounded text-xs">Category: {activeSession.categoryFilter}</span>}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
             {activeSession.status === 'in_progress' && (
               <>
                 <button onClick={handleSaveProgress} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors">
                    {t('save')}
                 </button>
                 <button onClick={() => setIsCommitModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Validate & Commit
                 </button>
               </>
             )}
             {activeSession.status === 'completed' && (
               <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Report
               </button>
             )}
          </div>
        </div>

        {/* Counting Table */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
             <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4 text-right">System Qty</th>
                      <th className="px-6 py-4 text-center w-40">Physical Count</th>
                      <th className="px-6 py-4 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activeSession.items.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.productName}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.sku}</td>
                        <td className="px-6 py-4 text-right font-mono">{item.systemQty}</td>
                        <td className="px-6 py-4 text-center">
                          {activeSession.status === 'in_progress' ? (
                            <input 
                              type="number"
                              value={item.physicalQty}
                              onChange={(e) => handleUpdateQty(item.productId, e.target.value)}
                              className={`w-24 px-2 py-1 text-center border rounded-lg focus:ring-2 focus:outline-none 
                                ${item.variance !== 0 ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white'}
                                focus:ring-indigo-500
                              `}
                            />
                          ) : (
                            <span className="font-bold dark:text-white">{item.physicalQty}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`font-bold ${item.variance === 0 ? 'text-gray-400' : item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                             {item.variance > 0 ? '+' : ''}{item.variance}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             
             {/* Footer Stats */}
             <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total Items: <span className="font-medium text-gray-900 dark:text-white">{activeSession.items.length}</span>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                     <span className="text-xs text-gray-500 uppercase block">Net Qty Variance</span>
                     <span className={`font-bold ${totalVariance === 0 ? 'text-gray-600' : totalVariance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {totalVariance > 0 ? '+' : ''}{totalVariance}
                     </span>
                  </div>
                  <div className="text-right">
                     <span className="text-xs text-gray-500 uppercase block">Value Impact</span>
                     <span className={`font-bold ${varianceValue === 0 ? 'text-gray-600' : varianceValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {/* Need formatter here but context is inside function */}
                        {varianceValue > 0 ? '+' : ''}{varianceValue.toFixed(2)}
                     </span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Commit Confirmation Modal */}
        {isCommitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" /> Confirm Inventory
                </h3>
                <button onClick={() => setIsCommitModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                This will finalize the inventory session <strong>{activeSession.reference}</strong> and generate stock adjustments for all variances.
                <br/><br/>
                <strong>This action cannot be undone.</strong>
              </p>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-sm">
                 <div className="flex justify-between mb-1">
                   <span>Items with variance:</span>
                   <span className="font-bold">{activeSession.items.filter(i => i.variance !== 0).length}</span>
                 </div>
                 <div className="flex justify-between text-red-600 dark:text-red-400">
                   <span>Total Value Impact:</span>
                   <span className="font-bold">{varianceValue.toFixed(2)}</span>
                 </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsCommitModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
                <button onClick={handleCommit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Confirm & Adjust Stock</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('stock_audit')} 📋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage inventory counts and stock corrections.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('new')} Audit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col flex-1">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search') + "..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="in_progress">{t('in_progress')}</option>
              <option value="completed">{t('completed')}</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
              <tr>
                <th className="px-6 py-4">{t('ref_num')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('warehouse')}</th>
                <th className="px-6 py-4">{t('category')}</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {session.reference}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{session.date}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{session.warehouseName}</td>
                  <td className="px-6 py-4 text-gray-500">{session.categoryFilter === 'All' ? 'Full Inventory' : session.categoryFilter}</td>
                  <td className="px-6 py-4 text-center font-medium">{session.items.length}</td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(session.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenSession(session)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {session.status === 'completed' ? 'View Report' : 'Resume Audit'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 italic">No inventory sessions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start New Inventory</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('warehouse')}</label>
                 <select 
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                   value={newSessionData.warehouseId}
                   onChange={e => setNewSessionData({...newSessionData, warehouseId: e.target.value})}
                 >
                   {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')} (Filter)</label>
                 <select 
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                   value={newSessionData.categoryFilter}
                   onChange={e => setNewSessionData({...newSessionData, categoryFilter: e.target.value})}
                 >
                   {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories (Full Inventory)' : c}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                 <textarea 
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white resize-none"
                   rows={2}
                   value={newSessionData.notes}
                   onChange={e => setNewSessionData({...newSessionData, notes: e.target.value})}
                   placeholder="Optional reference..."
                 />
               </div>

               <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">{t('cancel')}</button>
                  <button onClick={handleCreateSession} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Start Counting</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAudit;

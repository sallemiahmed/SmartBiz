
import React, { useState, useMemo } from 'react';
import { 
  Wallet, Lock, Unlock, ArrowUpCircle, ArrowDownCircle, History, 
  AlertTriangle, DollarSign, Calculator, Clock, Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CashTransaction } from '../types';

const CashRegister: React.FC = () => {
  const { cashSessions, cashTransactions, openCashSession, closeCashSession, addCashTransaction, formatCurrency, t } = useApp();
  
  // State
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  
  // Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');

  const activeSession = cashSessions.find(s => s.status === 'open');
  const sessionTransactions = activeSession 
    ? cashTransactions.filter(tx => tx.sessionId === activeSession.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const filteredHistory = useMemo(() => {
    return cashSessions.filter(s => s.status === 'closed').filter(s => {
      const sDate = new Date(s.startTime);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && sDate < start) return false;
      if (end) {
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          if (sDate > endDate) return false;
      }
      return true;
    });
  }, [cashSessions, dateRange]);

  const handleSessionAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) return;

    if (activeSession) {
      closeCashSession(amount, noteInput);
    } else {
      openCashSession(amount);
    }
    
    setIsSessionModalOpen(false);
    setAmountInput('');
    setNoteInput('');
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    const amount = parseFloat(amountInput);
    if (isNaN(amount)) return;

    const newTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      sessionId: activeSession.id,
      date: new Date().toISOString(),
      type: txType,
      amount: txType === 'withdrawal' ? -amount : amount,
      description: noteInput || (txType === 'deposit' ? 'Cash In' : 'Cash Out')
    };

    addCashTransaction(newTx);
    setIsTransactionModalOpen(false);
    setAmountInput('');
    setNoteInput('');
  };

  const openTxModal = (type: 'deposit' | 'withdrawal') => {
    setTxType(type);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cash_register_management')} 💵</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('cash_desc')}</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {t('current_session')}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {t('session_history')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Main Control Panel */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Status Background Indicator */}
            <div className={`absolute top-0 left-0 w-full h-2 ${activeSession ? 'bg-green-500' : 'bg-red-500'}`} />
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${activeSession ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
              {activeSession ? <Unlock className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {activeSession ? formatCurrency(activeSession.expectedBalance) : t('register_closed')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {activeSession ? `${t('current_session')} • ${t('opened_at')} ${new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Open a new session to start trading.'}
            </p>

            {activeSession ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                <button onClick={() => openTxModal('deposit')} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 transition-all flex flex-col items-center gap-2 group">
                  <ArrowDownCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('add_cash')}</span>
                </button>
                <button onClick={() => setIsSessionModalOpen(true)} className="p-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all flex flex-col items-center gap-2 shadow-lg shadow-red-200 dark:shadow-none">
                  <Lock className="w-6 h-6" />
                  <span className="font-medium">{t('close_register')}</span>
                </button>
                <button onClick={() => openTxModal('withdrawal')} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 transition-all flex flex-col items-center gap-2 group">
                  <ArrowUpCircle className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('remove_cash')}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSessionModalOpen(true)}
                className="px-8 py-3 bg-green-600 text-white rounded-xl text-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" /> {t('open_register')}
              </button>
            )}
          </div>

          {/* Side Log */}
          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
              <span>{t('movement_log')}</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sessionTransactions.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm italic">No movements in this session.</div>
              ) : (
                sessionTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {tx.amount > 0 ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</div>
                        <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                    <span className={`font-mono font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
            {activeSession && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{t('opening_amount')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(activeSession.openingBalance)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // History Tab
        <div className="h-full flex flex-col gap-4">
          <div className="flex justify-end">
             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{t('date')}:</span>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-sm outline-none dark:text-white dark:color-scheme-dark"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-sm outline-none dark:text-white dark:color-scheme-dark"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4">{t('opened_at')}</th>
                    <th className="px-6 py-4">{t('closed_at')}</th>
                    <th className="px-6 py-4 text-right">{t('opening_amount')}</th>
                    <th className="px-6 py-4 text-right">{t('closing_amount')}</th>
                    <th className="px-6 py-4 text-right">{t('difference')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredHistory.map(session => {
                    const diff = (session.closingBalance || 0) - session.expectedBalance;
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium uppercase">Closed</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(session.startTime).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{session.endTime ? new Date(session.endTime).toLocaleString() : '-'}</td>
                        <td className="px-6 py-4 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(session.openingBalance)}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(session.closingBalance || 0)}</td>
                        <td className={`px-6 py-4 text-right font-mono font-medium ${diff === 0 ? 'text-gray-400' : diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No closed sessions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal (Open/Close) */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{activeSession ? t('close_register') : t('open_register')}</h2>
            <form onSubmit={handleSessionAction} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>
                  {activeSession 
                    ? "Please count the cash drawer physically. The system expects: " 
                    : "Enter the initial cash float amount available in the drawer."}
                  {activeSession && <span className="font-bold block mt-1 text-lg">{formatCurrency(activeSession.expectedBalance)}</span>}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {activeSession ? t('closing_amount') : t('opening_amount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    autoFocus
                    type="number" 
                    step="0.01" 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-lg dark:text-white"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              {activeSession && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reason')} / Notes</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white text-sm"
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="E.g. Discrepancy reason..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsSessionModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal (Deposit/Withdrawal) */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white capitalize">{txType} Cash</h2>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                <input 
                  autoFocus
                  type="number" 
                  step="0.01" 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reason')}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Petty cash for supplies"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegister;

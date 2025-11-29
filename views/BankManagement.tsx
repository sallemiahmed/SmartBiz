import React, { useState } from 'react';
import { 
  Landmark, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, 
  Search, Filter, CheckCircle, AlertCircle, RefreshCw, Trash2, Pencil, Wallet, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BankAccount, BankTransaction } from '../types';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { allCurrencies } from '../utils/currencyList';

const BankManagement: React.FC<{ view?: string }> = ({ view = 'banking' }) => {
  const { bankAccounts, bankTransactions, formatCurrency, addBankTransaction, addBankAccount, updateBankAccount, deleteBankAccount, deleteBankTransaction, t } = useApp();
  
  // Tab Handling based on route or internal state if needed (though mostly props driven)
  const activeTab = view === 'banking' ? 'overview' : view.replace('banking-', '');

  // State
  const [selectedAccount, setSelectedAccount] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Transaction Modal State
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [reconcileMode, setReconcileMode] = useState(false);

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  
  // Filtered Data
  const filteredTransactions = bankTransactions.filter(tx => {
    const matchesAccount = selectedAccount === 'all' || tx.accountId === selectedAccount;
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAccount && matchesSearch;
  });

  const totalLiquidity = bankAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Mock Sparkline Data
  const sparkData = [
    { v: 10 }, { v: 25 }, { v: 15 }, { v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }
  ];

  // --- Handlers ---

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      accountId: formData.get('accountId') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string) * (formData.get('type') === 'withdrawal' ? -1 : 1),
      type: formData.get('type') as any,
      status: 'pending'
    };

    addBankTransaction(newTx);
    setIsAddTxModalOpen(false);
  };

  const handleAccountSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const currency = formData.get('currency') as string;
    const type = formData.get('type') as any;
    const initialBalance = parseFloat(formData.get('balance') as string) || 0;

    if (editingAccount) {
      updateBankAccount({
        ...editingAccount,
        name,
        bankName,
        accountNumber,
        currency,
        type
      });
    } else {
      addBankAccount({
        id: `ba-${Date.now()}`,
        name,
        bankName,
        accountNumber,
        currency,
        type,
        balance: initialBalance
      });
    }
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm(t('delete_account_confirm_msg'))) {
      deleteBankAccount(id);
    }
  };

  const openEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  const openAddAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  // --- Renderers ---

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bankAccounts.map(account => (
          <div 
            key={account.id}
            onClick={() => setSelectedAccount(account.id === selectedAccount ? 'all' : account.id)}
            className={`
              p-6 rounded-xl border cursor-pointer transition-all relative overflow-hidden group
              ${selectedAccount === account.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
            `}
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${selectedAccount === account.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Landmark className={`w-6 h-6 ${selectedAccount === account.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${selectedAccount === account.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {account.currency}
              </span>
            </div>
            
            <div className="relative z-10">
              <p className={`text-sm ${selectedAccount === account.id ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>{account.bankName}</p>
              <h3 className={`text-xl font-bold mb-1 ${selectedAccount === account.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{account.name}</h3>
              <p className={`font-mono text-sm opacity-80 mb-4 ${selectedAccount === account.id ? 'text-indigo-200' : 'text-gray-400'}`}>{account.accountNumber}</p>
              
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-bold ${selectedAccount === account.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {formatCurrency(account.balance)}
                </span>
                <div className="w-16 h-8">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={sparkData}>
                       <Bar dataKey="v" fill={selectedAccount === account.id ? '#ffffff' : '#6366f1'} fillOpacity={0.5} radius={[2,2,0,0]} />
                     </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h3>
          <button onClick={() => setIsAddTxModalOpen(true)} className="text-sm text-indigo-600 hover:underline">
            + Quick Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('description')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4 text-center">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.slice(0, 5).map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{tx.description}</div>
                    <div className="text-xs text-gray-500 capitalize">{t(tx.type)}</div>
                  </td>
                  <td className={`px-6 py-4 font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'cleared' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t(tx.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">{t('no_transactions')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAccountsList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
          <tr>
            <th className="px-6 py-4">{t('account_name')}</th>
            <th className="px-6 py-4">{t('bank_name')}</th>
            <th className="px-6 py-4">{t('account_number')}</th>
            <th className="px-6 py-4">{t('account_type')}</th>
            <th className="px-6 py-4">{t('currency')}</th>
            <th className="px-6 py-4 text-right">{t('balance')}</th>
            <th className="px-6 py-4 text-right">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {bankAccounts.map(account => (
            <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{account.name}</td>
              <td className="px-6 py-4 text-gray-500">{account.bankName}</td>
              <td className="px-6 py-4 font-mono text-gray-500">{account.accountNumber}</td>
              <td className="px-6 py-4 capitalize text-gray-500">{t(account.type)}</td>
              <td className="px-6 py-4 text-gray-500">{account.currency}</td>
              <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                {formatCurrency(account.balance)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditAccount(account)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {bankAccounts.length === 0 && (
            <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t('no_accounts')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTransactionsList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search') + "..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="all">All Accounts</option>
              {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button 
              onClick={() => setReconcileMode(!reconcileMode)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors
                ${reconcileMode 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${reconcileMode ? 'animate-spin' : ''}`} />
              {t('reconcile')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                {reconcileMode && <th className="w-10 px-6 py-4"></th>}
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('description')}</th>
                <th className="px-6 py-4">{t('account_name')}</th>
                <th className="px-6 py-4 text-right">{t('amount')}</th>
                <th className="px-6 py-4 text-center">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  {reconcileMode && (
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                  )}
                  <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{tx.description}</div>
                    <div className="text-xs text-gray-500 capitalize">{t(tx.type)}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {bankAccounts.find(a => a.id === tx.accountId)?.name}
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${tx.status === 'cleared' || tx.status === 'reconciled' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}
                    `}>
                      {tx.status === 'cleared' || tx.status === 'reconciled' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {t(tx.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteBankTransaction(tx.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={reconcileMode ? 7 : 6} className="p-8 text-center text-gray-500">{t('no_transactions')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bank_management')} 🏦</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('bank_desc')}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'overview' && (
            <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold flex flex-col items-end">
               <span className="text-xs font-normal">{t('total_liquidity')}</span>
               {formatCurrency(totalLiquidity)}
            </div>
          )}
          {activeTab === 'accounts' && (
            <button 
              onClick={openAddAccount}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors h-full my-auto"
            >
              <Plus className="w-4 h-4" /> {t('add_account')}
            </button>
          )}
          {(activeTab === 'overview' || activeTab === 'transactions') && (
            <button 
              onClick={() => setIsAddTxModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors h-full my-auto"
            >
              <Plus className="w-4 h-4" /> {t('add_transaction')}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'accounts' && renderAccountsList()}
      {activeTab === 'transactions' && renderTransactionsList()}

      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAccount ? t('edit_account') : t('new_account')}
              </h2>
              <button onClick={() => setIsAccountModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_name')}</label>
                <input name="name" defaultValue={editingAccount?.name} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required placeholder="e.g. Main Checking" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bank_name')}</label>
                  <input name="bankName" defaultValue={editingAccount?.bankName} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required placeholder="e.g. Chase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_number')}</label>
                  <input name="accountNumber" defaultValue={editingAccount?.accountNumber} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required placeholder="**** 1234" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_type')}</label>
                  <select name="type" defaultValue={editingAccount?.type || 'checking'} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white">
                    <option value="checking">{t('checking')}</option>
                    <option value="savings">{t('savings')}</option>
                    <option value="credit">{t('credit')}</option>
                    <option value="investment">{t('investment')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('currency')}</label>
                  <select name="currency" defaultValue={editingAccount?.currency || 'USD'} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white">
                    {allCurrencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!editingAccount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('initial_balance')}</label>
                  <input type="number" step="0.01" name="balance" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" placeholder="0.00" />
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
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

      {/* Add Transaction Modal */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('add_transaction')}</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_name')}</label>
                <select name="accountId" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required>
                  {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                  <input type="date" name="date" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select name="type" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white">
                    <option value="payment">{t('payment')}</option>
                    <option value="deposit">{t('deposit')}</option>
                    <option value="transfer">{t('transfer')}</option>
                    <option value="fee">{t('fee')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
                <input type="text" name="description" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                <input type="number" step="0.01" name="amount" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" required />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsAddTxModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
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

export default BankManagement;
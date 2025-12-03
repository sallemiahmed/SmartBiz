
import React, { useState } from 'react';
import { Receipt, Plus, CheckCircle, XCircle, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseReport } from '../../types';

const HRExpenses: React.FC = () => {
  const { expenses, employees, addExpenseReport, updateExpenseReport, formatCurrency, t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter(e => 
    e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ExpenseModal = () => {
      const [form, setForm] = useState<Partial<ExpenseReport>>({ status: 'pending', type: 'Transport' });
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const emp = employees.find(e => e.id === form.employeeId);
          addExpenseReport({ ...form, id: `exp-${Date.now()}`, employeeName: emp?.firstName + ' ' + emp?.lastName } as ExpenseReport);
          setIsModalOpen(false);
      };
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><Receipt className="w-5 h-5 text-purple-500" /> Submit Expense</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Employee</label>
                          <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, employeeId: e.target.value})}>
                              <option value="">Select Employee</option>
                              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                             <input type="date" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, date: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
                             <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                                 <option>Transport</option><option>Food</option><option>Accommodation</option><option>Other</option>
                             </select>
                          </div>
                      </div>
                      <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Amount</label>
                           <input type="number" step="0.01" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
                           <textarea rows={2} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" onChange={e => setForm({...form, description: e.target.value})} />
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6 pt-2">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg">{t('cancel')}</button>
                          <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Reports 🧾</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reimburse employee expenses.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> New Expense
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 bg-gray-50 dark:bg-gray-900/50">
               <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                       type="text" 
                       placeholder="Search expenses..." 
                       className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                   />
               </div>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredExpenses.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">{e.employeeName}</td>
                            <td className="p-4 text-gray-500">{e.date}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">{e.type}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300 truncate max-w-xs">{e.description}</td>
                            <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(e.amount)}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                                    ${e.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                      e.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                    {e.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {e.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => updateExpenseReport({...e, status: 'approved'})} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Approve">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => updateExpenseReport({...e, status: 'rejected'})} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-500 italic">No expense reports found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        {isModalOpen && <ExpenseModal />}
    </div>
  );
};

export default HRExpenses;

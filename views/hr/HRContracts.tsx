
import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, X, Save, UserCheck, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';

const HRContracts: React.FC = () => {
  const { contracts, employees, addContract, updateContract, deleteContract, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(c => 
    c.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ContractModal = () => {
      const [form, setForm] = useState<Partial<Contract>>(editingItem || { status: 'active', type: 'CDI' });
      
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const employee = employees.find(emp => emp.id === form.employeeId);
          const contractData = {
             ...form,
             employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
          } as Contract;

          if(editingItem) updateContract(contractData);
          else addContract({ ...contractData, id: `cnt-${Date.now()}` });
          
          setIsModalOpen(false);
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          {editingItem ? 'Edit Contract' : 'New Contract'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Employee</label>
                          <select 
                            required 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.employeeId || ''}
                            onChange={e => setForm({...form, employeeId: e.target.value})}
                            disabled={!!editingItem} 
                          >
                              <option value="">Select Employee...</option>
                              {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.position})</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Contract Type</label>
                          <select 
                             required
                             className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                             value={form.type}
                             onChange={e => setForm({...form, type: e.target.value as any})}
                          >
                              <option value="CDI">CDI (Permanent)</option>
                              <option value="CDD">CDD (Fixed-Term)</option>
                              <option value="Stage">Internship (Stage)</option>
                              <option value="Internship">Apprenticeship</option>
                          </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Date</label>
                             <input type="date" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.startDate || ''} onChange={e => setForm({...form, startDate: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Date</label>
                             <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.endDate || ''} onChange={e => setForm({...form, endDate: e.target.value})} />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                          <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="terminated">Terminated</option>
                          </select>
                      </div>

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('cancel')}</button>
                          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" /> {t('save')}</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employment Contracts 📝</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage employee contracts and terms.</p>
            </div>
            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> New Contract
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search contracts..." 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContracts.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">{c.employeeName}</div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-bold">{c.type}</span>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="w-3 h-3" /> {c.startDate} <span className="text-gray-400">→</span> {c.endDate || 'Indefinite'}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                                    ${c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                      c.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditingItem(c); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if(confirm('Delete contract?')) deleteContract(c.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredContracts.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">No contracts found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {isModalOpen && <ContractModal />}
    </div>
  );
};

export default HRContracts;

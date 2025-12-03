
import React, { useState } from 'react';
import { Clock, Plus, CheckCircle, XCircle, Search, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';

const HRLeave: React.FC = () => {
  const { leaves, employees, addLeaveRequest, updateLeaveRequest, t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const filteredLeaves = leaves.filter(l => {
      if(filter === 'all') return true;
      return l.status === filter;
  });

  const LeaveModal = () => {
      const [form, setForm] = useState<Partial<LeaveRequest>>({ status: 'pending', type: 'Paid Leave' });
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const emp = employees.find(e => e.id === form.employeeId);
          addLeaveRequest({ ...form, id: `l-${Date.now()}`, employeeName: emp?.firstName + ' ' + emp?.lastName } as LeaveRequest);
          setIsModalOpen(false);
      };
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> Request Leave</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Employee</label>
                          <select required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, employeeId: e.target.value})}>
                              <option value="">Select Employee</option>
                              {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Type</label>
                          <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                              <option>Paid Leave</option><option>Sick Leave</option><option>Unpaid</option><option>Remote</option>
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Date</label>
                              <input type="date" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, startDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Date</label>
                              <input type="date" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, endDate: e.target.value})} />
                          </div>
                      </div>
                      <div>
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Total Days</label>
                           <input type="number" placeholder="1" required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, days: parseInt(e.target.value)})} />
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6 pt-2">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg">{t('cancel')}</button>
                          <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Submit</button>
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management 🏖️</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track employee time off and requests.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Request Leave
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>All</button>
                    <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'pending' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>Pending</button>
                    <button onClick={() => setFilter('approved')} className={`px-3 py-1 rounded-lg text-sm ${filter === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}>Approved</button>
                </div>
             </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4 text-center">Days</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLeaves.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">{l.employeeName}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">{l.type}</td>
                            <td className="p-4 text-gray-500 text-xs">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {l.startDate} → {l.endDate}</div>
                            </td>
                            <td className="p-4 text-center font-bold">{l.days}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                                    ${l.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                      l.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                    {l.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {l.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => updateLeaveRequest({...l, status: 'approved'})} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Approve">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => updateLeaveRequest({...l, status: 'rejected'})} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredLeaves.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No leave requests found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        {isModalOpen && <LeaveModal />}
    </div>
  );
};

export default HRLeave;

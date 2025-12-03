
import React, { useState } from 'react';
import { Search, Plus, Trash2, Users, Mail, Phone, X, Save, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

const HREmployees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);

  const initialForm: Partial<Employee> = {
    status: 'active',
    salary: 0,
    position: '',
    department: ''
  };

  const filteredEmployees = employees.filter(e => 
    e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EmployeeModal = () => {
      const [form, setForm] = useState<Partial<Employee>>(editingItem || initialForm);
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if(editingItem) updateEmployee({ ...editingItem, ...form } as Employee);
          else addEmployee({ ...form, id: `e-${Date.now()}` } as Employee);
          setIsModalOpen(false);
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-indigo-600" />
                          {editingItem ? 'Edit Employee' : 'Add New Employee'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">First Name</label>
                              <input required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Last Name</label>
                              <input required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                              <input required type="email" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone</label>
                              <input required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Department</label>
                              <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                                  <option value="">Select...</option>
                                  <option value="Management">Management</option>
                                  <option value="Sales">Sales</option>
                                  <option value="Engineering">Engineering</option>
                                  <option value="HR">HR</option>
                                  <option value="Logistics">Logistics</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Position</label>
                              <input required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.position || ''} onChange={e => setForm({...form, position: e.target.value})} />
                          </div>
                      </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Hire Date</label>
                             <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.hireDate || ''} onChange={e => setForm({...form, hireDate: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Monthly Salary</label>
                             <input type="number" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.salary || 0} onChange={e => setForm({...form, salary: parseFloat(e.target.value)})} />
                          </div>
                       </div>
                       
                       <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                          <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                              <option value="active">Active</option>
                              <option value="on_leave">On Leave</option>
                              <option value="inactive">Inactive</option>
                          </select>
                       </div>

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('cancel')}</button>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4" /> {t('save')}</button>
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees Directory 👥</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your team members and their details.</p>
            </div>
            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add Employee
            </button>
        </div>

        <div className="flex gap-4 mb-6">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search employees by name or department..." 
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Position</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Salary</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                                        <div className="text-xs text-gray-500">Joined {emp.hireDate}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2 text-xs mb-1"><Mail className="w-3 h-3" /> {emp.email}</div>
                                <div className="flex items-center gap-2 text-xs"><Phone className="w-3 h-3" /> {emp.phone}</div>
                            </td>
                            <td className="p-4">
                                <div className="text-gray-900 dark:text-white font-medium">{emp.position}</div>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded mt-1 inline-block">{emp.department}</span>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                                    ${emp.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                      emp.status === 'on_leave' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
                                    {emp.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-gray-900 dark:text-white">
                                {formatCurrency(emp.salary)}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditingItem(emp); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if(confirm('Delete employee?')) deleteEmployee(emp.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No employees found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {isModalOpen && <EmployeeModal />}
    </div>
  );
};

export default HREmployees;

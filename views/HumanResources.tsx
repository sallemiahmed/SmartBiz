
import React, { useState } from 'react';
import { 
  Users, Briefcase, FileText, Calendar, DollarSign, Plus, Search, 
  Filter, CheckCircle, XCircle, Eye, Trash2, Clock, Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee, Contract, LeaveRequest, Payroll, ExpenseReport } from '../types';

interface HumanResourcesProps {
  view?: string;
}

const HumanResources: React.FC<HumanResourcesProps> = ({ view }) => {
  const { 
    employees, contracts, payrolls, leaves, expenses,
    addEmployee, updateEmployee, deleteEmployee,
    addContract, updateContract, deleteContract,
    addLeaveRequest, updateLeaveRequest,
    addExpenseReport, updateExpenseReport,
    formatCurrency, t
  } = useApp();

  const activeTab = view?.replace('hr-', '') || 'dashboard';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- Dashboard ---
  const renderDashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">Total Employees</p>
                        <h3 className="text-2xl font-bold dark:text-white">{employees.length}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">On Leave Today</p>
                        <h3 className="text-2xl font-bold dark:text-white">{leaves.filter(l => l.status === 'approved').length}</h3>
                    </div>
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Calendar className="w-6 h-6" /></div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">Pending Expenses</p>
                        <h3 className="text-2xl font-bold dark:text-white">{expenses.filter(e => e.status === 'pending').length}</h3>
                    </div>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Receipt className="w-6 h-6" /></div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">Payroll (Last Month)</p>
                        <h3 className="text-xl font-bold dark:text-white">{formatCurrency(payrolls.reduce((acc, p) => acc + p.netSalary, 0))}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                </div>
            </div>
        </div>
    </div>
  );

  // --- Employees ---
  const EmployeeModal = () => {
      const [form, setForm] = useState<Partial<Employee>>(editingItem || { status: 'active' });
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if(editingItem) updateEmployee(form as Employee);
          else addEmployee({ ...form, id: `e-${Date.now()}` } as Employee);
          setIsModalOpen(false);
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">{editingItem ? 'Edit' : 'Add'} Employee</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <input required placeholder="First Name" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} />
                          <input required placeholder="Last Name" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input required placeholder="Email" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                          <input required placeholder="Phone" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input required placeholder="Position" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.position || ''} onChange={e => setForm({...form, position: e.target.value})} />
                          <input required placeholder="Department" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} />
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs text-gray-500">Hire Date</label>
                             <input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.hireDate || ''} onChange={e => setForm({...form, hireDate: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-xs text-gray-500">Base Salary</label>
                             <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.salary || 0} onChange={e => setForm({...form, salary: parseFloat(e.target.value)})} />
                          </div>
                       </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  const renderEmployees = () => (
    <div className="space-y-4">
        <div className="flex justify-between">
             <input type="text" placeholder="Search employees..." className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Add Employee</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.filter(e => e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || e.lastName.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                        <tr key={emp.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium dark:text-white">{emp.firstName} {emp.lastName}</td>
                            <td className="p-4 text-gray-500">{emp.position} <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{emp.department}</span></td>
                            <td className="p-4 text-gray-500">{emp.email}<br/>{emp.phone}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs uppercase font-bold ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{emp.status}</span></td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button onClick={() => { setEditingItem(emp); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-600"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => deleteEmployee(emp.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {isModalOpen && <EmployeeModal />}
    </div>
  );

  // --- Contracts ---
  const renderContracts = () => (
      <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Start Date</th>
                        <th className="p-4">End Date</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map(c => (
                        <tr key={c.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium dark:text-white">{c.employeeName}</td>
                            <td className="p-4">{c.type}</td>
                            <td className="p-4">{c.startDate}</td>
                            <td className="p-4">{c.endDate || '-'}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs uppercase font-bold">{c.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
  );

  // --- Payroll ---
  const renderPayroll = () => (
      <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Month</th>
                        <th className="p-4 text-right">Base</th>
                        <th className="p-4 text-right">Bonuses</th>
                        <th className="p-4 text-right">Deductions</th>
                        <th className="p-4 text-right">Net Pay</th>
                        <th className="p-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {payrolls.map(p => (
                        <tr key={p.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium dark:text-white">{p.employeeName}</td>
                            <td className="p-4">{p.month}</td>
                            <td className="p-4 text-right">{formatCurrency(p.baseSalary)}</td>
                            <td className="p-4 text-right text-green-600">+{formatCurrency(p.bonuses)}</td>
                            <td className="p-4 text-right text-red-600">-{formatCurrency(p.deductions)}</td>
                            <td className="p-4 text-right font-bold dark:text-white">{formatCurrency(p.netSalary)}</td>
                            <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs uppercase font-bold ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
  );

  // --- Leave ---
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Request Leave</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <select required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, employeeId: e.target.value})}>
                          <option value="">Select Employee</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                      <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                          <option>Paid Leave</option><option>Sick Leave</option><option>Unpaid</option>
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                          <input type="date" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, startDate: e.target.value})} />
                          <input type="date" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, endDate: e.target.value})} />
                      </div>
                      <input type="number" placeholder="Days" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setForm({...form, days: parseInt(e.target.value)})} />
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  const renderLeave = () => (
      <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Request Leave</button></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Days</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map(l => (
                        <tr key={l.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium dark:text-white">{l.employeeName}</td>
                            <td className="p-4">{l.type}</td>
                            <td className="p-4 text-gray-500">{l.startDate} - {l.endDate}</td>
                            <td className="p-4 font-bold">{l.days}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs uppercase font-bold ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{l.status}</span></td>
                            <td className="p-4 text-right">
                                {l.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => updateLeaveRequest({...l, status: 'approved'})} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => updateLeaveRequest({...l, status: 'rejected'})} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
          {isModalOpen && <LeaveModal />}
      </div>
  );
  
  // --- Expenses ---
  const renderExpenses = () => (
      <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="p-4">Employee</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(e => (
                        <tr key={e.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4 font-medium dark:text-white">{e.employeeName}</td>
                            <td className="p-4 text-gray-500">{e.date}</td>
                            <td className="p-4">{e.type}</td>
                            <td className="p-4 text-gray-500">{e.description}</td>
                            <td className="p-4 text-right font-bold dark:text-white">{formatCurrency(e.amount)}</td>
                            <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs uppercase font-bold ${e.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{e.status}</span></td>
                            <td className="p-4 text-right">
                                {e.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => updateExpenseReport({...e, status: 'approved'})} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => updateExpenseReport({...e, status: 'rejected'})} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Human Resources 👥</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage employees, contracts, payroll, and leave.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'payroll' && renderPayroll()}
        {activeTab === 'leave' && renderLeave()}
        {activeTab === 'expenses' && renderExpenses()}
      </div>
    </div>
  );
};

export default HumanResources;

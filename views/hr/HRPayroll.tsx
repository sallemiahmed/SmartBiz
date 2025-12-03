
import React, { useState } from 'react';
import { DollarSign, Plus, Search, Trash2, X, CheckCircle, Calculator, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payroll } from '../../types';

const HRPayroll: React.FC = () => {
  const { payrolls, employees, addPayroll, formatCurrency, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  const filteredPayrolls = payrolls.filter(p => 
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.month.includes(searchTerm)
  );

  const ProcessPayrollModal = () => {
      const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
      const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
      
      const handleToggleEmployee = (id: string) => {
          if(selectedEmployees.includes(id)) setSelectedEmployees(selectedEmployees.filter(e => e !== id));
          else setSelectedEmployees([...selectedEmployees, id]);
      };

      const handleSelectAll = () => {
          if(selectedEmployees.length === employees.length) setSelectedEmployees([]);
          else setSelectedEmployees(employees.map(e => e.id));
      };

      const handleProcess = () => {
          selectedEmployees.forEach(empId => {
              const emp = employees.find(e => e.id === empId);
              if(!emp) return;
              
              const baseSalary = emp.salary;
              const bonuses = 0; 
              const deductions = 0; 
              const netSalary = baseSalary + bonuses - deductions;

              addPayroll({
                  id: `pay-${Date.now()}-${emp.id}`,
                  employeeId: emp.id,
                  employeeName: `${emp.firstName} ${emp.lastName}`,
                  month: month,
                  baseSalary,
                  bonuses,
                  deductions,
                  netSalary,
                  status: 'paid',
                  paymentDate: new Date().toISOString().split('T')[0]
              });
          });
          setIsProcessModalOpen(false);
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-green-600" />
                          Process Payroll
                      </h3>
                      <button onClick={() => setIsProcessModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                  </div>
                  
                  <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Month</label>
                      <input 
                        type="month" 
                        value={month} 
                        onChange={e => setMonth(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                      />
                  </div>

                  <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Select Employees</label>
                          <button onClick={handleSelectAll} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                              {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                          </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600 p-2 space-y-1">
                          {employees.filter(e => e.status === 'active').map(emp => (
                              <div key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleToggleEmployee(emp.id)}>
                                  <input 
                                    type="checkbox" 
                                    checked={selectedEmployees.includes(emp.id)}
                                    onChange={() => {}} 
                                    className="rounded text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-sm dark:text-white">{emp.firstName} {emp.lastName}</span>
                                  <span className="ml-auto text-xs text-gray-500">{formatCurrency(emp.salary)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => setIsProcessModalOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('cancel')}</button>
                      <button onClick={handleProcess} disabled={selectedEmployees.length === 0} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Generate
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management 💸</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Process monthly salaries and view history.</p>
            </div>
            <button onClick={() => setIsProcessModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Process Payroll
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex-1">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by employee or month..." 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="p-4">Month</th>
                        <th className="p-4">Employee</th>
                        <th className="p-4 text-right">Base Salary</th>
                        <th className="p-4 text-right">Bonus</th>
                        <th className="p-4 text-right">Deductions</th>
                        <th className="p-4 text-right">Net Pay</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Date Paid</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayrolls.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {p.month}
                                </div>
                            </td>
                            <td className="p-4 text-gray-700 dark:text-gray-300">{p.employeeName}</td>
                            <td className="p-4 text-right text-gray-500">{formatCurrency(p.baseSalary)}</td>
                            <td className="p-4 text-right text-green-600">+{formatCurrency(p.bonuses)}</td>
                            <td className="p-4 text-right text-red-600">-{formatCurrency(p.deductions)}</td>
                            <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(p.netSalary)}</td>
                            <td className="p-4 text-center">
                                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase flex items-center justify-center gap-1 w-fit mx-auto">
                                    <CheckCircle className="w-3 h-3" /> {p.status}
                                </span>
                            </td>
                            <td className="p-4 text-right text-gray-500 text-xs">{p.paymentDate}</td>
                        </tr>
                    ))}
                    {filteredPayrolls.length === 0 && (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-500 italic">No payroll records found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {isProcessModalOpen && <ProcessPayrollModal />}
    </div>
  );
};

export default HRPayroll;

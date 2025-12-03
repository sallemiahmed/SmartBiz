import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PayrollRun, Payslip } from '../types';
import {
  DollarSign,
  Calculator,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  X
} from 'lucide-react';

const HRPayroll: React.FC = () => {
  const {
    payrollRuns,
    addPayrollRun,
    updatePayrollRun,
    payslips,
    addPayslip,
    employees,
    payrollElements,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayslipsModal, setShowPayslipsModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  // Form state for new payroll run
  const [newRun, setNewRun] = useState({
    reference: '',
    periodStart: '',
    periodEnd: '',
    notes: ''
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const runs = payrollRuns || [];
    const emps = employees || [];

    const totalRuns = runs.length;
    const activeRuns = runs.filter(r => r.status === 'calculated' || r.status === 'validated').length;
    const totalEmployees = emps.filter(e => e.status === 'active').length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthRuns = runs.filter(r => {
      const runDate = new Date(r.periodEnd);
      return runDate.getMonth() === currentMonth && runDate.getFullYear() === currentYear;
    });

    const totalGross = currentMonthRuns.reduce((sum, r) => sum + r.totalGross, 0);
    const totalNet = currentMonthRuns.reduce((sum, r) => sum + r.totalNet, 0);

    return { totalRuns, activeRuns, totalEmployees, totalGross, totalNet };
  }, [payrollRuns, employees]);

  // Filter payroll runs
  const filteredRuns = useMemo(() => {
    const runs = payrollRuns || [];
    return runs.filter(run => {
      const matchesSearch = run.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || run.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
  }, [payrollRuns, searchTerm, filterStatus]);

  // Generate reference
  const generateReference = () => {
    const date = new Date(newRun.periodEnd || new Date());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `PAY-${year}-${month}`;
  };

  // Calculate payslips for a run
  const calculatePayslips = (run: PayrollRun) => {
    const activeEmployees = employees.filter(e => e.status === 'active');
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    activeEmployees.forEach(emp => {
      // Base salary
      const baseSalary = emp.salary || 0;

      // Calculate earnings
      const earnings = [
        { elementId: 'pe1', name: 'Salaire de Base', amount: baseSalary, taxable: true }
      ];

      // Add transport allowance if applicable
      if (baseSalary > 0) {
        earnings.push({ elementId: 'pe2', name: 'Prime de Transport', amount: 75, taxable: false });
      }

      const grossSalary = earnings.reduce((sum, e) => sum + e.amount, 0);

      // Calculate deductions
      const cnssRate = 0.0918; // 9.18% employee contribution
      const cnssAmount = baseSalary * cnssRate;

      // IRPP calculation (simplified progressive)
      let irppAmount = 0;
      const taxableIncome = earnings.filter(e => e.taxable).reduce((sum, e) => sum + e.amount, 0);
      if (taxableIncome > 5000) {
        irppAmount = (taxableIncome - 5000) * 0.26;
      } else if (taxableIncome > 1500) {
        irppAmount = (taxableIncome - 1500) * 0.26;
      }

      const deductions = [
        { elementId: 'pe5', name: 'Cotisation CNSS', amount: cnssAmount, type: 'social' as const },
        { elementId: 'pe6', name: 'IRPP', amount: irppAmount, type: 'tax' as const }
      ];

      const totalEmpDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const netSalary = grossSalary - totalEmpDeductions;

      totalGross += grossSalary;
      totalNet += netSalary;
      totalDeductions += totalEmpDeductions;

      // Create payslip
      const payslip: Payslip = {
        id: `ps-${run.id}-${emp.id}`,
        runId: run.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeMatricule: emp.matricule,
        periodStart: run.periodStart,
        periodEnd: run.periodEnd,
        baseSalary,
        workDays: 26,
        workedDays: 26,
        earnings,
        deductions,
        grossSalary,
        totalDeductions: totalEmpDeductions,
        netSalary,
        status: 'draft',
        generatedDate: new Date().toISOString()
      };

      addPayslip(payslip);
    });

    // Update run with calculated totals
    updatePayrollRun({
      ...run,
      status: 'calculated',
      totalGross,
      totalNet,
      totalDeductions,
      employeesCount: activeEmployees.length
    });
  };

  // Create new payroll run
  const handleCreateRun = () => {
    if (!newRun.periodStart || !newRun.periodEnd) {
      alert('Veuillez renseigner les dates de période');
      return;
    }

    const run: PayrollRun = {
      id: `pr-${Date.now()}`,
      reference: newRun.reference || generateReference(),
      periodStart: newRun.periodStart,
      periodEnd: newRun.periodEnd,
      status: 'draft',
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
      employeesCount: 0,
      createdBy: 'Admin User',
      createdDate: new Date().toISOString(),
      notes: newRun.notes
    };

    addPayrollRun(run);
    setShowCreateModal(false);
    setNewRun({ reference: '', periodStart: '', periodEnd: '', notes: '' });
  };

  // Validate run
  const handleValidate = (run: PayrollRun) => {
    if (run.status !== 'calculated') {
      alert('Veuillez d\'abord calculer la paie');
      return;
    }
    if (confirm(`Valider la paie ${run.reference} ?`)) {
      updatePayrollRun({ ...run, status: 'validated' });

      // Update payslips to final
      const runPayslips = payslips.filter(p => p.runId === run.id);
      runPayslips.forEach(p => {
        addPayslip({ ...p, status: 'final' });
      });
    }
  };

  // Mark as paid
  const handleMarkPaid = (run: PayrollRun) => {
    if (run.status !== 'validated') {
      alert('Veuillez d\'abord valider la paie');
      return;
    }
    if (confirm(`Marquer ${run.reference} comme payée ?`)) {
      updatePayrollRun({
        ...run,
        status: 'paid',
        paymentDate: new Date().toISOString()
      });
    }
  };

  // Close run
  const handleClose = (run: PayrollRun) => {
    if (run.status !== 'paid') {
      alert('Veuillez d\'abord marquer la paie comme payée');
      return;
    }
    if (confirm(`Clôturer ${run.reference} ? Cette action est irréversible.`)) {
      updatePayrollRun({
        ...run,
        status: 'closed',
        closedDate: new Date().toISOString()
      });
    }
  };

  // View payslips
  const handleViewPayslips = (run: PayrollRun) => {
    setSelectedRun(run);
    setShowPayslipsModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: PayrollRun['status']) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Brouillon' },
      calculated: { color: 'bg-blue-100 text-blue-700', icon: Calculator, label: 'Calculée' },
      validated: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle, label: 'Validée' },
      paid: { color: 'bg-green-100 text-green-700', icon: DollarSign, label: 'Payée' },
      closed: { color: 'bg-gray-100 text-gray-500', icon: CheckCircle, label: 'Clôturée' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Get run payslips
  const getRunPayslips = (runId: string) => {
    return payslips.filter(p => p.runId === runId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paie</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestion des paies et bulletins de salaire
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Paie
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paies Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalRuns}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Cours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.activeRuns}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalEmployees}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Brut (Mois)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalGross.toLocaleString()} TND
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net (Mois)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalNet.toLocaleString()} TND
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="calculated">Calculée</option>
              <option value="validated">Validée</option>
              <option value="paid">Payée</option>
              <option value="closed">Clôturée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payroll Runs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant Brut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant Net
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRuns.map((run) => (
                <React.Fragment key={run.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRun === run.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {run.reference}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(run.periodStart).toLocaleDateString('fr-FR')} - {new Date(run.periodEnd).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {run.employeesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {run.totalGross.toLocaleString()} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {run.totalNet.toLocaleString()} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(run.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {run.status === 'draft' && (
                          <button
                            onClick={() => calculatePayslips(run)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            title="Calculer"
                          >
                            <Calculator className="w-5 h-5" />
                          </button>
                        )}
                        {run.status === 'calculated' && (
                          <button
                            onClick={() => handleValidate(run)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400"
                            title="Valider"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {run.status === 'validated' && (
                          <button
                            onClick={() => handleMarkPaid(run)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400"
                            title="Marquer comme payée"
                          >
                            <DollarSign className="w-5 h-5" />
                          </button>
                        )}
                        {run.status === 'paid' && (
                          <button
                            onClick={() => handleClose(run)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                            title="Clôturer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {(run.status === 'calculated' || run.status === 'validated' || run.status === 'paid' || run.status === 'closed') && (
                          <button
                            onClick={() => handleViewPayslips(run)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                            title="Voir bulletins"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRun === run.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Créé par: </span>
                              <span className="text-gray-600 dark:text-gray-400">{run.createdBy}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Date création: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {new Date(run.createdDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            {run.paymentDate && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Date paiement: </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(run.paymentDate).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                            {run.closedDate && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Date clôture: </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(run.closedDate).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                          </div>
                          {run.notes && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Notes: </span>
                              <span className="text-gray-600 dark:text-gray-400">{run.notes}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredRuns.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune paie</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Commencez par créer une nouvelle paie.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Run Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nouvelle Paie
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Référence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newRun.reference}
                    onChange={(e) => setNewRun({ ...newRun, reference: e.target.value })}
                    placeholder="PAY-2024-12 (généré automatiquement)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Début Période *
                    </label>
                    <input
                      type="date"
                      value={newRun.periodStart}
                      onChange={(e) => setNewRun({ ...newRun, periodStart: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fin Période *
                    </label>
                    <input
                      type="date"
                      value={newRun.periodEnd}
                      onChange={(e) => setNewRun({ ...newRun, periodEnd: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newRun.notes}
                    onChange={(e) => setNewRun({ ...newRun, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Notes additionnelles..."
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Processus de paie</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
                        <li>Créer la paie en brouillon</li>
                        <li>Calculer les bulletins (CNSS, IRPP auto-calculés)</li>
                        <li>Valider les montants</li>
                        <li>Marquer comme payée après virement</li>
                        <li>Clôturer (action irréversible)</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateRun}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer Paie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Modal */}
      {showPayslipsModal && selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bulletins de Paie - {selectedRun.reference}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Période: {new Date(selectedRun.periodStart).toLocaleDateString('fr-FR')} - {new Date(selectedRun.periodEnd).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPayslipsModal(false);
                    setSelectedRun(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Matricule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Employé
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Salaire Base
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Brut
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        CNSS
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        IRPP
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Net
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getRunPayslips(selectedRun.id).map((payslip) => {
                      const cnss = payslip.deductions.find(d => d.name.includes('CNSS'))?.amount || 0;
                      const irpp = payslip.deductions.find(d => d.name.includes('IRPP'))?.amount || 0;
                      return (
                        <tr key={payslip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {payslip.employeeMatricule}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {payslip.employeeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                            {payslip.baseSalary.toLocaleString()} TND
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            {payslip.grossSalary.toLocaleString()} TND
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                            -{cnss.toFixed(2)} TND
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                            -{irpp.toFixed(2)} TND
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                            {payslip.netSalary.toFixed(2)} TND
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => alert('Génération PDF à implémenter')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                              title="Télécharger PDF"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white">
                        {selectedRun.totalGross.toLocaleString()} TND
                      </td>
                      <td colSpan={2} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        Déductions: -{selectedRun.totalDeductions.toLocaleString()} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                        {selectedRun.totalNet.toLocaleString()} TND
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPayroll;

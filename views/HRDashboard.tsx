
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users, UserPlus, UserMinus, Calendar, DollarSign, AlertTriangle,
  TrendingUp, FileText, CheckCircle, Clock
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

const HRDashboard: React.FC = () => {
  const {
    employees,
    contracts,
    leaves,
    expenses,
    payrolls,
    attendances,
    performanceReviews,
    formatCurrency,
    t
  } = useApp();

  // KPI Calculations
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Total active employees
    const activeEmployees = employees.filter(e => e.status === 'active').length;

    // New hires this month
    const newHires = employees.filter(e => {
      const hireDate = new Date(e.hireDate);
      return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
    }).length;

    // Departures this month
    const departures = employees.filter(e => {
      if (!e.status || e.status === 'active') return false;
      // Assuming termination date would be tracked (placeholder logic)
      return e.status === 'terminated';
    }).length;

    // Pending leave requests
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

    // Pending expense reports
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

    // Total payroll (latest month)
    const latestPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    // Absenteeism rate (placeholder - based on attendances)
    const totalAttendances = attendances.length;
    const absences = attendances.filter(a => a.status === 'absent').length;
    const absenteeismRate = totalAttendances > 0 ? (absences / totalAttendances) * 100 : 0;

    // Leave balance (placeholder - assuming 20 days/year)
    const totalLeaveDays = employees.length * 20;
    const usedLeaveDays = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);
    const remainingLeaveDays = totalLeaveDays - usedLeaveDays;

    // Documents expiring soon (placeholder)
    const expiringDocuments = employees.filter(e => {
      if (!e.documents || e.documents.length === 0) return false;
      return e.documents.some(doc => {
        if (!doc.expiryDate) return false;
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
      });
    }).length;

    // Contracts ending soon (CDD within 60 days)
    const endingContracts = contracts.filter(c => {
      if (c.type === 'CDI' || !c.endDate) return false;
      const endDate = new Date(c.endDate);
      const daysUntilEnd = Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd >= 0 && daysUntilEnd <= 60;
    }).length;

    return {
      activeEmployees,
      newHires,
      departures,
      pendingLeaves,
      pendingExpenses,
      latestPayroll,
      absenteeismRate,
      remainingLeaveDays,
      expiringDocuments,
      endingContracts
    };
  }, [employees, contracts, leaves, expenses, payrolls, attendances]);

  // Department distribution
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(e => {
      if (e.status === 'active') {
        deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
      }
    });
    return Object.entries(deptCounts).map(([name, count]) => ({ name, count }));
  }, [employees]);

  // Contract type distribution
  const contractTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    contracts.filter(c => c.status === 'active').forEach(c => {
      typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
  }, [contracts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('human_resources')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('hr_dashboard_subtitle') || 'Vue d\'ensemble RH'}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t('add_employee') || 'Nouvel Employé'}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t('run_payroll') || 'Lancer Paie'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('total_employees') || 'Effectif Total'}
          value={stats.activeEmployees.toString()}
          icon={Users}
          color="indigo"
          trend={`+${stats.newHires} ${t('this_month') || 'ce mois'}`}
        />
        <StatsCard
          title={t('payroll_cost') || 'Masse Salariale'}
          value={formatCurrency(stats.latestPayroll)}
          icon={DollarSign}
          color="green"
          trend={t('last_month') || 'Mois dernier'}
        />
        <StatsCard
          title={t('pending_leaves') || 'Congés en Attente'}
          value={stats.pendingLeaves.toString()}
          icon={Calendar}
          color="yellow"
          trend={`${stats.pendingExpenses} ${t('expenses') || 'notes de frais'}`}
        />
        <StatsCard
          title={t('absenteeism_rate') || 'Taux d\'Absentéisme'}
          value={`${stats.absenteeismRate.toFixed(1)}%`}
          icon={TrendingUp}
          color={stats.absenteeismRate > 5 ? 'red' : 'green'}
          trend={stats.absenteeismRate > 5 ? t('high') || 'Élevé' : t('normal') || 'Normal'}
        />
      </div>

      {/* Alerts Section */}
      {(stats.expiringDocuments > 0 || stats.endingContracts > 0 || stats.pendingLeaves > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">{t('alerts') || 'Alertes'}</h3>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                {stats.expiringDocuments > 0 && (
                  <li>• {stats.expiringDocuments} {t('documents_expiring') || 'document(s) expirent dans 30 jours'}</li>
                )}
                {stats.endingContracts > 0 && (
                  <li>• {stats.endingContracts} {t('contracts_ending') || 'contrat(s) CDD arrivent à échéance dans 60 jours'}</li>
                )}
                {stats.pendingLeaves > 0 && (
                  <li>• {stats.pendingLeaves} {t('leaves_pending_approval') || 'demande(s) de congé en attente d\'approbation'}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('by_department') || 'Répartition par Département'}
          </h3>
          <div className="space-y-3">
            {departmentData.map((dept, idx) => {
              const percentage = ((dept.count / stats.activeEmployees) * 100).toFixed(1);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{dept.name}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dept.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('by_contract_type') || 'Types de Contrats'}
          </h3>
          <div className="space-y-3">
            {contractTypeData.map((ct, idx) => {
              const total = contractTypeData.reduce((sum, c) => sum + c.count, 0);
              const percentage = total > 0 ? ((ct.count / total) * 100).toFixed(1) : '0';
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{ct.type}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{ct.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quick_actions') || 'Actions Rapides'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex flex-col items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('add_employee') || 'Ajouter Employé'}</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('run_payroll') || 'Lancer Paie'}</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors flex flex-col items-center gap-2">
            <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('approve_leaves') || 'Approuver Congés'}</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex flex-col items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('validate_expenses') || 'Valider Notes de Frais'}</span>
          </button>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('recent_activity') || 'Activité Récente'}</h3>
        <div className="space-y-3">
          {leaves.slice(0, 3).map((leave, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{leave.employeeName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('leave_request') || 'Demande de congé'}: {leave.type} ({leave.days} {t('days') || 'jours'})
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {t(leave.status) || leave.status}
              </span>
            </div>
          ))}
          {leaves.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('no_recent_activity') || 'Aucune activité récente'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

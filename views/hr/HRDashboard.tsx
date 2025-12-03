
import React from 'react';
import { 
  Users, Briefcase, DollarSign, Clock, TrendingUp, 
  Calendar, AlertCircle, CheckCircle, Activity, UserPlus, FileText,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, Line, 
  PieChart, Pie, Cell, Tooltip, Legend, CartesianGrid, XAxis, YAxis
} from 'recharts';
import { useApp } from '../../context/AppContext';
import StatsCard from '../../components/StatsCard';

const PAYROLL_TREND = [
  { month: 'Jan', amount: 42000, headcount: 12 },
  { month: 'Feb', amount: 43500, headcount: 13 },
  { month: 'Mar', amount: 43500, headcount: 13 },
  { month: 'Apr', amount: 48000, headcount: 15 },
  { month: 'May', amount: 48000, headcount: 15 },
  { month: 'Jun', amount: 52000, headcount: 16 },
];

const DEPT_DATA = [
  { name: 'Engineering', value: 8, color: '#6366f1' },
  { name: 'Sales', value: 4, color: '#10b981' },
  { name: 'Marketing', value: 3, color: '#f59e0b' },
  { name: 'HR', value: 2, color: '#ec4899' },
];

const RECENT_ACTIVITIES = [
  { id: 1, text: 'New employee onboarding: Sarah Jenkins', time: '2 hours ago', icon: UserPlus, color: 'bg-green-100 text-green-600' },
  { id: 2, text: 'Payroll for April 2024 processed', time: '5 hours ago', icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
  { id: 3, text: 'Contract renewal: Karim Jaziri', time: '1 day ago', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  { id: 4, text: 'Leave request approved for Walid', time: '1 day ago', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
];

const HRDashboard: React.FC = () => {
  const { employees, contracts, payrolls, leaves, formatCurrency, t } = useApp();

  const totalEmployees = employees.filter(e => e.status === 'active').length;
  const activeContractsCount = contracts.filter(c => c.status === 'active').length;
  
  const today = new Date();
  const onLeaveToday = leaves.filter(l => {
    if (l.status !== 'approved') return false;
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return today >= start && today <= end;
  }).length;

  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'active' || !c.endDate) return false;
    const end = new Date(c.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const totalPayrollCost = payrolls.reduce((acc, p) => acc + p.netSalary, 0);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard 👥</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of workforce, attendance, and performance.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
           📅 Today: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title={t('total_employees') || "Total Employees"} 
          value={totalEmployees.toString()} 
          trend="+2" 
          trendUp={true} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatsCard 
          title={t('on_leave_today') || "On Leave Today"} 
          value={onLeaveToday.toString()} 
          trend="0" 
          trendUp={true} 
          icon={Calendar} 
          color="bg-blue-500" 
        />
        <StatsCard 
          title={t('active_contracts') || "Active Contracts"} 
          value={activeContractsCount.toString()} 
          trend={expiringContracts.length > 0 ? `${expiringContracts.length} Expiring` : "Stable"} 
          trendUp={expiringContracts.length === 0} 
          icon={Briefcase} 
          color={expiringContracts.length > 0 ? "bg-orange-500" : "bg-emerald-500"} 
        />
        <StatsCard 
          title={t('payroll_cost') || "Payroll Cost"} 
          value={formatCurrency(totalPayrollCost)} 
          trend="+5%" 
          trendUp={false} 
          icon={DollarSign} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Payroll & Headcount Trend
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PAYROLL_TREND}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="amount" name="Payroll Cost" stroke="#6366f1" fill="url(#colorPayroll)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="headcount" name="Employees" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            Department Distribution
          </h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DEPT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

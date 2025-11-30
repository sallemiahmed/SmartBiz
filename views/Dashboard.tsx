
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users, Wrench, Zap, FileText, Download } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

const Dashboard: React.FC = () => {
  const { stats, clients, formatCurrency, chartData, serviceJobs, t } = useApp();

  const activeRepairs = serviceJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('dashboard_overview')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('welcome_message')}</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
             <FileText className="w-4 h-4" />
             {t('new_invoice')}
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 shadow-sm">
             <Download className="w-4 h-4" />
             {t('export_report')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard 
          title={t('total_revenue')} 
          value={formatCurrency(stats.revenue)} 
          trend="12%" 
          trendUp={true} 
          icon={DollarSign} 
          color="bg-indigo-500" 
        />
        <StatsCard 
          title={t('total_expenses')}
          value={formatCurrency(stats.expenses)} 
          trend="4%" 
          trendUp={false} 
          icon={ShoppingCart} 
          color="bg-rose-500" 
        />
        <StatsCard 
          title={t('net_profit')}
          value={formatCurrency(stats.profit)} 
          trend="8%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatsCard 
          title={t('active_clients')}
          value={clients.length.toLocaleString()} 
          trend="15%" 
          trendUp={true} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatsCard 
          title="Active Repairs"
          value={activeRepairs.toLocaleString()} 
          trend="5%" 
          trendUp={true} 
          icon={Wrench} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            {t('revenue_vs_expenses')}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            {t('monthly_sales')}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

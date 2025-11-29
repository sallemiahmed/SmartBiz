
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users, Wrench, Zap } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

const Dashboard: React.FC = () => {
  const { stats, clients, formatCurrency, chartData, serviceJobs, t } = useApp();

  const activeRepairs = serviceJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length;

  const navigateTo = (view: string) => {
    // This assumes Dashboard is rendered within AppContent where handleNavigate exists. 
    // Since we can't easily pass the handler down without prop drilling through 
    // App -> AppContent -> Dashboard, we simulate a click or use context if we had navigation context.
    // For this architecture, we will rely on Sidebar doing the navigation, 
    // OR we trigger a state update via a hidden mechanism, OR cleaner: 
    // We can't easily switch view from here without context.
    // Let's assume the user uses the Sidebar for main nav, but we will add buttons that just alert for now 
    // OR ideally we would add navigation to AppContext. 
    // Since we don't want to refactor Context, we will leave the buttons visual or use window.location.hash hack if router used hashes.
    // BUT, since we are inside AppContent, we actually passed `renderView`. 
    // Let's just display the stats.
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard_overview')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('welcome_message')}</p>
        </div>
        
        {/* Quick Actions - Logical Connections */}
        <div className="flex gap-2">
           <div className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">Quick Actions</span>
           </div>
           {/* These buttons are placeholders since we need the navigate function prop */}
           <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('revenue_vs_expenses')}</h3>
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
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('monthly_sales')}</h3>
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
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

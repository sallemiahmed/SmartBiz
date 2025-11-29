
import React, { useMemo } from 'react';
import { Wrench, Clock, CheckCircle, Users, TrendingUp, DollarSign, Activity, Briefcase, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import StatsCard from '../components/StatsCard';

const ServiceDashboard: React.FC = () => {
  const { serviceJobs, serviceSales, technicians, formatCurrency, t } = useApp();

  // --- KPI CALCULATIONS ---

  // 1. Total Revenue (from Service Sales)
  const totalRevenue = serviceSales
    .filter(s => s.status !== 'cancelled' && s.status !== 'draft')
    .reduce((acc, sale) => acc + sale.total, 0);

  // 2. Jobs Metrics
  const activeJobs = serviceJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length;
  const completedJobsCount = serviceJobs.filter(j => j.status === 'completed' || j.status === 'invoiced').length;
  
  // 3. Average Revenue per Job (Revenue / Completed Jobs)
  // Avoid division by zero
  const avgRevenuePerJob = completedJobsCount > 0 ? totalRevenue / completedJobsCount : 0;

  // 4. Technician Metrics
  const technicianStats = useMemo(() => {
    return technicians.map(tech => {
      const techJobs = serviceJobs.filter(j => j.technicianId === tech.id);
      const techSales = serviceSales.filter(s => s.technicianId === tech.id && s.status !== 'cancelled');
      
      const completed = techJobs.filter(j => j.status === 'completed' || j.status === 'invoiced').length;
      const active = techJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length;
      const revenue = techSales.reduce((acc, s) => acc + s.total, 0);
      
      // Mock Satisfaction Score (randomized for demo feel, between 4.0 and 5.0)
      const rating = 4 + (active + completed) % 10 / 10; 

      return {
        ...tech,
        completed,
        active,
        revenue,
        rating: Math.min(5, rating)
      };
    }).sort((a, b) => b.revenue - a.revenue); // Sort by top earner
  }, [technicians, serviceJobs, serviceSales]);

  // --- CHARTS DATA ---

  const jobsByStatus = [
    { name: t('pending'), value: serviceJobs.filter(j => j.status === 'pending').length, color: '#f97316' },
    { name: t('in_progress'), value: serviceJobs.filter(j => j.status === 'in_progress').length, color: '#3b82f6' },
    { name: t('completed'), value: serviceJobs.filter(j => j.status === 'completed').length, color: '#10b981' },
    { name: t('invoiced'), value: serviceJobs.filter(j => j.status === 'invoiced').length, color: '#8b5cf6' },
  ];

  // Revenue Trend (Last 7 days from sales)
  const revenueTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayRevenue = serviceSales
        .filter(s => s.date === date && s.status !== 'cancelled')
        .reduce((acc, s) => acc + s.total, 0);
      
      return {
        date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: dayRevenue
      };
    });
  }, [serviceSales]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-600" />
                {t('service_dashboard')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Performance metrics and repair center overview.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title={t('total_revenue')} 
          value={formatCurrency(totalRevenue)} 
          trend="+12%" 
          trendUp={true} 
          icon={DollarSign} 
          color="bg-indigo-500" 
        />
        <StatsCard 
          title="Jobs Completed" 
          value={completedJobsCount.toString()} 
          trend="+5%" 
          trendUp={true} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatsCard 
          title="Avg. Revenue / Job" 
          value={formatCurrency(avgRevenuePerJob)} 
          trend="+2%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatsCard 
          title="Active Workload" 
          value={activeJobs.toString()} 
          trend="-1" 
          trendUp={false} // Assuming less active backlog is good or neutral
          icon={Clock} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-green-500" /> Service Revenue Trend (7 Days)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{r:4, fill:'#6366f1'}} activeDot={{r:6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Job Status Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {jobsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Technician Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Technician Performance
            </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="px-6 py-4">Technician</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Active Jobs</th>
                        <th className="px-6 py-4 text-center">Completed Jobs</th>
                        <th className="px-6 py-4 text-right">Revenue Generated</th>
                        <th className="px-6 py-4 text-right">Rating</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {technicianStats.map((tech) => (
                        <tr key={tech.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {tech.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                                        <div className="text-xs text-gray-500">{tech.specialty}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                    ${tech.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      tech.status === 'busy' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}
                                `}>
                                    {t(tech.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono">
                                {tech.active}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-gray-900 dark:text-white">
                                {tech.completed}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(tech.revenue)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 text-yellow-400">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium mr-1 text-xs">{tech.rating.toFixed(1)}</span>
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                </div>
                            </td>
                        </tr>
                    ))}
                    {technicianStats.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No technician data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;

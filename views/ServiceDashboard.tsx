
import React from 'react';
import { Wrench, Clock, CheckCircle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ServiceDashboard: React.FC = () => {
  const { serviceJobs, technicians, t } = useApp();

  const activeJobs = serviceJobs.filter(j => j.status === 'in_progress' || j.status === 'pending').length;
  const completedJobs = serviceJobs.filter(j => j.status === 'completed' || j.status === 'invoiced').length;
  const urgentJobs = serviceJobs.filter(j => (j.status === 'in_progress' || j.status === 'pending') && j.priority === 'critical').length;
  const busyTechs = technicians.filter(t => t.status === 'busy').length;

  const jobsByStatus = [
    { name: 'Pending', value: serviceJobs.filter(j => j.status === 'pending').length },
    { name: 'In Progress', value: serviceJobs.filter(j => j.status === 'in_progress').length },
    { name: 'Completed', value: serviceJobs.filter(j => j.status === 'completed').length },
    { name: 'Invoiced', value: serviceJobs.filter(j => j.status === 'invoiced').length },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('service_dashboard')} 🛠️</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed (Month)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedJobs}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Urgent Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{urgentJobs}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Techs Busy</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{busyTechs} / {technicians.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Job Status Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobsByStatus}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Technician Status</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {technicians.map(tech => (
              <div key={tech.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${tech.status === 'available' ? 'bg-green-500' : tech.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{tech.name}</div>
                    <div className="text-xs text-gray-500">{tech.specialty}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${tech.status === 'available' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : tech.status === 'busy' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                  {t(tech.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;

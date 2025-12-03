
import React from 'react';
import HRDashboard from './hr/HRDashboard';
import HREmployees from './hr/HREmployees';
import HRContracts from './hr/HRContracts';
import HRPayroll from './hr/HRPayroll';
import HRLeave from './hr/HRLeave';
import HRExpenses from './hr/HRExpenses';
import HRPerformance from './hr/HRPerformance';

interface HumanResourcesProps {
  view?: string;
}

const HumanResources: React.FC<HumanResourcesProps> = ({ view }) => {
  const activeTab = view?.replace('hr-', '') || 'dashboard';

  // Simple routing logic
  if (activeTab === 'hr') return <HRDashboard />;

  switch (activeTab) {
    case 'dashboard':
      return <HRDashboard />;
    case 'employees':
      return <HREmployees />;
    case 'contracts':
      return <HRContracts />;
    case 'payroll':
      return <HRPayroll />;
    case 'leave':
      return <HRLeave />;
    case 'expenses':
      return <HRExpenses />;
    case 'performance':
      return <HRPerformance />;
    default:
      return <HRDashboard />;
  }
};

export default HumanResources;

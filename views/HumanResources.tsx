
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
  // Normalize the view to get the active tab
  let activeTab = 'dashboard';

  if (view) {
    // Remove 'hr-' or 'hr' prefix to get the actual tab name
    if (view === 'hr') {
      activeTab = 'dashboard';
    } else if (view.startsWith('hr-')) {
      activeTab = view.replace('hr-', '');
    } else {
      activeTab = view;
    }
  }

  // Log for debugging (will help identify routing issues)
  console.log('[HumanResources] view:', view, '→ activeTab:', activeTab);

  // Route to the appropriate component
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
      console.warn('[HumanResources] Unknown tab:', activeTab, '- defaulting to dashboard');
      return <HRDashboard />;
  }
};

export default HumanResources;

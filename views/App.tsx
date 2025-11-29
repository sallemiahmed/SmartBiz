
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AIAssistant from './components/AIAssistant';
import ProgressBar from './components/ProgressBar'; // Import ProgressBar
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Inventory from './views/Inventory';
import InventoryWarehouses from './views/InventoryWarehouses';
import InventoryTransfers from './views/InventoryTransfers';
import Invoices from './views/Invoices';
import Suppliers from './views/Suppliers';
import Sales from './views/Sales';
import Purchases from './views/Purchases';
import SalesOrders from './views/SalesOrders';
import PurchaseOrders from './views/PurchaseOrders';
import PurchaseDeliveries from './views/PurchaseDeliveries';
import PurchaseInvoices from './views/PurchaseInvoices';
import SalesEstimates from './views/SalesEstimates';
import SalesDeliveries from './views/SalesDeliveries';
import SalesInvoices from './views/SalesInvoices';
import SalesIssues from './views/SalesIssues';
import RequestForQuotation from './views/RequestForQuotation';
import InternalPurchaseRequest from './views/InternalPurchaseRequest';
import Services from './views/Services'; // New Import
import ServiceJobs from './views/ServiceJobs'; // New Import
import Reports from './views/Reports';
import Settings from './views/Settings';
import BankManagement from './views/BankManagement'; 
import CashRegister from './views/CashRegister'; 
import CostAnalysis from './views/CostAnalysis';
import { AppView } from './types';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const { settings, setIsLoading } = useApp();

  const handleNavigate = (view: AppView) => {
    if (view !== currentView) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentView(view);
        setTimeout(() => setIsLoading(false), 200);
      }, 100);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (settings.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = settings.language;
    }
  }, [settings.language]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderView = () => {
    // --- Services Routing ---
    if (currentView === 'services-jobs') {
        return <ServiceJobs onAddNew={() => handleNavigate('services-jobs-create' as AppView)} />;
    }
    if (currentView === 'services-jobs-create' as AppView) {
        return <Services mode="create" />;
    }
    if (currentView.startsWith('services')) {
        const mode = currentView.replace('services-', '');
        // if mode is just 'services', default to dashboard
        return <Services mode={mode === 'services' ? undefined : mode} />;
    }

    // --- Specific Sales Lists Routing ---
    if (currentView === 'sales-estimate') {
      return <SalesEstimates onAddNew={() => handleNavigate('sales-estimate-create' as AppView)} />;
    }
    if (currentView === 'sales-estimate-create' as AppView) {
      return <Sales mode="estimate" />;
    }
    if (currentView === 'sales-order') {
      return <SalesOrders onAddNew={() => handleNavigate('sales-order-create' as AppView)} />;
    }
    if (currentView === 'sales-order-create' as AppView) { 
      return <Sales mode="order" />;
    }
    if (currentView === 'sales-delivery') {
      return <SalesDeliveries onAddNew={() => handleNavigate('sales-delivery-create' as AppView)} />;
    }
    if (currentView === 'sales-delivery-create' as AppView) {
      return <Sales mode="delivery" />;
    }
    if (currentView === 'sales-invoice') {
      return <SalesInvoices onAddNew={() => handleNavigate('sales-invoice-create' as AppView)} />;
    }
    if (currentView === 'sales-invoice-create' as AppView) {
      return <Sales mode="invoice" />;
    }
    if (currentView === 'sales-issue') {
      return <SalesIssues onAddNew={() => handleNavigate('sales-issue-create' as AppView)} />;
    }
    if (currentView === 'sales-issue-create' as AppView) {
      return <Sales mode="issue" />;
    }

    // --- Purchases Routing ---
    if (currentView === 'purchases-pr') {
        return <InternalPurchaseRequest onAddNew={() => handleNavigate('purchases-pr-create' as AppView)} />;
    }
    if (currentView === 'purchases-pr-create' as AppView) {
        return <Purchases mode="pr" />;
    }
    if (currentView === 'purchases-rfq') {
        return <RequestForQuotation onAddNew={() => handleNavigate('purchases-rfq-create' as AppView)} />;
    }
    if (currentView === 'purchases-rfq-create' as AppView) {
        return <Purchases mode="rfq" />;
    }
    if (currentView === 'purchases-order') {
      return <PurchaseOrders onAddNew={() => handleNavigate('purchases-order-create' as AppView)} />;
    }
    if (currentView === 'purchases-order-create' as AppView) {
      return <Purchases mode="order" />;
    }
    if (currentView === 'purchases-delivery') {
      return <PurchaseDeliveries onAddNew={() => handleNavigate('purchases-delivery-create' as AppView)} />;
    }
    if (currentView === 'purchases-delivery-create' as AppView) {
      return <Purchases mode="delivery" />;
    }
    if (currentView === 'purchases-invoice') {
      return <PurchaseInvoices onAddNew={() => handleNavigate('purchases-invoice-create' as AppView)} />;
    }
    if (currentView === 'purchases-invoice-create' as AppView) {
      return <Purchases mode="invoice" />;
    }

    // Fallbacks
    if (currentView.startsWith('sales')) {
      if (currentView === 'sales') return <Sales mode="invoice" />; 
      const mode = currentView.replace('sales-', '') as any; 
      return <Sales mode={mode} />;
    }
    if (currentView.startsWith('purchases')) {
      if (currentView === 'purchases') return <Purchases mode="invoice" />; 
      const mode = currentView.replace('purchases-', '') as any;
      return <Purchases mode={mode} />;
    }

    if (currentView.startsWith('settings')) {
      return <Settings view={currentView} />;
    }

    if (currentView.startsWith('inventory')) {
        if (currentView === 'inventory') return <Inventory />; // Default
        const mode = currentView.replace('inventory-', '');
        if (mode === 'products') return <Inventory />;
        if (mode === 'warehouses') return <InventoryWarehouses />;
        if (mode === 'transfers') return <InventoryTransfers />;
    }

    if (currentView.startsWith('banking')) {
      return <BankManagement view={currentView} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'suppliers':
        return <Suppliers />;
      case 'invoices':
        return <Invoices />; 
      case 'cash_register':
        return <CashRegister />; 
      case 'cost_analysis':
        return <CostAnalysis />;
      case 'reports':
        return <Reports />;
      default:
        return (
          <div className="p-12 text-center">
            <h2 className="text-xl font-bold text-gray-400">Module under construction 🚧</h2>
            <p className="text-gray-500 mt-2">The {currentView} module will be available in v1.1</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      <ProgressBar />
      <Sidebar 
        currentView={currentView.includes('-create') ? currentView.replace('-create', '') as AppView : currentView} 
        onChangeView={handleNavigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          onToggleAI={() => setIsAIOpen(!isAIOpen)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {renderView()}
          
          {!currentView.startsWith('sales') && !currentView.startsWith('purchases') && !currentView.startsWith('settings') && !currentView.startsWith('services') && (
            <footer className="p-6 text-center text-xs text-gray-400 dark:text-gray-600">
              &copy; 2024 SmartBiz Manager SaaS. All rights reserved. v1.0.0
            </footer>
          )}
        </main>

        <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

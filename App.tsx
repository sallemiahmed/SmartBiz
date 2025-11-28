
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AIAssistant from './components/AIAssistant';
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Inventory from './views/Inventory';
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
import Reports from './views/Reports';
import Settings from './views/Settings';
import BankManagement from './views/BankManagement'; // New Import
import CashRegister from './views/CashRegister'; // New Import
import { AppView } from './types';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  // Access global settings for language handling
  const { settings } = useApp();

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initialize Direction (RTL/LTR) based on Language
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
    // --- Specific Sales Lists Routing ---

    // 1. Estimate
    if (currentView === 'sales-estimate') {
      return <SalesEstimates onAddNew={() => setCurrentView('sales-estimate-create' as AppView)} />;
    }
    if (currentView === 'sales-estimate-create' as AppView) {
      return <Sales mode="estimate" />;
    }

    // 2. Client Order
    if (currentView === 'sales-order') {
      return <SalesOrders onAddNew={() => setCurrentView('sales-order-create' as AppView)} />;
    }
    if (currentView === 'sales-order-create' as AppView) { 
      return <Sales mode="order" />;
    }

    // 3. Delivery Note
    if (currentView === 'sales-delivery') {
      return <SalesDeliveries onAddNew={() => setCurrentView('sales-delivery-create' as AppView)} />;
    }
    if (currentView === 'sales-delivery-create' as AppView) {
      return <Sales mode="delivery" />;
    }

    // 4. Invoice (Sales Specific)
    if (currentView === 'sales-invoice') {
      return <SalesInvoices onAddNew={() => setCurrentView('sales-invoice-create' as AppView)} />;
    }
    if (currentView === 'sales-invoice-create' as AppView) {
      return <Sales mode="invoice" />;
    }

    // 5. Issue Note
    if (currentView === 'sales-issue') {
      return <SalesIssues onAddNew={() => setCurrentView('sales-issue-create' as AppView)} />;
    }
    if (currentView === 'sales-issue-create' as AppView) {
      return <Sales mode="issue" />;
    }

    // --- Purchases Routing ---

    // 1. Supplier Order
    if (currentView === 'purchases-order') {
      return <PurchaseOrders onAddNew={() => setCurrentView('purchases-order-create' as AppView)} />;
    }
    if (currentView === 'purchases-order-create' as AppView) {
      return <Purchases mode="order" />;
    }

    // 2. Supplier Delivery (GRN)
    if (currentView === 'purchases-delivery') {
      return <PurchaseDeliveries onAddNew={() => setCurrentView('purchases-delivery-create' as AppView)} />;
    }
    if (currentView === 'purchases-delivery-create' as AppView) {
      return <Purchases mode="delivery" />;
    }

    // 3. Supplier Invoice
    if (currentView === 'purchases-invoice') {
      return <PurchaseInvoices onAddNew={() => setCurrentView('purchases-invoice-create' as AppView)} />;
    }
    if (currentView === 'purchases-invoice-create' as AppView) {
      return <Purchases mode="invoice" />;
    }

    // Fallbacks for general sales/purchases links if sidebar structure changes
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

    // --- Settings Routing ---
    if (currentView.startsWith('settings')) {
      return <Settings view={currentView} />;
    }

    // --- Main Modules ---

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'suppliers':
        return <Suppliers />;
      case 'inventory':
        return <Inventory />;
      case 'invoices':
        return <Invoices />; 
      case 'banking':
        return <BankManagement />; // New View
      case 'cash_register':
        return <CashRegister />; // New View
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
      <Sidebar 
        currentView={currentView.includes('-create') ? currentView.replace('-create', '') as AppView : currentView} 
        onChangeView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={setCurrentView}
          onToggleAI={() => setIsAIOpen(!isAIOpen)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {renderView()}
          
          {!currentView.startsWith('sales') && !currentView.startsWith('purchases') && !currentView.startsWith('settings') && (
            <footer className="p-6 text-center text-xs text-gray-400 dark:text-gray-600">
              &copy; 2024 SmartBiz Manager SaaS. All rights reserved. v1.0.0
            </footer>
          )}
        </main>

        {/* AI Assistant Overlay */}
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

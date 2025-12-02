
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  FileStack, 
  LineChart, 
  Settings,
  CircleDollarSign,
  Receipt,
  ChevronDown,
  ChevronRight,
  Plus,
  Landmark,
  Wallet,
  Calculator,
  Wrench,
  Car
} from 'lucide-react';
import { AppView } from '../types';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

type SubItem = {
  id: string; 
  labelKey: string;
  hasAction?: boolean;
};

type MenuItem = {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  emoji: string;
  subItems?: SubItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const { t } = useApp();
  
  // State for expanded menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  
  // State for resizing
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px
  const [isResizing, setIsResizing] = useState(false);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      
      // Constraints
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 480) newWidth = 480;
      
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'clients', labelKey: 'clients', icon: Users, emoji: '👥' },
    { id: 'suppliers', labelKey: 'suppliers', icon: Truck, emoji: '🏪' },
    { 
      id: 'sales', 
      labelKey: 'sales', 
      icon: CircleDollarSign, 
      emoji: '💸',
      subItems: [
        { id: 'sales-estimate', labelKey: 'estimate', hasAction: true },
        { id: 'sales-order', labelKey: 'client_order' },
        { id: 'sales-delivery', labelKey: 'delivery_note' },
        { id: 'sales-invoice', labelKey: 'invoice' },
        { id: 'sales-return', labelKey: 'customer_returns', hasAction: true },
      ]
    },
    { 
      id: 'purchases', 
      labelKey: 'purchases', 
      icon: Receipt, 
      emoji: '🧾',
      subItems: [
        { id: 'purchases-pr', labelKey: 'internal_purchase_request', hasAction: true },
        { id: 'purchases-rfq', labelKey: 'request_for_quotation', hasAction: true },
        { id: 'purchases-order', labelKey: 'supplier_order' },
        { id: 'purchases-delivery', labelKey: 'supplier_delivery', hasAction: true },
        { id: 'purchases-invoice', labelKey: 'supplier_invoice' },
        { id: 'purchases-return', labelKey: 'supplier_returns', hasAction: true },
      ]
    },
    {
      id: 'services',
      labelKey: 'services',
      icon: Wrench,
      emoji: '🛠️',
      subItems: [
        { id: 'services-dashboard', labelKey: 'service_dashboard' },
        { id: 'services-jobs', labelKey: 'job_cards', hasAction: true },
        { id: 'services-sales', labelKey: 'service_sales' }, 
        { id: 'services-catalog', labelKey: 'service_catalog' },
        { id: 'services-technicians', labelKey: 'technicians' }
      ]
    },
    { 
      id: 'inventory', 
      labelKey: 'inventory', 
      icon: Package, 
      emoji: '📦',
      subItems: [
        { id: 'inventory-products', labelKey: 'products_list' },
        { id: 'inventory-warehouses', labelKey: 'warehouses' },
        { id: 'inventory-transfers', labelKey: 'stock_transfers' },
        { id: 'inventory-audit', labelKey: 'stock_audit' },
      ]
    },
    { 
      id: 'fleet', 
      labelKey: 'fleet_management', 
      icon: Car, 
      emoji: '🚗',
      subItems: [
        { id: 'fleet-dashboard', labelKey: 'dashboard_overview' },
        { id: 'fleet-vehicles', labelKey: 'vehicles' },
        { id: 'fleet-missions', labelKey: 'missions' },
        { id: 'fleet-maintenance', labelKey: 'maintenance' },
        { id: 'fleet-costs', labelKey: 'costs_expenses' },
      ]
    },
    { id: 'invoices', labelKey: 'documents', icon: FileStack, emoji: '🧮' },
    { 
      id: 'banking', 
      labelKey: 'banking', 
      icon: Landmark, 
      emoji: '🏦',
      subItems: [
        { id: 'banking', labelKey: 'overview' },
        { id: 'banking-accounts', labelKey: 'accounts' },
        { id: 'banking-transactions', labelKey: 'transactions' },
      ]
    },
    { id: 'cash_register', labelKey: 'cash_register', icon: Wallet, emoji: '💵' },
    { id: 'cost_analysis', labelKey: 'cost_analysis', icon: Calculator, emoji: '🧮' },
    { id: 'reports', labelKey: 'reports', icon: LineChart, emoji: '📈' },
    { 
      id: 'settings', 
      labelKey: 'settings', 
      icon: Settings, 
      emoji: '⚙️',
      subItems: [
        { id: 'settings-general', labelKey: 'general' },
        { id: 'settings-profile', labelKey: 'profile' },
        { id: 'settings-security', labelKey: 'security' },
        { id: 'settings-billing', labelKey: 'billing' },
        { id: 'settings-notifications', labelKey: 'notifications' },
      ]
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        style={{ width: isOpen && window.innerWidth >= 768 ? sidebarWidth : undefined }}
        className={`
          fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out flex flex-col group
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:relative
          ${isResizing ? 'duration-0' : ''}
        `}
      >
        {/* Force width on mobile via class if style is undefined, but style handles desktop */}
        <div className={`h-full flex flex-col w-64 md:w-auto`} style={{ width: window.innerWidth >= 768 ? sidebarWidth : undefined }}>
          
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => onChangeView('dashboard')}>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                SB
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white truncate">SmartBiz</span>
            </div>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {menuItems.map((item) => {
              const isExpanded = expandedMenus[item.id];
              const isActive = currentView === item.id || (item.subItems && item.subItems.some(sub => sub.id === currentView));
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleMenu(item.id);
                      } else {
                        onChangeView(item.id as AppView);
                        if (window.innerWidth < 768) setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive && !hasSubItems
                        ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 dark:from-indigo-900/40 dark:to-indigo-900/10 dark:text-indigo-300 shadow-sm border-l-4 border-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive && !hasSubItems ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                    <span className="flex-1 text-left rtl:text-right truncate">{t(item.labelKey)}</span>
                    {hasSubItems && (
                      <span className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
                      </span>
                    )}
                    {!hasSubItems && <span className="ml-auto opacity-50 text-xs grayscale filter">{item.emoji}</span>}
                  </button>

                  {hasSubItems && isExpanded && (
                    <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 mt-1 border-l-2 border-gray-100 dark:border-gray-700 ml-4 rtl:ml-0 rtl:mr-4">
                      {item.subItems?.map((subItem, idx) => {
                        const isSubActive = currentView === subItem.id;
                        return (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeView(subItem.id as AppView);
                              if (window.innerWidth < 768) setIsOpen(false);
                            }}
                            className={`
                              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group
                              ${isSubActive 
                                ? 'text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                            `}
                          >
                            <span className="truncate text-left rtl:text-right w-full">
                              {t(subItem.labelKey)}
                            </span>
                            {subItem.hasAction && (
                              <div className="p-0.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Resizer Handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-50 hidden md:block bg-transparent"
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          style={{ backgroundColor: isResizing ? '#6366f1' : undefined }}
        />
      </aside>
    </>
  );
};

export default Sidebar;

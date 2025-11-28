import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Sun, Menu, ChevronDown, Sparkles, Package, Users, FileText, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

interface TopBarProps {
  onMenuClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (view: AppView) => void;
  onToggleAI: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isDark, toggleTheme, onNavigate, onToggleAI }) => {
  const { clients, suppliers, products, invoices, formatCurrency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = {
    clients: clients.filter(c => c.company.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    suppliers: suppliers.filter(s => s.company.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2),
    products: products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    invoices: invoices.filter(i => i.number.toLowerCase().includes(searchQuery.toLowerCase()) || i.clientName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  };

  const hasResults = Object.values(filteredResults).some(arr => arr.length > 0);

  const handleResultClick = (view: AppView) => {
    onNavigate(view);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Global Search */}
        <div className="relative hidden md:block w-full max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          {/* Search Dropdown */}
          {showResults && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-30">
              {!hasResults ? (
                <div className="p-4 text-sm text-gray-500 text-center">No results found.</div>
              ) : (
                <div className="py-2">
                  {filteredResults.clients.length > 0 && (
                    <div className="px-2 mb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Clients</div>
                      {filteredResults.clients.map(c => (
                        <button key={c.id} onClick={() => handleResultClick('clients')} className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md"><Users className="w-4 h-4" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{c.company}</div>
                            <div className="text-xs text-gray-500">{c.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.invoices.length > 0 && (
                    <div className="px-2 mb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Invoices</div>
                      {filteredResults.invoices.map(i => (
                        <button key={i.id} onClick={() => handleResultClick('invoices')} className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group">
                          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-md"><FileText className="w-4 h-4" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{i.number}</div>
                            <div className="text-xs text-gray-500">{i.clientName} • {formatCurrency(i.amount)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.products.length > 0 && (
                    <div className="px-2 mb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Products</div>
                      {filteredResults.products.map(p => (
                        <button key={p.id} onClick={() => handleResultClick('inventory')} className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group">
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-md"><Package className="w-4 h-4" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.sku} • {formatCurrency(p.price)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.suppliers.length > 0 && (
                    <div className="px-2 mb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Suppliers</div>
                      {filteredResults.suppliers.map(s => (
                        <button key={s.id} onClick={() => handleResultClick('suppliers')} className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group">
                          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-md"><Store className="w-4 h-4" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{s.company}</div>
                            <div className="text-xs text-gray-500">{s.contactName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Assistant Toggle */}
        <button 
          onClick={onToggleAI}
          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors flex items-center gap-2"
          title="Ask AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Ask AI</span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Alex Morgan</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Admin</div>
          </div>
          <img 
            src="https://picsum.photos/100/100" 
            alt="Profile" 
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
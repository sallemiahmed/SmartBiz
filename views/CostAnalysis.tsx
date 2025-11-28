
import React, { useState, useMemo } from 'react';
import { 
  Calculator, TrendingUp, AlertTriangle, Package, 
  DollarSign, BarChart3, RefreshCw, Search, Calendar, Filter, Download,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

const CostAnalysis: React.FC = () => {
  const { products, invoices, warehouses, formatCurrency, t } = useApp();
  
  // State for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });

  // Simulator State
  const [simulatorProduct, setSimulatorProduct] = useState<Product | null>(null);
  const [simQty, setSimQty] = useState<number>(10);
  const [simPrice, setSimPrice] = useState<number>(0);
  const [simExtraCost, setSimExtraCost] = useState<number>(0);

  // Categories for filter
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  // --- ACTIONS ---

  const setPresetDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Stock', 'Avg Cost', 'Selling Price', 'Margin', 'Margin %'];
    const rows = processedProducts.map(p => [
      `"${p.name}"`, 
      p.sku, 
      p.category, 
      p.stock, 
      p.cost.toFixed(2), 
      p.price.toFixed(2), 
      (p.price - p.cost).toFixed(2),
      p.marginPercent.toFixed(2) + '%'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cost_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // --- SNAPSHOT METRICS (Inventory State) ---

  // 1. Total Inventory Value (Current Stock * Weighted Avg Cost) - Filtered by Warehouse
  const totalInventoryValue = products.reduce((acc, p) => {
    const qty = selectedWarehouse === 'All' ? p.stock : (p.warehouseStock[selectedWarehouse] || 0);
    return acc + (qty * p.cost);
  }, 0);

  // 2. Potential Profit (Total Stock * (Price - Cost)) - Filtered by Warehouse
  const potentialProfit = products.reduce((acc, p) => {
    const qty = selectedWarehouse === 'All' ? p.stock : (p.warehouseStock[selectedWarehouse] || 0);
    return acc + (qty * (p.price - p.cost));
  }, 0);

  // --- FLOW METRICS & TREND DATA ---

  const { metrics, trendData } = useMemo(() => {
    const filteredInvoices = invoices.filter(inv => {
      if (inv.type !== 'invoice' && inv.type !== 'order') return false; // Focus on sales
      if (inv.status === 'draft') return false;
      
      const invDate = inv.date;
      const start = dateRange.start;
      const end = dateRange.end;
      
      const matchesDate = (!start || invDate >= start) && (!end || invDate <= end);
      const matchesWarehouse = selectedWarehouse === 'All' || inv.warehouseId === selectedWarehouse;

      return matchesDate && matchesWarehouse;
    });

    let revenue = 0;
    let cogs = 0;
    const trendMap: Record<string, { date: string, revenue: number, cogs: number, profit: number }> = {};

    filteredInvoices.forEach(inv => {
      // For Orders/Invoices
      if (inv.type === 'invoice' || (inv.type === 'order' && inv.status === 'completed')) {
         const invRevenue = inv.amount;
         let invCogs = 0;
         
         inv.items.forEach(item => {
           // Use historical cost if available, otherwise current cost (fallback)
           const itemCost = item.historicalCost !== undefined ? item.historicalCost : (products.find(p => p.id === item.id)?.cost || 0);
           invCogs += (itemCost * item.quantity);
         });

         revenue += invRevenue;
         cogs += invCogs;

         // Aggregate for Trend Chart
         const dateKey = inv.date;
         if (!trendMap[dateKey]) {
           trendMap[dateKey] = { date: dateKey, revenue: 0, cogs: 0, profit: 0 };
         }
         trendMap[dateKey].revenue += invRevenue;
         trendMap[dateKey].cogs += invCogs;
         trendMap[dateKey].profit += (invRevenue - invCogs);
      }
    });

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Convert trend map to array and sort by date
    const trends = Object.values(trendMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { 
      metrics: { revenue, cogs, grossProfit, grossMargin },
      trendData: trends
    };
  }, [invoices, products, dateRange, selectedWarehouse]);

  // --- Product List Data ---
  const processedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        // Check if product has stock in selected warehouse (optional: show all products even if 0 stock in that warehouse? Lets show all but display correct stock)
        return matchesSearch && matchesCategory;
      })
      .map(p => {
        const stock = selectedWarehouse === 'All' ? p.stock : (p.warehouseStock[selectedWarehouse] || 0);
        const margin = p.price - p.cost;
        const marginPercent = p.price > 0 ? (margin / p.price) * 100 : 0;
        return { ...p, stock, margin, marginPercent };
      })
      .sort((a, b) => b.marginPercent - a.marginPercent);
  }, [products, searchTerm, categoryFilter, selectedWarehouse]);

  // --- Simulator Logic ---
  const simulatedNewCost = useMemo(() => {
    if (!simulatorProduct) return 0;
    
    // Simulator uses GLOBAL stock for WAC calculation because new purchases usually affect the global WAC or main warehouse
    // But for simplicity, let's use the product's total stock as WAC is typically calculated on total inventory value
    const currentTotalVal = simulatorProduct.stock * simulatorProduct.cost; // Using global stock/cost
    const incomingVal = (simQty * simPrice) + simExtraCost; 
    const totalQty = simulatorProduct.stock + simQty;
    return totalQty > 0 ? (currentTotalVal + incomingVal) / totalQty : 0;
  }, [simulatorProduct, simQty, simPrice, simExtraCost]);

  // --- Chart Data ---
  const marginDistributionData = useMemo(() => {
    const high = processedProducts.filter(p => p.marginPercent >= 30).length;
    const medium = processedProducts.filter(p => p.marginPercent >= 15 && p.marginPercent < 30).length;
    const low = processedProducts.filter(p => p.marginPercent < 15).length;
    return [
      { name: 'High Margin (>30%)', value: high, color: '#10b981' },
      { name: 'Healthy (15-30%)', value: medium, color: '#f59e0b' },
      { name: 'Low Margin (<15%)', value: low, color: '#ef4444' },
    ];
  }, [processedProducts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            {t('cost_analysis_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('cost_analysis_desc')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Warehouse Filter */}
          <div className="relative">
            <Building className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* Date Presets */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={() => setPresetDate(7)} className="px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors dark:text-gray-300">7D</button>
            <button onClick={() => setPresetDate(30)} className="px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors dark:text-gray-300">30D</button>
            <button onClick={() => setPresetDate(90)} className="px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors dark:text-gray-300">90D</button>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent border-0 text-sm focus:ring-0 dark:text-white w-28"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent border-0 text-sm focus:ring-0 dark:text-white w-28"
            />
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Snapshot Cards (Inventory State) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_inventory_value')}</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white relative z-10">{formatCurrency(totalInventoryValue)}</h3>
          <p className="text-xs text-gray-400 mt-1 relative z-10">Based on current WAC {selectedWarehouse !== 'All' ? `(${warehouses.find(w=>w.id===selectedWarehouse)?.name})` : ''}</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('potential_profit')}</p>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white relative z-10">{formatCurrency(potentialProfit)}</h3>
          <p className="text-xs text-gray-400 mt-1 relative z-10">Unrealized profit on current stock</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        {/* Flow Metrics (Performance) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('cogs')}</p>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white relative z-10">{formatCurrency(metrics.cogs)}</h3>
          <p className="text-xs text-gray-400 mt-1 relative z-10">Period Cost of Goods Sold</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Realized Gross Profit</p>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.grossProfit)}</h3>
            <span className={`text-sm font-medium mb-1 ${metrics.grossMargin > 30 ? 'text-green-500' : metrics.grossMargin > 15 ? 'text-yellow-500' : 'text-red-500'}`}>
              {metrics.grossMargin.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 relative z-10">Revenue - COGS (Period)</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      </div>

      {/* Profitability Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profitability Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} minTickGap={30} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
            />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#6366f1" fill="url(#colorRevenue)" name="Revenue" />
            <Area type="monotone" dataKey="profit" stackId="2" stroke="#10b981" fill="url(#colorProfit)" name="Gross Profit" />
            <Line type="monotone" dataKey="cogs" stroke="#f97316" strokeDasharray="5 5" name="COGS" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-900 dark:text-white">Product Cost Breakdown</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">{t('product_name')}</th>
                    <th className="px-6 py-4 text-right">{t('stock_level')}</th>
                    <th className="px-6 py-4 text-right">{t('avg_cost')}</th>
                    <th className="px-6 py-4 text-right">{t('selling_price')}</th>
                    <th className="px-6 py-4 text-right">{t('margin_percent')}</th>
                    <th className="px-6 py-4 text-right">Simulate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {processedProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{p.stock}</td>
                      <td className="px-6 py-4 text-right font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(p.cost)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          p.marginPercent < 15 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          p.marginPercent < 30 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {p.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSimulatorProduct(p);
                            setSimPrice(p.cost); // Default to current cost as baseline
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-600 dark:text-indigo-400 transition-colors"
                          title="Simulate Cost Change"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Simulator & Charts */}
        <div className="flex flex-col gap-6">
          
          {/* Cost Simulator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              {t('cost_simulation')}
            </h3>
            
            {simulatorProduct ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800">
                  <span className="text-gray-500 block text-xs uppercase tracking-wider">Target Product</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-2">{simulatorProduct.name}</span>
                  <div className="flex justify-between text-xs border-t border-indigo-200 dark:border-indigo-800 pt-2">
                    <span>Global Stock: {simulatorProduct.stock}</span>
                    <span>WAC: {formatCurrency(simulatorProduct.cost)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('sim_purchase_qty')}</label>
                    <input 
                      type="number" 
                      value={simQty}
                      onChange={(e) => setSimQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('sim_unit_price')}</label>
                    <input 
                      type="number" 
                      value={simPrice}
                      onChange={(e) => setSimPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('sim_additional_cost')}</label>
                  <input 
                    type="number" 
                    value={simExtraCost}
                    onChange={(e) => setSimExtraCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-gray-500">{t('sim_new_cost')}</span>
                    <span className={`text-xl font-bold ${simulatedNewCost > simulatorProduct.cost ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(simulatedNewCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">Impact:</span>
                    <span className={simulatedNewCost > simulatorProduct.cost ? 'text-red-500' : 'text-green-500'}>
                      {simulatedNewCost > simulatorProduct.cost ? '▲ Cost Increase' : '▼ Cost Decrease'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                Select a product from the table <br/> to simulate cost changes.
              </div>
            )}
          </div>

          {/* Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex-1 min-h-[300px] flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Margin Distribution</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marginDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {marginDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;

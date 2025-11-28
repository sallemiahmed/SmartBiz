import React, { useState } from 'react';
import { 
  Search, FileInput, FileOutput, Users, Truck, Package, 
  Banknote, TrendingUp, ArrowLeft, Download, Printer, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';

// --- Types ---

type ReportType = 'summary' | 'transactions' | 'chart' | 'invoice_list' | 'product_metrics';

interface ReportConfig {
  title: string;
  type: ReportType;
  columns?: { header: string; key: string; isCurrency?: boolean; color?: (val: any) => string }[];
  dataGenerator: () => any[];
  summary?: { label: string; value: string }[];
}

const Reports: React.FC = () => {
  const { invoices, clients, suppliers, products, purchases, formatCurrency, chartData } = useApp();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIC ENGINE ---

  // 1. Sales Logic: Aggregate Invoices by Client
  const getSalesByCustomer = () => {
    // We already update clients totalSpent in context, but for reporting we might want to recalculate from invoices if we added filters
    return clients.sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // 2. VAT Logic: Derive from Invoices
  const getSalesVAT = () => {
    return invoices.map(inv => ({
      date: inv.date,
      ref: inv.number,
      entity: inv.clientName,
      amount: inv.amount,
      vat: inv.amount * 0.19, // Assuming 19% VAT for demo calculation, ideally derived from invoice items tax
      total: inv.amount * 1.19
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 3. Product Profit Logic: (Price - Cost) * Estimated Sales
  const getProductPerformance = () => {
    // In a real app we would query invoice items. 
    // Here we can assume sales = initial stock (e.g. 100) - current stock? 
    // Or just use the product properties for demo.
    return products.map(product => {
      const margin = product.price - product.cost;
      const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;
      // Using a heuristic for sold count in this demo context since we don't have a separate SalesItems table readily available
      // In production, we'd iterate all invoices -> items to count exactly.
      const estimatedUnitsSold = Math.max(0, 100 - product.stock); 
      const totalRevenue = estimatedUnitsSold * product.price;
      const totalProfit = estimatedUnitsSold * margin;

      return {
        name: product.name,
        category: product.category,
        unitsSold: estimatedUnitsSold,
        revenue: totalRevenue,
        profit: totalProfit,
        margin: marginPercent
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  // 4. Inventory Value Logic
  const getStockMovements = () => {
    // Use invoices and purchases to generate a movement log
    const salesMovements = invoices.flatMap(inv => 
      inv.items.map(item => ({
        date: inv.date,
        ref: inv.number,
        entity: item.description,
        type: 'Out',
        qty: item.quantity,
        balance: 'N/A' // Balance history is hard without a ledger
      }))
    );

    const purchaseMovements = purchases.flatMap(po => 
      po.items.map(item => ({
        date: po.date,
        ref: po.number,
        entity: item.description,
        type: 'In',
        qty: item.quantity,
        balance: 'N/A'
      }))
    );

    return [...salesMovements, ...purchaseMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 5. Supplier Logic
  const getSupplierPurchases = () => {
    return suppliers.map(s => ({
      company: s.company,
      category: s.category,
      netAmount: s.totalPurchased / 1.19, 
      tax: s.totalPurchased - (s.totalPurchased / 1.19),
      total: s.totalPurchased
    }));
  };

  // --- REPORT CONFIGURATION ---

  const getReportConfig = (reportName: string): ReportConfig => {
    switch (reportName) {
      // === SALES ===
      case 'Customers sales':
      case 'Customer turnover':
        const salesData = getSalesByCustomer();
        return {
          title: 'Sales by Customer',
          type: 'summary',
          columns: [
            { header: 'Customer', key: 'company' },
            { header: 'Contact', key: 'name' },
            { header: 'Total Revenue', key: 'totalSpent', isCurrency: true }
          ],
          dataGenerator: () => salesData,
          summary: [
            { label: 'Total Revenue', value: formatCurrency(salesData.reduce((acc, c) => acc + c.totalSpent, 0)) },
            { label: 'Active Clients', value: salesData.length.toString() }
          ]
        };

      case 'Sales VAT':
        const vatData = getSalesVAT();
        return {
          title: 'Sales VAT Declaration (19%)',
          type: 'transactions',
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Invoice', key: 'ref' },
            { header: 'Client', key: 'entity' },
            { header: 'Net Amount', key: 'amount', isCurrency: true },
            { header: 'VAT (19%)', key: 'vat', isCurrency: true }
          ],
          dataGenerator: () => vatData,
          summary: [
            { label: 'Total VAT Collected', value: formatCurrency(vatData.reduce((acc, r) => acc + r.vat, 0)) }
          ]
        };

      case 'Customers transactions':
        return {
          title: 'Customer Transaction History',
          type: 'transactions',
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Invoice', key: 'number' }, 
            { header: 'Customer', key: 'clientName' },
            { header: 'Status', key: 'status', color: (v) => v === 'paid' ? 'text-green-600' : 'text-orange-600' },
            { header: 'Amount', key: 'amount', isCurrency: true }
          ],
          dataGenerator: () => invoices
        };

      // === PURCHASES ===
      case 'Suppliers purchases':
        const suppData = getSupplierPurchases();
        return {
          title: 'Purchases by Supplier',
          type: 'summary',
          columns: [
            { header: 'Supplier', key: 'company' },
            { header: 'Category', key: 'category' },
            { header: 'Net Amount', key: 'netAmount', isCurrency: true },
            { header: 'Total (inc. Tax)', key: 'total', isCurrency: true }
          ],
          dataGenerator: () => suppData
        };

      case 'Purchase VAT':
        const purVatData = getSupplierPurchases();
        return {
          title: 'Input VAT (Recoverable)',
          type: 'transactions',
          columns: [
            { header: 'Supplier', key: 'company' },
            { header: 'Category', key: 'category' },
            { header: 'Total Spend', key: 'total', isCurrency: true },
            { header: 'VAT Portion', key: 'tax', isCurrency: true }
          ],
          dataGenerator: () => purVatData,
          summary: [
             { label: 'Total Recoverable VAT', value: formatCurrency(purVatData.reduce((acc, s) => acc + s.tax, 0)) }
          ]
        };

      // === PRODUCT / INVENTORY ===
      case 'Sales Details by Product Line':
      case 'Profit by Product':
      case 'Commercial profit per product.':
        const prodData = getProductPerformance();
        return {
          title: 'Product Performance & Margins',
          type: 'product_metrics',
          columns: [
            { header: 'Product', key: 'name' },
            { header: 'Est. Sold', key: 'unitsSold' },
            { header: 'Revenue', key: 'revenue', isCurrency: true },
            { header: 'Profit', key: 'profit', isCurrency: true, color: (v) => v > 0 ? 'text-green-600' : 'text-red-600' },
            { header: 'Margin %', key: 'margin', color: (v) => v > 30 ? 'text-green-600' : 'text-gray-600' }
          ],
          dataGenerator: () => prodData,
          summary: [
            { label: 'Total Profit', value: formatCurrency(prodData.reduce((acc, p) => acc + p.profit, 0)) }
          ]
        };

      case 'Detailed Stock Movements':
        return {
          title: 'Stock Movements Log',
          type: 'transactions',
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Reference', key: 'ref' },
            { header: 'Product', key: 'entity' },
            { header: 'Type', key: 'type', color: (v) => v === 'In' ? 'text-green-600' : 'text-red-600' },
            { header: 'Qty', key: 'qty' },
            { header: 'Balance', key: 'balance' }
          ],
          dataGenerator: () => getStockMovements()
        };

      // === FINANCIALS ===
      case 'Monthly Profit':
        // Use real chartData from context instead of mock
        const financialData = chartData.map(d => ({
          ...d,
          profit: d.revenue - d.expenses,
          margin: d.revenue > 0 ? ((d.revenue - d.expenses) / d.revenue * 100).toFixed(1) : 0
        }));
        return {
          title: 'Monthly Financial Overview',
          type: 'chart',
          dataGenerator: () => financialData
        };

      case 'Unpaid Invoices Over One Month':
        return {
          title: 'Aging Receivables',
          type: 'invoice_list',
          dataGenerator: () => invoices.filter(i => i.status === 'overdue' || i.status === 'pending')
        };

      default:
        // Generic fallback for unmapped reports
        return {
          title: reportName,
          type: 'summary',
          columns: [{ header: 'Name', key: 'name' }],
          dataGenerator: () => []
        };
    }
  };

  // --- RENDERERS ---

  const renderSummaryCards = (summary?: {label: string, value: string}[]) => {
    if (!summary) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summary.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = (config: ReportConfig) => {
    const data = config.dataGenerator();
    const cols = config.columns || [];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                {cols.map((col, i) => <th key={i} className="px-6 py-4">{col.header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {cols.map((col, j) => {
                    let val = row[col.key];
                    if (col.isCurrency && typeof val === 'number') {
                      val = formatCurrency(val);
                    } else if (typeof val === 'number' && col.key === 'margin') { 
                      val = `${val}%`;
                    }

                    const textColor = col.color ? col.color(row[col.key]) : 'text-gray-900 dark:text-white';
                    
                    return (
                      <td key={j} className={`px-6 py-4 ${textColor}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={cols.length} className="p-8 text-center text-gray-500">No data available for this report.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCharts = (config: ReportConfig) => {
    const data = config.dataGenerator();
    return (
      <div className="space-y-6">
        {/* Main Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profit Margin Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" hide />
                <YAxis unit="%" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={3} dot={{r:4}} name="Margin %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80 flex flex-col justify-center items-center text-gray-500">
             <p>Additional Metric Visualization</p>
             <p className="text-xs mt-2">Charts auto-scale based on selected timeframe</p>
           </div>
        </div>
      </div>
    );
  };

  // --- MAIN VIEW ---

  if (activeReport) {
    const config = getReportConfig(activeReport);

    return (
      <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveReport(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time data generated from system records
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
              <Printer className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {renderSummaryCards(config.summary)}
        
        {config.type === 'chart' 
          ? renderCharts(config) 
          : renderTable(config)
        }
      </div>
    );
  }

  // --- DASHBOARD NAVIGATION ---

  const reportSections = [
    {
      title: 'Sales Report',
      icon: FileOutput,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      links: ['Customers sales', 'Sales Details by Product Line', 'Customers transactions', 'Sales VAT']
    },
    {
      title: 'Purchase Report',
      icon: FileInput,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      links: ['Suppliers purchases', 'Purchase VAT', 'Supplier turnover']
    },
    {
      title: 'Inventory & Stock',
      icon: Package,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      links: ['Detailed Stock Movements', 'Profit by Product']
    },
    {
      title: 'Financials',
      icon: Banknote,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      links: ['Monthly Profit', 'Unpaid Invoices Over One Month']
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
           <p className="text-sm text-gray-500 dark:text-gray-400">Select a category to view detailed metrics.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Find a report..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {reportSections.map((section, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-2.5 rounded-lg ${section.color}`}>
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>
            
            <ul className="space-y-2 flex-1">
              {section.links.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase())).map((link, linkIndex) => (
                <li key={linkIndex}>
                  <button 
                    onClick={() => setActiveReport(link)}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg text-left flex items-center justify-between group transition-colors"
                  >
                    <span>{link}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
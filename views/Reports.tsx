
import React, { useState, useMemo } from 'react';
import { 
  Search, FileInput, FileOutput, Users, Truck, Package, 
  Banknote, TrendingUp, ArrowLeft, Download, Printer, ArrowRight,
  Filter, Calendar, ChevronDown, ChevronRight, BarChart2, PieChart,
  DollarSign, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Invoice, Product, Client } from '../types';

// --- Types ---

type ReportType = 'summary' | 'transactions' | 'chart' | 'invoice_list' | 'product_metrics' | 'detailed_product' | 'detailed_customer' | 'financial_statement';

interface ReportConfig {
  title: string;
  type: ReportType;
  columns?: { header: string; key: string; isCurrency?: boolean; color?: (val: any) => string }[];
  dataGenerator: () => any[];
  summary?: { label: string; value: string }[];
}

const Reports: React.FC = () => {
  const { invoices, clients, suppliers, products, purchases, warehouses, bankTransactions, cashTransactions, formatCurrency, chartData, t, settings } = useApp();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIC ENGINE ---

  // 1. Sales Logic: Aggregate Invoices by Client
  const getSalesByCustomer = () => {
    return clients.sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // 2. VAT Logic: Derive from Invoices
  const getSalesVAT = () => {
    return invoices.map(inv => ({
      date: inv.date,
      ref: inv.number,
      entity: inv.clientName,
      amount: inv.amount,
      vat: inv.amount * 0.19, 
      total: inv.amount * 1.19
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 3. Product Profit Logic
  const getProductPerformance = () => {
    return products.map(product => {
      const margin = product.price - product.cost;
      const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;
      // Heuristic: assuming some units sold based on stock level changes or mock data logic
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
    const salesMovements = invoices.flatMap(inv => 
      inv.items.map(item => ({
        date: inv.date,
        ref: inv.number,
        entity: item.description,
        type: 'Out',
        qty: item.quantity,
        balance: 'N/A' 
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

  // 6. Financial Logic (P&L, Cash Flow, Trial Balance)
  const getProfitAndLoss = () => {
    // REVENUE
    const totalSales = invoices.filter(i => i.type === 'invoice' && i.status !== 'draft').reduce((acc, i) => acc + i.amount, 0);
    const returns = invoices.filter(i => i.type === 'credit').reduce((acc, i) => acc + i.amount, 0);
    const netSales = totalSales - returns;

    // COGS (Approximate based on products sold)
    let cogs = 0;
    invoices.filter(i => i.type === 'invoice' && i.status !== 'draft').forEach(inv => {
      inv.items.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod) cogs += (prod.cost * item.quantity);
      });
    });

    const grossProfit = netSales - cogs;

    // EXPENSES (From Purchases marked as invoices & Cash Expenses)
    const purchaseExpenses = purchases.filter(p => p.type === 'invoice').reduce((acc, p) => acc + p.amount, 0);
    const cashExpenses = cashTransactions.filter(t => t.type === 'expense').reduce((acc, t) => Math.abs(t.amount), 0);
    const bankFees = bankTransactions.filter(t => t.type === 'fee' || t.type === 'payment').reduce((acc, t) => Math.abs(t.amount), 0);
    
    const totalExpenses = purchaseExpenses + cashExpenses + bankFees;
    const netProfit = grossProfit - totalExpenses;

    return [
      { category: 'Income', items: [
        { name: 'Sales Revenue', value: totalSales },
        { name: 'Returns & Allowances', value: -returns },
        { name: 'Net Sales', value: netSales, isTotal: true }
      ]},
      { category: 'Cost of Goods Sold', items: [
        { name: 'Cost of Goods Sold', value: -cogs },
        { name: 'Gross Profit', value: grossProfit, isTotal: true }
      ]},
      { category: 'Operating Expenses', items: [
        { name: 'Purchases / Suppliers', value: -purchaseExpenses },
        { name: 'Cash Expenses', value: -cashExpenses },
        { name: 'Bank Fees & Payments', value: -bankFees },
        { name: 'Total Expenses', value: -totalExpenses, isTotal: true }
      ]},
      { category: 'Net Income', items: [
        { name: 'Net Profit / (Loss)', value: netProfit, isTotal: true, isHighlight: true }
      ]}
    ];
  };

  const getCashFlow = () => {
    // OPERATING ACTIVITIES
    const collections = bankTransactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + t.amount, 0) 
                      + cashTransactions.filter(t => t.type === 'sale').reduce((acc, t) => t.amount, 0);
    
    const payments = bankTransactions.filter(t => t.type === 'payment' || t.type === 'withdrawal' || t.type === 'fee').reduce((acc, t) => Math.abs(t.amount), 0)
                   + cashTransactions.filter(t => t.type === 'expense' || t.type === 'withdrawal').reduce((acc, t) => Math.abs(t.amount), 0);

    const netCash = collections - payments;

    return [
      { category: 'Cash Inflow', items: [
        { name: 'Customer Collections', value: collections },
        { name: 'Total Inflow', value: collections, isTotal: true }
      ]},
      { category: 'Cash Outflow', items: [
        { name: 'Supplier Payments & Expenses', value: -payments },
        { name: 'Total Outflow', value: -payments, isTotal: true }
      ]},
      { category: 'Net Cash Flow', items: [
        { name: 'Net Increase / (Decrease) in Cash', value: netCash, isTotal: true, isHighlight: true }
      ]}
    ];
  };

  const getTrialBalance = () => {
    // Assets
    const bankBalance = bankTransactions.reduce((acc, t) => acc + t.amount, 0); // Simplified
    const cashBalance = cashTransactions.reduce((acc, t) => acc + t.amount, 0); // Simplified
    const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const receivables = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);

    // Liabilities
    const payables = purchases.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

    // Equity (Simplified: Assets - Liabilities)
    const equity = (bankBalance + cashBalance + inventoryValue + receivables) - payables;

    return [
      { category: 'Assets', items: [
        { name: 'Cash on Hand', value: cashBalance },
        { name: 'Bank Accounts', value: bankBalance },
        { name: 'Accounts Receivable', value: receivables },
        { name: 'Inventory Asset', value: inventoryValue },
        { name: 'Total Assets', value: cashBalance + bankBalance + receivables + inventoryValue, isTotal: true }
      ]},
      { category: 'Liabilities', items: [
        { name: 'Accounts Payable', value: payables },
        { name: 'Total Liabilities', value: payables, isTotal: true }
      ]},
      { category: 'Equity', items: [
        { name: 'Owner\'s Equity', value: equity },
        { name: 'Total Equity', value: equity, isTotal: true }
      ]}
    ];
  };

  // --- REPORT CONFIGURATION ---

  const getReportConfig = (reportKey: string): ReportConfig => {
    switch (reportKey) {
      // === SALES ===
      case 'rep_sales_customer':
        const salesData = getSalesByCustomer();
        return {
          title: t('rep_sales_customer'),
          type: 'summary',
          columns: [
            { header: t('company_contact'), key: 'company' },
            { header: 'Contact', key: 'name' },
            { header: t('total_revenue'), key: 'totalSpent', isCurrency: true }
          ],
          dataGenerator: () => salesData,
          summary: [
            { label: t('total_revenue'), value: formatCurrency(salesData.reduce((acc, c) => acc + c.totalSpent, 0)) },
            { label: t('active_clients'), value: salesData.length.toString() }
          ]
        };

      case 'rep_sales_customer_detailed':
        return {
          title: t('rep_sales_customer_detailed'),
          type: 'detailed_customer',
          dataGenerator: () => [] 
        };

      case 'rep_sales_product_detailed':
        return {
          title: t('rep_sales_product_detailed'),
          type: 'detailed_product',
          dataGenerator: () => []
        };

      case 'rep_sales_vat':
        const vatData = getSalesVAT();
        return {
          title: t('rep_sales_vat'),
          type: 'transactions',
          columns: [
            { header: t('date'), key: 'date' },
            { header: t('invoice'), key: 'ref' },
            { header: t('client'), key: 'entity' },
            { header: t('amount'), key: 'amount', isCurrency: true },
            { header: t('tax'), key: 'vat', isCurrency: true }
          ],
          dataGenerator: () => vatData,
          summary: [
            { label: 'Total VAT Collected', value: formatCurrency(vatData.reduce((acc, r) => acc + r.vat, 0)) }
          ]
        };

      case 'rep_cust_trans':
        return {
          title: t('rep_cust_trans'),
          type: 'transactions',
          columns: [
            { header: t('date'), key: 'date' },
            { header: t('invoice'), key: 'number' }, 
            { header: t('client'), key: 'clientName' },
            { header: t('status'), key: 'status', color: (v) => v === 'paid' ? 'text-green-600' : 'text-orange-600' },
            { header: t('amount'), key: 'amount', isCurrency: true }
          ],
          dataGenerator: () => invoices
        };

      // === PURCHASES ===
      case 'rep_supp_purch':
        const suppData = getSupplierPurchases();
        return {
          title: t('rep_supp_purch'),
          type: 'summary',
          columns: [
            { header: t('supplier_management'), key: 'company' },
            { header: t('category'), key: 'category' },
            { header: t('amount'), key: 'netAmount', isCurrency: true },
            { header: t('total'), key: 'total', isCurrency: true }
          ],
          dataGenerator: () => suppData
        };

      case 'rep_purch_vat':
        const purVatData = getSupplierPurchases();
        return {
          title: t('rep_purch_vat'),
          type: 'transactions',
          columns: [
            { header: t('supplier_management'), key: 'company' },
            { header: t('category'), key: 'category' },
            { header: t('total'), key: 'total', isCurrency: true },
            { header: t('tax'), key: 'tax', isCurrency: true }
          ],
          dataGenerator: () => purVatData,
          summary: [
             { label: 'Total Recoverable VAT', value: formatCurrency(purVatData.reduce((acc, s) => acc + s.tax, 0)) }
          ]
        };

      // === PRODUCT / INVENTORY ===
      case 'rep_prod_perf':
        const prodData = getProductPerformance();
        return {
          title: t('rep_prod_perf'),
          type: 'product_metrics',
          columns: [
            { header: t('product_name'), key: 'name' },
            { header: 'Est. Sold', key: 'unitsSold' },
            { header: t('total_revenue'), key: 'revenue', isCurrency: true },
            { header: 'Profit', key: 'profit', isCurrency: true, color: (v) => v > 0 ? 'text-green-600' : 'text-red-600' },
            { header: 'Margin %', key: 'margin', color: (v) => v > 30 ? 'text-green-600' : 'text-gray-600' }
          ],
          dataGenerator: () => prodData,
          summary: [
            { label: 'Total Profit', value: formatCurrency(prodData.reduce((acc, p) => acc + p.profit, 0)) }
          ]
        };

      case 'rep_stock_mov':
        return {
          title: t('rep_stock_mov'),
          type: 'transactions',
          columns: [
            { header: t('date'), key: 'date' },
            { header: t('ref_num'), key: 'ref' },
            { header: t('product_name'), key: 'entity' },
            { header: t('type'), key: 'type', color: (v) => v === 'In' ? 'text-green-600' : 'text-red-600' },
            { header: t('stock_qty'), key: 'qty' },
            { header: 'Balance', key: 'balance' }
          ],
          dataGenerator: () => getStockMovements()
        };

      // === FINANCIALS ===
      case 'rep_monthly_profit':
        const financialData = chartData.map(d => ({
          ...d,
          profit: d.revenue - d.expenses,
          margin: d.revenue > 0 ? ((d.revenue - d.expenses) / d.revenue * 100).toFixed(1) : 0
        }));
        return {
          title: t('rep_monthly_profit'),
          type: 'chart',
          dataGenerator: () => financialData
        };

      case 'rep_aging_receivables':
        return {
          title: t('rep_aging_receivables'),
          type: 'invoice_list',
          dataGenerator: () => invoices.filter(i => i.status === 'overdue' || i.status === 'pending')
        };

      case 'rep_pl':
        return {
          title: t('rep_pl'),
          type: 'financial_statement',
          dataGenerator: () => getProfitAndLoss()
        };

      case 'rep_cash_flow':
        return {
          title: t('rep_cash_flow'),
          type: 'financial_statement',
          dataGenerator: () => getCashFlow()
        };

      case 'rep_trial_balance':
        return {
          title: t('rep_trial_balance'),
          type: 'financial_statement',
          dataGenerator: () => getTrialBalance()
        };

      default:
        return {
          title: reportKey,
          type: 'summary',
          columns: [{ header: 'Name', key: 'name' }],
          dataGenerator: () => []
        };
    }
  };

  // --- RENDERERS ---

  const handlePrintFinancialReport = (config: ReportConfig) => {
    const data = config.dataGenerator();
    const isRTL = settings.language === 'ar';
    
    let htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px;">${settings.companyName}</h1>
          <h2 style="margin: 5px 0; font-size: 18px; color: #555;">${config.title}</h2>
          <p style="margin: 0; color: #777;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; direction: ${isRTL ? 'rtl' : 'ltr'};">
          <thead>
            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px; text-align: ${isRTL ? 'right' : 'left'};">Category / Item</th>
              <th style="padding: 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((group: any) => {
      htmlContent += `
        <tr style="background-color: #f9fafb;">
          <td colspan="2" style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #374151;">${group.category}</td>
        </tr>
      `;
      group.items.forEach((item: any) => {
        const isTotal = item.isTotal;
        const isHighlight = item.isHighlight;
        const style = isTotal 
          ? `font-weight: bold; border-top: 1px solid #d1d5db; ${isHighlight ? 'background-color: #e0e7ff; color: #3730a3;' : ''}` 
          : 'border-bottom: 1px solid #f3f4f6;';
        
        htmlContent += `
          <tr style="${style}">
            <td style="padding: 8px 24px;">${item.name}</td>
            <td style="padding: 8px 12px; text-align: right;">${formatCurrency(item.value)}</td>
          </tr>
        `;
      });
    });

    htmlContent += `
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af;">
          ${settings.companyName} - Confidential Financial Report
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${config.title}</title></head>
          <body>${htmlContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const renderFinancialStatement = (config: ReportConfig) => {
    const data = config.dataGenerator();
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">As of {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => handlePrintFinancialReport(config)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-right py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((group: any, idx: number) => (
                <React.Fragment key={idx}>
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={2} className="py-3 px-2 font-bold text-gray-800 dark:text-gray-200">{group.category}</td>
                  </tr>
                  {group.items.map((item: any, i: number) => (
                    <tr 
                      key={i} 
                      className={`
                        ${item.isTotal ? 'font-bold border-t border-gray-300 dark:border-gray-600' : 'border-b border-gray-100 dark:border-gray-800'}
                        ${item.isHighlight ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : ''}
                      `}
                    >
                      <td className={`py-2 px-2 ${item.isTotal ? '' : 'pl-8'}`}>{item.name}</td>
                      <td className={`py-2 px-2 text-right ${item.value < 0 ? 'text-red-500' : ''}`}>
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))}
                  {/* Spacer Row */}
                  <tr><td colSpan={2} className="py-2"></td></tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ... (DetailedProductReport, DetailedCustomerReport renderers remain unchanged)
  const DetailedProductReport: React.FC = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedWarehouse, setSelectedWarehouse] = useState('All');
    const [selectedSalesperson, setSelectedSalesperson] = useState('All');
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const salesPersons = ['All', ...Array.from(new Set(invoices.map(i => i.salespersonName).filter(Boolean) as string[]))];

    const processedData = useMemo(() => {
      return products.map(product => {
        // Find relevant invoice items
        const sales = invoices.filter(inv => {
          const inDate = !dateRange.start || inv.date >= dateRange.start;
          const inEnd = !dateRange.end || inv.date <= dateRange.end;
          const inWarehouse = selectedWarehouse === 'All' || inv.warehouseId === selectedWarehouse;
          const inSalesperson = selectedSalesperson === 'All' || inv.salespersonName === selectedSalesperson;
          return inDate && inEnd && inWarehouse && inSalesperson && (inv.type === 'invoice' || inv.type === 'order');
        }).flatMap(inv => {
          const item = inv.items.find(i => i.id === product.id);
          return item ? [{ ...item, invoice: inv }] : [];
        });

        const totalQty = sales.reduce((acc, s) => acc + s.quantity, 0);
        const totalRev = sales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
        const avgPrice = totalQty > 0 ? totalRev / totalQty : 0;
        const totalCost = totalQty * product.cost;
        const margin = totalRev - totalCost;

        // Generate trend data for this product
        const trendMap: Record<string, number> = {};
        sales.forEach(s => {
          const dateKey = s.invoice.date.substring(0, 7); // YYYY-MM
          trendMap[dateKey] = (trendMap[dateKey] || 0) + s.quantity;
        });
        const trends = Object.entries(trendMap).map(([date, qty]) => ({ date, qty })).sort((a,b) => a.date.localeCompare(b.date));

        return {
          ...product,
          totalQty,
          totalRev,
          avgPrice,
          margin,
          salesList: sales,
          trends
        };
      }).filter(p => {
        const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
        return catMatch;
      }).sort((a, b) => b.totalRev - a.totalRev);
    }, [products, invoices, dateRange, selectedCategory, selectedWarehouse, selectedSalesperson]);

    const chartData = processedData.slice(0, 10).map(p => ({
      name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
      revenue: p.totalRev
    }));

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            <option value="All">{t('all_categories')}</option>
            {categories.map(c => c !== 'All' && <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            <option value="All">All Warehouses</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={selectedSalesperson} onChange={e => setSelectedSalesperson(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            <option value="All">All Salespersons</option>
            {salesPersons.map(s => s !== 'All' && <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top 10 Products by Revenue</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#374151" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', color: '#fff', border: 'none' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center gap-4">
             <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
               <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_revenue')}</p>
               <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(processedData.reduce((acc, p) => acc + p.totalRev, 0))}</p>
             </div>
             <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
               <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
               <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(processedData.reduce((acc, p) => acc + p.margin, 0))}</p>
             </div>
             <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
               <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_sold')}</p>
               <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{processedData.reduce((acc, p) => acc + p.totalQty, 0)} units</p>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('product_name')}</th>
                <th className="px-6 py-4">{t('category')}</th>
                <th className="px-6 py-4 text-right">{t('total_sold')}</th>
                <th className="px-6 py-4 text-right">{t('avg_price')}</th>
                <th className="px-6 py-4 text-right">{t('total_revenue')}</th>
                <th className="px-6 py-4 text-right">{t('margin')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedData.map((p) => (
                <React.Fragment key={p.id}>
                  <tr 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-6 py-4 text-gray-500">{p.category}</td>
                    <td className="px-6 py-4 text-right font-mono">{p.totalQty}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(p.avgPrice)}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(p.totalRev)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${p.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.margin)}</td>
                    <td className="px-6 py-4 text-right">
                      {expandedProduct === p.id ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronRight className="w-4 h-4 inline" />}
                    </td>
                  </tr>
                  {expandedProduct === p.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Sales History</div>
                            {p.salesList.length === 0 ? <p className="text-sm italic text-gray-400">No sales records.</p> : (
                              <div className="overflow-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-500 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                      <th className="py-2 px-3 text-left">{t('date')}</th>
                                      <th className="py-2 px-3 text-left">{t('ref_num')}</th>
                                      <th className="py-2 px-3 text-left">{t('client')}</th>
                                      <th className="py-2 px-3 text-right">{t('quantity')}</th>
                                      <th className="py-2 px-3 text-right">{t('price')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.salesList.map((sale, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{sale.invoice.date}</td>
                                        <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-mono">{sale.invoice.number}</td>
                                        <td className="py-2 px-3 text-gray-900 dark:text-white">{sale.invoice.clientName}</td>
                                        <td className="py-2 px-3 text-right font-mono">{sale.quantity}</td>
                                        <td className="py-2 px-3 text-right">{formatCurrency(sale.price)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                          <div className="w-full lg:w-1/3">
                             <div className="text-xs font-bold text-gray-500 uppercase mb-2">Sales Trend (Qty)</div>
                             <div className="h-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={p.trends}>
                                    <defs>
                                      <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <RechartsTooltip contentStyle={{ fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="qty" stroke="#10b981" fillOpacity={1} fill="url(#colorQty)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const DetailedCustomerReport: React.FC = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [expandedClient, setExpandedClient] = useState<string | null>(null);

    const regions = ['All', ...Array.from(new Set(clients.map(c => c.region).filter(Boolean) as string[]))];
    const customerCategories = ['All', 'Retail', 'Wholesale', 'Corporate', 'Government'];

    const processedData = useMemo(() => {
      return clients.map(client => {
        const clientInvoices = invoices.filter(inv => {
          const inDate = !dateRange.start || inv.date >= dateRange.start;
          const inEnd = !dateRange.end || inv.date <= dateRange.end;
          return inDate && inEnd && inv.clientId === client.id;
        });

        const totalPurchases = clientInvoices.reduce((acc, i) => acc + i.amount, 0);
        const invoiceCount = clientInvoices.length;
        const balanceDue = clientInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);
        
        // Aggregate purchased products
        const productsMap = new Map<string, {name: string, qty: number, amount: number}>();
        clientInvoices.forEach(inv => {
          inv.items.forEach(item => {
            const existing = productsMap.get(item.id) || { name: item.description, qty: 0, amount: 0 };
            productsMap.set(item.id, {
              name: item.description,
              qty: existing.qty + item.quantity,
              amount: existing.amount + (item.price * item.quantity)
            });
          });
        });

        return {
          ...client,
          totalPurchases,
          invoiceCount,
          balanceDue,
          productsList: Array.from(productsMap.values()).sort((a,b) => b.amount - a.amount)
        };
      }).filter(c => {
        const regionMatch = selectedRegion === 'All' || c.region === selectedRegion;
        const statusMatch = selectedStatus === 'All' || c.status === selectedStatus;
        const categoryMatch = selectedCategory === 'All' || c.category === selectedCategory;
        return regionMatch && statusMatch && categoryMatch;
      }).sort((a, b) => b.totalPurchases - a.totalPurchases);
    }, [clients, invoices, dateRange, selectedRegion, selectedStatus, selectedCategory]);

    const chartData = processedData.slice(0, 10).map(c => ({
      name: c.company.substring(0, 15),
      sales: c.totalPurchases
    }));

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-white" />
          </div>
          <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            <option value="All">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            {customerCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm dark:text-white">
            <option value="All">{t('all_status')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top 10 Customers</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', color: '#fff', border: 'none' }} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center gap-4">
             <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
               <p className="text-sm text-gray-500 dark:text-gray-400">Avg Sales / Customer</p>
               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                 {formatCurrency(processedData.length > 0 ? processedData.reduce((acc, c) => acc + c.totalPurchases, 0) / processedData.length : 0)}
               </p>
             </div>
             <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
               <p className="text-sm text-gray-500 dark:text-gray-400">Total Outstanding</p>
               <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(processedData.reduce((acc, c) => acc + c.balanceDue, 0))}</p>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">{t('company_name')}</th>
                <th className="px-6 py-4">{t('region')}</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">{t('invoices_count')}</th>
                <th className="px-6 py-4 text-right">{t('total_revenue')}</th>
                <th className="px-6 py-4 text-right">{t('balance_due')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedData.map((c) => (
                <React.Fragment key={c.id}>
                  <tr 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setExpandedClient(expandedClient === c.id ? null : c.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.company}</td>
                    <td className="px-6 py-4 text-gray-500">{c.region || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{c.category || '-'}</td>
                    <td className="px-6 py-4 text-right font-mono">{c.invoiceCount}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.totalPurchases)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${c.balanceDue > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formatCurrency(c.balanceDue)}</td>
                    <td className="px-6 py-4 text-right">
                      {expandedClient === c.id ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronRight className="w-4 h-4 inline" />}
                    </td>
                  </tr>
                  {expandedClient === c.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Purchased Products</div>
                        {c.productsList.length === 0 ? <p className="text-sm italic text-gray-400">No purchases yet.</p> : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {c.productsList.map((prod, idx) => (
                              <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-xs">{prod.name}</div>
                                  <div className="text-gray-500 text-xs">Qty: {prod.qty}</div>
                                </div>
                                <div className="font-bold text-gray-700 dark:text-gray-300 text-xs">{formatCurrency(prod.amount)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
                      val = `${val.toFixed(1)}%`;
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
              <Download className="w-4 h-4" /> {t('export_report')}
            </button>
          </div>
        </div>

        {renderSummaryCards(config.summary)}
        
        {config.type === 'chart' 
          ? renderCharts(config)
          : config.type === 'financial_statement'
            ? renderFinancialStatement(config)
            : config.type === 'detailed_product'
              ? <DetailedProductReport />
              : config.type === 'detailed_customer'
                ? <DetailedCustomerReport />
                : renderTable(config)
        }
      </div>
    );
  }

  // --- DASHBOARD NAVIGATION ---

  const reportSections = [
    {
      title: t('sales_report'),
      icon: FileOutput,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      links: [
        { key: 'rep_sales_customer_detailed', label: t('rep_sales_customer_detailed') },
        { key: 'rep_sales_product_detailed', label: t('rep_sales_product_detailed') },
        { key: 'rep_sales_customer', label: t('rep_sales_customer') },
        { key: 'rep_prod_perf', label: t('rep_prod_perf') },
        { key: 'rep_cust_trans', label: t('rep_cust_trans') },
        { key: 'rep_sales_vat', label: t('rep_sales_vat') }
      ]
    },
    {
      title: t('purchase_report'),
      icon: FileInput,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      links: [
        { key: 'rep_supp_purch', label: t('rep_supp_purch') },
        { key: 'rep_purch_vat', label: t('rep_purch_vat') }
      ]
    },
    {
      title: t('inventory_stock_report'),
      icon: Package,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      links: [
        { key: 'rep_stock_mov', label: t('rep_stock_mov') },
        { key: 'rep_prod_perf', label: t('rep_prod_perf') }
      ]
    },
    {
      title: t('financials_report'),
      icon: Banknote,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      links: [
        { key: 'rep_pl', label: t('rep_pl') },
        { key: 'rep_cash_flow', label: t('rep_cash_flow') },
        { key: 'rep_trial_balance', label: t('rep_trial_balance') },
        { key: 'rep_monthly_profit', label: t('rep_monthly_profit') },
        { key: 'rep_aging_receivables', label: t('rep_aging_receivables') }
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports_analytics')}</h1>
           <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports_desc')}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('search')}
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
              {section.links.filter(l => l.label.toLowerCase().includes(searchTerm.toLowerCase())).map((link, linkIndex) => (
                <li key={linkIndex}>
                  <button 
                    onClick={() => setActiveReport(link.key)}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg text-left flex items-center justify-between group transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all rtl:rotate-180 rtl:translate-x-2 rtl:group-hover:translate-x-0" />
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

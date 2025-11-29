
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, DollarSign, 
  Trash2, X, BarChart2, CheckCircle, Tag
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ServiceSale, ServiceSaleItem, InvoiceItem } from '../types';
import SearchableSelect from '../components/SearchableSelect';
import StatsCard from '../components/StatsCard';

type ViewMode = 'dashboard' | 'list' | 'create' | 'reports';

const ServiceSales: React.FC = () => {
  const { serviceSales, addServiceSale, deleteServiceSale, createSalesDocument, clients, serviceCatalog, technicians, formatCurrency, settings, t } = useApp();
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  
  // Create/Edit Form State
  const [formData, setFormData] = useState<Partial<ServiceSale>>({
    status: 'draft',
    discountType: 'percent',
    discountValue: 0,
    items: []
  });

  // --- Handlers ---

  const handleCreateNew = () => {
    setFormData({
      reference: `SRV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      discountType: 'percent',
      discountValue: 0,
      taxRate: settings.taxRates.find(r => r.isDefault)?.rate || 0,
      items: []
    });
    setViewMode('create');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || formData.items?.length === 0) {
        alert("Please select a client and add at least one service.");
        return;
    }

    const client = clients.find(c => c.id === formData.clientId);
    const tech = technicians.find(t => t.id === formData.technicianId);

    // Calc totals
    const subtotal = formData.items!.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = formData.discountType === 'percent' 
        ? subtotal * (formData.discountValue! / 100) 
        : formData.discountValue!;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxable * ((formData.taxRate || 0) / 100);
    const total = taxable + taxAmount;

    const newSale: ServiceSale = {
        id: `ss-${Date.now()}`,
        reference: formData.reference || '',
        date: formData.date || '',
        clientId: formData.clientId,
        clientName: client?.company || 'Unknown',
        technicianId: formData.technicianId,
        technicianName: tech?.name,
        status: formData.status as any,
        items: formData.items as any,
        subtotal,
        discountType: formData.discountType as any,
        discountValue: formData.discountValue || 0,
        discountAmount,
        taxRate: formData.taxRate || 0,
        taxAmount,
        total,
        notes: formData.notes
    };

    addServiceSale(newSale);

    // --- INTEGRATION: Create Financial Invoice ---
    // If sale is confirmed (not draft), generate a corresponding invoice in the general ledger
    if (newSale.status !== 'draft') {
        const invoiceItems: InvoiceItem[] = newSale.items.map(item => ({
            id: item.serviceId || `srv-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
            description: item.description,
            quantity: item.quantity,
            price: item.unitPrice
        }));

        createSalesDocument('invoice', {
            clientId: newSale.clientId,
            clientName: newSale.clientName,
            date: newSale.date,
            dueDate: newSale.date, // Due immediately for service sales usually
            amount: newSale.total,
            status: newSale.status === 'paid' ? 'paid' : 'pending',
            paymentTerms: 'Due on Receipt',
            notes: `Auto-generated from Service Sale #${newSale.reference}. Technician: ${newSale.technicianName || 'N/A'}`,
            taxRate: newSale.taxRate,
            subtotal: newSale.subtotal,
            discount: newSale.discountAmount,
            discountValue: newSale.discountValue,
            discountType: newSale.discountType,
            linkedDocumentId: newSale.id 
        }, invoiceItems);
    }
    // ---------------------------------------------

    setViewMode('list');
  };

  const addItem = () => {
    setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const updateItem = (index: number, field: keyof ServiceSaleItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calc total
    if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Auto fill from catalog if serviceId selected
    if (field === 'serviceId') {
        const service = serviceCatalog.find(s => s.id === value);
        if (service) {
            newItems[index].description = service.name;
            newItems[index].unitPrice = service.basePrice;
            newItems[index].total = newItems[index].quantity * service.basePrice;
        }
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleDelete = (id: string) => {
      if(confirm("Delete this sale record?")) {
          deleteServiceSale(id);
      }
  };

  // --- Filtering & Stats ---

  const filteredSales = serviceSales.filter(s => {
      const matchSearch = s.reference.toLowerCase().includes(searchTerm.toLowerCase()) || s.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchTech = techFilter === 'all' || s.technicianId === techFilter;
      return matchSearch && matchStatus && matchTech;
  });

  const totalRevenue = serviceSales.reduce((acc, s) => acc + s.total, 0);
  const totalServicesSold = serviceSales.reduce((acc, s) => acc + s.items.length, 0);
  const avgTicket = serviceSales.length > 0 ? totalRevenue / serviceSales.length : 0;

  // Chart Data
  const revenueTrend = useMemo(() => {
      const data: any[] = [];
      const grouped = serviceSales.reduce((acc, s) => {
          acc[s.date] = (acc[s.date] || 0) + s.total;
          return acc;
      }, {} as Record<string, number>);
      
      Object.keys(grouped).sort().forEach(date => {
          data.push({ date, revenue: grouped[date] });
      });
      return data.slice(-7); 
  }, [serviceSales]);

  const topCategories = useMemo(() => {
      return [
          { name: 'Repair', value: 45, color: '#4f46e5' },
          { name: 'Maintenance', value: 30, color: '#10b981' },
          { name: 'Installation', value: 15, color: '#f59e0b' },
          { name: 'Consulting', value: 10, color: '#6366f1' }
      ];
  }, []);

  const techPerformance = useMemo(() => {
      return technicians.map(tech => {
          const sales = serviceSales.filter(s => s.technicianId === tech.id);
          return {
              name: tech.name,
              revenue: sales.reduce((acc, s) => acc + s.total, 0),
              count: sales.length
          };
      }).sort((a,b) => b.revenue - a.revenue);
  }, [serviceSales, technicians]);


  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} trend="+12%" trendUp={true} icon={DollarSign} color="bg-indigo-500" />
            <StatsCard title="Services Sold" value={totalServicesSold.toString()} trend="+5%" trendUp={true} icon={Tag} color="bg-emerald-500" />
            <StatsCard title="Avg. Ticket Size" value={formatCurrency(avgTicket)} trend="-2%" trendUp={false} icon={BarChart2} color="bg-blue-500" />
            <StatsCard title="Conversion Rate" value="68%" trend="+4%" trendUp={true} icon={CheckCircle} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="date" hide />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', color: '#fff', border: 'none' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{r:4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Service Categories</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={topCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {topCategories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Technician Leaderboard</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">Technician</th>
                            <th className="px-4 py-3 text-right">Jobs Completed</th>
                            <th className="px-4 py-3 text-right">Revenue Generated</th>
                            <th className="px-4 py-3 text-right">Efficiency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {techPerformance.map((tech, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 font-bold text-gray-500">#{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tech.name}</td>
                                <td className="px-4 py-3 text-right">{tech.count}</td>
                                <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(tech.revenue)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end text-yellow-400 text-xs">★★★★☆</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Ref #, Client..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none"
            >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
            </select>
            <select 
                value={techFilter} 
                onChange={(e) => setTechFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white outline-none"
            >
                <option value="all">All Technicians</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                        <th className="px-6 py-4">Ref #</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Technician</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSales.map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400 font-medium">{sale.reference}</td>
                            <td className="px-6 py-4 text-gray-500">{sale.date}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.clientName}</td>
                            <td className="px-6 py-4 text-gray-500">{sale.technicianName || '-'}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                    ${sale.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                      sale.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {sale.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete(sale.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredSales.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">No records found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderCreateForm = () => (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in slide-in-from-right-4 duration-300">
        {/* Left Column: Data Entry */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            
            {/* Section 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider text-indigo-600 dark:text-indigo-400">Client & Logistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Customer</label>
                        <SearchableSelect 
                            options={clients.map(c => ({ value: c.id, label: c.company }))}
                            value={formData.clientId || ''}
                            onChange={(val) => setFormData({...formData, clientId: val})}
                            placeholder="Select Client..."
                            className="w-full rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
                        <input 
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Technician</label>
                        <select 
                            value={formData.technicianId || ''}
                            onChange={e => setFormData({...formData, technicianId: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Unassigned</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                        <select 
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as any})}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending Payment</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider text-indigo-600 dark:text-indigo-400">Service Line Items</h3>
                <div className="space-y-3">
                    {formData.items?.map((item, idx) => (
                        <div key={item.id} className="flex gap-2 items-center">
                            <div className="flex-1">
                                <SearchableSelect 
                                    options={serviceCatalog.map(s => ({ value: s.id, label: s.name }))}
                                    value={item.serviceId || ''}
                                    onChange={(val) => updateItem(idx, 'serviceId', val)}
                                    placeholder="Select Service..."
                                    className="w-full rounded-lg"
                                />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Description" 
                                value={item.description}
                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                            />
                            <input 
                                type="number" 
                                placeholder="Qty" 
                                value={item.quantity}
                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                            />
                            <input 
                                type="number" 
                                placeholder="Price" 
                                value={item.unitPrice}
                                onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                                className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                            />
                            <div className="w-24 text-right font-medium dark:text-white">{formatCurrency(item.total)}</div>
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                    
                    <button 
                        onClick={addItem}
                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Line Item
                    </button>
                </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-xs tracking-wider">Internal Notes</h3>
                <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    placeholder="Notes visible only to staff..."
                />
            </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Summary</h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(formData.items?.reduce((a, b) => a + b.total, 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Discount</span>
                        <div className="flex items-center gap-1">
                            <input 
                                type="number" 
                                value={formData.discountValue}
                                onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                                className="w-12 px-1 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-right"
                            />
                            <select 
                                value={formData.discountType}
                                onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                                className="bg-transparent border-none text-xs"
                            >
                                <option value="percent">%</option>
                                <option value="amount">$</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax ({formData.taxRate}%)</span>
                        <span>{formatCurrency(
                            Math.max(0, (formData.items?.reduce((a, b) => a + b.total, 0) || 0) - (formData.discountType === 'percent' ? (formData.items?.reduce((a, b) => a + b.total, 0) || 0) * (formData.discountValue!/100) : formData.discountValue!)) * (formData.taxRate!/100)
                        )}</span>
                    </div>
                </div>

                <div className="pt-4 mb-6">
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-gray-900 dark:text-white">Grand Total</span>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(
                                (formData.items?.reduce((a, b) => a + b.total, 0) || 0) - 
                                (formData.discountType === 'percent' ? (formData.items?.reduce((a, b) => a + b.total, 0) || 0) * (formData.discountValue!/100) : formData.discountValue!) +
                                (Math.max(0, (formData.items?.reduce((a, b) => a + b.total, 0) || 0) - (formData.discountType === 'percent' ? (formData.items?.reduce((a, b) => a + b.total, 0) || 0) * (formData.discountValue!/100) : formData.discountValue!)) * (formData.taxRate!/100))
                            )}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">
                        Confirm Sale
                    </button>
                    <button onClick={() => setViewMode('list')} className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Sales 💰</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage service transactions and invoicing.</p>
        </div>
        
        {viewMode !== 'create' && (
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button onClick={() => setViewMode('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Dashboard</button>
                <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>List View</button>
                <button onClick={() => setViewMode('reports')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'reports' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Reports</button>
            </div>
        )}

        {viewMode === 'list' && (
            <button onClick={handleCreateNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" /> New Service Sale
            </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
          {viewMode === 'dashboard' && renderDashboard()}
          {viewMode === 'list' && renderList()}
          {viewMode === 'create' && renderCreateForm()}
          {viewMode === 'reports' && (
              <div className="flex items-center justify-center h-full text-gray-400 italic bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  Detailed Reports Module coming soon...
              </div>
          )}
      </div>
    </div>
  );
};

export default ServiceSales;

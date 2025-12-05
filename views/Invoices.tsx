
import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, FileDown, Send, Filter, ArrowUp, ArrowDown, RotateCcw, Calendar, X, CheckCircle, Mail, Paperclip, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import Pagination from '../components/Pagination';
import { printInvoice } from '../utils/printGenerator';

const Invoices: React.FC = () => {
  const { invoices, clients, formatCurrency, settings, t } = useApp();
  const startDateRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice | 'amount'; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Email State ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<Invoice | null>(null);

  // --- Helpers ---
  const getTypeLabel = (type: string) => {
    return t(type) || type.toUpperCase();
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'estimate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'order': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'delivery': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'invoice': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Handlers ---
  const handleSort = (key: keyof Invoice | 'amount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const handleEmailClick = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    const clientEmail = client ? client.email : '';
    
    setSelectedInvoiceForEmail(invoice);
    setEmailData({
      to: clientEmail,
      subject: `Invoice ${invoice.number} from ${settings.companyName}`,
      message: `Dear ${invoice.clientName},\n\nPlease find attached invoice ${invoice.number} for ${formatCurrency(invoice.amount, invoice.currency)}.\n\nThank you for your business.\n\nRegards,\n${settings.companyName}`
    });
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate Backend API call
    setTimeout(() => {
      setIsSending(false);
      setIsEmailModalOpen(false);
      alert(t('email_sent_success'));
    }, 1500);
  };

  const handleDownload = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    printInvoice(invoice, settings, client);
  };

  // --- Process Data ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || inv.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      const invDate = new Date(inv.date);
      const matchesStart = !dateRange.start || invDate >= new Date(dateRange.start);
      const matchesEnd = !dateRange.end || invDate <= new Date(dateRange.end);

      return matchesSearch && matchesType && matchesStatus && matchesStart && matchesEnd;
    });
  }, [invoices, searchTerm, typeFilter, statusFilter, dateRange]);

  const sortedInvoices = useMemo(() => {
    const sortable = [...filteredInvoices];
    if (sortConfig) {
      sortable.sort((a, b) => {
        const { key, direction } = sortConfig;
        
        let aValue: any = a[key as keyof Invoice];
        let bValue: any = b[key as keyof Invoice];

        // Handle specific types
        if (key === 'amount') {
          // already number
        } else if (key === 'date' || key === 'dueDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredInvoices, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, dateRange]);

  const SortIcon = ({ columnKey }: { columnKey: keyof Invoice | 'amount' }) => {
    if (sortConfig?.key !== columnKey) return <div className="w-4 h-4 inline-block ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 inline text-indigo-500" /> : <ArrowDown className="w-4 h-4 ml-1 inline text-indigo-500" />;
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('documents_history')} 🧮</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('documents_desc')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col flex-1">
        {/* Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col xl:flex-row gap-4 bg-gray-50 dark:bg-gray-800">
          <div className="relative flex-1 min-w-full sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_documents')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 w-full sm:w-auto">
              <button 
                onClick={() => startDateRef.current?.showPicker()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-indigo-600 transition-colors hidden sm:block"
                title="Open Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 whitespace-nowrap">{t('date')}:</span>
              <input 
                ref={startDateRef}
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent text-sm outline-none dark:text-white w-28 sm:w-28 cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent text-sm outline-none dark:text-white w-28 sm:w-28 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 flex-1 sm:flex-none">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="all">{t('all_types')}</option>
                <option value="estimate">{t('estimate')}</option>
                <option value="order">{t('client_order')}</option>
                <option value="delivery">{t('delivery_note')}</option>
                <option value="invoice">{t('invoice')}</option>
                <option value="issue">{t('issue_note')}</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              >
                <option value="all">{t('all_status')}</option>
                <option value="paid">{t('paid')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="overdue">{t('overdue')}</option>
                <option value="draft">{t('draft')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
            </div>

            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
               <button 
                onClick={handleResetFilters}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('number')}
                >
                  {t('ref_num')} <SortIcon columnKey="number" />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">{t('type')}</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('clientName')}
                >
                  {t('client')} <SortIcon columnKey="clientName" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('date')}
                >
                  {t('date')} <SortIcon columnKey="date" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('amount')}
                >
                  {t('amount')} <SortIcon columnKey="amount" />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">{t('status')}</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {inv.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getTypeStyle(inv.type)}`}>
                      {getTypeLabel(inv.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white whitespace-nowrap">{inv.clientName}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{inv.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(inv.amount, inv.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      inv.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {t(inv.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEmailClick(inv)}
                         className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                         title={t('email_invoice')}
                       >
                         <Send className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleDownload(inv)}
                         className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                         title={t('download_pdf')}
                       >
                         <FileDown className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedInvoices.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                     {t('no_documents')}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredInvoices.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && selectedInvoiceForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                {t('email_invoice')}
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('recipient_email')}</label>
                <input 
                  type="email" 
                  required
                  value={emailData.to}
                  onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject')}</label>
                <input 
                  type="text" 
                  required
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('message')}</label>
                <textarea 
                  rows={5}
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              {/* Attachment Visual */}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm text-red-500">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('attach_pdf')}</p>
                  <p className="text-xs text-gray-500">{selectedInvoiceForEmail.number}.pdf</p>
                </div>
                <div className="ml-auto text-indigo-600 dark:text-indigo-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? t('sending') : t('send_email')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, BankAccount, BankTransaction, 
  CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement, 
  Technician, ServiceItem, ServiceJob, ServiceSale, AppSettings, InvoiceItem
} from '../types';
import * as mockData from '../services/mockData';
import { loadTranslations } from '../services/translations';

// Define the Context Type
interface AppContextType {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  invoices: Invoice[];
  createSalesDocument: (type: any, data: any, items: any[]) => any;
  deleteInvoice: (id: string) => void;
  updateInvoice: (invoice: Invoice) => void;

  purchases: Purchase[];
  createPurchaseDocument: (type: any, data: any, items: any[]) => any;
  deletePurchase: (id: string) => void;
  updatePurchase: (purchase: Purchase) => void;

  warehouses: Warehouse[];
  addWarehouse: (wh: Warehouse) => void;
  updateWarehouse: (wh: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  stockMovements: StockMovement[];
  addStockMovement: (sm: StockMovement) => void;
  stockTransfers: StockTransfer[];
  transferStock: (data: any) => void;

  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;

  bankTransactions: BankTransaction[];
  addBankTransaction: (tx: BankTransaction) => void;
  deleteBankTransaction: (id: string) => void;

  cashSessions: CashSession[];
  openCashSession: (amount: number) => void;
  closeCashSession: (amount: number, notes: string) => void;

  cashTransactions: CashTransaction[];
  addCashTransaction: (tx: CashTransaction) => void;

  technicians: Technician[];
  addTechnician: (tech: Technician) => void;
  updateTechnician: (tech: Technician) => void;
  deleteTechnician: (id: string) => void;

  serviceCatalog: ServiceItem[];
  addServiceItem: (item: ServiceItem) => void;
  updateServiceItem: (item: ServiceItem) => void;
  deleteServiceItem: (id: string) => void;

  serviceJobs: ServiceJob[];
  addServiceJob: (job: ServiceJob) => void;
  updateServiceJob: (job: ServiceJob) => void;
  deleteServiceJob: (id: string) => void;

  serviceSales: ServiceSale[];
  addServiceSale: (sale: ServiceSale) => void;
  deleteServiceSale: (id: string) => void;

  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  
  stats: { revenue: number; expenses: number; profit: number };
  chartData: any[];
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  t: (key: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  recordDocPayment: (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State Definitions
  const [clients, setClients] = useState<Client[]>(mockData.mockClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockData.mockInventory);
  const [invoices, setInvoices] = useState<Invoice[]>(mockData.mockInvoices);
  const [purchases, setPurchases] = useState<Purchase[]>(mockData.mockPurchases);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockData.mockWarehouses);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockData.mockStockMovements);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(mockData.mockStockTransfers);
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockData.mockBankAccounts);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockData.mockBankTransactions);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(mockData.mockCashSessions);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(mockData.mockCashTransactions);
  
  const [technicians, setTechnicians] = useState<Technician[]>(mockData.mockTechnicians);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>(mockData.mockServiceCatalog);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>(mockData.mockServiceJobs);
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>(mockData.mockServiceSales);

  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'SmartBiz Solutions',
    companyEmail: 'contact@smartbiz.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Avenue\nTech District, NY 10001',
    companyLogo: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC-5',
    geminiApiKey: '',
    enableFiscalStamp: true,
    fiscalStampValue: 1.000,
    taxRates: [
      { id: '1', name: 'VAT Standard', rate: 19, isDefault: true },
      { id: '2', name: 'VAT Reduced', rate: 7 },
      { id: '3', name: 'Zero Rate', rate: 0 }
    ],
    customFields: {
      clients: [],
      suppliers: []
    }
  });

  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || settings.currency,
    }).format(amount);
  };

  // Actions
  const addClient = (c: Client) => setClients(prev => [...prev, c]);
  const updateClient = (c: Client) => setClients(prev => prev.map(item => item.id === c.id ? c : item));
  const deleteClient = (id: string) => setClients(prev => prev.filter(item => item.id !== id));

  const addSupplier = (s: Supplier) => setSuppliers(prev => [...prev, s]);
  const updateSupplier = (s: Supplier) => setSuppliers(prev => prev.map(item => item.id === s.id ? s : item));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(item => item.id !== id));

  const addProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

  const addWarehouse = (w: Warehouse) => setWarehouses(prev => [...prev, w]);
  const updateWarehouse = (w: Warehouse) => setWarehouses(prev => prev.map(item => item.id === w.id ? w : item));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(item => item.id !== id));

  const createSalesDocument = (type: any, data: any, items: InvoiceItem[]) => {
    const newDoc = {
      ...data,
      id: `inv-${Date.now()}`,
      number: `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      type,
      items
    };
    setInvoices(prev => [...prev, newDoc]);
    return newDoc;
  };
  const updateInvoice = (inv: Invoice) => setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));

  const createPurchaseDocument = (type: any, data: any, items: InvoiceItem[]) => {
    const newDoc = {
      ...data,
      id: `po-${Date.now()}`,
      number: `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      type,
      items
    };
    setPurchases(prev => [...prev, newDoc]);
    return newDoc;
  };
  const updatePurchase = (p: Purchase) => setPurchases(prev => prev.map(i => i.id === p.id ? p : i));
  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(i => i.id !== id));

  const addBankAccount = (a: BankAccount) => setBankAccounts(prev => [...prev, a]);
  const updateBankAccount = (a: BankAccount) => setBankAccounts(prev => prev.map(item => item.id === a.id ? a : item));
  const deleteBankAccount = (id: string) => setBankAccounts(prev => prev.filter(item => item.id !== id));
  
  const addBankTransaction = (tx: BankTransaction) => {
    setBankTransactions(prev => [...prev, tx]);
    setBankAccounts(prev => prev.map(acc => {
      if(acc.id === tx.accountId) {
        return { ...acc, balance: acc.balance + tx.amount };
      }
      return acc;
    }));
  };
  const deleteBankTransaction = (id: string) => setBankTransactions(prev => prev.filter(item => item.id !== id));

  const openCashSession = (amount: number) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedBy: 'User',
      startTime: new Date().toISOString(),
      openingBalance: amount,
      expectedBalance: amount,
      status: 'open'
    };
    setCashSessions(prev => [...prev, newSession]);
  };
  
  const closeCashSession = (amount: number, notes: string) => {
    setCashSessions(prev => prev.map(s => s.status === 'open' ? { ...s, status: 'closed', closingBalance: amount, endTime: new Date().toISOString() } : s));
  };

  const addCashTransaction = (tx: CashTransaction) => {
    setCashTransactions(prev => [...prev, tx]);
    setCashSessions(prev => prev.map(s => {
      if(s.id === tx.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + tx.amount };
      }
      return s;
    }));
  };

  const addStockMovement = (sm: StockMovement) => setStockMovements(prev => [...prev, sm]);
  const transferStock = (data: any) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = data;
    const transfer: StockTransfer = {
      id: `tr-${Date.now()}`,
      ...data,
      date: new Date().toISOString(),
      productName: products.find(p => p.id === productId)?.name || 'Unknown'
    };
    setStockTransfers(prev => [...prev, transfer]);
    
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newWhStock = { ...p.warehouseStock };
        newWhStock[fromWarehouseId] = (newWhStock[fromWarehouseId] || 0) - quantity;
        newWhStock[toWarehouseId] = (newWhStock[toWarehouseId] || 0) + quantity;
        return { ...p, warehouseStock: newWhStock };
      }
      return p;
    }));
  };

  const addTechnician = (t: Technician) => setTechnicians(prev => [...prev, t]);
  const updateTechnician = (t: Technician) => setTechnicians(prev => prev.map(item => item.id === t.id ? t : item));
  const deleteTechnician = (id: string) => setTechnicians(prev => prev.filter(item => item.id !== id));

  const addServiceItem = (i: ServiceItem) => setServiceCatalog(prev => [...prev, i]);
  const updateServiceItem = (i: ServiceItem) => setServiceCatalog(prev => prev.map(item => item.id === i.id ? i : item));
  const deleteServiceItem = (id: string) => setServiceCatalog(prev => prev.filter(item => item.id !== id));

  const addServiceJob = (j: ServiceJob) => setServiceJobs(prev => [...prev, j]);
  const updateServiceJob = (j: ServiceJob) => setServiceJobs(prev => prev.map(item => item.id === j.id ? j : item));
  const deleteServiceJob = (id: string) => setServiceJobs(prev => prev.filter(item => item.id !== id));

  const addServiceSale = (s: ServiceSale) => setServiceSales(prev => [...prev, s]);
  const deleteServiceSale = (id: string) => setServiceSales(prev => prev.filter(item => item.id !== id));

  const recordDocPayment = (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => {
    if (type === 'invoice') {
      updateInvoice({ ...invoices.find(i => i.id === id)!, status: 'paid' });
    } else {
      updatePurchase({ ...purchases.find(p => p.id === id)!, status: 'completed' });
    }

    if (method === 'bank' && accountId) {
      addBankTransaction({
        id: `tx-${Date.now()}`,
        accountId,
        date: new Date().toISOString().split('T')[0],
        description: `Payment for ${type} #${id}`,
        amount: type === 'invoice' ? amount : -amount,
        type: type === 'invoice' ? 'deposit' : 'payment',
        status: 'cleared'
      });
    } else if (method === 'cash') {
      const activeSession = cashSessions.find(s => s.status === 'open');
      if (activeSession) {
        addCashTransaction({
          id: `ctx-${Date.now()}`,
          sessionId: activeSession.id,
          date: new Date().toISOString(),
          type: type === 'invoice' ? 'sale' : 'expense',
          amount: type === 'invoice' ? amount : -amount,
          description: `Payment for ${type} #${id}`
        });
      }
    }
  };

  const revenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const expenses = purchases.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
  const stats = { revenue, expenses, profit: revenue - expenses };
  
  const chartData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
  ];

  return (
    <AppContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      products, addProduct, updateProduct, deleteProduct,
      invoices, createSalesDocument, deleteInvoice, updateInvoice,
      purchases, createPurchaseDocument, deletePurchase, updatePurchase,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      stockMovements, addStockMovement, stockTransfers, transferStock,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
      bankTransactions, addBankTransaction, deleteBankTransaction,
      cashSessions, openCashSession, closeCashSession,
      cashTransactions, addCashTransaction,
      technicians, addTechnician, updateTechnician, deleteTechnician,
      serviceCatalog, addServiceItem, updateServiceItem, deleteServiceItem,
      serviceJobs, addServiceJob, updateServiceJob, deleteServiceJob,
      serviceSales, addServiceSale, deleteServiceSale,
      settings, setSettings,
      stats, chartData,
      isLoading, setIsLoading,
      t, formatCurrency, recordDocPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  StockTransfer, BankAccount, BankTransaction, CashSession, CashTransaction,
  Technician, ServiceItem, ServiceJob, ServiceSale, AppSettings, InvoiceItem,
  SalesDocumentType, PurchaseDocumentType
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, 
  mockWarehouses, mockStockMovements, mockBankAccounts, mockBankTransactions,
  mockCashSessions, mockCashTransactions, mockTechnicians, mockServiceCatalog,
  mockServiceJobs, mockServiceSales
} from '../services/mockData';
import { loadTranslations } from '../services/translations';

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
  addProducts: (products: Product[]) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  invoices: Invoice[];
  createSalesDocument: (type: SalesDocumentType, data: Partial<Invoice>, items: InvoiceItem[]) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordDocPayment: (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => void;

  purchases: Purchase[];
  createPurchaseDocument: (type: PurchaseDocumentType, data: Partial<Purchase>, items: InvoiceItem[]) => Purchase;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;

  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;

  stockTransfers: StockTransfer[];
  transferStock: (data: any) => void;

  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;

  bankTransactions: BankTransaction[];
  addBankTransaction: (transaction: BankTransaction) => void;
  deleteBankTransaction: (id: string) => void;

  cashSessions: CashSession[];
  openCashSession: (openingBalance: number) => void;
  closeCashSession: (closingBalance: number, notes?: string) => void;

  cashTransactions: CashTransaction[];
  addCashTransaction: (transaction: CashTransaction) => void;

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

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  stats: { revenue: number; expenses: number; profit: number };
  chartData: any[];
  
  formatCurrency: (amount: number, currency?: string) => string;
  t: (key: string) => string;
}

const defaultSettings: AppSettings = {
  companyName: 'SmartBiz Tunisie',
  companyEmail: 'contact@smartbiz.tn',
  companyPhone: '+216 71 123 456',
  companyAddress: 'Immeuble Yasmin, Centre Urbain Nord, 1082 Tunis',
  companyLogo: 'https://placehold.co/200x80/4f46e5/ffffff?text=SmartBiz&font=montserrat',
  currency: 'TND',
  language: 'fr',
  timezone: 'Africa/Tunis',
  geminiApiKey: '',
  enableFiscalStamp: true,
  fiscalStampValue: 1.000,
  taxRates: [
    { id: '1', name: 'TVA Standard', rate: 19, isDefault: true },
    { id: '2', name: 'TVA Réduite', rate: 7 },
    { id: '3', name: 'TVA Zéro', rate: 0 }
  ],
  customFields: {
    clients: [],
    suppliers: []
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State initialization
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockInventory);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(mockCashSessions);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(mockCashTransactions);
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>(mockServiceCatalog);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>(mockServiceJobs);
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>(mockServiceSales);
  
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key;

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
  };

  const formatCurrency = (amount: number, currency: string = settings.currency) => {
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'TND' ? 3 : 2
    }).format(amount);
  };

  // --- CRUD Functions ---

  const addClient = (client: Client) => setClients(prev => [...prev, client]);
  const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  const addSupplier = (supplier: Supplier) => setSuppliers(prev => [...prev, supplier]);
  const updateSupplier = (supplier: Supplier) => setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const addProducts = (newProducts: Product[]) => setProducts(prev => [...prev, ...newProducts]);
  const updateProduct = (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const createSalesDocument = (type: SalesDocumentType, data: Partial<Invoice>, items: InvoiceItem[]): Invoice => {
    const newDoc: Invoice = {
      id: `inv-${Date.now()}`,
      number: `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      type,
      items,
      clientId: data.clientId || '',
      clientName: data.clientName || 'Unknown',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: data.amount || 0,
      status: data.status || 'draft',
      ...data
    } as Invoice;
    setInvoices(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updateInvoice = (invoice: Invoice) => setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));

  const recordDocPayment = (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => {
    if (type === 'invoice') {
        setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
        // Add transaction
        if (method === 'bank' && accountId) {
            addBankTransaction({
                id: `tx-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0],
                description: `Payment for Invoice`, amount, type: 'deposit', status: 'cleared'
            });
            // Update balance
            setBankAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a));
        } else if (method === 'cash') {
            const activeSession = cashSessions.find(s => s.status === 'open');
            if (activeSession) {
                addCashTransaction({
                    id: `ctx-${Date.now()}`, sessionId: activeSession.id, date: new Date().toISOString(),
                    type: 'sale', amount, description: `Payment for Invoice`
                });
            }
        }
    } else {
        setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
        // Add transaction (Payment out)
        if (method === 'bank' && accountId) {
            addBankTransaction({
                id: `tx-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0],
                description: `Payment for Purchase`, amount: -amount, type: 'payment', status: 'cleared'
            });
            // Update balance
            setBankAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance - amount } : a));
        }
    }
  };

  const createPurchaseDocument = (type: PurchaseDocumentType, data: Partial<Purchase>, items: InvoiceItem[]): Purchase => {
    const newDoc: Purchase = {
      id: `po-${Date.now()}`,
      number: `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      type,
      items,
      supplierId: data.supplierId || '',
      supplierName: data.supplierName || 'Unknown',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: data.amount || 0,
      status: data.status || 'pending',
      ...data
    } as Purchase;
    setPurchases(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updatePurchase = (purchase: Purchase) => setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));
  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));

  const addWarehouse = (wh: Warehouse) => setWarehouses(prev => [...prev, wh]);
  const updateWarehouse = (wh: Warehouse) => setWarehouses(prev => prev.map(w => w.id === wh.id ? wh : w));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(w => w.id !== id));

  const addStockMovement = (movement: StockMovement) => setStockMovements(prev => [movement, ...prev]);

  const transferStock = (data: any) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes, reference } = data;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Deduct from source
    addStockMovement({
        id: `sm-out-${Date.now()}`, productId, productName: product.name, warehouseId: fromWarehouseId, warehouseName: warehouses.find(w => w.id === fromWarehouseId)?.name || '',
        date: new Date().toISOString(), quantity: -quantity, type: 'transfer_out', reference, notes
    });

    // Add to dest
    addStockMovement({
        id: `sm-in-${Date.now()}`, productId, productName: product.name, warehouseId: toWarehouseId, warehouseName: warehouses.find(w => w.id === toWarehouseId)?.name || '',
        date: new Date().toISOString(), quantity: quantity, type: 'transfer_in', reference, notes
    });

    const newTransfer: StockTransfer = {
        id: `tr-${Date.now()}`, productId, productName: product.name, fromWarehouseId, toWarehouseId, quantity, date: new Date().toISOString(), reference, notes
    };
    setStockTransfers(prev => [newTransfer, ...prev]);

    // Update Product Stock
    const newWarehouseStock = { ...product.warehouseStock };
    newWarehouseStock[fromWarehouseId] = (newWarehouseStock[fromWarehouseId] || 0) - quantity;
    newWarehouseStock[toWarehouseId] = (newWarehouseStock[toWarehouseId] || 0) + quantity;
    updateProduct({ ...product, warehouseStock: newWarehouseStock });
  };

  const addBankAccount = (acc: BankAccount) => setBankAccounts(prev => [...prev, acc]);
  const updateBankAccount = (acc: BankAccount) => setBankAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  const deleteBankAccount = (id: string) => setBankAccounts(prev => prev.filter(a => a.id !== id));

  const addBankTransaction = (tx: BankTransaction) => {
      setBankTransactions(prev => [tx, ...prev]);
      // Update account balance
      setBankAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a));
  };
  const deleteBankTransaction = (id: string) => {
      const tx = bankTransactions.find(t => t.id === id);
      if (tx) {
          // Revert balance
          setBankAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a));
      }
      setBankTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openCashSession = (openingBalance: number) => {
      const newSession: CashSession = {
          id: `cs-${Date.now()}`,
          openedBy: 'Current User', // Placeholder
          startTime: new Date().toISOString(),
          openingBalance,
          expectedBalance: openingBalance,
          status: 'open'
      };
      setCashSessions(prev => [newSession, ...prev]);
  };

  const closeCashSession = (closingBalance: number, notes?: string) => {
      setCashSessions(prev => prev.map(s => s.status === 'open' ? { ...s, status: 'closed', closingBalance, endTime: new Date().toISOString() } : s));
  };

  const addCashTransaction = (tx: CashTransaction) => {
      setCashTransactions(prev => [tx, ...prev]);
      setCashSessions(prev => prev.map(s => s.id === tx.sessionId ? { ...s, expectedBalance: s.expectedBalance + tx.amount } : s));
  };

  const addTechnician = (tech: Technician) => setTechnicians(prev => [...prev, tech]);
  const updateTechnician = (tech: Technician) => setTechnicians(prev => prev.map(t => t.id === tech.id ? tech : t));
  const deleteTechnician = (id: string) => setTechnicians(prev => prev.filter(t => t.id !== id));

  const addServiceItem = (item: ServiceItem) => setServiceCatalog(prev => [...prev, item]);
  const updateServiceItem = (item: ServiceItem) => setServiceCatalog(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteServiceItem = (id: string) => setServiceCatalog(prev => prev.filter(i => i.id !== id));

  const addServiceJob = (job: ServiceJob) => setServiceJobs(prev => [job, ...prev]);
  const updateServiceJob = (job: ServiceJob) => setServiceJobs(prev => prev.map(j => j.id === job.id ? job : j));
  const deleteServiceJob = (id: string) => setServiceJobs(prev => prev.filter(j => j.id !== id));

  const addServiceSale = (sale: ServiceSale) => setServiceSales(prev => [sale, ...prev]);
  const deleteServiceSale = (id: string) => setServiceSales(prev => prev.filter(s => s.id !== id));

  // Stats Logic
  const stats = useMemo(() => {
    const revenue = invoices
      .filter(inv => inv.type === 'invoice' && inv.status !== 'draft')
      .reduce((acc, inv) => acc + inv.amount, 0);
    
    const expenses = purchases
      .filter(pur => pur.type === 'invoice')
      .reduce((acc, pur) => acc + pur.amount, 0);

    return { revenue, expenses, profit: revenue - expenses };
  }, [invoices, purchases]);

  const chartData = useMemo(() => {
    const data: any[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Simple mock projection over last 6 months based on data
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = months[d.getMonth()];
        // Aggregate actual data
        const monthRevenue = invoices
            .filter(inv => inv.type === 'invoice' && new Date(inv.date).getMonth() === d.getMonth() && new Date(inv.date).getFullYear() === d.getFullYear())
            .reduce((acc, inv) => acc + inv.amount, 0);
        
        const monthExpense = purchases
            .filter(p => p.type === 'invoice' && new Date(p.date).getMonth() === d.getMonth() && new Date(p.date).getFullYear() === d.getFullYear())
            .reduce((acc, p) => acc + p.amount, 0);

        data.push({ name: monthName, revenue: monthRevenue, expenses: monthExpense });
    }
    return data;
  }, [invoices, purchases]);

  const value = {
    clients, addClient, updateClient, deleteClient,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    products, addProduct, addProducts, updateProduct, deleteProduct,
    invoices, createSalesDocument, updateInvoice, deleteInvoice, recordDocPayment,
    purchases, createPurchaseDocument, updatePurchase, deletePurchase,
    warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
    stockMovements, addStockMovement,
    stockTransfers, transferStock,
    bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
    bankTransactions, addBankTransaction, deleteBankTransaction,
    cashSessions, openCashSession, closeCashSession,
    cashTransactions, addCashTransaction,
    technicians, addTechnician, updateTechnician, deleteTechnician,
    serviceCatalog, addServiceItem, updateServiceItem, deleteServiceItem,
    serviceJobs, addServiceJob, updateServiceJob, deleteServiceJob,
    serviceSales, addServiceSale, deleteServiceSale,
    settings, setSettings,
    isLoading, setIsLoading,
    stats, chartData, formatCurrency, t
  };

  return (
    <AppContext.Provider value={value}>
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

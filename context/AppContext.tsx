
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Client, Supplier, Product, Invoice, DashboardStats, Purchase, InvoiceItem, SalesDocumentType, PurchaseDocumentType, AppSettings, Language, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer } from '../types';
import { mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, mockBankAccounts, mockBankTransactions, mockCashSessions, mockCashTransactions, mockWarehouses, mockStockTransfers } from '../services/mockData';
import { loadTranslations } from '../services/translations';

interface ChartDataPoint {
  name: string;
  revenue: number;
  expenses: number;
}

interface AppContextType {
  // Data
  clients: Client[];
  suppliers: Supplier[];
  products: Product[];
  invoices: Invoice[];
  purchases: Purchase[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  cashSessions: CashSession[];
  cashTransactions: CashTransaction[];
  warehouses: Warehouse[];
  stockTransfers: StockTransfer[];
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  settings: AppSettings;
  
  // Helper
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;

  // Actions
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  deleteInvoice: (id: string) => void;
  updateInvoice: (invoice: Invoice) => void;

  deletePurchase: (id: string) => void;
  updatePurchase: (purchase: Purchase) => void;

  // Banking Actions
  addBankTransaction: (transaction: BankTransaction) => void;
  updateBankAccount: (account: BankAccount) => void;

  // Cash Actions
  openCashSession: (amount: number) => void;
  closeCashSession: (amount: number, notes?: string) => void;
  addCashTransaction: (transaction: CashTransaction) => void;

  // Warehouse Actions
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  transferStock: (transfer: Omit<StockTransfer, 'id' | 'date' | 'productName'>) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Complex Logic
  createSalesDocument: (
    type: SalesDocumentType, 
    docData: Omit<Invoice, 'id' | 'number' | 'type' | 'items'>, 
    items: InvoiceItem[]
  ) => Invoice; 
  
  createPurchaseDocument: (
    type: PurchaseDocumentType,
    docData: Omit<Purchase, 'id' | 'number' | 'type' | 'items'>, 
    items: InvoiceItem[]
  ) => Purchase;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize State with Mock Data
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockInventory);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases); 
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(mockCashSessions);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(mockCashTransactions);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(mockStockTransfers);
  
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'My Smart Business',
    companyEmail: 'admin@smartbiz.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Tech Blvd, Silicon Valley, CA',
    companyVatId: 'TAX-12345678',
    currency: 'EUR', // Default to Euro
    language: 'fr',  // Default to French
    timezone: 'UTC+1', // Default to Paris Time
    geminiApiKey: "AIzaSyAzHVNUeZ4V1ykeomWvnYsFBGn4k2ZLtoE",
    taxRates: [
      { id: '1', name: 'TVA Standard', rate: 20, isDefault: true },
      { id: '2', name: 'Taux Réduit', rate: 5.5 },
      { id: '3', name: 'Zéro', rate: 0 }
    ],
    customFields: {
      clients: [],
      suppliers: []
    }
  });

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>({});

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(settings.language).then(data => {
      setCurrentTranslations(data);
    });
  }, [settings.language]);

  // --- DERIVED STATE (STATS & CHARTS) ---

  // Dynamic Stats Calculation
  const stats: DashboardStats = useMemo(() => {
    const revenue = invoices
      .filter(i => (i.type === 'invoice' && i.status !== 'draft')) 
      .reduce((sum, i) => sum + i.amount, 0);
    
    // Subtract Credit Notes from Revenue
    const credits = invoices
      .filter(i => i.type === 'credit')
      .reduce((sum, i) => sum + i.amount, 0);

    const netRevenue = revenue - credits;

    const expenses = purchases
      .filter(p => p.type === 'invoice') // Count all registered purchase invoices
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingInvoices = invoices.filter(i => i.type === 'invoice' && i.status === 'pending').length;

    return {
      revenue: netRevenue,
      expenses,
      profit: netRevenue - expenses,
      pendingInvoices
    };
  }, [invoices, purchases]);

  // Dynamic Chart Data Calculation (Last 6 Months)
  const chartData: ChartDataPoint[] = useMemo(() => {
    const data: Record<string, ChartDataPoint> = {};
    
    // Initialize last 6 months keys
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short' });
      data[key] = { name: key, revenue: 0, expenses: 0 };
    }

    // Aggregate Revenue (Invoices - Credit Notes)
    invoices.forEach(inv => {
      if ((inv.type === 'invoice' && inv.status !== 'draft') || inv.type === 'credit') {
        const date = new Date(inv.date);
        const key = date.toLocaleString('default', { month: 'short' });
        if (data[key]) {
          if (inv.type === 'credit') {
            data[key].revenue -= inv.amount;
          } else {
            data[key].revenue += inv.amount;
          }
        }
      }
    });

    // Aggregate Expenses
    purchases.forEach(pur => {
      if (pur.type === 'invoice') {
        const date = new Date(pur.date);
        const key = date.toLocaleString('default', { month: 'short' });
        if (data[key]) {
          data[key].expenses += pur.amount;
        }
      }
    });

    return Object.values(data);
  }, [invoices, purchases]);

  // --- HELPERS ---
  const t = (key: string): string => {
    return currentTranslations[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-FR' : 'en-US'), {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // --- ACTIONS ---

  // Clients
  const addClient = (client: Client) => setClients(prev => [...prev, client]);
  const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  // Suppliers
  const addSupplier = (supplier: Supplier) => setSuppliers(prev => [...prev, supplier]);
  const updateSupplier = (supplier: Supplier) => setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  // Products
  const addProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const updateProduct = (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  // Documents
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));
  const updateInvoice = (invoice: Invoice) => setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));

  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));
  const updatePurchase = (purchase: Purchase) => setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Banking
  const addBankTransaction = (transaction: BankTransaction) => {
    setBankTransactions(prev => [transaction, ...prev]);
    // Update account balance
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === transaction.accountId) {
        return { ...acc, balance: acc.balance + transaction.amount };
      }
      return acc;
    }));
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };

  // Cash Register
  const openCashSession = (amount: number) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedBy: 'Current User', // In real app, from auth context
      startTime: new Date().toISOString(),
      openingBalance: amount,
      expectedBalance: amount,
      status: 'open'
    };
    setCashSessions(prev => [newSession, ...prev]);
  };

  const closeCashSession = (closingAmount: number, notes?: string) => {
    setCashSessions(prev => {
      const active = prev.find(s => s.status === 'open');
      if (!active) return prev;
      
      const closedSession: CashSession = {
        ...active,
        endTime: new Date().toISOString(),
        closingBalance: closingAmount,
        status: 'closed',
        notes
      };
      return [closedSession, ...prev.filter(s => s.id !== active.id)];
    });
  };

  const addCashTransaction = (transaction: CashTransaction) => {
    setCashTransactions(prev => [transaction, ...prev]);
    // Update expected balance of open session
    setCashSessions(prev => prev.map(s => {
      if (s.status === 'open' && s.id === transaction.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + transaction.amount };
      }
      return s;
    }));
  };

  // Warehouse Actions
  const addWarehouse = (warehouse: Warehouse) => setWarehouses(prev => [...prev, warehouse]);
  const updateWarehouse = (warehouse: Warehouse) => setWarehouses(prev => prev.map(w => w.id === warehouse.id ? warehouse : w));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(w => w.id !== id));

  const transferStock = (transferData: Omit<StockTransfer, 'id' | 'date' | 'productName'>) => {
    const product = products.find(p => p.id === transferData.productId);
    if (!product) return;

    // Check availability
    const currentSourceStock = product.warehouseStock[transferData.fromWarehouseId] || 0;
    if (currentSourceStock < transferData.quantity) {
      alert(`Insufficient stock in source warehouse. Available: ${currentSourceStock}`);
      return;
    }

    // 1. Log Transfer
    const newTransfer: StockTransfer = {
      ...transferData,
      id: `tr-${Date.now()}`,
      date: new Date().toISOString(),
      productName: product.name
    };
    setStockTransfers(prev => [newTransfer, ...prev]);

    // 2. Update Product Stock
    const updatedWarehouseStock = { ...product.warehouseStock };
    updatedWarehouseStock[transferData.fromWarehouseId] = (updatedWarehouseStock[transferData.fromWarehouseId] || 0) - transferData.quantity;
    updatedWarehouseStock[transferData.toWarehouseId] = (updatedWarehouseStock[transferData.toWarehouseId] || 0) + transferData.quantity;

    // Recalculate total stock
    const newTotalStock = (Object.values(updatedWarehouseStock) as number[]).reduce((a, b) => a + b, 0);

    const updatedProduct = {
      ...product,
      stock: newTotalStock,
      warehouseStock: updatedWarehouseStock,
      status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 10 ? 'low_stock' : 'in_stock'
    } as Product;

    updateProduct(updatedProduct);
  };

  // --- BUSINESS LOGIC ---

  const createSalesDocument = (type: SalesDocumentType, docData: Omit<Invoice, 'id' | 'number' | 'type' | 'items'>, items: InvoiceItem[]): Invoice => {
    const newId = `${Date.now()}`;
    let prefix = 'INV';
    if (type === 'estimate') prefix = 'EST';
    if (type === 'order') prefix = 'ORD';
    if (type === 'delivery') prefix = 'DEL';
    if (type === 'issue') prefix = 'ISS';
    if (type === 'return') prefix = 'RET';
    if (type === 'credit') prefix = 'CR';

    const newNumber = `${prefix}-${new Date().getFullYear()}-${String(invoices.length + 1001).padStart(4, '0')}`;
    
    const newDoc: Invoice = {
      ...docData,
      id: newId,
      number: newNumber,
      type,
      items
    };

    // 1. Add Document Record
    setInvoices(prev => [newDoc, ...prev]);

    // 2. Update Related Data
    
    // IMPACT: Stock Deduction (Sales) - Updated for Warehouse Logic
    if (type === 'invoice' || type === 'delivery' || type === 'issue') {
      const warehouseId = docData.warehouseId;
      if (!warehouseId && type !== 'invoice') { // Invoice might not always deduct stock immediately if it's service-based, but here we assume product sales need warehouse
         console.warn("No warehouse selected for stock deduction!");
      }

      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const soldItem = items.find(item => item.id === prod.id);
          if (soldItem) {
            const currentWhStock = prod.warehouseStock[warehouseId] || 0;
            const newWhStock = currentWhStock - soldItem.quantity;
            
            const updatedWarehouseStock = { ...prod.warehouseStock, [warehouseId]: newWhStock };
            const newTotalStock = (Object.values(updatedWarehouseStock) as number[]).reduce((a, b) => a + b, 0);

            return {
              ...prod,
              stock: newTotalStock,
              warehouseStock: updatedWarehouseStock,
              status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 10 ? 'low_stock' : 'in_stock'
            };
          }
          return prod;
        }));
      }
    }

    // IMPACT: Stock Increase (Returns)
    if (type === 'return') {
      const warehouseId = docData.warehouseId; // Where are returns going?
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const returnedItem = items.find(item => item.id === prod.id);
          if (returnedItem) {
            const currentWhStock = prod.warehouseStock[warehouseId] || 0;
            const newWhStock = currentWhStock + returnedItem.quantity;
            
            const updatedWarehouseStock = { ...prod.warehouseStock, [warehouseId]: newWhStock };
            const newTotalStock = (Object.values(updatedWarehouseStock) as number[]).reduce((a, b) => a + b, 0);

            return {
              ...prod,
              stock: newTotalStock,
              warehouseStock: updatedWarehouseStock,
              status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 10 ? 'low_stock' : 'in_stock'
            };
          }
          return prod;
        }));
      }
    }

    // IMPACT: Client Total Spent
    if (type === 'invoice') {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === docData.clientId) {
          return { ...client, totalSpent: client.totalSpent + docData.amount };
        }
        return client;
      }));
    }

    // IMPACT: Credit Note (Reduce Total Spent or handle as credit)
    if (type === 'credit') {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === docData.clientId) {
          return { ...client, totalSpent: Math.max(0, client.totalSpent - docData.amount) };
        }
        return client;
      }));
    }

    return newDoc;
  };

  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Omit<Purchase, 'id' | 'number' | 'type' | 'items'>, items: InvoiceItem[]): Purchase => {
    const newId = `PO-${Date.now()}`;
    const prefix = type === 'order' ? 'PO' : type === 'delivery' ? 'GRN' : 'PINV';
    const newNumber = `${prefix}-${new Date().getFullYear()}-${String(purchases.length + 5001).padStart(4, '0')}`;
    
    const newDoc: Purchase = {
      ...docData,
      id: newId,
      number: newNumber,
      type,
      items
    };

    // 1. Record Document
    setPurchases(prev => [newDoc, ...prev]);

    // 2. Update Related Data
    
    // IMPACT: Stock Increase (Purchases / GRN)
    if (type === 'delivery') {
      const warehouseId = docData.warehouseId;
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const purchasedItem = items.find(item => item.id === prod.id);
          if (purchasedItem) {
            const currentWhStock = prod.warehouseStock[warehouseId] || 0;
            const newWhStock = currentWhStock + purchasedItem.quantity;
            
            const updatedWarehouseStock = { ...prod.warehouseStock, [warehouseId]: newWhStock };
            const newTotalStock = (Object.values(updatedWarehouseStock) as number[]).reduce((a, b) => a + b, 0);

            return {
              ...prod,
              stock: newTotalStock,
              warehouseStock: updatedWarehouseStock,
              status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 10 ? 'low_stock' : 'in_stock'
            };
          }
          return prod;
        }));
      }
    }

    // IMPACT: Supplier Total Purchased
    if (type === 'invoice') {
      setSuppliers(prevSuppliers => prevSuppliers.map(s => {
        if (s.id === docData.supplierId) {
          return { ...s, totalPurchased: s.totalPurchased + docData.amount };
        }
        return s;
      }));
    }

    return newDoc;
  };

  return (
    <AppContext.Provider value={{
      clients, suppliers, products, invoices, purchases, 
      bankAccounts, bankTransactions, cashSessions, cashTransactions,
      warehouses, stockTransfers,
      stats, chartData, settings,
      t,
      formatCurrency,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addProduct, updateProduct, deleteProduct,
      deleteInvoice, updateInvoice,
      deletePurchase, updatePurchase,
      addBankTransaction, updateBankAccount,
      openCashSession, closeCashSession, addCashTransaction,
      addWarehouse, updateWarehouse, deleteWarehouse, transferStock,
      updateSettings,
      createSalesDocument, createPurchaseDocument
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

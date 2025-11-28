import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Client, Supplier, Product, Invoice, DashboardStats, Purchase, InvoiceItem, SalesDocumentType, PurchaseDocumentType, AppSettings, Language } from '../types';
import { mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases } from '../services/mockData';
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
  
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'My Smart Business',
    companyEmail: 'admin@smartbiz.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Tech Blvd, Silicon Valley, CA',
    companyVatId: 'TAX-12345678',
    currency: 'EUR', // Default to Euro
    language: 'fr',  // Default to French
    timezone: 'UTC+1', // Default to Paris Time
    taxRates: [
      { id: '1', name: 'TVA Standard', rate: 20, isDefault: true },
      { id: '2', name: 'Taux Réduit', rate: 5.5 },
      { id: '3', name: 'Zéro', rate: 0 }
    ]
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
      .filter(i => i.type === 'invoice' && i.status !== 'draft') // Count paid, pending, overdue
      .reduce((sum, i) => sum + i.amount, 0);

    const expenses = purchases
      .filter(p => p.type === 'invoice') // Count all registered purchase invoices
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingInvoices = invoices.filter(i => i.type === 'invoice' && i.status === 'pending').length;

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
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

    // Aggregate Revenue
    invoices.forEach(inv => {
      if (inv.type === 'invoice' && inv.status !== 'draft') {
        const date = new Date(inv.date);
        const key = date.toLocaleString('default', { month: 'short' });
        // Only add if it falls within our 6-month window initialization (simple check)
        if (data[key]) {
          data[key].revenue += inv.amount;
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

  // --- BUSINESS LOGIC ---

  const createSalesDocument = (type: SalesDocumentType, docData: Omit<Invoice, 'id' | 'number' | 'type' | 'items'>, items: InvoiceItem[]): Invoice => {
    const newId = `${Date.now()}`;
    const prefix = type === 'estimate' ? 'EST' : type === 'order' ? 'ORD' : type === 'delivery' ? 'DEL' : type === 'issue' ? 'ISS' : 'INV';
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
    
    // IMPACT: Stock Deduction (Sales)
    if (type === 'invoice' || type === 'delivery' || type === 'issue') {
      setProducts(prevProducts => prevProducts.map(prod => {
        const soldItem = items.find(item => item.id === prod.id);
        if (soldItem) {
          const newStock = prod.stock - soldItem.quantity;
          return {
            ...prod,
            stock: newStock,
            status: newStock <= 0 ? 'out_of_stock' : newStock <= 10 ? 'low_stock' : 'in_stock'
          };
        }
        return prod;
      }));
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
    
    // IMPACT: Stock Increase (Purchases)
    if (type === 'delivery') {
      setProducts(prevProducts => prevProducts.map(prod => {
        const purchasedItem = items.find(item => item.id === prod.id);
        if (purchasedItem) {
          const newStock = prod.stock + purchasedItem.quantity;
          return {
            ...prod,
            stock: newStock,
            status: newStock <= 0 ? 'out_of_stock' : newStock <= 10 ? 'low_stock' : 'in_stock'
          };
        }
        return prod;
      }));
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
      clients, suppliers, products, invoices, purchases, stats, chartData, settings,
      t,
      formatCurrency,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addProduct, updateProduct, deleteProduct,
      deleteInvoice, updateInvoice,
      deletePurchase, updatePurchase,
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
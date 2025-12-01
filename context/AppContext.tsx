
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  StockTransfer, BankAccount, BankTransaction, CashSession, CashTransaction,
  Technician, ServiceItem, ServiceJob, ServiceSale, AppSettings, InvoiceItem,
  SalesDocumentType, PurchaseDocumentType, InventorySession, InventoryItem
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, 
  mockWarehouses, mockStockMovements, mockBankAccounts, mockBankTransactions,
  mockCashSessions, mockCashTransactions, mockTechnicians, mockServiceCatalog,
  mockServiceJobs, mockServiceSales, mockInventorySessions
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

  inventorySessions: InventorySession[];
  createInventorySession: (data: Partial<InventorySession>) => void;
  updateInventorySession: (session: InventorySession) => void;
  commitInventorySession: (session: InventorySession) => void;

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
  const [inventorySessions, setInventorySessions] = useState<InventorySession[]>(mockInventorySessions);
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

  const addStockMovement = (movement: StockMovement) => {
      setStockMovements(prev => [movement, ...prev]);
      // Auto update product stock if needed
      if (movement.productId) {
          setProducts(prev => prev.map(p => {
              if (p.id === movement.productId) {
                   const newStock = p.stock + movement.quantity;
                   const newWhStock = { ...p.warehouseStock };
                   newWhStock[movement.warehouseId] = (newWhStock[movement.warehouseId] || 0) + movement.quantity;
                   
                   // Optional: Update Cost if purchase
                   let newCost = p.cost;
                   if (movement.type === 'purchase' && movement.unitCost) {
                       // Simple weighted average
                       const totalValue = (p.stock * p.cost) + (movement.quantity * movement.unitCost);
                       newCost = totalValue / newStock;
                   }

                   return { ...p, stock: newStock, warehouseStock: newWhStock, cost: newCost };
              }
              return p;
          }));
      }
  };

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
      amountPaid: 0,
      status: data.status || 'draft',
      ...data
    } as Invoice;
    setInvoices(prev => [newDoc, ...prev]);

    // Handle Stock Movement for Returns
    if (type === 'return' && data.stockAction === 'reintegrate') {
        items.forEach(item => {
             addStockMovement({
                 id: `sm-ret-${Date.now()}-${item.id}`,
                 productId: item.id,
                 productName: item.description,
                 warehouseId: data.warehouseId || warehouses[0]?.id || '',
                 warehouseName: 'Return',
                 date: new Date().toISOString(),
                 quantity: item.quantity, // Positive for customer return
                 type: 'return',
                 reference: newDoc.number,
                 notes: `Customer Return: ${data.returnReason}`
             });
        });
    }
    
    // Handle Stock Movement for Delivery (Existing logic)
    if (type === 'delivery' || type === 'invoice') {
        // Deduct stock logic would typically be here if not handled separately
        items.forEach(item => {
            if (type === 'delivery') { // Only deduct on delivery note creation in this flow
                addStockMovement({
                    id: `sm-del-${Date.now()}-${item.id}`,
                    productId: item.id,
                    productName: item.description,
                    warehouseId: data.warehouseId || '',
                    warehouseName: 'Sales',
                    date: new Date().toISOString(),
                    quantity: -item.quantity,
                    type: 'sale',
                    reference: newDoc.number
                });
            }
        });
    }

    return newDoc;
  };

  const updateInvoice = (invoice: Invoice) => setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));

  const recordDocPayment = (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => {
    if (type === 'invoice') {
        setInvoices(prev => prev.map(i => {
            if (i.id === id) {
                const currentPaid = i.amountPaid || 0;
                const newPaid = currentPaid + amount;
                const isFullyPaid = newPaid >= i.amount - 0.01;
                
                return { 
                    ...i, 
                    amountPaid: newPaid,
                    status: isFullyPaid ? 'paid' : 'partial' 
                };
            }
            return i;
        }));

        const refNum = invoices.find(i => i.id === id)?.number || 'REF';
        if (method === 'bank' && accountId) {
            addBankTransaction({
                id: `tx-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0],
                description: `Payment for Invoice ${refNum}`, amount, type: 'deposit', status: 'cleared'
            });
            setBankAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a));
        } else if (method === 'cash') {
            const activeSession = cashSessions.find(s => s.status === 'open');
            if (activeSession) {
                addCashTransaction({
                    id: `ctx-${Date.now()}`, sessionId: activeSession.id, date: new Date().toISOString(),
                    type: 'sale', amount, description: `Payment for Invoice ${refNum}`
                });
            }
        }
    } else {
        setPurchases(prev => prev.map(p => {
            if (p.id === id) {
                const currentPaid = p.amountPaid || 0;
                const newPaid = currentPaid + amount;
                const isFullyPaid = newPaid >= p.amount - 0.01;

                return { 
                    ...p, 
                    amountPaid: newPaid,
                    status: isFullyPaid ? 'completed' : 'partial' 
                };
            }
            return p;
        }));

        const refNum = purchases.find(p => p.id === id)?.number || 'REF';
        if (method === 'bank' && accountId) {
            addBankTransaction({
                id: `tx-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0],
                description: `Payment for Purchase ${refNum}`, amount: -amount, type: 'payment', status: 'cleared'
            });
            setBankAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance - amount } : a));
        } else if (method === 'cash') {
             const activeSession = cashSessions.find(s => s.status === 'open');
             if (activeSession) {
                 addCashTransaction({
                     id: `ctx-${Date.now()}`, sessionId: activeSession.id, date: new Date().toISOString(),
                     type: 'expense', amount: -amount, description: `Payment for Purchase ${refNum}`
                 });
             }
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
      amountPaid: 0,
      status: data.status || 'pending',
      ...data
    } as Purchase;
    setPurchases(prev => [newDoc, ...prev]);

    // Handle Stock Movement for Supplier Returns
    if (type === 'return' && data.stockAction === 'reintegrate') {
        // Reintegrate in purchase context usually means "Return to Supplier" -> Stock Out
        items.forEach(item => {
             addStockMovement({
                 id: `sm-sret-${Date.now()}-${item.id}`,
                 productId: item.id,
                 productName: item.description,
                 warehouseId: data.warehouseId || warehouses[0]?.id || '',
                 warehouseName: 'Return',
                 date: new Date().toISOString(),
                 quantity: -item.quantity, // Negative for supplier return (Stock Out)
                 type: 'return',
                 reference: newDoc.number,
                 notes: `Supplier Return: ${data.returnReason}`
             });
        });
    }
    
    // Handle GRN Stock Increase
    if (type === 'delivery') {
         items.forEach(item => {
             addStockMovement({
                 id: `sm-grn-${Date.now()}-${item.id}`,
                 productId: item.id,
                 productName: item.description,
                 warehouseId: data.warehouseId || '',
                 warehouseName: 'Purchase',
                 date: new Date().toISOString(),
                 quantity: item.quantity,
                 type: 'purchase',
                 reference: newDoc.number,
                 unitCost: item.price // Used for WAC calculation in addStockMovement
             });
        });
    }

    return newDoc;
  };

  const updatePurchase = (purchase: Purchase) => setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));
  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));

  const addWarehouse = (wh: Warehouse) => setWarehouses(prev => [...prev, wh]);
  const updateWarehouse = (wh: Warehouse) => setWarehouses(prev => prev.map(w => w.id === wh.id ? wh : w));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(w => w.id !== id));

  const transferStock = (data: any) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes, reference } = data;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    addStockMovement({
        id: `sm-out-${Date.now()}`, productId, productName: product.name, warehouseId: fromWarehouseId, warehouseName: warehouses.find(w => w.id === fromWarehouseId)?.name || '',
        date: new Date().toISOString(), quantity: -quantity, type: 'transfer_out', reference, notes
    });

    addStockMovement({
        id: `sm-in-${Date.now()}`, productId, productName: product.name, warehouseId: toWarehouseId, warehouseName: warehouses.find(w => w.id === toWarehouseId)?.name || '',
        date: new Date().toISOString(), quantity: quantity, type: 'transfer_in', reference, notes
    });

    const newTransfer: StockTransfer = {
        id: `tr-${Date.now()}`, productId, productName: product.name, fromWarehouseId, toWarehouseId, quantity, date: new Date().toISOString(), reference, notes
    };
    setStockTransfers(prev => [newTransfer, ...prev]);
  };

  // --- Inventory Sessions Logic ---

  const createInventorySession = (data: Partial<InventorySession>) => {
      const warehouseId = data.warehouseId || warehouses[0]?.id;
      const warehouse = warehouses.find(w => w.id === warehouseId);
      
      // Filter products if category is set
      let filteredProducts = products;
      if (data.categoryFilter && data.categoryFilter !== 'All') {
          filteredProducts = products.filter(p => p.category === data.categoryFilter);
      }

      const items: InventoryItem[] = filteredProducts.map(p => ({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          systemQty: p.warehouseStock[warehouseId] || 0, // Snapshot current qty
          physicalQty: p.warehouseStock[warehouseId] || 0, // Default to current qty
          variance: 0,
          cost: p.cost
      }));

      const newSession: InventorySession = {
          id: `inv-sess-${Date.now()}`,
          reference: `INV-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          warehouseId: warehouseId,
          warehouseName: warehouse?.name || 'Unknown',
          status: 'in_progress',
          categoryFilter: data.categoryFilter || 'All',
          items: items,
          notes: data.notes || ''
      };
      
      setInventorySessions(prev => [newSession, ...prev]);
  };

  const updateInventorySession = (session: InventorySession) => {
      setInventorySessions(prev => prev.map(s => s.id === session.id ? session : s));
  };

  const commitInventorySession = (session: InventorySession) => {
      // 1. Create stock movements for variance
      session.items.forEach(item => {
          if (item.variance !== 0) {
              addStockMovement({
                  id: `sm-adj-${Date.now()}-${item.productId}`,
                  productId: item.productId,
                  productName: item.productName,
                  warehouseId: session.warehouseId,
                  warehouseName: session.warehouseName,
                  date: new Date().toISOString(),
                  quantity: item.variance, // Positive or negative adjustment
                  type: 'adjustment',
                  reference: session.reference,
                  notes: `Inventory Audit Variance: ${item.variance}`,
                  unitCost: item.cost,
                  costBefore: item.cost,
                  costAfter: item.cost
              });
          }
      });

      // 2. Mark session as completed
      const completedSession = { ...session, status: 'completed' as const };
      updateInventorySession(completedSession);
  };

  const addBankAccount = (acc: BankAccount) => setBankAccounts(prev => [...prev, acc]);
  const updateBankAccount = (acc: BankAccount) => setBankAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  const deleteBankAccount = (id: string) => setBankAccounts(prev => prev.filter(a => a.id !== id));

  const addBankTransaction = (tx: BankTransaction) => {
      setBankTransactions(prev => [tx, ...prev]);
      setBankAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a));
  };
  const deleteBankTransaction = (id: string) => {
      const tx = bankTransactions.find(t => t.id === id);
      if (tx) {
          setBankAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a));
      }
      setBankTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openCashSession = (openingBalance: number) => {
      const newSession: CashSession = {
          id: `cs-${Date.now()}`,
          openedBy: 'Current User',
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
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = months[d.getMonth()];
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
    inventorySessions, createInventorySession, updateInventorySession, commitInventorySession,
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

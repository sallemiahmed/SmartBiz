
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, BankAccount, BankTransaction, 
  CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement, 
  AppSettings, InvoiceItem, PurchaseDocumentType, SalesDocumentType,
  Technician, ServiceItem, ServiceJob, ServiceSale
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, 
  mockBankAccounts, mockBankTransactions, mockCashSessions, mockCashTransactions, 
  mockWarehouses, mockStockTransfers, mockStockMovements,
  mockTechnicians, mockServiceCatalog, mockServiceJobs, mockServiceSales
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
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  invoices: Invoice[];
  createSalesDocument: (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  purchases: Purchase[];
  createPurchaseDocument: (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]) => Purchase;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;
  
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  
  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;
  
  stockTransfers: StockTransfer[];
  transferStock: (transfer: { productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reference: string, notes: string }) => void;
  
  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  
  bankTransactions: BankTransaction[];
  addBankTransaction: (transaction: BankTransaction) => void;
  deleteBankTransaction: (id: string) => void;
  
  cashSessions: CashSession[];
  openCashSession: (amount: number) => void;
  closeCashSession: (amount: number, notes?: string) => void;
  
  cashTransactions: CashTransaction[];
  addCashTransaction: (transaction: CashTransaction) => void;
  
  // New Financial Logic
  recordDocPayment: (docType: 'invoice' | 'purchase', docId: string, amount: number, accountId: string, method: 'bank' | 'cash') => void;

  // Services Module
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
  updateServiceSale: (sale: ServiceSale) => void;
  deleteServiceSale: (id: string) => void;

  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  
  stats: { revenue: number; expenses: number; profit: number };
  chartData: any[];
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  t: (key: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  // Data States
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockInventory);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(mockStockTransfers);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(mockCashSessions);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(mockCashTransactions);
  
  // Service Module Data
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>(mockServiceCatalog);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>(mockServiceJobs);
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>(mockServiceSales);

  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'SmartBiz Demo',
    companyEmail: 'contact@smartbiz.com',
    companyPhone: '+216 71 123 456',
    companyAddress: 'Les Berges du Lac 2, Tunis, Tunisie',
    companyLogo: 'https://placehold.co/300x100/4f46e5/ffffff?text=SmartBiz+Corp',
    currency: 'TND',
    language: 'fr',
    timezone: 'UTC+1',
    geminiApiKey: '',
    enableFiscalStamp: true,
    fiscalStampValue: 1.000,
    taxRates: [{ id: 't1', name: 'TVA', rate: 19, isDefault: true }, { id: 't2', name: 'TVA', rate: 7, isDefault: false }],
    customFields: { clients: [], suppliers: [] }
  });

  // Load Translations
  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const formatCurrency = (amount: number, currency: string = settings.currency) => {
    try {
      return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'TND' ? 3 : 2
      }).format(amount);
    } catch (e) {
      return `${amount} ${currency}`;
    }
  };

  // --- CRUD Operations ---

  const addClient = (client: Client) => setClients([...clients, client]);
  const updateClient = (client: Client) => setClients(clients.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));

  const addSupplier = (supplier: Supplier) => setSuppliers([...suppliers, supplier]);
  const updateSupplier = (supplier: Supplier) => setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
  const deleteSupplier = (id: string) => setSuppliers(suppliers.filter(s => s.id !== id));

  const addProduct = (product: Product) => setProducts([...products, product]);
  const updateProduct = (product: Product) => setProducts(products.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const addWarehouse = (wh: Warehouse) => setWarehouses([...warehouses, wh]);
  const updateWarehouse = (wh: Warehouse) => setWarehouses(warehouses.map(w => w.id === wh.id ? wh : w));
  const deleteWarehouse = (id: string) => setWarehouses(warehouses.filter(w => w.id !== id));

  // Service Module CRUD
  const addTechnician = (tech: Technician) => setTechnicians([...technicians, tech]);
  const updateTechnician = (tech: Technician) => setTechnicians(technicians.map(t => t.id === tech.id ? tech : t));
  const deleteTechnician = (id: string) => setTechnicians(technicians.filter(t => t.id !== id));

  const addServiceItem = (item: ServiceItem) => setServiceCatalog([...serviceCatalog, item]);
  const updateServiceItem = (item: ServiceItem) => setServiceCatalog(serviceCatalog.map(s => s.id === item.id ? item : s));
  const deleteServiceItem = (id: string) => setServiceCatalog(serviceCatalog.filter(s => s.id !== id));

  const addServiceJob = (job: ServiceJob) => setServiceJobs([...serviceJobs, job]);
  const updateServiceJob = (job: ServiceJob) => setServiceJobs(serviceJobs.map(j => j.id === job.id ? job : j));
  const deleteServiceJob = (id: string) => setServiceJobs(serviceJobs.filter(j => j.id !== id));

  const addServiceSale = (sale: ServiceSale) => setServiceSales([...serviceSales, sale]);
  const updateServiceSale = (sale: ServiceSale) => setServiceSales(serviceSales.map(s => s.id === sale.id ? sale : s));
  const deleteServiceSale = (id: string) => setServiceSales(serviceSales.filter(s => s.id !== id));

  // Banking
  const addBankTransaction = (tx: BankTransaction) => {
    setBankTransactions([tx, ...bankTransactions]);
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        return { ...acc, balance: acc.balance + tx.amount };
      }
      return acc;
    }));
  };
  const deleteBankTransaction = (id: string) => {
    const tx = bankTransactions.find(t => t.id === id);
    if (tx) {
        setBankTransactions(prev => prev.filter(t => t.id !== id));
        setBankAccounts(prev => prev.map(acc => {
            if (acc.id === tx.accountId) {
                return { ...acc, balance: acc.balance - tx.amount }; 
            }
            return acc;
        }));
    }
  };

  const addBankAccount = (acc: BankAccount) => setBankAccounts([...bankAccounts, acc]);
  const updateBankAccount = (acc: BankAccount) => setBankAccounts(bankAccounts.map(a => a.id === acc.id ? acc : a));
  const deleteBankAccount = (id: string) => setBankAccounts(bankAccounts.filter(a => a.id !== id));

  const openCashSession = (amount: number) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedBy: 'Admin',
      startTime: new Date().toISOString(),
      openingBalance: amount,
      expectedBalance: amount,
      status: 'open'
    };
    setCashSessions([newSession, ...cashSessions]);
  };

  const closeCashSession = (amount: number, notes?: string) => {
    setCashSessions(prev => prev.map(s => {
      if (s.status === 'open') {
        return { ...s, status: 'closed', endTime: new Date().toISOString(), closingBalance: amount };
      }
      return s;
    }));
  };

  const addCashTransaction = (tx: CashTransaction) => {
    setCashTransactions([tx, ...cashTransactions]);
    setCashSessions(prev => prev.map(s => {
      if (s.id === tx.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + tx.amount };
      }
      return s;
    }));
  };

  // --- Core Financial Logic: Record Payment ---
  const recordDocPayment = (docType: 'invoice' | 'purchase', docId: string, amount: number, accountId: string, method: 'bank' | 'cash') => {
    const description = `${docType === 'invoice' ? 'Payment Received' : 'Payment Sent'} - Ref: ${docId}`;
    
    // 1. Update Document Status
    if (docType === 'invoice') {
        setInvoices(prev => prev.map(inv => {
            if (inv.id === docId) {
                // If payment amount covers the total, mark paid, else could be partial (simplified to paid here)
                return { ...inv, status: 'paid' };
            }
            return inv;
        }));
    } else {
        setPurchases(prev => prev.map(pur => {
            if (pur.id === docId) {
                return { ...pur, status: 'completed' }; // or 'paid' if status supported
            }
            return pur;
        }));
    }

    // 2. Create Transaction & Update Balance
    if (method === 'bank') {
        // Invoice = Deposit (Positive), Purchase = Payment (Negative)
        const txAmount = docType === 'invoice' ? amount : -amount; 
        
        const newTx: BankTransaction = {
            id: `tx-${Date.now()}`,
            accountId: accountId,
            date: new Date().toISOString().split('T')[0],
            description: description,
            amount: txAmount,
            type: docType === 'invoice' ? 'deposit' : 'payment',
            status: 'cleared'
        };
        addBankTransaction(newTx);
    } else {
        // Cash Logic
        const activeSession = cashSessions.find(s => s.status === 'open');
        if (activeSession) {
            const txAmount = docType === 'invoice' ? amount : -amount; 
            const newTx: CashTransaction = {
                id: `ctx-${Date.now()}`,
                sessionId: activeSession.id,
                date: new Date().toISOString(),
                type: docType === 'invoice' ? 'sale' : 'expense',
                amount: txAmount,
                description: description
            };
            addCashTransaction(newTx);
        } else {
            alert(t('register_closed') + " - " + t('open_register') + " " + t('first'));
        }
    }
  };

  const createSalesDocument = (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]): Invoice => {
    const newDoc: Invoice = {
      ...docData,
      id: docData.id || `inv-${Date.now()}`,
      number: docData.number || `${type.toUpperCase().substring(0,3)}-${Date.now()}`,
      type,
      items,
      status: docData.status || 'draft',
      date: docData.date || new Date().toISOString(),
      amount: docData.amount || 0,
      clientId: docData.clientId || '',
      clientName: docData.clientName || ''
    } as Invoice;

    setInvoices([newDoc, ...invoices]);

    if (type === 'invoice' || type === 'delivery') {
       // Logic to deduct stock only if items are Products (check by finding in product list)
       if (newDoc.warehouseId) {
         setProducts(prev => prev.map(p => {
           const item = items.find(i => i.id === p.id);
           // Only deduct if item exists in inventory (skips services or custom non-inventory items)
           if (item) {
             const newStock = p.stock - item.quantity;
             const whStock = { ...p.warehouseStock };
             if (whStock[newDoc.warehouseId!]) {
                whStock[newDoc.warehouseId!] -= item.quantity;
             }
             // Log automated movement
             addStockMovement({
                id: `sm-out-${Date.now()}-${p.id}`,
                productId: p.id,
                productName: p.name,
                warehouseId: newDoc.warehouseId!,
                warehouseName: warehouses.find(w => w.id === newDoc.warehouseId)?.name || 'Unknown',
                date: new Date().toISOString(),
                quantity: -item.quantity,
                type: 'sale',
                reference: newDoc.number,
                notes: `Auto-deduct via ${type}`,
                unitCost: p.cost,
                costBefore: p.cost,
                costAfter: p.cost
             });
             return { ...p, stock: newStock, warehouseStock: whStock };
           }
           return p;
         }));
       }
    }

    if (type === 'invoice') {
        const client = clients.find(c => c.id === newDoc.clientId);
        if (client) {
            updateClient({ ...client, totalSpent: client.totalSpent + newDoc.amount });
        }
    }

    return newDoc;
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const deleteInvoice = (id: string) => setInvoices(invoices.filter(i => i.id !== id));

  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]): Purchase => {
    const newDoc: Purchase = {
      ...docData,
      id: docData.id || `po-${Date.now()}`,
      type,
      number: docData.number || `${type.toUpperCase().substring(0,3)}-${Date.now()}`,
      items,
      status: docData.status || (type === 'rfq' ? 'sent' : 'pending'),
      date: docData.date || new Date().toISOString(),
      amount: docData.amount || 0,
      supplierId: docData.supplierId || '',
      supplierName: docData.supplierName || ''
    } as Purchase;

    if (type === 'invoice' || type === 'order') {
        const supplier = suppliers.find(s => s.id === newDoc.supplierId);
        if (supplier) {
            updateSupplier({ ...supplier, totalPurchased: supplier.totalPurchased + newDoc.amount });
        }
    }

    // Logic for linking docs
    if (type === 'delivery' && docData.linkedDocumentId) {
      setPurchases(prev => {
        const updatedPurchases = prev.map(p => {
          if (p.id === docData.linkedDocumentId) {
            return { ...p, status: 'received' as const };
          }
          return p;
        });
        return [newDoc, ...updatedPurchases];
      });
    } else if (type === 'order' && docData.linkedDocumentId) {
        setPurchases(prev => {
            const updatedPurchases = prev.map(p => {
              if (p.id === docData.linkedDocumentId) {
                return { ...p, status: 'accepted' as const };
              }
              return p;
            });
            return [newDoc, ...updatedPurchases];
        });
    } else {
      setPurchases(prev => [newDoc, ...prev]);
    }

    if (type === 'delivery') {
      const warehouseId = docData.warehouseId;
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const purchasedItem = items.find(item => item.id === prod.id);
          if (purchasedItem) {
            const newTotalStock = prod.stock + purchasedItem.quantity;
            const updatedWarehouseStock = { ...prod.warehouseStock };
            updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) + purchasedItem.quantity;
            
            const oldTotalValue = prod.stock * prod.cost;
            const newPurchaseValue = purchasedItem.quantity * purchasedItem.price;
            const newCost = newTotalStock > 0 ? (oldTotalValue + newPurchaseValue) / newTotalStock : prod.cost;

            addStockMovement({
                id: `sm-in-${Date.now()}-${prod.id}`,
                productId: prod.id,
                productName: prod.name,
                warehouseId,
                warehouseName: warehouses.find(w => w.id === warehouseId)?.name || 'Unknown',
                date: new Date().toISOString(),
                quantity: purchasedItem.quantity,
                type: 'purchase',
                reference: newDoc.number,
                notes: `Received via ${type}`,
                unitCost: purchasedItem.price,
                costBefore: prod.cost,
                costAfter: newCost
            });

            return { 
              ...prod, 
              stock: newTotalStock, 
              warehouseStock: updatedWarehouseStock,
              cost: newCost,
              status: newTotalStock > 10 ? 'in_stock' : newTotalStock > 0 ? 'low_stock' : 'out_of_stock'
            };
          }
          return prod;
        }));
      }
    }

    return newDoc;
  };

  const updatePurchase = (updatedPurchase: Purchase) => {
    setPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
  };

  const deletePurchase = (id: string) => setPurchases(purchases.filter(p => p.id !== id));

  const addStockMovement = (movement: StockMovement) => setStockMovements([movement, ...stockMovements]);

  const transferStock = (transfer: { productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reference: string, notes: string }) => {
    setProducts(prev => prev.map(p => {
        if (p.id === transfer.productId) {
            const currentFrom = p.warehouseStock[transfer.fromWarehouseId] || 0;
            const currentTo = p.warehouseStock[transfer.toWarehouseId] || 0;
            
            if (currentFrom >= transfer.quantity) {
                addStockMovement({
                    id: `sm-tr-out-${Date.now()}`,
                    productId: p.id,
                    productName: p.name,
                    warehouseId: transfer.fromWarehouseId,
                    warehouseName: warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || '',
                    date: new Date().toISOString(),
                    quantity: -transfer.quantity,
                    type: 'transfer_out',
                    reference: transfer.reference,
                    notes: transfer.notes,
                    relatedWarehouseName: warehouses.find(w => w.id === transfer.toWarehouseId)?.name || ''
                });
                addStockMovement({
                    id: `sm-tr-in-${Date.now()}`,
                    productId: p.id,
                    productName: p.name,
                    warehouseId: transfer.toWarehouseId,
                    warehouseName: warehouses.find(w => w.id === transfer.toWarehouseId)?.name || '',
                    date: new Date().toISOString(),
                    quantity: transfer.quantity,
                    type: 'transfer_in',
                    reference: transfer.reference,
                    notes: transfer.notes,
                    relatedWarehouseName: warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || ''
                });

                return {
                    ...p,
                    warehouseStock: {
                        ...p.warehouseStock,
                        [transfer.fromWarehouseId]: currentFrom - transfer.quantity,
                        [transfer.toWarehouseId]: currentTo + transfer.quantity
                    }
                };
            } else {
                alert("Insufficient stock in source warehouse");
            }
        }
        return p;
    }));
    
    setStockTransfers([{ ...transfer, id: `tr-${Date.now()}`, productName: products.find(p=>p.id===transfer.productId)?.name || '', date: new Date().toISOString() }, ...stockTransfers]);
  };

  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  // Derived Stats
  const revenue = invoices.filter(i => i.type === 'invoice' && i.status !== 'draft').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = purchases.filter(p => p.type === 'invoice').reduce((acc, curr) => acc + curr.amount, 0);
  const profit = revenue - expenses;

  // Chart Data generation based on invoice dates
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
        const monthNum = index; // 0-5
        
        // Calculate revenue for this month
        const monthlyRevenue = invoices
            .filter(i => {
                const d = new Date(i.date);
                return i.type === 'invoice' && i.status !== 'draft' && d.getMonth() === monthNum && d.getFullYear() === currentYear;
            })
            .reduce((sum, i) => sum + i.amount, 0);

        // Calculate expenses for this month
        const monthlyExpenses = purchases
            .filter(p => {
                const d = new Date(p.date);
                return p.type === 'invoice' && d.getMonth() === monthNum && d.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            name: month,
            revenue: monthlyRevenue,
            expenses: monthlyExpenses
        };
    });
  }, [invoices, purchases]);

  return (
    <AppContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      products, addProduct, updateProduct, deleteProduct,
      invoices, createSalesDocument, updateInvoice, deleteInvoice,
      purchases, createPurchaseDocument, updatePurchase, deletePurchase,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      stockMovements, addStockMovement,
      stockTransfers, transferStock,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
      bankTransactions, addBankTransaction, deleteBankTransaction,
      cashSessions, openCashSession, closeCashSession,
      cashTransactions, addCashTransaction,
      recordDocPayment, // Export the new function
      // Services
      technicians, addTechnician, updateTechnician, deleteTechnician,
      serviceCatalog, addServiceItem, updateServiceItem, deleteServiceItem,
      serviceJobs, addServiceJob, updateServiceJob, deleteServiceJob,
      serviceSales, addServiceSale, updateServiceSale, deleteServiceSale,
      settings, updateSettings,
      stats: { revenue, expenses, profit },
      chartData,
      isLoading, setIsLoading,
      t, formatCurrency
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

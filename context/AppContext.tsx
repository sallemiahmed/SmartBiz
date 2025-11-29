import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  StockTransfer, BankAccount, BankTransaction, CashSession, CashTransaction, 
  AppSettings, DashboardStats, SalesDocumentType, PurchaseDocumentType, InvoiceItem
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, 
  mockWarehouses, mockStockMovements, mockStockTransfers, mockBankAccounts, 
  mockBankTransactions, mockCashSessions, mockCashTransactions 
} from '../services/mockData';
import { loadTranslations } from '../services/translations';

interface AppContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
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
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  invoices: Invoice[];
  createSalesDocument: (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  purchases: Purchase[];
  createPurchaseDocument: (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]) => Purchase;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;
  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;
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
  closeCashSession: (amount: number, notes?: string) => void;
  cashTransactions: CashTransaction[];
  addCashTransaction: (tx: CashTransaction) => void;
  stats: DashboardStats;
  chartData: any[];
  formatCurrency: (amount: number, currency?: string) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'My Business',
    companyEmail: 'info@business.com',
    companyPhone: '+1 234 567 890',
    companyAddress: '123 Business St, City, Country',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    geminiApiKey: '',
    enableFiscalStamp: false,
    fiscalStampValue: 1.000,
    taxRates: [
      { id: 'vat1', name: 'VAT Standard', rate: 19, isDefault: true },
      { id: 'vat2', name: 'VAT Reduced', rate: 7 }
    ],
    customFields: {
      clients: [],
      suppliers: []
    }
  });

  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  // Data State
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

  // Load Translations
  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => {
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = currencyCode || settings.currency;
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
      style: 'currency',
      currency: code,
      minimumFractionDigits: code === 'TND' ? 3 : 2
    }).format(amount);
  };

  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  // --- CRUD Operations ---

  const addClient = (client: Client) => setClients(prev => [client, ...prev]);
  const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  const addSupplier = (supplier: Supplier) => setSuppliers(prev => [supplier, ...prev]);
  const updateSupplier = (supplier: Supplier) => setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  const addProduct = (product: Product) => setProducts(prev => [product, ...prev]);
  const updateProduct = (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const addWarehouse = (wh: Warehouse) => setWarehouses(prev => [...prev, wh]);
  const updateWarehouse = (wh: Warehouse) => setWarehouses(prev => prev.map(w => w.id === wh.id ? wh : w));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(w => w.id !== id));

  // --- Sales Documents & Stock Impact ---
  const createSalesDocument = (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]): Invoice => {
    const newNumber = docData.number || `${type.toUpperCase().substring(0,3)}-${Date.now()}`;
    const newDoc: Invoice = {
      ...docData,
      id: docData.id || `inv-${Date.now()}`,
      type,
      number: newNumber,
      items,
      status: docData.status || 'draft',
      date: docData.date || new Date().toISOString(),
      dueDate: docData.dueDate || new Date().toISOString(),
      amount: docData.amount || 0,
      clientId: docData.clientId || '',
      clientName: docData.clientName || ''
    } as Invoice;

    setInvoices(prev => [newDoc, ...prev]);

    // Update Client Spend
    if (newDoc.status !== 'draft') {
      const client = clients.find(c => c.id === newDoc.clientId);
      if (client) {
        updateClient({ ...client, totalSpent: client.totalSpent + newDoc.amount });
      }
    }

    // Stock Deduction Logic
    if (type === 'delivery' || type === 'invoice' || type === 'issue') {
      const warehouseId = docData.warehouseId;
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const soldItem = items.find(item => item.id === prod.id);
          if (soldItem) {
            const newTotalStock = prod.stock - soldItem.quantity;
            const updatedWarehouseStock = { ...prod.warehouseStock };
            updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) - soldItem.quantity;
            
            // Log movement
            addStockMovement({
              id: `sm-${Date.now()}-${prod.id}`,
              productId: prod.id,
              productName: prod.name,
              warehouseId,
              warehouseName: warehouses.find(w => w.id === warehouseId)?.name || 'Unknown',
              date: new Date().toISOString(),
              quantity: -soldItem.quantity,
              type: 'sale',
              reference: newNumber,
              notes: `Sold via ${type}`,
              unitCost: prod.cost,
              costBefore: prod.cost,
              costAfter: prod.cost
            });

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

    // Stock Return Logic
    if (type === 'return') {
      // Assuming linkedDocumentId exists to find warehouse
      // Simplified: return to default warehouse if not specified
      const warehouseId = warehouses.find(w => w.isDefault)?.id || warehouses[0].id;
      
      setProducts(prevProducts => prevProducts.map(prod => {
        const returnedItem = items.find(item => item.id === prod.id);
        if (returnedItem) {
          const newTotalStock = prod.stock + returnedItem.quantity;
          const updatedWarehouseStock = { ...prod.warehouseStock };
          updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) + returnedItem.quantity;

          addStockMovement({
            id: `sm-ret-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            warehouseId,
            warehouseName: warehouses.find(w => w.id === warehouseId)?.name || 'Unknown',
            date: new Date().toISOString(),
            quantity: returnedItem.quantity,
            type: 'return',
            reference: newNumber,
            notes: `Returned from ${docData.clientName}`,
            unitCost: prod.cost,
            costBefore: prod.cost,
            costAfter: prod.cost
          });

          return { ...prod, stock: newTotalStock, warehouseStock: updatedWarehouseStock };
        }
        return prod;
      }));
    }

    return newDoc;
  };

  const updateInvoice = (invoice: Invoice) => setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));

  // --- Purchase Documents & Stock Impact ---
  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]): Purchase => {
    const newNumber = docData.number || `PO-${Date.now()}`;
    const newDoc: Purchase = {
      ...docData,
      id: docData.id || `po-${Date.now()}`,
      type,
      number: newNumber,
      items,
      status: docData.status || 'pending',
      date: docData.date || new Date().toISOString(),
      amount: docData.amount || 0,
      supplierId: docData.supplierId || '',
      supplierName: docData.supplierName || ''
    } as Purchase;

    setPurchases(prev => [newDoc, ...prev]);

    if (newDoc.status === 'completed' || type === 'invoice') {
      const supplier = suppliers.find(s => s.id === newDoc.supplierId);
      if (supplier) {
        updateSupplier({ ...supplier, totalPurchased: supplier.totalPurchased + newDoc.amount });
      }
    }

    // IMPACT: Stock Increase (Purchases / GRN) & COST CALCULATION
    if (type === 'delivery' || type === 'invoice') {
      const warehouseId = docData.warehouseId;
      const warehouseName = warehouses.find(w => w.id === warehouseId)?.name || 'Unknown';
      
      const exchangeRate = docData.exchangeRate || 1;
      const additionalCosts = (docData.additionalCosts || 0) * exchangeRate; 
      
      const docSubtotal = items.reduce((sum, item) => sum + ((item.price * exchangeRate) * item.quantity), 0);

      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const purchasedItem = items.find(item => item.id === prod.id);
          
          if (purchasedItem) {
            const currentTotalStock = prod.stock;
            const currentCost = prod.cost; 
            const currentTotalValue = currentTotalStock * currentCost;

            const itemPriceBase = purchasedItem.price * exchangeRate;
            const itemTotalValue = itemPriceBase * purchasedItem.quantity;
            
            const costAllocationRatio = docSubtotal > 0 ? (itemTotalValue / docSubtotal) : 0;
            const allocatedAdditionalCost = additionalCosts * costAllocationRatio;
            const totalIncomingCost = itemTotalValue + allocatedAdditionalCost;
            
            const incomingUnitCost = purchasedItem.quantity > 0 ? totalIncomingCost / purchasedItem.quantity : 0;

            const newTotalStock = currentTotalStock + purchasedItem.quantity;
            let newWAC = currentCost;

            if (newTotalStock > 0) {
                if (currentTotalStock < 0) {
                   newWAC = incomingUnitCost; 
                } else {
                   newWAC = (currentTotalValue + totalIncomingCost) / newTotalStock;
                }
            } else {
                newWAC = incomingUnitCost;
            }

            addStockMovement({
              id: `sm-pur-${Date.now()}-${prod.id}`,
              productId: prod.id,
              productName: prod.name,
              warehouseId: warehouseId,
              warehouseName: warehouseName,
              date: new Date().toISOString(),
              quantity: purchasedItem.quantity,
              type: 'purchase',
              reference: newNumber,
              notes: `Received via ${type === 'invoice' ? 'Invoice' : 'GRN'} from ${docData.supplierName}`,
              unitCost: incomingUnitCost,
              costBefore: currentCost,
              costAfter: newWAC
            });

            const updatedWarehouseStock = { ...prod.warehouseStock };
            updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) + purchasedItem.quantity;

            return {
              ...prod,
              stock: newTotalStock,
              warehouseStock: updatedWarehouseStock,
              cost: newWAC,
              status: newTotalStock <= 0 ? 'out_of_stock' : newTotalStock <= 10 ? 'low_stock' : 'in_stock'
            };
          }
          return prod;
        }));
      }
    }

    return newDoc;
  };

  const updatePurchase = (purchase: Purchase) => setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));
  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));

  // --- Stock Movements & Transfers ---
  const addStockMovement = (movement: StockMovement) => setStockMovements(prev => [movement, ...prev]);
  
  const transferStock = (data: { productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reference?: string, notes?: string }) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = data;
    
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === productId) {
        const fromQty = p.warehouseStock[fromWarehouseId] || 0;
        const toQty = p.warehouseStock[toWarehouseId] || 0;
        
        if (fromQty < quantity) {
          alert(`Insufficient stock in source warehouse. Available: ${fromQty}`);
          return p;
        }

        const newStock = { ...p.warehouseStock };
        newStock[fromWarehouseId] = fromQty - quantity;
        newStock[toWarehouseId] = toQty + quantity;

        // Log Transfer Out
        addStockMovement({
          id: `sm-to-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          warehouseId: fromWarehouseId,
          warehouseName: warehouses.find(w => w.id === fromWarehouseId)?.name || '',
          relatedWarehouseId: toWarehouseId,
          relatedWarehouseName: warehouses.find(w => w.id === toWarehouseId)?.name || '',
          date: new Date().toISOString(),
          quantity: -quantity,
          type: 'transfer_out',
          reference: data.reference,
          notes: data.notes,
          unitCost: p.cost,
          costBefore: p.cost,
          costAfter: p.cost
        });

        // Log Transfer In
        addStockMovement({
          id: `sm-ti-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          warehouseId: toWarehouseId,
          warehouseName: warehouses.find(w => w.id === toWarehouseId)?.name || '',
          relatedWarehouseId: fromWarehouseId,
          relatedWarehouseName: warehouses.find(w => w.id === fromWarehouseId)?.name || '',
          date: new Date().toISOString(),
          quantity: quantity,
          type: 'transfer_in',
          reference: data.reference,
          notes: data.notes,
          unitCost: p.cost,
          costBefore: p.cost,
          costAfter: p.cost
        });

        return { ...p, warehouseStock: newStock };
      }
      return p;
    }));

    setStockTransfers(prev => [{
      id: `tr-${Date.now()}`,
      date: new Date().toISOString(),
      ...data,
      productName: products.find(p => p.id === productId)?.name || ''
    }, ...prev]);
  };

  // --- Banking & Cash ---
  const addBankAccount = (acc: BankAccount) => setBankAccounts(prev => [...prev, acc]);
  const updateBankAccount = (acc: BankAccount) => setBankAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  const deleteBankAccount = (id: string) => setBankAccounts(prev => prev.filter(a => a.id !== id));

  const addBankTransaction = (tx: BankTransaction) => {
    setBankTransactions(prev => [tx, ...prev]);
    // Update Account Balance
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        return { ...acc, balance: acc.balance + tx.amount };
      }
      return acc;
    }));
  };
  const deleteBankTransaction = (id: string) => setBankTransactions(prev => prev.filter(t => t.id !== id));

  const openCashSession = (amount: number) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedBy: 'Current User',
      startTime: new Date().toISOString(),
      openingBalance: amount,
      expectedBalance: amount,
      status: 'open'
    };
    setCashSessions(prev => [newSession, ...prev]);
  };

  const closeCashSession = (amount: number, notes?: string) => {
    setCashSessions(prev => prev.map(s => {
      if (s.status === 'open') {
        return {
          ...s,
          endTime: new Date().toISOString(),
          closingBalance: amount,
          status: 'closed',
          notes
        };
      }
      return s;
    }));
  };

  const addCashTransaction = (tx: CashTransaction) => {
    setCashTransactions(prev => [tx, ...prev]);
    setCashSessions(prev => prev.map(s => {
      if (s.id === tx.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + tx.amount };
      }
      return s;
    }));
  };

  // --- Derived Stats & Data ---
  const stats: DashboardStats = useMemo(() => {
    const revenue = invoices.filter(i => i.type === 'invoice' && i.status !== 'draft').reduce((acc, i) => acc + i.amount, 0);
    // Simple expense calculation
    const expenses = purchases.filter(p => p.type === 'invoice').reduce((acc, p) => acc + p.amount, 0);
    const profit = revenue - expenses;
    const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
    return { revenue, expenses, profit, pendingInvoices };
  }, [invoices, purchases]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(m => ({
      name: m,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      expenses: Math.floor(Math.random() * 3000) + 500,
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      isLoading, setIsLoading,
      settings, updateSettings,
      clients, addClient, updateClient, deleteClient,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      products, addProduct, updateProduct, deleteProduct,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      invoices, createSalesDocument, updateInvoice, deleteInvoice,
      purchases, createPurchaseDocument, updatePurchase, deletePurchase,
      stockMovements, addStockMovement,
      stockTransfers, transferStock,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
      bankTransactions, addBankTransaction, deleteBankTransaction,
      cashSessions, openCashSession, closeCashSession,
      cashTransactions, addCashTransaction,
      stats, chartData,
      formatCurrency, t
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

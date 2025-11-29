
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Client, Supplier, Product, Invoice, DashboardStats, Purchase, InvoiceItem, SalesDocumentType, PurchaseDocumentType, AppSettings, Language, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement } from '../types';
import { mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, mockBankAccounts, mockBankTransactions, mockCashSessions, mockCashTransactions, mockWarehouses, mockStockTransfers, mockStockMovements } from '../services/mockData';
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
  stockMovements: StockMovement[];
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  settings: AppSettings;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Helper
  t: (key: string) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;

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
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addBankTransaction: (transaction: BankTransaction) => void;
  deleteBankTransaction: (id: string) => void;

  // Cash Actions
  openCashSession: (amount: number) => void;
  closeCashSession: (amount: number, notes?: string) => void;
  addCashTransaction: (transaction: CashTransaction) => void;

  // Warehouse Actions
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  transferStock: (transfer: Omit<StockTransfer, 'id' | 'date' | 'productName'>) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;

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
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'Tunisie Tech Solutions',
    companyEmail: 'contact@tuntech.tn',
    companyPhone: '+216 71 123 456',
    companyAddress: 'Immeuble Jasmine, Les Berges du Lac 2, Tunis, 1053',
    companyVatId: '1234567/A/M/000',
    currency: 'TND',
    language: 'fr', 
    timezone: 'UTC+1',
    geminiApiKey: process.env.API_KEY || "", 
    enableFiscalStamp: true,
    fiscalStampValue: 1.000,
    taxRates: [
      { id: '1', name: 'TVA Standard', rate: 19, isDefault: true },
      { id: '2', name: 'TVA Réduit', rate: 7 },
      { id: '3', name: 'TVA Interm.', rate: 13 },
      { id: '4', name: 'Exonéré', rate: 0 }
    ],
    customFields: {
      clients: [
        { id: 'cf1', key: 'matricule_fiscale', label: 'Matricule Fiscale', type: 'text', required: false }
      ],
      suppliers: []
    }
  });

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>({});

  // Load translations when language changes
  useEffect(() => {
    setIsLoading(true);
    loadTranslations(settings.language).then(data => {
      setCurrentTranslations(data);
      setTimeout(() => setIsLoading(false), 500); // Simulate subtle load for effect
    });
  }, [settings.language]);

  // --- DERIVED STATE (STATS & CHARTS) ---

  // Dynamic Stats Calculation (Normalized to Base Currency)
  const stats: DashboardStats = useMemo(() => {
    const revenue = invoices
      .filter(i => (i.type === 'invoice' && i.status !== 'draft')) 
      .reduce((sum, i) => sum + (i.amount * (i.exchangeRate || 1)), 0);
    
    // Subtract Credit Notes from Revenue
    const credits = invoices
      .filter(i => i.type === 'credit')
      .reduce((sum, i) => sum + (i.amount * (i.exchangeRate || 1)), 0);

    const netRevenue = revenue - credits;

    const expenses = purchases
      .filter(p => p.type === 'invoice') // Count all registered purchase invoices
      .reduce((sum, p) => sum + (p.amount * (p.exchangeRate || 1)), 0);

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
          const amountInBase = inv.amount * (inv.exchangeRate || 1);
          if (inv.type === 'credit') {
            data[key].revenue -= amountInBase;
          } else {
            data[key].revenue += amountInBase;
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
          data[key].expenses += (pur.amount * (pur.exchangeRate || 1));
        }
      }
    });

    return Object.values(data);
  }, [invoices, purchases]);

  // --- HELPERS ---
  const t = (key: string): string => {
    return currentTranslations[key] || key;
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-TN'), {
      style: 'currency',
      currency: currencyCode || settings.currency,
      minimumFractionDigits: (currencyCode || settings.currency) === 'TND' ? 3 : 2
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
  const addBankAccount = (account: BankAccount) => {
    setBankAccounts(prev => [...prev, account]);
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

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

  const deleteBankTransaction = (id: string) => {
    const tx = bankTransactions.find(t => t.id === id);
    if (tx) {
        setBankTransactions(prev => prev.filter(t => t.id !== id));
        // Revert balance
        setBankAccounts(prev => prev.map(acc => {
            if (acc.id === tx.accountId) {
                return { ...acc, balance: acc.balance - tx.amount };
            }
            return acc;
        }));
    }
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

  // Traceability
  const addStockMovement = (movement: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setStockMovements(prev => [newMovement, ...prev]);
  };

  const transferStock = (transferData: Omit<StockTransfer, 'id' | 'date' | 'productName'>) => {
    const product = products.find(p => p.id === transferData.productId);
    if (!product) return;

    const sourceWarehouseName = warehouses.find(w => w.id === transferData.fromWarehouseId)?.name || 'Unknown';
    const destWarehouseName = warehouses.find(w => w.id === transferData.toWarehouseId)?.name || 'Unknown';

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

    // 2. Log Movements
    const ref = transferData.reference || `TR-${newTransfer.id.substr(-4)}`;
    // Out from source
    addStockMovement({
      productId: product.id,
      productName: product.name,
      warehouseId: transferData.fromWarehouseId,
      warehouseName: sourceWarehouseName,
      relatedWarehouseId: transferData.toWarehouseId,
      relatedWarehouseName: destWarehouseName,
      date: new Date().toISOString(),
      quantity: -transferData.quantity,
      type: 'transfer_out',
      reference: ref,
      notes: transferData.notes || `Transfer to ${destWarehouseName}`,
      unitCost: product.cost,
      costBefore: product.cost,
      costAfter: product.cost
    });
    // In to dest
    addStockMovement({
      productId: product.id,
      productName: product.name,
      warehouseId: transferData.toWarehouseId,
      warehouseName: destWarehouseName,
      relatedWarehouseId: transferData.fromWarehouseId,
      relatedWarehouseName: sourceWarehouseName,
      date: new Date().toISOString(),
      quantity: transferData.quantity,
      type: 'transfer_in',
      reference: ref,
      notes: transferData.notes || `Transfer from ${sourceWarehouseName}`,
      unitCost: product.cost,
      costBefore: product.cost,
      costAfter: product.cost
    });

    // 3. Update Product Stock
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
    let prefix = 'F'; // Facture
    if (type === 'estimate') prefix = 'D'; // Devis
    if (type === 'order') prefix = 'BC'; // Bon Commande
    if (type === 'delivery') prefix = 'BL'; // Bon Livraison
    if (type === 'issue') prefix = 'BS'; // Bon Sortie
    if (type === 'return') prefix = 'BR'; // Bon Retour
    if (type === 'credit') prefix = 'AV'; // Avoir

    const newNumber = `${prefix}-${new Date().getFullYear()}-${String(invoices.length + 1001).padStart(4, '0')}`;
    
    // SNAPSHOT HISTORICAL COST for COGS analysis
    const itemsWithCostSnapshot = items.map(item => {
      const product = products.find(p => p.id === item.id);
      return {
        ...item,
        historicalCost: product ? product.cost : 0
      };
    });

    const newDoc: Invoice = {
      ...docData,
      id: newId,
      number: newNumber,
      type,
      items: itemsWithCostSnapshot,
      // Ensure currency fallback
      currency: docData.currency || settings.currency,
      exchangeRate: docData.exchangeRate || 1
    };

    // 1. Add Document Record
    setInvoices(prev => [newDoc, ...prev]);

    // 2. Update Related Data
    
    // IMPACT: Stock Deduction (Sales) - Updated for Warehouse Logic
    if (type === 'invoice' || type === 'delivery' || type === 'issue') {
      const warehouseId = docData.warehouseId;
      const warehouseName = warehouses.find(w => w.id === warehouseId)?.name || 'Unknown';

      if (!warehouseId && type !== 'invoice') { 
         console.warn("No warehouse selected for stock deduction!");
      }

      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const soldItem = items.find(item => item.id === prod.id);
          if (soldItem) {
            // Log Movement
            addStockMovement({
              productId: prod.id,
              productName: prod.name,
              warehouseId: warehouseId,
              warehouseName: warehouseName,
              date: new Date().toISOString(),
              quantity: -soldItem.quantity,
              type: 'sale',
              reference: newNumber,
              notes: `${type === 'issue' ? 'Manual Issue' : 'Sale'} to ${docData.clientName}`,
              unitCost: prod.cost,
              costBefore: prod.cost,
              costAfter: prod.cost
            });

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
      const warehouseId = docData.warehouseId || warehouses.find(w => w.isDefault)?.id || warehouses[0]?.id; // Default to main warehouse for returns if not specified
      const warehouseName = warehouses.find(w => w.id === warehouseId)?.name || 'Unknown';

      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const returnedItem = items.find(item => item.id === prod.id);
          if (returnedItem) {
            // Log Movement
            addStockMovement({
              productId: prod.id,
              productName: prod.name,
              warehouseId: warehouseId,
              warehouseName: warehouseName,
              date: new Date().toISOString(),
              quantity: returnedItem.quantity,
              type: 'return',
              reference: newNumber,
              notes: `Return from ${docData.clientName}`,
              unitCost: prod.cost, // Ideally this should be cost at time of sale, but simplicity uses current
              costBefore: prod.cost,
              costAfter: prod.cost
            });

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

    // IMPACT: Client Total Spent (Normalize to base currency)
    const baseAmount = docData.amount * (docData.exchangeRate || 1);
    if (type === 'invoice') {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === docData.clientId) {
          return { ...client, totalSpent: client.totalSpent + baseAmount };
        }
        return client;
      }));
    }

    // IMPACT: Credit Note (Reduce Total Spent or handle as credit)
    if (type === 'credit') {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === docData.clientId) {
          return { ...client, totalSpent: Math.max(0, client.totalSpent - baseAmount) };
        }
        return client;
      }));
    }

    return newDoc;
  };

  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Omit<Purchase, 'id' | 'number' | 'type' | 'items'>, items: InvoiceItem[]): Purchase => {
    const newId = `PO-${Date.now()}`;
    const prefix = type === 'order' ? 'BCF' : type === 'delivery' ? 'BR' : 'FF'; // Bon Commande Fourn, Bon Reception, Facture Fourn
    const newNumber = `${prefix}-${new Date().getFullYear()}-${String(purchases.length + 5001).padStart(4, '0')}`;
    
    const newDoc: Purchase = {
      ...docData,
      id: newId,
      number: newNumber,
      type,
      items,
      // Ensure currency fallback
      currency: docData.currency || settings.currency,
      exchangeRate: docData.exchangeRate || 1
    };

    // 1. Record Document
    setPurchases(prev => [newDoc, ...prev]);

    // Update Supplier Financials if Invoice (Normalize to base currency)
    const baseAmount = docData.amount * (docData.exchangeRate || 1);
    if (type === 'invoice') {
        setSuppliers(prevSuppliers => prevSuppliers.map(s => {
          if (s.id === docData.supplierId) {
            return { ...s, totalPurchased: s.totalPurchased + baseAmount };
          }
          return s;
        }));
    }

    // IMPACT: Stock Increase (Purchases / GRN) & COST CALCULATION
    // We only update stock and calculate new WAC when goods are delivered (GRN/Delivery)
    if (type === 'delivery') {
      const warehouseId = docData.warehouseId;
      const warehouseName = warehouses.find(w => w.id === warehouseId)?.name || 'Unknown';
      
      // Convert costs to Base Currency for WAC calculation
      const exchangeRate = docData.exchangeRate || 1;
      const additionalCosts = (docData.additionalCosts || 0) * exchangeRate; // Convert to Base
      
      // Calculate Subtotal in Base Currency
      const docSubtotal = items.reduce((sum, item) => sum + ((item.price * exchangeRate) * item.quantity), 0);

      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const purchasedItem = items.find(item => item.id === prod.id);
          
          if (purchasedItem) {
            const currentTotalStock = prod.stock;
            const currentCost = prod.cost; // Already in Base
            const currentTotalValue = currentTotalStock * currentCost;

            // Calculate Allocated Cost for this item (All in Base Currency)
            const itemPriceBase = purchasedItem.price * exchangeRate;
            const itemTotalValue = itemPriceBase * purchasedItem.quantity;
            
            const costAllocationRatio = docSubtotal > 0 ? (itemTotalValue / docSubtotal) : 0;
            const allocatedAdditionalCost = additionalCosts * costAllocationRatio;
            const totalIncomingCost = itemTotalValue + allocatedAdditionalCost;
            
            // Effective unit cost of this incoming batch (Base Currency)
            const incomingUnitCost = purchasedItem.quantity > 0 ? totalIncomingCost / purchasedItem.quantity : 0;

            // New WAC Calculation
            const newTotalStock = currentTotalStock + purchasedItem.quantity;
            const newWAC = newTotalStock > 0 
                ? (currentTotalValue + totalIncomingCost) / newTotalStock 
                : incomingUnitCost; // fallback to incoming cost if previous stock was 0

            // Log Movement with Cost Details
            addStockMovement({
              productId: prod.id,
              productName: prod.name,
              warehouseId: warehouseId,
              warehouseName: warehouseName,
              date: new Date().toISOString(),
              quantity: purchasedItem.quantity,
              type: 'purchase',
              reference: newNumber,
              notes: `Received from ${docData.supplierName}`,
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

  return (
    <AppContext.Provider value={{
      clients, suppliers, products, invoices, purchases, 
      bankAccounts, bankTransactions, cashSessions, cashTransactions,
      warehouses, stockTransfers, stockMovements,
      stats, chartData, settings,
      isLoading, setIsLoading,
      t,
      formatCurrency,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addProduct, updateProduct, deleteProduct,
      deleteInvoice, updateInvoice,
      deletePurchase, updatePurchase,
      addBankAccount, updateBankAccount, deleteBankAccount,
      addBankTransaction, deleteBankTransaction,
      openCashSession, closeCashSession, addCashTransaction,
      addWarehouse, updateWarehouse, deleteWarehouse, transferStock, addStockMovement,
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

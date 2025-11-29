
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, 
  StockMovement, StockTransfer, BankAccount, BankTransaction, 
  CashSession, CashTransaction, AppSettings, SalesDocumentType, 
  PurchaseDocumentType, InvoiceItem
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, 
  mockPurchases, mockWarehouses, mockStockMovements, mockStockTransfers,
  mockBankAccounts, mockBankTransactions, mockCashSessions, mockCashTransactions 
} from '../services/mockData';
import { loadTranslations } from '../services/translations';

interface AppContextType {
  clients: Client[];
  suppliers: Supplier[];
  products: Product[];
  invoices: Invoice[];
  purchases: Purchase[];
  warehouses: Warehouse[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  cashSessions: CashSession[];
  cashTransactions: CashTransaction[];
  settings: AppSettings;
  stats: { revenue: number; expenses: number; profit: number };
  chartData: any[];
  isLoading: boolean;
  
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  
  createSalesDocument: (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]) => Invoice;
  createPurchaseDocument: (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]) => Purchase;
  deleteInvoice: (id: string) => void;
  deletePurchase: (id: string) => void;
  
  addStockMovement: (movement: StockMovement) => void;
  transferStock: (transfer: any) => void;
  
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addBankTransaction: (tx: BankTransaction) => void;
  deleteBankTransaction: (id: string) => void;
  
  openCashSession: (amount: number) => void;
  closeCashSession: (amount: number, notes?: string) => void;
  addCashTransaction: (tx: CashTransaction) => void;
  
  updateSettings: (newSettings: AppSettings) => void;
  setIsLoading: (loading: boolean) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  t: (key: string) => string;
}

const defaultSettings: AppSettings = {
  companyName: 'My Business',
  companyEmail: 'contact@business.com',
  companyPhone: '+1 234 567 890',
  companyAddress: '123 Business St',
  currency: 'TND',
  language: 'en',
  timezone: 'UTC+1',
  enableFiscalStamp: true,
  fiscalStampValue: 1.000,
  taxRates: [{ id: '1', name: 'VAT Standard', rate: 19, isDefault: true }],
  customFields: { clients: [], suppliers: [] }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key;

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
      style: 'currency',
      currency: currencyCode || settings.currency,
      minimumFractionDigits: (currencyCode || settings.currency) === 'TND' ? 3 : 2
    }).format(amount);
  };

  // CRUD Operations
  const addClient = (client: Client) => setClients([...clients, client]);
  const updateClient = (client: Client) => setClients(clients.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));

  const addSupplier = (supplier: Supplier) => setSuppliers([...suppliers, supplier]);
  const updateSupplier = (supplier: Supplier) => setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
  const deleteSupplier = (id: string) => setSuppliers(suppliers.filter(s => s.id !== id));

  const addProduct = (product: Product) => setProducts([...products, product]);
  const updateProduct = (product: Product) => setProducts(products.map(p => p.id === product.id ? product : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const addWarehouse = (warehouse: Warehouse) => setWarehouses([...warehouses, warehouse]);
  const updateWarehouse = (warehouse: Warehouse) => setWarehouses(warehouses.map(w => w.id === warehouse.id ? warehouse : w));
  const deleteWarehouse = (id: string) => setWarehouses(warehouses.filter(w => w.id !== id));

  const addStockMovement = (movement: StockMovement) => setStockMovements(prev => [...prev, movement]);

  const createSalesDocument = (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]): Invoice => {
    const newNumber = `${type.toUpperCase().substring(0,3)}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    const newDoc: Invoice = {
      id: `${type}-${Date.now()}`,
      number: newNumber,
      type,
      status: 'draft',
      items,
      clientId: '',
      clientName: 'Unknown',
      date: new Date().toISOString(),
      amount: 0,
      ...docData
    } as Invoice;

    setInvoices(prev => [newDoc, ...prev]);

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

    if (type === 'return') {
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

  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]): Purchase => {
    const newNumber = `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(4, '0')}`;
    const newDoc: Purchase = {
      id: `${type}-${Date.now()}`,
      number: newNumber,
      type,
      status: 'pending',
      items,
      supplierId: '',
      supplierName: 'Unknown',
      date: new Date().toISOString(),
      amount: 0,
      ...docData
    } as Purchase;

    setPurchases(prev => [newDoc, ...prev]);

    // Stock Addition Logic (GRN)
    if (type === 'delivery') {
      const warehouseId = docData.warehouseId;
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const receivedItem = items.find(item => item.id === prod.id);
          if (receivedItem) {
            const newTotalStock = prod.stock + receivedItem.quantity;
            const updatedWarehouseStock = { ...prod.warehouseStock };
            updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) + receivedItem.quantity;
            
            // Recalculate WAC
            const currentTotalValue = prod.stock * prod.cost;
            const incomingValue = receivedItem.quantity * receivedItem.price;
            const newCost = (currentTotalValue + incomingValue) / newTotalStock;

            addStockMovement({
              id: `sm-grn-${Date.now()}-${prod.id}`,
              productId: prod.id,
              productName: prod.name,
              warehouseId,
              warehouseName: warehouses.find(w => w.id === warehouseId)?.name || 'Unknown',
              date: new Date().toISOString(),
              quantity: receivedItem.quantity,
              type: 'purchase',
              reference: newNumber,
              notes: `Received via ${type}`,
              unitCost: receivedItem.price,
              costBefore: prod.cost,
              costAfter: newCost
            });

            return { 
              ...prod, 
              stock: newTotalStock, 
              warehouseStock: updatedWarehouseStock, 
              cost: newCost,
              status: newTotalStock > 10 ? 'in_stock' : 'low_stock'
            };
          }
          return prod;
        }));
      }
    }

    return newDoc;
  };

  const deleteInvoice = (id: string) => setInvoices(invoices.filter(i => i.id !== id));
  const deletePurchase = (id: string) => setPurchases(purchases.filter(p => p.id !== id));

  const transferStock = (transfer: any) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, reference, notes } = transfer;
    
    setProducts(prevProducts => prevProducts.map(prod => {
      if (prod.id === productId) {
        const fromStock = prod.warehouseStock[fromWarehouseId] || 0;
        if (fromStock < quantity) {
          alert(`Insufficient stock in source warehouse. Available: ${fromStock}`);
          return prod;
        }

        const newWhStock = { ...prod.warehouseStock };
        newWhStock[fromWarehouseId] = fromStock - quantity;
        newWhStock[toWarehouseId] = (newWhStock[toWarehouseId] || 0) + quantity;

        const fromWhName = warehouses.find(w => w.id === fromWarehouseId)?.name || fromWarehouseId;
        const toWhName = warehouses.find(w => w.id === toWarehouseId)?.name || toWarehouseId;

        // Log Movements
        setStockMovements(prev => [
          ...prev,
          {
            id: `sm-tr-out-${Date.now()}`,
            productId,
            productName: prod.name,
            warehouseId: fromWarehouseId,
            warehouseName: fromWhName,
            relatedWarehouseName: toWhName,
            date: new Date().toISOString(),
            quantity: -quantity,
            type: 'transfer_out',
            reference,
            notes,
            unitCost: prod.cost,
            costBefore: prod.cost,
            costAfter: prod.cost
          },
          {
            id: `sm-tr-in-${Date.now()}`,
            productId,
            productName: prod.name,
            warehouseId: toWarehouseId,
            warehouseName: toWhName,
            relatedWarehouseName: fromWhName,
            date: new Date().toISOString(),
            quantity: quantity,
            type: 'transfer_in',
            reference,
            notes,
            unitCost: prod.cost,
            costBefore: prod.cost,
            costAfter: prod.cost
          }
        ]);

        setStockTransfers(prev => [...prev, {
          id: `tr-${Date.now()}`,
          date: new Date().toISOString(),
          productId,
          productName: prod.name,
          fromWarehouseId,
          toWarehouseId,
          quantity,
          reference,
          notes
        }]);

        return { ...prod, warehouseStock: newWhStock };
      }
      return prod;
    }));
  };

  // Banking & Cash
  const addBankAccount = (acc: BankAccount) => setBankAccounts([...bankAccounts, acc]);
  const updateBankAccount = (acc: BankAccount) => setBankAccounts(bankAccounts.map(a => a.id === acc.id ? acc : a));
  const deleteBankAccount = (id: string) => setBankAccounts(bankAccounts.filter(a => a.id !== id));
  
  const addBankTransaction = (tx: BankTransaction) => {
    setBankTransactions([...bankTransactions, tx]);
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
      setBankAccounts(prev => prev.map(acc => {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        return acc;
      }));
      setBankTransactions(bankTransactions.filter(t => t.id !== id));
    }
  };

  const openCashSession = (amount: number) => {
    setCashSessions([...cashSessions, {
      id: `cs-${Date.now()}`,
      openedBy: 'CurrentUser',
      startTime: new Date().toISOString(),
      openingBalance: amount,
      expectedBalance: amount,
      status: 'open'
    }]);
  };

  const closeCashSession = (amount: number) => {
    setCashSessions(prev => prev.map(s => {
      if (s.status === 'open') {
        return { ...s, status: 'closed', closingBalance: amount, endTime: new Date().toISOString() };
      }
      return s;
    }));
  };

  const addCashTransaction = (tx: CashTransaction) => {
    setCashTransactions([...cashTransactions, tx]);
    setCashSessions(prev => prev.map(s => {
      if (s.id === tx.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + tx.amount };
      }
      return s;
    }));
  };

  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  const stats = {
    revenue: invoices.reduce((acc, inv) => acc + (inv.status !== 'draft' ? inv.amount : 0), 0),
    expenses: purchases.reduce((acc, pur) => acc + (pur.status === 'completed' ? pur.amount : 0), 0),
    profit: 0
  };
  stats.profit = stats.revenue - stats.expenses;

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
      clients, suppliers, products, invoices, purchases, warehouses, stockMovements, stockTransfers,
      bankAccounts, bankTransactions, cashSessions, cashTransactions, settings, stats, chartData, isLoading,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addProduct, updateProduct, deleteProduct,
      addWarehouse, updateWarehouse, deleteWarehouse,
      createSalesDocument, createPurchaseDocument, deleteInvoice, deletePurchase,
      addStockMovement, transferStock,
      addBankAccount, updateBankAccount, deleteBankAccount, addBankTransaction, deleteBankTransaction,
      openCashSession, closeCashSession, addCashTransaction,
      updateSettings, setIsLoading, formatCurrency, t
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

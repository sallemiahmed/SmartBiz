import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, StockTransfer, 
  BankAccount, BankTransaction, CashSession, CashTransaction, AppSettings, SalesDocumentType, 
  PurchaseDocumentType, InvoiceItem 
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, mockWarehouses, 
  mockStockMovements, mockStockTransfers, mockBankAccounts, mockBankTransactions, 
  mockCashSessions, mockCashTransactions 
} from '../services/mockData';
import { loadTranslations } from '../services/translations';

// Define the shape of the context
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
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;

  stockTransfers: StockTransfer[];
  transferStock: (transfer: { productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reference?: string, notes?: string }) => void;

  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  createSalesDocument: (type: SalesDocumentType, docData: Partial<Invoice>, items: InvoiceItem[]) => Invoice;
  deleteInvoice: (id: string) => void;

  purchases: Purchase[];
  createPurchaseDocument: (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]) => Purchase;
  deletePurchase: (id: string) => void;

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

  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;

  stats: { revenue: number; expenses: number; profit: number };
  chartData: { name: string; revenue: number; expenses: number }[];

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  t: (key: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State Initialization
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [products, setProducts] = useState<Product[]>(mockInventory);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(mockStockTransfers);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(mockCashSessions);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(mockCashTransactions);
  
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const [settings, setSettingsState] = useState<AppSettings>({
    companyName: 'My Business',
    companyEmail: 'info@business.com',
    companyPhone: '+1 234 567 890',
    companyAddress: '123 Business St, City, Country',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    enableFiscalStamp: false,
    fiscalStampValue: 0.600,
    taxRates: [{ id: 't1', name: 'VAT', rate: 19, isDefault: true }],
    customFields: { clients: [], suppliers: [] }
  });

  // Load Translations
  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key;

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: currencyCode || settings.currency,
    }).format(amount);
  };

  // CRUD Helpers
  const addClient = (c: Client) => setClients(prev => [c, ...prev]);
  const updateClient = (c: Client) => setClients(prev => prev.map(item => item.id === c.id ? c : item));
  const deleteClient = (id: string) => setClients(prev => prev.filter(item => item.id !== id));

  const addSupplier = (s: Supplier) => setSuppliers(prev => [s, ...prev]);
  const updateSupplier = (s: Supplier) => setSuppliers(prev => prev.map(item => item.id === s.id ? s : item));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(item => item.id !== id));

  const addProduct = (p: Product) => setProducts(prev => [p, ...prev]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

  const addWarehouse = (w: Warehouse) => setWarehouses(prev => [w, ...prev]);
  const updateWarehouse = (w: Warehouse) => setWarehouses(prev => prev.map(item => item.id === w.id ? w : item));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(item => item.id !== id));

  const addStockMovement = (m: StockMovement) => setStockMovements(prev => [m, ...prev]);

  const transferStock = (data: { productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reference?: string, notes?: string }) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, reference, notes } = data;
    
    // Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newWarehouseStock = { ...p.warehouseStock };
        newWarehouseStock[fromWarehouseId] = (newWarehouseStock[fromWarehouseId] || 0) - quantity;
        newWarehouseStock[toWarehouseId] = (newWarehouseStock[toWarehouseId] || 0) + quantity;
        return { ...p, warehouseStock: newWarehouseStock };
      }
      return p;
    }));

    // Log Transfer
    const transfer: StockTransfer = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString(),
      productId,
      productName: products.find(p => p.id === productId)?.name || '',
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reference,
      notes
    };
    setStockTransfers(prev => [transfer, ...prev]);

    // Log Movements
    const product = products.find(p => p.id === productId);
    if (product) {
        const fromWhName = warehouses.find(w => w.id === fromWarehouseId)?.name || fromWarehouseId;
        const toWhName = warehouses.find(w => w.id === toWarehouseId)?.name || toWarehouseId;

        addStockMovement({
            id: `sm-out-${Date.now()}`,
            productId,
            productName: product.name,
            warehouseId: fromWarehouseId,
            warehouseName: fromWhName,
            relatedWarehouseName: toWhName,
            date: new Date().toISOString(),
            quantity: -quantity,
            type: 'transfer_out',
            reference,
            notes: notes || `Transfer to ${toWhName}`,
            unitCost: product.cost
        });

        addStockMovement({
            id: `sm-in-${Date.now()}`,
            productId,
            productName: product.name,
            warehouseId: toWarehouseId,
            warehouseName: toWhName,
            relatedWarehouseName: fromWhName,
            date: new Date().toISOString(),
            quantity: quantity,
            type: 'transfer_in',
            reference,
            notes: notes || `Transfer from ${fromWhName}`,
            unitCost: product.cost
        });
    }
  };

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

    // PARTIAL DELIVERY LOGIC: Update the Original Order
    if (type === 'delivery' && docData.linkedDocumentId) {
      setInvoices(prevInvoices => {
        const updatedInvoices = prevInvoices.map(inv => {
          if (inv.id === docData.linkedDocumentId) {
            // Update fulfilled quantities on the order items
            const updatedItems = inv.items.map(orderItem => {
              const deliveredItem = items.find(i => i.id === orderItem.id);
              if (deliveredItem) {
                return {
                  ...orderItem,
                  fulfilledQuantity: (orderItem.fulfilledQuantity || 0) + deliveredItem.quantity
                };
              }
              return orderItem;
            });

            // Check if order is completely fulfilled
            const isFullyDelivered = updatedItems.every(
              item => (item.fulfilledQuantity || 0) >= item.quantity
            );

            return {
              ...inv,
              items: updatedItems,
              status: isFullyDelivered ? 'completed' : 'pending'
            };
          }
          return inv;
        });
        
        // Add the new delivery document
        return [newDoc, ...updatedInvoices];
      });
    } else {
      setInvoices(prev => [newDoc, ...prev]);
    }

    // Update Client Spend
    if (newDoc.status !== 'draft' && type === 'invoice') {
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

  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(item => item.id !== id));

  const createPurchaseDocument = (type: PurchaseDocumentType, docData: Partial<Purchase>, items: InvoiceItem[]): Purchase => {
    const newDoc: Purchase = {
      ...docData,
      id: docData.id || `po-${Date.now()}`,
      type,
      number: docData.number || `${type.toUpperCase().substring(0,3)}-${Date.now()}`,
      items,
      status: docData.status || 'pending',
      date: docData.date || new Date().toISOString(),
      amount: docData.amount || 0,
      supplierId: docData.supplierId || '',
      supplierName: docData.supplierName || ''
    } as Purchase;

    setPurchases(prev => [newDoc, ...prev]);

    // Update Supplier Stats
    if (type === 'invoice' || type === 'order') {
        const supplier = suppliers.find(s => s.id === newDoc.supplierId);
        if (supplier) {
            updateSupplier({ ...supplier, totalPurchased: supplier.totalPurchased + newDoc.amount });
        }
    }

    // Stock Addition Logic (GRN)
    if (type === 'delivery') {
      const warehouseId = docData.warehouseId;
      if (warehouseId) {
        setProducts(prevProducts => prevProducts.map(prod => {
          const purchasedItem = items.find(item => item.id === prod.id);
          if (purchasedItem) {
            const newTotalStock = prod.stock + purchasedItem.quantity;
            const updatedWarehouseStock = { ...prod.warehouseStock };
            updatedWarehouseStock[warehouseId] = (updatedWarehouseStock[warehouseId] || 0) + purchasedItem.quantity;
            
            // WAC Calculation (Weighted Average Cost)
            // New Cost = ((Old Stock * Old Cost) + (New Qty * New Cost)) / (Old Stock + New Qty)
            // Note: Use global stock for WAC or per warehouse? Usually global.
            const oldTotalValue = prod.stock * prod.cost;
            const newPurchaseValue = purchasedItem.quantity * purchasedItem.price; // purchasedItem.price holds unit cost here
            const newCost = (oldTotalValue + newPurchaseValue) / newTotalStock;

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

  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(item => item.id !== id));

  const addBankAccount = (a: BankAccount) => setBankAccounts(prev => [a, ...prev]);
  const updateBankAccount = (a: BankAccount) => setBankAccounts(prev => prev.map(item => item.id === a.id ? a : item));
  const deleteBankAccount = (id: string) => setBankAccounts(prev => prev.filter(item => item.id !== id));

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

  const deleteBankTransaction = (id: string) => {
    const tx = bankTransactions.find(t => t.id === id);
    if (tx) {
      setBankTransactions(prev => prev.filter(t => t.id !== id));
      // Revert Balance
      setBankAccounts(prev => prev.map(acc => {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        return acc;
      }));
    }
  };

  const openCashSession = (openingBalance: number) => {
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedBy: 'Current User', // Auth context would go here
      startTime: new Date().toISOString(),
      openingBalance,
      expectedBalance: openingBalance,
      status: 'open'
    };
    setCashSessions(prev => [newSession, ...prev]);
  };

  const closeCashSession = (closingBalance: number, notes?: string) => {
    setCashSessions(prev => prev.map(s => {
      if (s.status === 'open') {
        return { ...s, status: 'closed', endTime: new Date().toISOString(), closingBalance };
      }
      return s;
    }));
  };

  const addCashTransaction = (tx: CashTransaction) => {
    setCashTransactions(prev => [tx, ...prev]);
    // Update Session Expected Balance
    setCashSessions(prev => prev.map(s => {
      if (s.id === tx.sessionId) {
        return { ...s, expectedBalance: s.expectedBalance + tx.amount };
      }
      return s;
    }));
  };

  const updateSettings = (newSettings: AppSettings) => setSettingsState(newSettings);

  // Stats Logic
  const stats = {
    revenue: invoices.filter(i => i.status !== 'draft' && i.type === 'invoice').reduce((acc, curr) => acc + curr.amount, 0),
    expenses: purchases.filter(p => p.status !== 'pending' && p.type === 'invoice').reduce((acc, curr) => acc + curr.amount, 0),
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
      clients, addClient, updateClient, deleteClient,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      stockMovements, addStockMovement,
      stockTransfers, transferStock,
      invoices, setInvoices, createSalesDocument, deleteInvoice,
      purchases, createPurchaseDocument, deletePurchase,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
      bankTransactions, addBankTransaction, deleteBankTransaction,
      cashSessions, openCashSession, closeCashSession,
      cashTransactions, addCashTransaction,
      settings, updateSettings,
      stats, chartData,
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
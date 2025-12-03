
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement,
  StockTransfer, BankAccount, BankTransaction, CashSession, CashTransaction,
  Technician, ServiceItem, ServiceJob, ServiceSale, AppSettings, InvoiceItem,
  SalesDocumentType, PurchaseDocumentType, InventorySession, InventoryItem,
  Vehicle, FleetMission, FleetMaintenance, FleetExpense, FleetDocument,
  Employee, Contract, Payroll, LeaveRequest, ExpenseReport,
  MaintenanceContract, ContactInteraction, Department, Position,
  Attendance, Timesheet, LeavePolicy, PerformanceReview, ReviewCycle
} from '../types';
// import { db, seedDatabase } from '../services/db'; // DISABLED - using mock data only
import { loadTranslations } from '../services/translations';
import {
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases,
  mockWarehouses, mockStockMovements, mockBankAccounts, mockBankTransactions,
  mockCashSessions, mockTechnicians, mockServiceCatalog, mockServiceJobs,
  mockVehicles, mockFleetMissions, mockEmployees, mockContracts, mockPayroll,
  mockLeaves, mockExpenses, mockMaintenanceContracts, mockContactInteractions,
  mockDepartments, mockPositions
} from '../services/mockData';

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
  
  // Maintenance CRM
  maintenanceContracts: MaintenanceContract[];
  addMaintenanceContract: (contract: MaintenanceContract) => void;
  updateMaintenanceContract: (contract: MaintenanceContract) => void;
  deleteMaintenanceContract: (id: string) => void;
  
  contactInteractions: ContactInteraction[];
  addContactInteraction: (interaction: ContactInteraction) => void;

  // Fleet Management
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  fleetMissions: FleetMission[];
  addFleetMission: (mission: FleetMission) => void;
  updateFleetMission: (mission: FleetMission) => void;
  deleteFleetMission: (id: string) => void;

  fleetMaintenances: FleetMaintenance[];
  addFleetMaintenance: (maintenance: FleetMaintenance) => void;
  deleteFleetMaintenance: (id: string) => void;

  fleetExpenses: FleetExpense[];
  addFleetExpense: (expense: FleetExpense) => void;
  deleteFleetExpense: (id: string) => void;

  fleetDocuments: FleetDocument[];
  addFleetDocument: (doc: FleetDocument) => void;
  deleteFleetDocument: (id: string) => void;

  // HR Management
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  contracts: Contract[];
  addContract: (contract: Contract) => void;
  updateContract: (contract: Contract) => void;
  deleteContract: (id: string) => void;

  payrolls: Payroll[];
  addPayroll: (payroll: Payroll) => void;
  updatePayroll: (payroll: Payroll) => void;
  
  leaves: LeaveRequest[];
  addLeaveRequest: (leave: LeaveRequest) => void;
  updateLeaveRequest: (leave: LeaveRequest) => void;

  expenses: ExpenseReport[];
  addExpenseReport: (expense: ExpenseReport) => void;
  updateExpenseReport: (expense: ExpenseReport) => void;

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
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [inventorySessions, setInventorySessions] = useState<InventorySession[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>([]);
  const [maintenanceContracts, setMaintenanceContracts] = useState<MaintenanceContract[]>([]);
  const [contactInteractions, setContactInteractions] = useState<ContactInteraction[]>([]);
  
  // Fleet
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetMissions, setFleetMissions] = useState<FleetMission[]>([]);
  const [fleetMaintenances, setFleetMaintenances] = useState<FleetMaintenance[]>([]);
  const [fleetExpenses, setFleetExpenses] = useState<FleetExpense[]>([]);
  const [fleetDocuments, setFleetDocuments] = useState<FleetDocument[]>([]);
  
  // HR
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [expenses, setExpenses] = useState<ExpenseReport[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>([]);

  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // --- MOCK DATA LOADING (IndexedDB disabled) ---
  useEffect(() => {
    console.log('Loading mock data directly (IndexedDB disabled)...');
    try {
      setIsLoading(true);

      // Load mock data directly into state
      setClients(mockClients);
      setSuppliers(mockSuppliers);
      setProducts(mockInventory);
      setInvoices(mockInvoices);
      setPurchases(mockPurchases);
      setWarehouses(mockWarehouses);
      setStockMovements(mockStockMovements);
      setStockTransfers([]);
      setInventorySessions([]);
      setBankAccounts(mockBankAccounts);
      setBankTransactions(mockBankTransactions);
      setCashSessions(mockCashSessions);
      setCashTransactions([]);
      setTechnicians(mockTechnicians);
      setServiceCatalog(mockServiceCatalog);
      setServiceJobs(mockServiceJobs);
      setServiceSales([]);
      setMaintenanceContracts(mockMaintenanceContracts);
      setContactInteractions(mockContactInteractions);
      setVehicles(mockVehicles);
      setFleetMissions(mockFleetMissions);
      setFleetMaintenances([]);
      setFleetExpenses([]);
      setFleetDocuments([]);
      setDepartments(mockDepartments);
      setPositions(mockPositions);
      setEmployees(mockEmployees);
      setContracts(mockContracts);
      setPayrolls(mockPayroll);
      setLeaves(mockLeaves);
      setLeavePolicies([]);
      setExpenses(mockExpenses);
      setAttendances([]);
      setTimesheets([]);
      setPerformanceReviews([]);
      setReviewCycles([]);

      console.log('Mock data loaded successfully!');
    } catch (error) {
      console.error("Failed to load mock data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(settings.language).then(setTranslations);
  }, [settings.language]);

  const t = (key: string) => translations[key] || key;

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    // db.settings.put({ ...newSettings, id: 'config' } as any); // DISABLED - no persistence
    console.log('Settings updated (in-memory only, no persistence):', newSettings);
  };

  const formatCurrency = (amount: number, currency: string = settings.currency) => {
    return new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'TND' ? 3 : 2
    }).format(amount);
  };

  // --- CRUD Functions (Persisted to DB and Updated Locally) ---

  const addClient = async (client: Client) => {
      // await db.clients.add(client);
      setClients(prev => [...prev, client]);
  };
  const updateClient = async (client: Client) => {
      // await db.clients.put(client);
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
  };
  const deleteClient = async (id: string) => {
      // await db.clients.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = async (supplier: Supplier) => {
      // await db.suppliers.add(supplier);
      setSuppliers(prev => [...prev, supplier]);
  };
  const updateSupplier = async (supplier: Supplier) => {
      // await db.suppliers.put(supplier);
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  };
  const deleteSupplier = async (id: string) => {
      // await db.suppliers.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addProduct = async (product: Product) => {
      // await db.products.add(product);
      setProducts(prev => [...prev, product]);
  };
  const addProducts = async (newProducts: Product[]) => {
      // await db.products.bulkAdd(newProducts);
      setProducts(prev => [...prev, ...newProducts]);
  };
  const updateProduct = async (product: Product) => {
      // await db.products.put(product);
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };
  const deleteProduct = async (id: string) => {
      // await db.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addStockMovement = async (movement: StockMovement) => {
      // await db.stockMovements.add(movement);
      setStockMovements(prev => [movement, ...prev]);
      
      if (movement.productId) {
          // Fetch fresh product to avoid stale state closure issues
          // const product = await db.products.get(movement.productId); // DISABLED
          const product = products.find(p => p.id === movement.productId);
          if (product) {
               const newStock = product.stock + movement.quantity;
               const newWhStock = { ...product.warehouseStock };
               newWhStock[movement.warehouseId] = (newWhStock[movement.warehouseId] || 0) + movement.quantity;
               let newCost = product.cost;
               if (movement.type === 'purchase' && movement.unitCost) {
                   const totalValue = (product.stock * product.cost) + (movement.quantity * movement.unitCost);
                   newCost = totalValue / newStock;
               }
               const updatedProduct = { ...product, stock: newStock, warehouseStock: newWhStock, cost: newCost };
               // await db.products.put(updatedProduct);
               setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
          }
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
    
    // Optimistic update
    setInvoices(prev => [newDoc, ...prev]);
    // Async DB update
    db.invoices.add(newDoc).catch(console.error);
    
    // If Delivery or Return, update stock
    if (type === 'delivery' || type === 'return') {
        items.forEach(item => {
            addStockMovement({
                id: `sm-${Date.now()}-${item.id}`,
                productId: item.id,
                productName: item.description,
                warehouseId: data.warehouseId || warehouses[0]?.id || 'default',
                warehouseName: warehouses.find(w => w.id === data.warehouseId)?.name || 'Default',
                date: new Date().toISOString(),
                quantity: type === 'delivery' ? -item.quantity : item.quantity,
                type: type === 'delivery' ? 'sale' : 'return',
                reference: newDoc.number,
                notes: `${type === 'delivery' ? 'Delivery' : 'Return'} for ${newDoc.number}`
            });
        });
    }
    
    return newDoc;
  };

  const updateInvoice = async (invoice: Invoice) => {
      // await db.invoices.put(invoice);
      setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  };
  const deleteInvoice = async (id: string) => {
      // await db.invoices.delete(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const recordDocPayment = async (type: 'invoice' | 'purchase', id: string, amount: number, accountId?: string, method?: 'bank' | 'cash') => {
      if (type === 'invoice') {
          const inv = invoices.find(i => i.id === id);
          if (inv) {
              const paid = (inv.amountPaid || 0) + amount;
              const status = paid >= inv.amount ? 'paid' : 'partial';
              const updated = { ...inv, amountPaid: paid, status: status as any };
              await updateInvoice(updated);

              if (method === 'bank' && accountId) {
                  addBankTransaction({ id: `bt-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0], description: `Payment for ${inv.number}`, amount, type: 'deposit', status: 'cleared' });
              } else if (method === 'cash') {
                  const session = cashSessions.find(s => s.status === 'open');
                  if (session) {
                      addCashTransaction({ id: `ct-${Date.now()}`, sessionId: session.id, date: new Date().toISOString(), type: 'sale', amount, description: `Payment for ${inv.number}` });
                  }
              }
          }
      } else {
          // Purchase Payment
           const pur = purchases.find(p => p.id === id);
           if (pur) {
              const paid = (pur.amountPaid || 0) + amount;
              const status = paid >= pur.amount ? 'completed' : 'partial';
              const updated = { ...pur, amountPaid: paid, status: status as any };
              await updatePurchase(updated);
              
              if (method === 'bank' && accountId) {
                  addBankTransaction({ id: `bt-${Date.now()}`, accountId, date: new Date().toISOString().split('T')[0], description: `Payment for ${pur.number}`, amount: -amount, type: 'payment', status: 'cleared' });
              } else if (method === 'cash') {
                  const session = cashSessions.find(s => s.status === 'open');
                  if (session) {
                      addCashTransaction({ id: `ct-${Date.now()}`, sessionId: session.id, date: new Date().toISOString(), type: 'expense', amount: -amount, description: `Payment for ${pur.number}` });
                  }
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
      db.purchases.add(newDoc).catch(console.error);

      if (type === 'delivery' || type === 'return') {
        items.forEach(item => {
            addStockMovement({
                id: `sm-${Date.now()}-${item.id}`,
                productId: item.id,
                productName: item.description,
                warehouseId: data.warehouseId || warehouses[0]?.id || 'default',
                warehouseName: warehouses.find(w => w.id === data.warehouseId)?.name || 'Default',
                date: new Date().toISOString(),
                quantity: type === 'delivery' ? item.quantity : -item.quantity, // Delivery adds, Return subtracts
                type: type === 'delivery' ? 'purchase' : 'return',
                reference: newDoc.number,
                notes: `${type === 'delivery' ? 'GRN' : 'Return'} for ${newDoc.number}`,
                unitCost: item.price // Update cost on purchase
            });
        });
      }

      return newDoc;
  };

  const updatePurchase = async (purchase: Purchase) => {
      // await db.purchases.put(purchase);
      setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));
  };
  const deletePurchase = async (id: string) => {
      // await db.purchases.delete(id);
      setPurchases(prev => prev.filter(p => p.id !== id));
  };

  const addWarehouse = async (wh: Warehouse) => {
      // await db.warehouses.add(wh);
      setWarehouses(prev => [...prev, wh]);
  };
  const updateWarehouse = async (wh: Warehouse) => {
      // await db.warehouses.put(wh);
      setWarehouses(prev => prev.map(w => w.id === wh.id ? wh : w));
  };
  const deleteWarehouse = async (id: string) => {
      // await db.warehouses.delete(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
  };

  const transferStock = (data: any) => {
      addStockMovement({
          id: `tr-out-${Date.now()}`,
          productId: data.productId,
          productName: products.find(p => p.id === data.productId)?.name || 'Product',
          warehouseId: data.fromWarehouseId,
          warehouseName: warehouses.find(w => w.id === data.fromWarehouseId)?.name || '',
          date: new Date().toISOString(),
          quantity: -data.quantity,
          type: 'transfer_out',
          reference: data.reference,
          notes: `Transfer to ${warehouses.find(w => w.id === data.toWarehouseId)?.name}`
      });
      addStockMovement({
          id: `tr-in-${Date.now()}`,
          productId: data.productId,
          productName: products.find(p => p.id === data.productId)?.name || 'Product',
          warehouseId: data.toWarehouseId,
          warehouseName: warehouses.find(w => w.id === data.toWarehouseId)?.name || '',
          date: new Date().toISOString(),
          quantity: data.quantity,
          type: 'transfer_in',
          reference: data.reference,
          notes: `Transfer from ${warehouses.find(w => w.id === data.fromWarehouseId)?.name}`
      });
      
      const transfer = { id: `tr-${Date.now()}`, productId: data.productId, productName: products.find(p => p.id === data.productId)?.name || 'Product', fromWarehouseId: data.fromWarehouseId, toWarehouseId: data.toWarehouseId, quantity: data.quantity, date: new Date().toISOString(), reference: data.reference, notes: data.notes };
      db.stockTransfers.add(transfer).catch(console.error);
      setStockTransfers(prev => [transfer, ...prev]);
  };

  const createInventorySession = async (data: Partial<InventorySession>) => {
      const warehouseId = data.warehouseId || warehouses[0]?.id;
      const items: InventoryItem[] = products.map(p => ({ productId: p.id, productName: p.name, sku: p.sku, systemQty: p.warehouseStock[warehouseId] || 0, physicalQty: p.warehouseStock[warehouseId] || 0, variance: 0, cost: p.cost }));
      const newSession: InventorySession = { id: `inv-sess-${Date.now()}`, reference: `INV-${Date.now()}`, date: new Date().toISOString().split('T')[0], warehouseId: warehouseId, warehouseName: warehouses.find(w=>w.id===warehouseId)?.name || 'Unknown', status: 'in_progress', categoryFilter: data.categoryFilter || 'All', items: items, notes: data.notes || '' };
      
      // await db.inventorySessions.add(newSession);
      setInventorySessions(prev => [newSession, ...prev]);
  };

  const updateInventorySession = async (session: InventorySession) => {
      // await db.inventorySessions.put(session);
      setInventorySessions(prev => prev.map(s => s.id === session.id ? session : s));
  };

  const commitInventorySession = (session: InventorySession) => {
      // Generate adjustments
      session.items.forEach(item => {
          if (item.variance !== 0) {
               addStockMovement({
                   id: `adj-${Date.now()}-${item.productId}`,
                   productId: item.productId,
                   productName: item.productName,
                   warehouseId: session.warehouseId,
                   warehouseName: session.warehouseName,
                   date: new Date().toISOString(),
                   quantity: item.variance,
                   type: 'adjustment',
                   reference: session.reference,
                   notes: 'Inventory Audit Adjustment'
               });
          }
      });
      const completedSession = { ...session, status: 'completed' as const };
      updateInventorySession(completedSession);
  };

  const addBankAccount = async (acc: BankAccount) => {
      // await db.bankAccounts.add(acc);
      setBankAccounts(prev => [...prev, acc]);
  };
  const updateBankAccount = async (acc: BankAccount) => {
      // await db.bankAccounts.put(acc);
      setBankAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  };
  const deleteBankAccount = async (id: string) => {
      // await db.bankAccounts.delete(id);
      setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addBankTransaction = async (tx: BankTransaction) => {
      // await db.bankTransactions.add(tx);
      setBankTransactions(prev => [tx, ...prev]);
      
      const account = bankAccounts.find(a => a.id === tx.accountId);
      if (account) {
          const updatedAccount = { ...account, balance: account.balance + tx.amount };
          await updateBankAccount(updatedAccount);
      }
  };
  
  const deleteBankTransaction = async (id: string) => {
       const tx = bankTransactions.find(t => t.id === id);
       if (tx) {
           // await db.bankTransactions.delete(id);
           setBankTransactions(prev => prev.filter(t => t.id !== id));
           // Revert balance
           const account = bankAccounts.find(a => a.id === tx.accountId);
           if (account) {
               await updateBankAccount({ ...account, balance: account.balance - tx.amount });
           }
       }
  };

  const openCashSession = async (openingBalance: number) => {
      const newSession: CashSession = { id: `cs-${Date.now()}`, openedBy: 'Current User', startTime: new Date().toISOString(), openingBalance, expectedBalance: openingBalance, status: 'open' };
      // await db.cashSessions.add(newSession);
      setCashSessions(prev => [newSession, ...prev]);
  };

  const closeCashSession = async (closingBalance: number, notes?: string) => {
      const session = cashSessions.find(s => s.status === 'open');
      if (session) {
          const updated = { ...session, status: 'closed' as const, closingBalance, endTime: new Date().toISOString(), notes };
          // await db.cashSessions.put(updated);
          setCashSessions(prev => prev.map(s => s.id === session.id ? updated : s));
      }
  };

  const addCashTransaction = async (tx: CashTransaction) => {
      // await db.cashTransactions.add(tx);
      setCashTransactions(prev => [tx, ...prev]);
      
      const session = cashSessions.find(s => s.id === tx.sessionId);
      if (session) {
          const updated = { ...session, expectedBalance: session.expectedBalance + tx.amount };
          // await db.cashSessions.put(updated);
          setCashSessions(prev => prev.map(s => s.id === session.id ? updated : s));
      }
  };

  const addTechnician = async (tech: Technician) => {
      // await db.technicians.add(tech);
      setTechnicians(prev => [...prev, tech]);
  };
  const updateTechnician = async (tech: Technician) => {
      // await db.technicians.put(tech);
      setTechnicians(prev => prev.map(t => t.id === tech.id ? tech : t));
  };
  const deleteTechnician = async (id: string) => {
      // await db.technicians.delete(id);
      setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  const addServiceItem = async (item: ServiceItem) => {
      // await db.serviceCatalog.add(item);
      setServiceCatalog(prev => [...prev, item]);
  };
  const updateServiceItem = async (item: ServiceItem) => {
      // await db.serviceCatalog.put(item);
      setServiceCatalog(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const deleteServiceItem = async (id: string) => {
      // await db.serviceCatalog.delete(id);
      setServiceCatalog(prev => prev.filter(i => i.id !== id));
  };

  const addServiceJob = async (job: ServiceJob) => {
      // await db.serviceJobs.add(job);
      setServiceJobs(prev => [job, ...prev]);
  };
  const updateServiceJob = async (job: ServiceJob) => {
      // await db.serviceJobs.put(job);
      setServiceJobs(prev => prev.map(j => j.id === job.id ? job : j));
  };
  const deleteServiceJob = async (id: string) => {
      // await db.serviceJobs.delete(id);
      setServiceJobs(prev => prev.filter(j => j.id !== id));
  };

  const addServiceSale = async (sale: ServiceSale) => {
      // await db.serviceSales.add(sale);
      setServiceSales(prev => [sale, ...prev]);
  };
  const deleteServiceSale = async (id: string) => {
      // await db.serviceSales.delete(id);
      setServiceSales(prev => prev.filter(s => s.id !== id));
  };

  const addVehicle = async (vehicle: Vehicle) => {
      // await db.vehicles.add(vehicle);
      setVehicles(prev => [...prev, vehicle]);
  };
  const updateVehicle = async (vehicle: Vehicle) => {
      // await db.vehicles.put(vehicle);
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
  };
  const deleteVehicle = async (id: string) => {
      // await db.vehicles.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addFleetMission = async (mission: FleetMission) => {
      // await db.fleetMissions.add(mission);
      setFleetMissions(prev => [...prev, mission]);
  };
  const updateFleetMission = async (mission: FleetMission) => {
      // await db.fleetMissions.put(mission);
      setFleetMissions(prev => prev.map(m => m.id === mission.id ? mission : m));
  };
  const deleteFleetMission = async (id: string) => {
      // await db.fleetMissions.delete(id);
      setFleetMissions(prev => prev.filter(m => m.id !== id));
  };

  const addFleetMaintenance = async (maintenance: FleetMaintenance) => {
      // await db.fleetMaintenances.add(maintenance);
      setFleetMaintenances(prev => [...prev, maintenance]);
  };
  const deleteFleetMaintenance = async (id: string) => {
      // await db.fleetMaintenances.delete(id);
      setFleetMaintenances(prev => prev.filter(m => m.id !== id));
  };

  const addFleetExpense = async (expense: FleetExpense) => {
      // await db.fleetExpenses.add(expense);
      setFleetExpenses(prev => [...prev, expense]);
  };
  const deleteFleetExpense = async (id: string) => {
      // await db.fleetExpenses.delete(id);
      setFleetExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addFleetDocument = async (doc: FleetDocument) => {
      // await db.fleetDocuments.add(doc);
      setFleetDocuments(prev => [...prev, doc]);
  };
  const deleteFleetDocument = async (id: string) => {
      // await db.fleetDocuments.delete(id);
      setFleetDocuments(prev => prev.filter(d => d.id !== id));
  };

  // HR Functions

  // Departments
  const addDepartment = async (dept: Department) => {
      // await db.departments.add(dept);
      setDepartments(prev => [...prev, dept]);
  };
  const updateDepartment = async (dept: Department) => {
      // await db.departments.put(dept);
      setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
  };
  const deleteDepartment = async (id: string) => {
      // await db.departments.delete(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Positions
  const addPosition = async (pos: Position) => {
      // await db.positions.add(pos);
      setPositions(prev => [...prev, pos]);
  };
  const updatePosition = async (pos: Position) => {
      // await db.positions.put(pos);
      setPositions(prev => prev.map(p => p.id === pos.id ? pos : p));
  };
  const deletePosition = async (id: string) => {
      // await db.positions.delete(id);
      setPositions(prev => prev.filter(p => p.id !== id));
  };

  // Employees
  const addEmployee = async (emp: Employee) => {
      // await db.employees.add(emp);
      setEmployees(prev => [...prev, emp]);
  };
  const updateEmployee = async (emp: Employee) => {
      // await db.employees.put(emp);
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  };
  const deleteEmployee = async (id: string) => {
      // await db.employees.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addContract = async (contract: Contract) => {
      // await db.contracts.add(contract);
      setContracts(prev => [...prev, contract]);
  };
  const updateContract = async (contract: Contract) => {
      // await db.contracts.put(contract);
      setContracts(prev => prev.map(c => c.id === contract.id ? contract : c));
  };
  const deleteContract = async (id: string) => {
      // await db.contracts.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addPayroll = async (payroll: Payroll) => {
      // await db.payrolls.add(payroll);
      setPayrolls(prev => [...prev, payroll]);
  };
  const updatePayroll = async (payroll: Payroll) => {
      // await db.payrolls.put(payroll);
      setPayrolls(prev => prev.map(p => p.id === payroll.id ? payroll : p));
  };

  const addLeaveRequest = async (leave: LeaveRequest) => {
      // await db.leaves.add(leave);
      setLeaves(prev => [...prev, leave]);
  };
  const updateLeaveRequest = async (leave: LeaveRequest) => {
      // await db.leaves.put(leave);
      setLeaves(prev => prev.map(l => l.id === leave.id ? leave : l));
  };

  const addExpenseReport = async (expense: ExpenseReport) => {
      // await db.expenses.add(expense);
      setExpenses(prev => [...prev, expense]);
  };
  const updateExpenseReport = async (expense: ExpenseReport) => {
      // await db.expenses.put(expense);
      setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
  };

  // Maintenance CRM
  const addMaintenanceContract = async (contract: MaintenanceContract) => {
      // await db.maintenanceContracts.add(contract);
      setMaintenanceContracts(prev => [...prev, contract]);
  };
  const updateMaintenanceContract = async (contract: MaintenanceContract) => {
      // await db.maintenanceContracts.put(contract);
      setMaintenanceContracts(prev => prev.map(c => c.id === contract.id ? contract : c));
  };
  const deleteMaintenanceContract = async (id: string) => {
      // await db.maintenanceContracts.delete(id);
      setMaintenanceContracts(prev => prev.filter(c => c.id !== id));
  };
  const addContactInteraction = async (interaction: ContactInteraction) => {
      // await db.contactInteractions.add(interaction);
      setContactInteractions(prev => [interaction, ...prev]);
  };

  const stats = useMemo(() => {
    const revenue = invoices.filter(inv => inv.type === 'invoice' && inv.status !== 'draft').reduce((acc, inv) => acc + inv.amount, 0);
    const expenses = purchases.filter(pur => pur.type === 'invoice').reduce((acc, pur) => acc + pur.amount, 0);
    return { revenue, expenses, profit: revenue - expenses };
  }, [invoices, purchases]);

  const chartData = useMemo(() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(month => ({ name: month, revenue: 0, expenses: 0 }));

      invoices.forEach(inv => {
          if (inv.type === 'invoice' && inv.status !== 'draft') {
              const date = new Date(inv.date);
              const monthIdx = date.getMonth();
              data[monthIdx].revenue += inv.amount;
          }
      });

      purchases.forEach(pur => {
          if (pur.type === 'invoice') {
              const date = new Date(pur.date);
              const monthIdx = date.getMonth();
              data[monthIdx].expenses += pur.amount;
          }
      });
      return data;
  }, [invoices, purchases]);

  const value = {
    clients, addClient, updateClient, deleteClient,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    products, addProduct, addProducts, updateProduct, deleteProduct,
    invoices, createSalesDocument, updateInvoice, deleteInvoice, recordDocPayment,
    purchases, createPurchaseDocument, updatePurchase, deletePurchase,
    warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
    stockMovements, addStockMovement, stockTransfers, transferStock,
    inventorySessions, createInventorySession, updateInventorySession, commitInventorySession,
    bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
    bankTransactions, addBankTransaction, deleteBankTransaction,
    cashSessions, openCashSession, closeCashSession, cashTransactions, addCashTransaction,
    technicians, addTechnician, updateTechnician, deleteTechnician,
    serviceCatalog, addServiceItem, updateServiceItem, deleteServiceItem,
    serviceJobs, addServiceJob, updateServiceJob, deleteServiceJob,
    serviceSales, addServiceSale, deleteServiceSale,
    maintenanceContracts, addMaintenanceContract, updateMaintenanceContract, deleteMaintenanceContract,
    contactInteractions, addContactInteraction,
    vehicles, addVehicle, updateVehicle, deleteVehicle,
    fleetMissions, addFleetMission, updateFleetMission, deleteFleetMission,
    fleetMaintenances, addFleetMaintenance, deleteFleetMaintenance,
    fleetExpenses, addFleetExpense, deleteFleetExpense,
    fleetDocuments, addFleetDocument, deleteFleetDocument,
    // HR
    departments, addDepartment, updateDepartment, deleteDepartment,
    positions, addPosition, updatePosition, deletePosition,
    employees, addEmployee, updateEmployee, deleteEmployee,
    contracts, addContract, updateContract, deleteContract,
    payrolls, addPayroll, updatePayroll,
    leaves, addLeaveRequest, updateLeaveRequest,
    leavePolicies,
    expenses, addExpenseReport, updateExpenseReport,
    attendances, timesheets, performanceReviews, reviewCycles,
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

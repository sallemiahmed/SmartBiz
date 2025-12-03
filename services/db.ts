
import Dexie, { Table } from 'dexie';
import {
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement,
  StockTransfer, BankAccount, BankTransaction, CashSession, CashTransaction,
  Technician, ServiceItem, ServiceJob, ServiceSale, InventorySession,
  Vehicle, FleetMission, FleetMaintenance, FleetExpense, FleetDocument,
  Employee, Contract, Payroll, LeaveRequest, ExpenseReport, MaintenanceContract,
  ContactInteraction, AppSettings, Department, Position, Attendance, Timesheet,
  LeavePolicy, PerformanceReview, ReviewCycle
} from '../types';
import { 
  mockClients, mockSuppliers, mockInventory, mockInvoices, mockPurchases, 
  mockWarehouses, mockStockMovements, mockBankAccounts, mockBankTransactions,
  mockCashSessions, mockTechnicians, mockServiceCatalog, mockServiceJobs, 
  mockVehicles, mockFleetMissions, mockEmployees, mockContracts, mockPayroll, 
  mockLeaves, mockExpenses, mockMaintenanceContracts, mockContactInteractions
} from './mockData';

export class SmartBizDatabase extends Dexie {
  // Core
  clients!: Table<Client>;
  suppliers!: Table<Supplier>;
  products!: Table<Product>;
  warehouses!: Table<Warehouse>;
  
  // Documents
  invoices!: Table<Invoice>;
  purchases!: Table<Purchase>;
  
  // Stock
  stockMovements!: Table<StockMovement>;
  stockTransfers!: Table<StockTransfer>;
  inventorySessions!: Table<InventorySession>;

  // Finance
  bankAccounts!: Table<BankAccount>;
  bankTransactions!: Table<BankTransaction>;
  cashSessions!: Table<CashSession>;
  cashTransactions!: Table<CashTransaction>;

  // Services
  technicians!: Table<Technician>;
  serviceCatalog!: Table<ServiceItem>;
  serviceJobs!: Table<ServiceJob>;
  serviceSales!: Table<ServiceSale>;
  maintenanceContracts!: Table<MaintenanceContract>;
  contactInteractions!: Table<ContactInteraction>;

  // Fleet
  vehicles!: Table<Vehicle>;
  fleetMissions!: Table<FleetMission>;
  fleetMaintenances!: Table<FleetMaintenance>;
  fleetExpenses!: Table<FleetExpense>;
  fleetDocuments!: Table<FleetDocument>;

  // HR
  departments!: Table<Department>;
  positions!: Table<Position>;
  employees!: Table<Employee>;
  contracts!: Table<Contract>;
  payrolls!: Table<Payroll>;
  leaves!: Table<LeaveRequest>;
  leavePolicies!: Table<LeavePolicy>;
  expenses!: Table<ExpenseReport>;
  attendances!: Table<Attendance>;
  timesheets!: Table<Timesheet>;
  performanceReviews!: Table<PerformanceReview>;
  reviewCycles!: Table<ReviewCycle>;

  // Settings
  settings!: Table<AppSettings>;

  constructor() {
    // Renamed database to force fresh seeding for the new Tunisian dataset
    super('SmartBizTunisieDB');
    (this as any).version(1).stores({
      clients: 'id, company, name, status',
      suppliers: 'id, company, status',
      products: 'id, name, sku, category, status',
      warehouses: 'id, name',
      invoices: 'id, number, clientId, type, status, date',
      purchases: 'id, number, supplierId, type, status, date',
      stockMovements: 'id, productId, warehouseId, type, date',
      stockTransfers: 'id, productId, date',
      inventorySessions: 'id, reference, status',
      bankAccounts: 'id, name',
      bankTransactions: 'id, accountId, date',
      cashSessions: 'id, status, startTime',
      cashTransactions: 'id, sessionId, date',
      technicians: 'id, name, status',
      serviceCatalog: 'id, name',
      serviceJobs: 'id, ticketNumber, clientId, status, technicianId',
      serviceSales: 'id, reference, clientId, date',
      maintenanceContracts: 'id, clientId, status, endDate',
      contactInteractions: 'id, clientId, date',
      vehicles: 'id, plate, status',
      fleetMissions: 'id, vehicleId, status, startDate',
      fleetMaintenances: 'id, vehicleId, date',
      fleetExpenses: 'id, vehicleId, date',
      fleetDocuments: 'id, vehicleId, type',
      // HR Tables
      departments: 'id, name, code, managerId',
      positions: 'id, title, code, departmentId',
      employees: 'id, matricule, lastName, department, status, managerId',
      contracts: 'id, employeeId, status, startDate, endDate',
      payrolls: 'id, employeeId, month, status',
      leaves: 'id, employeeId, status, startDate',
      leavePolicies: 'id, name, type',
      expenses: 'id, employeeId, status, date',
      attendances: 'id, employeeId, date, status',
      timesheets: 'id, employeeId, weekStarting, status',
      performanceReviews: 'id, employeeId, cycleId, status',
      reviewCycles: 'id, name, status',
      settings: 'id' // We will use a fixed ID 'config' for settings
    });
  }
}

export const db = new SmartBizDatabase();

export const seedDatabase = async (defaultSettings: AppSettings) => {
    const clientCount = await db.clients.count();
    
    if (clientCount === 0) {
        console.log('Seeding Database with Tunisian Mock Data...');
        await (db as any).transaction('rw', (db as any).tables, async () => {
            await db.clients.bulkAdd(mockClients);
            await db.suppliers.bulkAdd(mockSuppliers);
            await db.products.bulkAdd(mockInventory);
            await db.warehouses.bulkAdd(mockWarehouses);
            await db.invoices.bulkAdd(mockInvoices);
            await db.purchases.bulkAdd(mockPurchases);
            await db.stockMovements.bulkAdd(mockStockMovements);
            await db.bankAccounts.bulkAdd(mockBankAccounts);
            await db.bankTransactions.bulkAdd(mockBankTransactions);
            await db.cashSessions.bulkAdd(mockCashSessions);
            await db.technicians.bulkAdd(mockTechnicians);
            await db.serviceCatalog.bulkAdd(mockServiceCatalog);
            await db.serviceJobs.bulkAdd(mockServiceJobs);
            await db.maintenanceContracts.bulkAdd(mockMaintenanceContracts);
            await db.contactInteractions.bulkAdd(mockContactInteractions);
            await db.vehicles.bulkAdd(mockVehicles);
            await db.fleetMissions.bulkAdd(mockFleetMissions);
            await db.employees.bulkAdd(mockEmployees);
            await db.contracts.bulkAdd(mockContracts);
            await db.payrolls.bulkAdd(mockPayroll);
            await db.leaves.bulkAdd(mockLeaves);
            await db.expenses.bulkAdd(mockExpenses);
            
            // Save default settings with a specific ID
            await db.settings.put({ ...defaultSettings, id: 'config' } as any);
        });
        console.log('Database Seeded Successfully.');
    }
};

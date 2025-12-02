
import { 
  FleetMission, Client, Supplier, Product, Invoice, Purchase, Warehouse, 
  StockMovement, BankAccount, BankTransaction, CashSession, CashTransaction,
  Technician, ServiceItem, ServiceJob, ServiceSale, InventorySession,
  Vehicle, FleetMaintenance, FleetExpense, FleetDocument
} from '../types';

const getDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const mockClients: Client[] = [
  { id: '1', name: 'John Doe', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+216 12345678', status: 'active', category: 'Corporate', totalSpent: 1500 },
  { id: '2', name: 'Jane Smith', company: 'Retail LLC', email: 'jane@retail.com', phone: '+216 87654321', status: 'active', category: 'Retail', totalSpent: 500 }
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'Global Parts', contactName: 'Mike Ross', email: 'mike@globalparts.com', phone: '+216 22334455', status: 'active', category: 'Electronics', totalPurchased: 5000 }
];

export const mockInventory: Product[] = [
  { id: 'p1', name: 'Laptop Pro', sku: 'LAP-001', category: 'Electronics', price: 2500, cost: 1800, stock: 15, warehouseStock: { 'w1': 10, 'w2': 5 }, status: 'in_stock', marginPercent: 28 },
  { id: 'p2', name: 'Wireless Mouse', sku: 'ACC-002', category: 'Accessories', price: 50, cost: 25, stock: 50, warehouseStock: { 'w1': 50 }, status: 'in_stock', marginPercent: 50 }
];

export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', location: 'Tunis', isDefault: true },
  { id: 'w2', name: 'Sfax Branch', location: 'Sfax' }
];

export const mockInvoices: Invoice[] = [
  { 
    id: 'inv1', number: 'INV-2024-001', type: 'invoice', clientId: '1', clientName: 'Tech Corp', 
    date: getDate(-2), amount: 2500, currency: 'TND', exchangeRate: 1, status: 'paid', 
    items: [{ id: 'p1', description: 'Laptop Pro', quantity: 1, price: 2500 }], 
    subtotal: 2500 
  }
];

export const mockPurchases: Purchase[] = [
  {
    id: 'po1', number: 'PO-2024-001', type: 'order', supplierId: 's1', supplierName: 'Global Parts',
    date: getDate(-10), amount: 5000, currency: 'TND', exchangeRate: 1, status: 'completed',
    items: [{ id: 'p1', description: 'Laptop Pro', quantity: 5, price: 1000 }],
    subtotal: 5000
  }
];

export const mockStockMovements: StockMovement[] = [];
export const mockBankAccounts: BankAccount[] = [
  { id: 'b1', name: 'Main Business', bankName: 'BIAT', accountNumber: '123456789', currency: 'TND', balance: 15000, type: 'checking' }
];
export const mockBankTransactions: BankTransaction[] = [];
export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Admin', startTime: getDate(0) + 'T08:00:00', openingBalance: 500, expectedBalance: 500, status: 'open' }
];
export const mockCashTransactions: CashTransaction[] = [];
export const mockTechnicians: Technician[] = [
  { id: 't1', name: 'Ali Tounsi', specialty: 'Hardware', phone: '555-0101', status: 'available' }
];
export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Screen Replacement', description: 'Replace broken screen', basePrice: 150, durationMinutes: 60 }
];
export const mockServiceJobs: ServiceJob[] = [];
export const mockServiceSales: ServiceSale[] = [];
export const mockInventorySessions: InventorySession[] = [];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', make: 'Peugeot', model: 'Partner', year: 2020, plate: '215 TN 1234', fuelType: 'Diesel', mileage: 45000, status: 'available', insuranceExpiry: getDate(180), technicalCheckExpiry: getDate(200) },
  { id: 'v2', make: 'Citroen', model: 'Berlingo', year: 2021, plate: '220 TN 5678', fuelType: 'Diesel', mileage: 28000, status: 'in_use', insuranceExpiry: getDate(30), technicalCheckExpiry: getDate(365) }
];

export const mockFleetMissions: FleetMission[] = [
  { id: 'm1', vehicleId: 'v2', vehicleName: 'Citroen Berlingo', driverName: 'Ahmed Tounsi', startDate: getDate(-1), startTime: '08:00', endDate: getDate(1), endTime: '18:00', destination: 'Sfax', status: 'in_progress', startMileage: 27500 },
  { id: 'm2', vehicleId: 'v1', vehicleName: 'Peugeot Partner', driverName: 'Sami Ben Amor', startDate: getDate(-5), startTime: '09:30', endDate: getDate(-4), endTime: '14:00', destination: 'Bizerte', status: 'completed', startMileage: 44200, endMileage: 44500 }
];

export const mockFleetMaintenance: FleetMaintenance[] = [];
export const mockFleetExpenses: FleetExpense[] = [];
export const mockFleetDocuments: FleetDocument[] = [];

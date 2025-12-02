
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  BankAccount, BankTransaction, CashSession, CashTransaction, Technician, 
  ServiceItem, ServiceJob, ServiceSale, InventorySession, Vehicle, FleetMission, 
  FleetMaintenance, FleetExpense, FleetDocument, Employee, Contract, Payroll, LeaveRequest, ExpenseReport
} from '../types';

export const getDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const mockClients: Client[] = [
  { id: '1', company: 'TechSolutions Inc.', name: 'John Doe', email: 'john@techsolutions.com', phone: '+216 20 123 456', status: 'active', category: 'Corporate', totalSpent: 12500, address: 'Lac 1, Tunis' },
  { id: '2', company: 'Global Trade Ltd.', name: 'Sarah Smith', email: 'sarah@globaltrade.com', phone: '+216 21 654 321', status: 'active', category: 'Corporate', totalSpent: 8900, address: 'Sfax, Tunisia' },
  { id: '3', company: 'Retail Hub', name: 'Mike Brown', email: 'mike@retailhub.com', phone: '+216 22 987 654', status: 'inactive', category: 'Retail', totalSpent: 2300 }
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'ElectroParts Dist', contactName: 'Ali Ben Salah', email: 'ali@electroparts.tn', phone: '+216 50 111 222', status: 'active', category: 'Electronics', totalPurchased: 45000 },
  { id: 's2', company: 'Office Supplies Co', contactName: 'Mouna Kallel', email: 'mouna@supplies.tn', phone: '+216 55 333 444', status: 'active', category: 'Stationery', totalPurchased: 5600 }
];

export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Main Warehouse', location: 'Tunis', isDefault: true },
  { id: 'wh2', name: 'Sfax Depot', location: 'Sfax' }
];

export const mockInventory: Product[] = [
  { id: 'p1', name: 'Laptop Pro X1', sku: 'LAP-001', category: 'Electronics', price: 2500, cost: 1800, stock: 15, warehouseStock: { 'wh1': 10, 'wh2': 5 }, status: 'in_stock', marginPercent: 28 },
  { id: 'p2', name: 'Wireless Mouse', sku: 'ACC-002', category: 'Accessories', price: 45, cost: 20, stock: 50, warehouseStock: { 'wh1': 50 }, status: 'in_stock', marginPercent: 55 },
  { id: 'p3', name: 'Office Chair', sku: 'FUR-003', category: 'Furniture', price: 350, cost: 200, stock: 5, warehouseStock: { 'wh1': 5 }, status: 'low_stock', marginPercent: 42 }
];

export const mockInvoices: Invoice[] = [
  { id: 'inv1', number: 'INV-001', type: 'invoice', clientId: '1', clientName: 'TechSolutions Inc.', date: getDate(-5), amount: 5045, amountPaid: 5045, status: 'paid', currency: 'TND', exchangeRate: 1, items: [{id: 'p1', description: 'Laptop Pro X1', quantity: 2, price: 2500}, {id: 'p2', description: 'Wireless Mouse', quantity: 1, price: 45}], warehouseId: 'wh1', taxRate: 19, subtotal: 5045, fiscalStamp: 1 },
  { id: 'inv2', number: 'INV-002', type: 'invoice', clientId: '2', clientName: 'Global Trade Ltd.', date: getDate(-2), amount: 350, amountPaid: 0, status: 'pending', currency: 'TND', exchangeRate: 1, items: [{id: 'p3', description: 'Office Chair', quantity: 1, price: 350}], warehouseId: 'wh1', taxRate: 19, subtotal: 350, fiscalStamp: 1 },
  { id: 'ord1', number: 'ORD-001', type: 'order', clientId: '1', clientName: 'TechSolutions Inc.', date: getDate(-1), amount: 2500, status: 'pending', currency: 'TND', exchangeRate: 1, items: [{id: 'p1', description: 'Laptop Pro X1', quantity: 1, price: 2500}], warehouseId: 'wh1', taxRate: 19, subtotal: 2500 }
];

export const mockPurchases: Purchase[] = [
  { id: 'po1', number: 'PO-001', type: 'order', supplierId: 's1', supplierName: 'ElectroParts Dist', date: getDate(-10), amount: 18000, status: 'completed', currency: 'TND', exchangeRate: 1, items: [{id: 'p1', description: 'Laptop Pro X1', quantity: 10, price: 1800}], warehouseId: 'wh1', subtotal: 18000, taxRate: 19 },
  { id: 'pr1', number: 'PR-001', type: 'pr', supplierId: '', supplierName: '', requesterName: 'John Admin', department: 'IT', date: getDate(0), amount: 0, status: 'pending', currency: 'TND', exchangeRate: 1, items: [{id: 'temp', description: 'Server Rack', quantity: 1, price: 0}], warehouseId: 'wh1', subtotal: 0 }
];

export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'Laptop Pro X1', warehouseId: 'wh1', warehouseName: 'Main Warehouse', date: getDate(-10), quantity: 10, type: 'purchase', unitCost: 1800 }
];

export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Main Checking', bankName: 'BIAT', accountNumber: '1234567890', type: 'checking', currency: 'TND', balance: 45000 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: getDate(-2), description: 'Invoice Payment INV-001', amount: 5045, type: 'deposit', status: 'cleared' }
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Admin', startTime: getDate(0) + 'T08:00:00', openingBalance: 500, expectedBalance: 500, status: 'open' }
];

export const mockCashTransactions: CashTransaction[] = [];

export const mockTechnicians: Technician[] = [
  { id: 't1', name: 'Rami J', specialty: 'Hardware Repair', status: 'available', phone: '22333444' },
  { id: 't2', name: 'Salma K', specialty: 'Software/OS', status: 'busy', phone: '55666777' }
];

export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Laptop Screen Repair', description: 'Replace broken screen', basePrice: 150, durationMinutes: 60 },
  { id: 'srv2', name: 'OS Installation', description: 'Windows/Linux/MacOS Install', basePrice: 50, durationMinutes: 45 }
];

export const mockServiceJobs: ServiceJob[] = [
  { id: 'job1', ticketNumber: 'JOB-1001', clientId: '1', clientName: 'TechSolutions Inc.', date: getDate(-2), status: 'in_progress', priority: 'high', technicianId: 't1', technicianName: 'Rami J', deviceInfo: 'Dell XPS 13', problemDescription: 'Screen flickering', estimatedCost: 150, services: [{serviceId: 'srv1', name: 'Laptop Screen Repair', price: 150}], usedParts: [] }
];

export const mockServiceSales: ServiceSale[] = [];

export const mockInventorySessions: InventorySession[] = [];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', make: 'Peugeot', model: 'Partner', plate: '190 TN 1234', year: 2020, status: 'available', fuelType: 'Diesel', mileage: 120000, technicalCheckExpiry: getDate(30), insuranceExpiry: getDate(60) },
  { id: 'v2', make: 'Citroen', model: 'Berlingo', plate: '205 TN 5678', year: 2022, status: 'in_use', fuelType: 'Diesel', mileage: 45000, technicalCheckExpiry: getDate(120), insuranceExpiry: getDate(120) }
];

export const mockFleetMissions: FleetMission[] = [
  { id: 'm1', vehicleId: 'v2', vehicleName: 'Citroen Berlingo', driverName: 'Ahmed Tounsi', startDate: getDate(-1), startTime: '08:00', endDate: getDate(1), endTime: '18:00', destination: 'Sfax', status: 'in_progress', startMileage: 27500 },
  { id: 'm2', vehicleId: 'v1', vehicleName: 'Peugeot Partner', driverName: 'Sami Ben Amor', startDate: getDate(-5), startTime: '09:30', endDate: getDate(-4), endTime: '14:00', destination: 'Bizerte', status: 'completed', startMileage: 44200, endMileage: 44500 }
];

export const mockFleetMaintenance: FleetMaintenance[] = [];
export const mockFleetExpenses: FleetExpense[] = [];
export const mockFleetDocuments: FleetDocument[] = [];

// HR MOCK DATA
export const mockEmployees: Employee[] = [
  { id: 'e1', firstName: 'Mohamed', lastName: 'Salah', email: 'mohamed.s@smartbiz.tn', phone: '55123456', position: 'Sales Manager', department: 'Sales', hireDate: '2022-01-15', status: 'active', salary: 2500 },
  { id: 'e2', firstName: 'Fatima', lastName: 'Ben Ali', email: 'fatima.b@smartbiz.tn', phone: '22654321', position: 'HR Specialist', department: 'Human Resources', hireDate: '2023-03-01', status: 'active', salary: 1800 },
  { id: 'e3', firstName: 'Karim', lastName: 'Gharbi', email: 'karim.g@smartbiz.tn', phone: '98765432', position: 'Technician', department: 'Service', hireDate: '2021-11-10', status: 'on_leave', salary: 1600 }
];

export const mockContracts: Contract[] = [
  { id: 'c1', employeeId: 'e1', employeeName: 'Mohamed Salah', type: 'CDI', startDate: '2022-01-15', status: 'active' },
  { id: 'c2', employeeId: 'e2', employeeName: 'Fatima Ben Ali', type: 'CDD', startDate: '2023-03-01', endDate: '2024-02-28', status: 'active' },
];

export const mockPayroll: Payroll[] = [
  { id: 'p1', employeeId: 'e1', employeeName: 'Mohamed Salah', month: '2024-05', baseSalary: 2500, bonuses: 200, deductions: 50, netSalary: 2650, status: 'paid', paymentDate: '2024-05-30' },
  { id: 'p2', employeeId: 'e2', employeeName: 'Fatima Ben Ali', month: '2024-05', baseSalary: 1800, bonuses: 0, deductions: 0, netSalary: 1800, status: 'draft' }
];

export const mockLeaves: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e3', employeeName: 'Karim Gharbi', type: 'Paid Leave', startDate: getDate(-2), endDate: getDate(2), days: 5, status: 'approved' },
  { id: 'l2', employeeId: 'e1', employeeName: 'Mohamed Salah', type: 'Sick Leave', startDate: getDate(-10), endDate: getDate(-9), days: 2, status: 'approved' }
];

export const mockExpenses: ExpenseReport[] = [
  { id: 'ex1', employeeId: 'e1', employeeName: 'Mohamed Salah', date: getDate(-3), type: 'Transport', amount: 45, description: 'Taxi to Client Meeting', status: 'pending' }
];

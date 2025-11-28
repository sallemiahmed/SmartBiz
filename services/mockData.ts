
import { Client, DashboardStats, Invoice, Product, Supplier, Purchase, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement } from '../types';

// Helper to get a date string relative to today
const getDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Mock Warehouses
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', location: 'New York HQ', isDefault: true },
  { id: 'w2', name: 'West Coast Depot', location: 'California' },
  { id: 'w3', name: 'Retail Store Backroom', location: 'Manhattan' }
];

// Mock Stock Transfers
export const mockStockTransfers: StockTransfer[] = [
  { id: 'tr1', date: getDate(-5), productId: 'p1', productName: 'Office Chair Ergonomic', fromWarehouseId: 'w1', toWarehouseId: 'w3', quantity: 5, notes: 'Restock retail' }
];

// Mock Stock Movements (Traceability)
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'Office Chair Ergonomic', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-30), quantity: 50, type: 'initial', reference: 'INIT', notes: 'Initial Stock' },
  { id: 'sm2', productId: 'p1', productName: 'Office Chair Ergonomic', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-20), quantity: -2, type: 'sale', reference: 'INV-001', notes: 'Sales Invoice' },
  { id: 'sm3', productId: 'p1', productName: 'Office Chair Ergonomic', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-5), quantity: -5, type: 'transfer_out', reference: 'TR-001', notes: 'Transfer to Retail' },
  { id: 'sm4', productId: 'p1', productName: 'Office Chair Ergonomic', warehouseId: 'w3', warehouseName: 'Retail Store Backroom', date: getDate(-5), quantity: 5, type: 'transfer_in', reference: 'TR-001', notes: 'Transfer from Main' },
];

// Mock Clients
export const mockClients: Client[] = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1 555-0101', company: 'Acme Inc.', status: 'active', category: 'Corporate', region: 'North America', totalSpent: 15200 },
  { id: '2', name: 'Globex', email: 'procurement@globex.com', phone: '+1 555-0102', company: 'Globex Corp', status: 'active', category: 'Corporate', region: 'Europe', totalSpent: 8500 },
  { id: '3', name: 'Soylent Corp', email: 'info@soylent.com', phone: '+1 555-0103', company: 'Soylent', status: 'inactive', category: 'Wholesale', region: 'Asia', totalSpent: 2100 },
  { id: '4', name: 'Umbrella Corp', email: 'secure@umbrella.com', phone: '+1 555-0104', company: 'Umbrella', status: 'active', category: 'Government', region: 'North America', totalSpent: 45000 },
  { id: '5', name: 'Stark Ind', email: 'tony@stark.com', phone: '+1 555-0105', company: 'Stark Industries', status: 'active', category: 'Corporate', region: 'North America', totalSpent: 125000 },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'Global Electronics Ltd', contactName: 'Sarah Connor', email: 'sarah@globalelec.com', phone: '+1 555-9988', category: 'Electronics', status: 'active', totalPurchased: 54000 },
  { id: 's2', company: 'Office Depot Wholesale', contactName: 'Michael Scott', email: 'mscott@odw.com', phone: '+1 555-1122', category: 'Office Supplies', status: 'active', totalPurchased: 12500 },
  { id: 's3', company: 'Heavy Metal Industries', contactName: 'James Hetfield', email: 'sales@heavymetal.com', phone: '+1 555-6666', category: 'Raw Materials', status: 'active', totalPurchased: 89000 },
  { id: 's4', company: 'Fast Shipping Co', contactName: 'Barry Allen', email: 'barry@fastship.com', phone: '+1 555-3344', category: 'Logistics', status: 'inactive', totalPurchased: 3400 },
  { id: 's5', company: 'Green Energy Solutions', contactName: 'Pamela Isley', email: 'pam@greenenergy.com', phone: '+1 555-7788', category: 'Utilities', status: 'active', totalPurchased: 7600 },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  { id: '101', number: 'INV-001', type: 'invoice', clientId: '1', clientName: 'Acme Corp', salespersonName: 'Alex Morgan', date: getDate(-60), dueDate: getDate(-45), amount: 3500.00, status: 'paid', items: [{id: 'p1', description: 'Office Chair', quantity: 15, price: 199.99}, {id: 'p4', description: 'Cables', quantity: 50, price: 10}], warehouseId: 'w1' },
  { id: '102', number: 'INV-002', type: 'invoice', clientId: '5', clientName: 'Stark Ind', salespersonName: 'John Doe', date: getDate(-45), dueDate: getDate(-30), amount: 12500.00, status: 'paid', items: [{id: 'p3', description: 'Monitor', quantity: 20, price: 450}], warehouseId: 'w1' },
  { id: '103', number: 'INV-003', type: 'invoice', clientId: '2', clientName: 'Globex', salespersonName: 'Alex Morgan', date: getDate(-30), dueDate: getDate(-15), amount: 4200.00, status: 'paid', items: [{id: 'p2', description: 'Keyboard', quantity: 50, price: 59.99}], warehouseId: 'w2' },
  { id: '104', number: 'INV-004', type: 'invoice', clientId: '4', clientName: 'Umbrella Corp', salespersonName: 'Jane Smith', date: getDate(-10), dueDate: getDate(5), amount: 8900.00, status: 'pending', items: [{id: 'p1', description: 'Office Chair', quantity: 40, price: 199.99}], warehouseId: 'w1' },
  { id: '105', number: 'INV-005', type: 'invoice', clientId: '1', clientName: 'Acme Corp', salespersonName: 'Alex Morgan', date: getDate(-2), dueDate: getDate(14), amount: 1200.00, status: 'pending', items: [{id: 'p4', description: 'USB Cable', quantity: 60, price: 19.99}], warehouseId: 'w1' },
  { id: '106', number: 'INV-006', type: 'invoice', clientId: '5', clientName: 'Stark Ind', salespersonName: 'John Doe', date: getDate(-5), dueDate: getDate(10), amount: 15000.00, status: 'paid', items: [{id: 'p3', description: 'Monitor', quantity: 30, price: 450}], warehouseId: 'w1' },
  { id: '201', number: 'ORD-001', type: 'order', clientId: '1', clientName: 'Acme Corp', salespersonName: 'Alex Morgan', date: getDate(-1), dueDate: getDate(14), amount: 3200.00, status: 'pending', items: [], warehouseId: 'w1' },
  { id: '202', number: 'ORD-002', type: 'order', clientId: '3', clientName: 'Soylent Corp', salespersonName: 'Jane Smith', date: getDate(0), dueDate: getDate(15), amount: 1500.00, status: 'draft', items: [], warehouseId: 'w1' },
  { id: '301', number: 'EST-001', type: 'estimate', clientId: '2', clientName: 'Globex Corp', salespersonName: 'Alex Morgan', date: getDate(0), dueDate: getDate(30), amount: 5000.00, status: 'draft', items: [], warehouseId: 'w1' },
  { id: '401', number: 'DEL-001', type: 'delivery', clientId: '5', clientName: 'Stark Ind', salespersonName: 'John Doe', date: getDate(-20), dueDate: getDate(-20), amount: 2200.00, status: 'completed', items: [], warehouseId: 'w1' },
];

// Mock Purchases
export const mockPurchases: Purchase[] = [
  { id: 'p101', number: 'PO-001', type: 'order', supplierId: 's1', supplierName: 'Global Electronics Ltd', date: getDate(-10), amount: 4500.00, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p102', number: 'PO-002', type: 'order', supplierId: 's3', supplierName: 'Heavy Metal Industries', date: getDate(-5), amount: 12000.00, status: 'pending', items: [], warehouseId: 'w1' },
  { id: 'p201', number: 'GRN-001', type: 'delivery', supplierId: 's1', supplierName: 'Global Electronics Ltd', date: getDate(-15), amount: 4500.00, status: 'received', items: [], warehouseId: 'w1' },
  { id: 'p301', number: 'PINV-001', type: 'invoice', supplierId: 's2', supplierName: 'Office Depot Wholesale', date: getDate(-40), amount: 1500.00, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p302', number: 'PINV-002', type: 'invoice', supplierId: 's5', supplierName: 'Green Energy Solutions', date: getDate(-25), amount: 850.00, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p303', number: 'PINV-003', type: 'invoice', supplierId: 's3', supplierName: 'Heavy Metal Industries', date: getDate(-5), amount: 6500.00, status: 'pending', items: [], warehouseId: 'w1' }
];

export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'SKU-001', name: 'Office Chair Ergonomic', category: 'Furniture', 
    stock: 45, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 5 },
    price: 199.99, cost: 85.00, status: 'in_stock' 
  },
  { 
    id: 'p2', sku: 'SKU-002', name: 'Wireless Keyboard', category: 'Electronics', 
    stock: 12, warehouseStock: { 'w1': 5, 'w2': 5, 'w3': 2 },
    price: 59.99, cost: 25.00, status: 'low_stock' 
  },
  { 
    id: 'p3', sku: 'SKU-003', name: '27" 4K Monitor', category: 'Electronics', 
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 450.00, cost: 280.00, status: 'low_stock' 
  },
  { 
    id: 'p4', sku: 'SKU-004', name: 'USB-C Cable', category: 'Accessories', 
    stock: 200, warehouseStock: { 'w1': 100, 'w2': 50, 'w3': 50 },
    price: 19.99, cost: 3.50, status: 'in_stock' 
  },
  { 
    id: 'p5', sku: 'SKU-005', name: 'Laptop Stand', category: 'Accessories', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 35.00, cost: 12.00, status: 'out_of_stock' 
  },
];

// --- Banking Mock Data ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'b1', name: 'Main Business Checking', bankName: 'Chase', accountNumber: '**** 4589', balance: 24500.00, currency: 'USD', type: 'checking' },
  { id: 'b2', name: 'Tax Savings', bankName: 'Wells Fargo', accountNumber: '**** 1234', balance: 8000.00, currency: 'USD', type: 'savings' },
  { id: 'b3', name: 'Corporate Card', bankName: 'Amex', accountNumber: '**** 9000', balance: -1250.00, currency: 'USD', type: 'credit' }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 't1', accountId: 'b1', date: getDate(0), description: 'Client Payment - Acme Corp', amount: 3500.00, type: 'deposit', status: 'cleared', reference: 'INV-001' },
  { id: 't2', accountId: 'b1', date: getDate(-1), description: 'Software Subscription', amount: -49.99, type: 'payment', status: 'cleared' },
  { id: 't3', accountId: 'b1', date: getDate(-2), description: 'Transfer to Savings', amount: -2000.00, type: 'transfer', status: 'cleared' },
  { id: 't4', accountId: 'b2', date: getDate(-2), description: 'Transfer from Checking', amount: 2000.00, type: 'transfer', status: 'cleared' },
  { id: 't5', accountId: 'b3', date: getDate(-5), description: 'Client Lunch', amount: -125.50, type: 'payment', status: 'pending' },
];

// --- Cash Register Mock Data ---
export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Alex Morgan', startTime: getDate(-1) + 'T08:00:00', endTime: getDate(-1) + 'T17:00:00', openingBalance: 200.00, closingBalance: 1250.00, expectedBalance: 1255.00, status: 'closed', notes: 'Short by $5' }
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ct1', sessionId: 'cs1', date: getDate(-1) + 'T09:30:00', type: 'sale', amount: 45.00, description: 'Walk-in Sale' },
  { id: 'ct2', sessionId: 'cs1', date: getDate(-1) + 'T11:00:00', type: 'expense', amount: -15.00, description: 'Office Coffee' },
];

export const mockStats: DashboardStats = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  pendingInvoices: 0,
};

export const chartData = [];

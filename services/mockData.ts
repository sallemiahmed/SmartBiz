import { Client, DashboardStats, Invoice, Product, Supplier, Purchase } from '../types';

// Helper to get a date string relative to today
const getDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Mock Clients
export const mockClients: Client[] = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1 555-0101', company: 'Acme Inc.', status: 'active', totalSpent: 15200 },
  { id: '2', name: 'Globex', email: 'procurement@globex.com', phone: '+1 555-0102', company: 'Globex Corp', status: 'active', totalSpent: 8500 },
  { id: '3', name: 'Soylent Corp', email: 'info@soylent.com', phone: '+1 555-0103', company: 'Soylent', status: 'inactive', totalSpent: 2100 },
  { id: '4', name: 'Umbrella Corp', email: 'secure@umbrella.com', phone: '+1 555-0104', company: 'Umbrella', status: 'active', totalSpent: 45000 },
  { id: '5', name: 'Stark Ind', email: 'tony@stark.com', phone: '+1 555-0105', company: 'Stark Industries', status: 'active', totalSpent: 125000 },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'Global Electronics Ltd', contactName: 'Sarah Connor', email: 'sarah@globalelec.com', phone: '+1 555-9988', category: 'Electronics', status: 'active', totalPurchased: 54000 },
  { id: 's2', company: 'Office Depot Wholesale', contactName: 'Michael Scott', email: 'mscott@odw.com', phone: '+1 555-1122', category: 'Office Supplies', status: 'active', totalPurchased: 12500 },
  { id: 's3', company: 'Heavy Metal Industries', contactName: 'James Hetfield', email: 'sales@heavymetal.com', phone: '+1 555-6666', category: 'Raw Materials', status: 'active', totalPurchased: 89000 },
  { id: 's4', company: 'Fast Shipping Co', contactName: 'Barry Allen', email: 'barry@fastship.com', phone: '+1 555-3344', category: 'Logistics', status: 'inactive', totalPurchased: 3400 },
  { id: 's5', company: 'Green Energy Solutions', contactName: 'Pamela Isley', email: 'pam@greenenergy.com', phone: '+1 555-7788', category: 'Utilities', status: 'active', totalPurchased: 7600 },
];

// Mock Invoices - Dynamic Dates
export const mockInvoices: Invoice[] = [
  // Past Invoices (Revenue)
  { id: '101', number: 'INV-001', type: 'invoice', clientId: '1', clientName: 'Acme Corp', date: getDate(-60), dueDate: getDate(-45), amount: 3500.00, status: 'paid', items: [] },
  { id: '102', number: 'INV-002', type: 'invoice', clientId: '5', clientName: 'Stark Ind', date: getDate(-45), dueDate: getDate(-30), amount: 12500.00, status: 'paid', items: [] },
  { id: '103', number: 'INV-003', type: 'invoice', clientId: '2', clientName: 'Globex', date: getDate(-30), dueDate: getDate(-15), amount: 4200.00, status: 'paid', items: [] },
  { id: '104', number: 'INV-004', type: 'invoice', clientId: '4', clientName: 'Umbrella Corp', date: getDate(-10), dueDate: getDate(5), amount: 8900.00, status: 'pending', items: [] },
  { id: '105', number: 'INV-005', type: 'invoice', clientId: '1', clientName: 'Acme Corp', date: getDate(-2), dueDate: getDate(14), amount: 1200.00, status: 'pending', items: [] },
  { id: '106', number: 'INV-006', type: 'invoice', clientId: '5', clientName: 'Stark Ind', date: getDate(-5), dueDate: getDate(10), amount: 15000.00, status: 'paid', items: [] },
  
  // Sales Orders
  { id: '201', number: 'ORD-001', type: 'order', clientId: '1', clientName: 'Acme Corp', date: getDate(-1), dueDate: getDate(14), amount: 3200.00, status: 'pending', items: [] },
  { id: '202', number: 'ORD-002', type: 'order', clientId: '3', clientName: 'Soylent Corp', date: getDate(0), dueDate: getDate(15), amount: 1500.00, status: 'draft', items: [] },

  // Estimates
  { id: '301', number: 'EST-001', type: 'estimate', clientId: '2', clientName: 'Globex Corp', date: getDate(0), dueDate: getDate(30), amount: 5000.00, status: 'draft', items: [] },
  
  // Delivery Notes
  { id: '401', number: 'DEL-001', type: 'delivery', clientId: '5', clientName: 'Stark Ind', date: getDate(-20), dueDate: getDate(-20), amount: 2200.00, status: 'completed', items: [] },
];

// Mock Purchases - Dynamic Dates
export const mockPurchases: Purchase[] = [
  { id: 'p101', number: 'PO-001', type: 'order', supplierId: 's1', supplierName: 'Global Electronics Ltd', date: getDate(-10), amount: 4500.00, status: 'completed', items: [] },
  { id: 'p102', number: 'PO-002', type: 'order', supplierId: 's3', supplierName: 'Heavy Metal Industries', date: getDate(-5), amount: 12000.00, status: 'pending', items: [] },
  { id: 'p201', number: 'GRN-001', type: 'delivery', supplierId: 's1', supplierName: 'Global Electronics Ltd', date: getDate(-15), amount: 4500.00, status: 'received', items: [] },
  
  // Invoices (Expenses)
  { id: 'p301', number: 'PINV-001', type: 'invoice', supplierId: 's2', supplierName: 'Office Depot Wholesale', date: getDate(-40), amount: 1500.00, status: 'completed', items: [] },
  { id: 'p302', number: 'PINV-002', type: 'invoice', supplierId: 's5', supplierName: 'Green Energy Solutions', date: getDate(-25), amount: 850.00, status: 'completed', items: [] },
  { id: 'p303', number: 'PINV-003', type: 'invoice', supplierId: 's3', supplierName: 'Heavy Metal Industries', date: getDate(-5), amount: 6500.00, status: 'pending', items: [] }
];

export const mockInventory: Product[] = [
  { id: 'p1', sku: 'SKU-001', name: 'Office Chair Ergonomic', category: 'Furniture', stock: 45, price: 199.99, cost: 85.00, status: 'in_stock' },
  { id: 'p2', sku: 'SKU-002', name: 'Wireless Keyboard', category: 'Electronics', stock: 12, price: 59.99, cost: 25.00, status: 'low_stock' },
  { id: 'p3', sku: 'SKU-003', name: '27" 4K Monitor', category: 'Electronics', stock: 8, price: 450.00, cost: 280.00, status: 'low_stock' },
  { id: 'p4', sku: 'SKU-004', name: 'USB-C Cable', category: 'Accessories', stock: 200, price: 19.99, cost: 3.50, status: 'in_stock' },
  { id: 'p5', sku: 'SKU-005', name: 'Laptop Stand', category: 'Accessories', stock: 0, price: 35.00, cost: 12.00, status: 'out_of_stock' },
];

// Placeholder for compatibility, though logic will now derive from arrays above
export const mockStats: DashboardStats = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  pendingInvoices: 0,
};

export const chartData = [];
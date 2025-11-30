
import { Client, Supplier, Product, Invoice, Purchase, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement, Technician, ServiceItem, ServiceJob, ServiceSale } from '../types';

const currentYear = new Date().getFullYear();
const today = new Date();

// Helper to generate dates relative to today
const getDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getTimestamp = (offsetDays: number, hour: number = 10) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
};

// --- WAREHOUSES ---
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', location: 'Industrial Zone A', isDefault: true },
  { id: 'w2', name: 'Downtown Showroom', location: 'City Center' },
  { id: 'w3', name: 'North Branch', location: 'North District' },
];

// --- INVENTORY ---
export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'LAP-HP-001', name: 'HP EliteBook 840 G8', category: 'Computers', 
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=200',
    stock: 25, warehouseStock: { 'w1': 15, 'w2': 5, 'w3': 5 },
    price: 1200.00, cost: 950.00, status: 'in_stock', marginPercent: 20.8
  },
  { 
    id: 'p2', sku: 'MON-DELL-27', name: 'Dell 27" 4K Monitor', category: 'Peripherals', 
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200',
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 450.00, cost: 320.00, status: 'low_stock', marginPercent: 28.8
  },
  { 
    id: 'p3', sku: 'PRN-EPS-L3150', name: 'Epson EcoTank L3150', category: 'Printers', 
    stock: 40, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 0 },
    price: 250.00, cost: 180.00, status: 'in_stock', marginPercent: 28.0
  },
  { 
    id: 'p4', sku: 'ACC-MSE-LOG', name: 'Logitech MX Master 3S', category: 'Accessories', 
    stock: 5, warehouseStock: { 'w1': 2, 'w2': 3, 'w3': 0 },
    price: 99.00, cost: 65.00, status: 'low_stock', marginPercent: 34.3
  },
  { 
    id: 'p5', sku: 'SERV-DELL-T40', name: 'Dell PowerEdge T40 Server', category: 'Servers', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 1800.00, cost: 1400.00, status: 'out_of_stock', marginPercent: 22.2
  },
  {
    id: 'p6', sku: 'OFF-CHR-001', name: 'Ergonomic Office Chair', category: 'Furniture',
    stock: 120, warehouseStock: { 'w1': 100, 'w2': 10, 'w3': 10 },
    price: 299.00, cost: 150.00, status: 'in_stock', marginPercent: 49.8
  },
  {
    id: 'p7', sku: 'NET-RTR-CIS', name: 'Cisco ISR 1100 Router', category: 'Networking',
    stock: 12, warehouseStock: { 'w1': 12, 'w2': 0, 'w3': 0 },
    price: 650.00, cost: 450.00, status: 'in_stock', marginPercent: 30.7
  },
  {
    id: 'p8', sku: 'SOFT-WIN-11', name: 'Windows 11 Pro License', category: 'Software',
    stock: 500, warehouseStock: { 'w1': 500 },
    price: 199.00, cost: 120.00, status: 'in_stock', marginPercent: 39.7
  },
  {
    id: 'p9', sku: 'ACC-KB-MECH', name: 'Mechanical Keyboard RGB', category: 'Accessories',
    stock: 15, warehouseStock: { 'w1': 10, 'w2': 5 },
    price: 120.00, cost: 70.00, status: 'in_stock', marginPercent: 41.6
  },
  {
    id: 'p10', sku: 'TAB-IPAD-AIR', name: 'iPad Air 5th Gen', category: 'Tablets',
    stock: 3, warehouseStock: { 'w2': 3 },
    price: 599.00, cost: 500.00, status: 'low_stock', marginPercent: 16.5
  }
];

// --- CLIENTS ---
export const mockClients: Client[] = [
  { id: 'c1', company: 'TechSolutions Corp', name: 'Ahmed Ben Ali', email: 'ahmed@techsolutions.com', phone: '+1 555-0101', status: 'active', category: 'Corporate', totalSpent: 45000.00, region: 'North' },
  { id: 'c2', company: 'Global Services Ltd', name: 'Sarah Miller', email: 'sarah@global.com', phone: '+1 555-0102', status: 'active', category: 'Retail', totalSpent: 8500.00, region: 'East' },
  { id: 'c3', company: 'Innovate Startups', name: 'Mehdi K.', email: 'mehdi@innovate.com', phone: '+1 555-0103', status: 'inactive', category: 'Wholesale', totalSpent: 0, region: 'West' },
  { id: 'c4', company: 'City Bank', name: 'Purchasing Dept', email: 'procurement@citybank.com', phone: '+1 555-0104', status: 'active', category: 'Corporate', totalSpent: 120000.00, region: 'Central' },
  { id: 'c5', company: 'HealthPlus Clinic', name: 'Dr. F. Tounsi', email: 'ftounsi@healthplus.com', phone: '+1 555-0105', status: 'active', category: 'Corporate', totalSpent: 15400.00, region: 'North' },
  { id: 'c6', company: 'Creative Design Studio', name: 'Lisa Ray', email: 'lisa@design.com', phone: '+1 555-0106', status: 'active', category: 'Retail', totalSpent: 2200.00, region: 'South' },
  { id: 'c7', company: 'Mega Construction', name: 'Bob Builder', email: 'bob@megaconst.com', phone: '+1 555-0107', status: 'active', category: 'Corporate', totalSpent: 35000.00, region: 'West' }
];

// --- SUPPLIERS ---
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MegaDistro Inc', contactName: 'Jean Dupont', email: 'sales@megadistro.com', phone: '+1 555-0201', category: 'Hardware', status: 'active', totalPurchased: 150000.00 },
  { id: 's2', company: 'Cable Masters', contactName: 'Mounir S.', email: 'mounir@cables.com', phone: '+1 555-0202', category: 'Networking', status: 'active', totalPurchased: 25000.00 },
  { id: 's3', company: 'Office World', contactName: 'Alice Smith', email: 'alice@officeworld.com', phone: '+1 555-0203', category: 'Furniture', status: 'active', totalPurchased: 45000.00 },
  { id: 's4', company: 'SoftCorp Global', contactName: 'Bill G.', email: 'bill@softcorp.com', phone: '+1 555-0204', category: 'Software', status: 'active', totalPurchased: 8000.00 },
  { id: 's5', company: 'Tech Parts Direct', contactName: 'Support', email: 'orders@techparts.com', phone: '+1 555-0205', category: 'Spares', status: 'active', totalPurchased: 12000.00 }
];

// --- INVOICES (SALES) ---
export const mockInvoices: Invoice[] = [
  // Paid Invoices (Past)
  { 
    id: 'inv1', number: 'INV-2024-001', type: 'invoice', clientId: 'c1', clientName: 'TechSolutions Corp', 
    date: getDate(-30), dueDate: getDate(-15), amount: 12500.00, status: 'paid', 
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 10, price: 1250 } ],
    warehouseId: 'w1', subtotal: 12500, taxRate: 0
  },
  { 
    id: 'inv2', number: 'INV-2024-002', type: 'invoice', clientId: 'c4', clientName: 'City Bank', 
    date: getDate(-25), dueDate: getDate(-5), amount: 45000.00, status: 'paid',
    items: [ { id: 'p7', description: 'Cisco Router', quantity: 20, price: 650 }, { id: 'p8', description: 'Win 11 Lic', quantity: 160, price: 200 } ],
    warehouseId: 'w1', subtotal: 45000, taxRate: 0
  },
  { 
    id: 'inv3', number: 'INV-2024-003', type: 'invoice', clientId: 'c2', clientName: 'Global Services Ltd', 
    date: getDate(-10), dueDate: getDate(5), amount: 3250.00, status: 'overdue',
    items: [ { id: 'p3', description: 'Epson Printer', quantity: 13, price: 250 } ],
    warehouseId: 'w2', subtotal: 3250, taxRate: 0
  },
  // Active Invoices
  { 
    id: 'inv4', number: 'INV-2024-004', type: 'invoice', clientId: 'c1', clientName: 'TechSolutions Corp', 
    date: getDate(-2), dueDate: getDate(28), amount: 8900.00, status: 'pending',
    items: [ { id: 'p6', description: 'Office Chair', quantity: 20, price: 299 }, { id: 'p2', description: 'Dell Monitor', quantity: 6, price: 450 } ],
    warehouseId: 'w1', subtotal: 8900, taxRate: 0
  },
  { 
    id: 'inv5', number: 'INV-2024-005', type: 'invoice', clientId: 'c5', clientName: 'HealthPlus Clinic', 
    date: getDate(0), dueDate: getDate(30), amount: 15400.00, status: 'pending',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 12, price: 1200 }, { id: 'p4', description: 'Logitech Mouse', quantity: 10, price: 100 } ],
    warehouseId: 'w1', subtotal: 15400, taxRate: 0
  },
  // Estimates
  { 
    id: 'est1', number: 'EST-24-101', type: 'estimate', clientId: 'c3', clientName: 'Innovate Startups', 
    date: getDate(-1), dueDate: getDate(14), amount: 28000.00, status: 'draft',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 20, price: 1200 }, { id: 'p2', description: 'Monitor', quantity: 10, price: 400 } ],
    warehouseId: 'w1'
  },
  { 
    id: 'est2', number: 'EST-24-102', type: 'estimate', clientId: 'c7', clientName: 'Mega Construction', 
    date: getDate(0), dueDate: getDate(7), amount: 5500.00, status: 'sent',
    items: [ { id: 'p3', description: 'Printers', quantity: 5, price: 250 }, { id: 'p8', description: 'Software', quantity: 20, price: 199 } ],
    warehouseId: 'w1'
  },
  // Orders
  { 
    id: 'ord1', number: 'ORD-24-055', type: 'order', clientId: 'c2', clientName: 'Global Services Ltd', 
    date: getDate(-5), amount: 4500.00, status: 'pending',
    items: [ { id: 'p6', description: 'Office Chair', quantity: 15, price: 300 } ],
    warehouseId: 'w2'
  },
  // Deliveries
  { 
    id: 'del1', number: 'DEL-24-882', type: 'delivery', clientId: 'c4', clientName: 'City Bank', 
    date: getDate(-20), amount: 0, status: 'completed',
    items: [ { id: 'p7', description: 'Cisco Router', quantity: 10, price: 0 } ],
    warehouseId: 'w1', linkedDocumentId: 'inv2'
  }
];

// --- PURCHASES ---
export const mockPurchases: Purchase[] = [
  {
    id: 'po1', number: 'PO-24-001', type: 'invoice', supplierId: 's1', supplierName: 'MegaDistro Inc',
    date: getDate(-45), amount: 50000.00, status: 'completed',
    items: [{ id: 'p1', description: 'HP EliteBook', quantity: 50, price: 950 }, { id: 'p2', description: 'Monitors', quantity: 20, price: 320 }],
    warehouseId: 'w1', subtotal: 50000
  },
  {
    id: 'po2', number: 'PO-24-002', type: 'invoice', supplierId: 's3', supplierName: 'Office World',
    date: getDate(-30), amount: 15000.00, status: 'completed',
    items: [{ id: 'p6', description: 'Ergonomic Chair', quantity: 100, price: 150 }],
    warehouseId: 'w1', subtotal: 15000
  },
  {
    id: 'po3', number: 'PO-24-003', type: 'order', supplierId: 's1', supplierName: 'MegaDistro Inc',
    date: getDate(-2), amount: 12000.00, status: 'pending',
    items: [{ id: 'p5', description: 'Dell Server', quantity: 8, price: 1400 }],
    warehouseId: 'w1'
  },
  {
    id: 'rfq1', number: 'RFQ-24-010', type: 'rfq', supplierId: 's5', supplierName: 'Tech Parts Direct',
    date: getDate(0), deadline: getDate(7), amount: 0, status: 'sent',
    items: [{ id: 'p1', description: 'Replacement Screens', quantity: 50, price: 0 }],
    warehouseId: 'w1'
  },
  {
    id: 'pr1', number: 'PR-24-005', type: 'pr', supplierId: '', supplierName: '',
    requesterName: 'IT Support', department: 'Internal Ops',
    date: getDate(-1), amount: 0, status: 'pending',
    items: [
        { id: 'p9', description: 'Mech Keyboards', quantity: 5, price: 0 }
    ],
    warehouseId: 'w1'
  }
];

// --- BANKING & CASH ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Main Operating', bankName: 'Chase', accountNumber: '**** 8892', currency: 'USD', type: 'checking', balance: 125400.50 },
  { id: 'ba2', name: 'Savings Reserve', bankName: 'BOA', accountNumber: '**** 4421', currency: 'USD', type: 'savings', balance: 45000.00 },
  { id: 'ba3', name: 'Euro Operations', bankName: 'HSBC', accountNumber: '**** 7723', currency: 'EUR', type: 'checking', balance: 12500.00 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: getDate(0), description: 'Client Payment - TechSolutions', amount: 12500.00, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: getDate(-1), description: 'Office Rent - May', amount: -2500.00, type: 'payment', status: 'cleared' },
  { id: 'tx3', accountId: 'ba1', date: getDate(-3), description: 'Utility Bill', amount: -450.00, type: 'payment', status: 'reconciled' },
  { id: 'tx4', accountId: 'ba1', date: getDate(-5), description: 'Supplier Payment - MegaDistro', amount: -15000.00, type: 'payment', status: 'reconciled' },
  { id: 'tx5', accountId: 'ba2', date: getDate(-10), description: 'Interest Income', amount: 120.50, type: 'deposit', status: 'reconciled' }
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Alex Morgan', startTime: getTimestamp(0, 8), openingBalance: 250.00, expectedBalance: 680.00, status: 'open' },
  { id: 'cs2', openedBy: 'Alex Morgan', startTime: getTimestamp(-1, 8), endTime: getTimestamp(-1, 18), openingBalance: 200.00, closingBalance: 1450.00, expectedBalance: 1450.00, status: 'closed' },
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ctx1', sessionId: 'cs1', date: getTimestamp(0, 10), type: 'sale', amount: 450.00, description: 'Counter Sale #882' },
  { id: 'ctx2', sessionId: 'cs1', date: getTimestamp(0, 12), type: 'expense', amount: -20.00, description: 'Office Supplies' },
  { id: 'ctx3', sessionId: 'cs2', date: getTimestamp(-1, 14), type: 'sale', amount: 1200.00, description: 'Large Cash Order' },
];

// --- SERVICES ---
export const mockTechnicians: Technician[] = [
  { id: 'tech1', name: 'Mike Ross', specialty: 'Hardware Repair', status: 'available', phone: '+1 555-9901' },
  { id: 'tech2', name: 'Rachel Zane', specialty: 'Software & Network', status: 'busy', phone: '+1 555-9902' },
  { id: 'tech3', name: 'Harvey Specter', specialty: 'Advanced Diagnostics', status: 'off_duty', phone: '+1 555-9903' },
  { id: 'tech4', name: 'Donna Paulsen', specialty: 'Customer Support', status: 'available', phone: '+1 555-9904' },
  { id: 'tech5', name: 'Louis Litt', specialty: 'Server Maintenance', status: 'busy', phone: '+1 555-9905' }
];

export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Diagnostic & Quote', description: 'Initial hardware inspection', basePrice: 45.00, durationMinutes: 30 },
  { id: 'srv2', name: 'OS Installation', description: 'Windows/Linux/MacOS Install + Drivers', basePrice: 80.00, durationMinutes: 60 },
  { id: 'srv3', name: 'Screen Replacement', description: 'Laptop screen replacement labor', basePrice: 100.00, durationMinutes: 45 },
  { id: 'srv4', name: 'Thermal Cleaning', description: 'Internal cleaning & thermal paste application', basePrice: 60.00, durationMinutes: 45 },
  { id: 'srv5', name: 'Network Setup', description: 'On-site router & wifi configuration', basePrice: 120.00, durationMinutes: 90 },
  { id: 'srv6', name: 'Data Recovery L1', description: 'Software-based data recovery', basePrice: 200.00, durationMinutes: 120 },
  { id: 'srv7', name: 'Printer Maintenance', description: 'LaserJet complete service', basePrice: 75.00, durationMinutes: 60 }
];

export const mockServiceJobs: ServiceJob[] = [
  { 
    id: 'job1', ticketNumber: 'JOB-24-1001', clientId: 'c1', clientName: 'TechSolutions Corp', 
    date: getDate(-2), status: 'in_progress', priority: 'high', 
    technicianId: 'tech1', technicianName: 'Mike Ross', deviceInfo: 'Dell Latitude 5420',
    problemDescription: 'Overheating and random shutdowns.',
    estimatedCost: 160.00,
    services: [{ serviceId: 'srv4', name: 'Thermal Cleaning', price: 60 }],
    usedParts: [{ productId: 'p1', name: 'Fan Unit', quantity: 1, price: 40 }]
  },
  { 
    id: 'job2', ticketNumber: 'JOB-24-1002', clientId: 'c5', clientName: 'HealthPlus Clinic', 
    date: getDate(-1), status: 'pending', priority: 'medium', 
    deviceInfo: 'HP LaserJet Pro',
    problemDescription: 'Paper jam error persistent.',
    estimatedCost: 75.00,
    services: [{ serviceId: 'srv1', name: 'Diagnostic', price: 45 }],
    usedParts: []
  },
  { 
    id: 'job3', ticketNumber: 'JOB-24-0998', clientId: 'c2', clientName: 'Global Services Ltd', 
    date: getDate(-5), status: 'completed', priority: 'low', 
    technicianId: 'tech2', technicianName: 'Rachel Zane', deviceInfo: 'File Server',
    problemDescription: 'Security update required',
    resolutionNotes: 'Patched OS and updated firewall rules.',
    estimatedCost: 120.00,
    services: [{ serviceId: 'srv2', name: 'OS Update', price: 120 }],
    usedParts: [],
    rating: 5, resolutionHours: 2.5
  },
  {
    id: 'job4', ticketNumber: 'JOB-24-1003', clientId: 'c4', clientName: 'City Bank',
    date: getDate(0), status: 'in_progress', priority: 'critical',
    technicianId: 'tech5', technicianName: 'Louis Litt', deviceInfo: 'Main Router',
    problemDescription: 'Packet loss on main line',
    estimatedCost: 350.00,
    services: [{ serviceId: 'srv5', name: 'Network Debug', price: 150 }],
    usedParts: []
  },
  {
    id: 'job5', ticketNumber: 'JOB-24-0995', clientId: 'c1', clientName: 'TechSolutions Corp',
    date: getDate(-10), status: 'invoiced', priority: 'low',
    technicianId: 'tech1', technicianName: 'Mike Ross', deviceInfo: 'ThinkPad X1',
    problemDescription: 'Screen flickering',
    resolutionNotes: 'Replaced screen panel.',
    estimatedCost: 300.00,
    services: [{ serviceId: 'srv3', name: 'Screen Replacement', price: 100 }],
    usedParts: [{ productId: 'p1', name: 'LCD Panel', quantity: 1, price: 200 }],
    rating: 4, resolutionHours: 48.0
  },
  {
    id: 'job6', ticketNumber: 'JOB-24-0990', clientId: 'c6', clientName: 'Creative Design Studio',
    date: getDate(-12), status: 'completed', priority: 'medium',
    technicianId: 'tech4', technicianName: 'Donna Paulsen', deviceInfo: 'iMac Pro',
    problemDescription: 'Slow performance',
    resolutionNotes: 'Cleaned dust, re-seated RAM.',
    estimatedCost: 80.00,
    services: [{ serviceId: 'srv4', name: 'Maintenance', price: 80 }],
    usedParts: [],
    rating: 5, resolutionHours: 4.0
  },
  {
    id: 'job7', ticketNumber: 'JOB-24-0992', clientId: 'c2', clientName: 'Global Services Ltd',
    date: getDate(-11), status: 'invoiced', priority: 'high',
    technicianId: 'tech1', technicianName: 'Mike Ross', deviceInfo: 'Server Rack',
    problemDescription: 'Power supply failure',
    resolutionNotes: 'Replaced PSU unit.',
    estimatedCost: 450.00,
    services: [{ serviceId: 'srv5', name: 'Hardware Install', price: 150 }],
    usedParts: [{ productId: 'p5', name: 'PSU 1000W', quantity: 1, price: 300 }],
    rating: 4.5, resolutionHours: 6.5
  },
  {
    id: 'job8', ticketNumber: 'JOB-24-0999', clientId: 'c5', clientName: 'HealthPlus Clinic',
    date: getDate(-4), status: 'completed', priority: 'critical',
    technicianId: 'tech5', technicianName: 'Louis Litt', deviceInfo: 'Database Server',
    problemDescription: 'Database corruption',
    resolutionNotes: 'Restored from backup, integrity check passed.',
    estimatedCost: 600.00,
    services: [{ serviceId: 'srv6', name: 'Data Recovery', price: 600 }],
    usedParts: [],
    rating: 3.5, resolutionHours: 12.0
  }
];

export const mockServiceSales: ServiceSale[] = [
  {
    id: 'ss1', reference: 'SRV-INV-501', date: getDate(-5), clientId: 'c1', clientName: 'TechSolutions Corp',
    technicianId: 'tech1', technicianName: 'Mike Ross', status: 'paid',
    items: [
      { id: '1', description: 'Screen Replacement Labor', quantity: 1, unitPrice: 100, total: 100 },
      { id: '2', description: 'LCD Panel 14"', quantity: 1, unitPrice: 200, total: 200 }
    ],
    subtotal: 300, discountType: 'amount', discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, total: 300
  },
  {
    id: 'ss2', reference: 'SRV-INV-502', date: getDate(-3), clientId: 'c2', clientName: 'Global Services Ltd',
    technicianId: 'tech2', technicianName: 'Rachel Zane', status: 'pending',
    items: [
      { id: '1', description: 'Network Configuration', quantity: 2, unitPrice: 120, total: 240 }
    ],
    subtotal: 240, discountType: 'percent', discountValue: 10, discountAmount: 24, taxRate: 0, taxAmount: 0, total: 216
  },
  {
    id: 'ss3', reference: 'SRV-INV-503', date: getDate(-1), clientId: 'c6', clientName: 'Creative Design Studio',
    technicianId: 'tech4', technicianName: 'Donna Paulsen', status: 'paid',
    items: [
      { id: '1', description: 'Printer Maintenance', quantity: 1, unitPrice: 75, total: 75 },
      { id: '2', description: 'Toner Cartridge', quantity: 1, unitPrice: 80, total: 80 }
    ],
    subtotal: 155, discountType: 'amount', discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, total: 155
  }
];

// --- STOCK MOVEMENTS ---
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'HP EliteBook', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-30), quantity: 50, type: 'initial', reference: 'INIT', notes: 'Opening Stock', unitCost: 950 },
  { id: 'sm2', productId: 'p1', productName: 'HP EliteBook', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-29), quantity: -10, type: 'sale', reference: 'INV-2024-001', notes: 'Sales', unitCost: 950 },
  { id: 'sm3', productId: 'p7', productName: 'Cisco Router', warehouseId: 'w1', warehouseName: 'Main Warehouse', date: getDate(-25), quantity: -20, type: 'sale', reference: 'INV-2024-002', notes: 'Sales', unitCost: 450 },
];

export const mockStockTransfers: StockTransfer[] = [];

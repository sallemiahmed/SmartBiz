
import { Client, Supplier, Product, Invoice, Purchase, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement } from '../types';

export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'CHA-001', name: 'Chaise de Bureau Ergonomique', category: 'Mobilier', 
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=200',
    stock: 45, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 5 },
    price: 289.000, cost: 150.000, status: 'in_stock', marginPercent: 48.1
  },
  { 
    id: 'p2', sku: 'TEC-002', name: 'Clavier Sans Fil Logitech', category: 'Informatique', 
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&q=80&w=200',
    stock: 12, warehouseStock: { 'w1': 5, 'w2': 5, 'w3': 2 },
    price: 89.000, cost: 45.000, status: 'low_stock', marginPercent: 49.4
  },
  { 
    id: 'p3', sku: 'TEC-003', name: 'Ecran Dell 27" 4K', category: 'Informatique', 
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200',
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 1250.000, cost: 980.000, status: 'low_stock', marginPercent: 21.6
  },
  { 
    id: 'p4', sku: 'ACC-004', name: 'Câble HDMI 2m', category: 'Accessoires', 
    stock: 200, warehouseStock: { 'w1': 100, 'w2': 50, 'w3': 50 },
    price: 25.000, cost: 8.500, status: 'in_stock', marginPercent: 66.0
  },
  { 
    id: 'p5', sku: 'ACC-005', name: 'Support PC Portable', category: 'Accessoires', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 75.000, cost: 35.000, status: 'out_of_stock', marginPercent: 53.3
  },
];

export const mockClients: Client[] = [
  { id: 'c1', company: 'TechSolutions SARL', name: 'Ahmed Ben Ali', email: 'contact@techsolutions.tn', phone: '+216 20 123 456', status: 'active', category: 'Corporate', totalSpent: 15400.000, region: 'Tunis' },
  { id: 'c2', company: 'Global Services', name: 'Sarah M.', email: 'sarah@global.com', phone: '+216 55 987 654', status: 'active', category: 'Retail', totalSpent: 2300.000, region: 'Sousse' },
  { id: 'c3', company: 'StartUp Hub', name: 'Mehdi K.', email: 'mehdi@hub.tn', phone: '+216 98 111 222', status: 'inactive', category: 'Wholesale', totalSpent: 0, region: 'Sfax' },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MegaDistro', contactName: 'Jean Dupont', email: 'sales@megadistro.com', phone: '+33 1 23 45 67 89', category: 'Electronics', status: 'active', totalPurchased: 50000.000 },
  { id: 's2', company: 'Office World', contactName: 'Alice Smith', email: 'alice@officeworld.com', phone: '+44 20 7123 4567', category: 'Furniture', status: 'active', totalPurchased: 12000.000 },
];

export const mockInvoices: Invoice[] = [
  { 
    id: 'inv1', number: 'F-2024-0001', type: 'invoice', clientId: 'c1', clientName: 'TechSolutions SARL', 
    date: '2024-01-15', dueDate: '2024-02-15', amount: 4500.000, status: 'paid', 
    items: [
        { id: 'p3', description: 'Ecran Dell 27" 4K', quantity: 2, price: 1250.000 },
        { id: 'p2', description: 'Clavier Sans Fil Logitech', quantity: 5, price: 89.000 }
    ],
    warehouseId: 'w1'
  },
  { 
    id: 'inv2', number: 'F-2024-0002', type: 'invoice', clientId: 'c2', clientName: 'Global Services', 
    date: '2024-01-20', dueDate: '2024-02-20', amount: 1250.000, status: 'pending',
    items: [
        { id: 'p3', description: 'Ecran Dell 27" 4K', quantity: 1, price: 1250.000 }
    ],
    warehouseId: 'w1'
  },
  { 
    id: 'est1', number: 'D-2024-0001', type: 'estimate', clientId: 'c3', clientName: 'StartUp Hub', 
    date: '2024-02-01', dueDate: '2024-02-15', amount: 8500.000, status: 'draft',
    items: [
        { id: 'p1', description: 'Chaise de Bureau Ergonomique', quantity: 10, price: 289.000 },
        { id: 'p4', description: 'Câble HDMI 2m', quantity: 20, price: 25.000 }
    ],
    warehouseId: 'w1'
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: 'po1', number: 'BCF-2024-0001', type: 'order', supplierId: 's1', supplierName: 'MegaDistro',
    date: '2024-01-10', amount: 15000.000, status: 'completed',
    items: [{ id: 'p3', description: 'Ecran Dell 27" 4K', quantity: 10, price: 980.000 }],
    warehouseId: 'w1'
  },
  {
    id: 'po2', number: 'FF-2024-0001', type: 'invoice', supplierId: 's2', supplierName: 'Office World',
    date: '2024-01-05', amount: 5000.000, status: 'completed',
    items: [{ id: 'p1', description: 'Chaise de Bureau Ergonomique', quantity: 20, price: 150.000 }],
    warehouseId: 'w1'
  }
];

export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Main Business Account', bankName: 'BIAT', accountNumber: '12345678901234567890', currency: 'TND', type: 'checking', balance: 25400.000 },
  { id: 'ba2', name: 'Savings Reserve', bankName: 'Amen Bank', accountNumber: '09876543210987654321', currency: 'TND', type: 'savings', balance: 10000.000 },
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: '2024-01-15', description: 'Payment from TechSolutions', amount: 4500.000, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: '2024-01-10', description: 'Rent Payment', amount: -1200.000, type: 'payment', status: 'reconciled' },
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Alex Morgan', startTime: '2024-02-01T08:00:00', openingBalance: 200.000, expectedBalance: 550.000, status: 'open' },
  { id: 'cs2', openedBy: 'Alex Morgan', startTime: '2024-01-31T08:00:00', endTime: '2024-01-31T18:00:00', openingBalance: 200.000, closingBalance: 1250.000, expectedBalance: 1250.000, status: 'closed' },
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ctx1', sessionId: 'cs1', date: '2024-02-01T10:30:00', type: 'sale', amount: 350.000, description: 'Walk-in Sale' },
];

export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse (Tunis)', location: 'Tunis', isDefault: true },
  { id: 'w2', name: 'Sousse Depot', location: 'Sousse' },
  { id: 'w3', name: 'Sfax Branch', location: 'Sfax' },
];

export const mockStockTransfers: StockTransfer[] = [];

export const mockStockMovements: StockMovement[] = [];

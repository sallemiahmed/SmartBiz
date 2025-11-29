
// ... existing imports
import { Client, Supplier, Product, Invoice, Purchase, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement } from '../types';

const currentYear = new Date().getFullYear();

// ... existing mock data (warehouses, inventory, clients, suppliers, invoices)
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Dépôt Principal', location: 'Tunis Z.I.', isDefault: true },
  { id: 'w2', name: 'Showroom Sousse', location: 'Sousse Centre' },
  { id: 'w3', name: 'Entrepôt Sfax', location: 'Sfax Nord' },
];

export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'LAP-HP-001', name: 'HP EliteBook 840 G8', category: 'Informatique', 
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=200',
    stock: 25, warehouseStock: { 'w1': 15, 'w2': 5, 'w3': 5 },
    price: 3200.000, cost: 2400.000, status: 'in_stock', marginPercent: 25.0
  },
  { 
    id: 'p2', sku: 'MON-DELL-27', name: 'Ecran Dell 27" 4K USB-C', category: 'Périphériques', 
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200',
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 1450.000, cost: 980.000, status: 'low_stock', marginPercent: 32.4
  },
  { 
    id: 'p3', sku: 'PRN-EPS-L3150', name: 'Imprimante Epson EcoTank', category: 'Impression', 
    stock: 40, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 0 },
    price: 650.000, cost: 420.000, status: 'in_stock', marginPercent: 35.4
  },
  { 
    id: 'p4', sku: 'ACC-MSE-LOG', name: 'Souris Logitech MX Master 3', category: 'Accessoires', 
    stock: 5, warehouseStock: { 'w1': 2, 'w2': 3, 'w3': 0 },
    price: 380.000, cost: 250.000, status: 'low_stock', marginPercent: 34.2
  },
  { 
    id: 'p5', sku: 'SERV-DELL-T40', name: 'Serveur Dell PowerEdge T40', category: 'Serveurs', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 2800.000, cost: 2100.000, status: 'out_of_stock', marginPercent: 25.0
  },
  {
    id: 'p6', sku: 'OFF-CHR-001', name: 'Chaise Ergonomique Pro', category: 'Mobilier',
    stock: 120, warehouseStock: { 'w1': 100, 'w2': 10, 'w3': 10 },
    price: 450.000, cost: 200.000, status: 'in_stock', marginPercent: 55.5
  },
  {
    id: 'p7', sku: 'NET-RTR-CIS', name: 'Routeur Cisco ISR 1100', category: 'Réseau',
    stock: 12, warehouseStock: { 'w1': 12, 'w2': 0, 'w3': 0 },
    price: 1800.000, cost: 1200.000, status: 'in_stock', marginPercent: 33.3
  },
  {
    id: 'p8', sku: 'SOFT-WIN-11', name: 'Windows 11 Pro (Licence)', category: 'Logiciel',
    stock: 500, warehouseStock: { 'w1': 500 },
    price: 450.000, cost: 280.000, status: 'in_stock', marginPercent: 37.7
  }
];

export const mockClients: Client[] = [
  { id: 'c1', company: 'TechSolutions SARL', name: 'Ahmed Ben Ali', email: 'ahmed@techsolutions.tn', phone: '20 123 456', status: 'active', category: 'Corporate', totalSpent: 45000.000, region: 'Tunis' },
  { id: 'c2', company: 'Global Services', name: 'Sarah M.', email: 'sarah@global.com', phone: '55 987 654', status: 'active', category: 'Retail', totalSpent: 8500.000, region: 'Sousse' },
  { id: 'c3', company: 'StartUp Hub', name: 'Mehdi K.', email: 'mehdi@hub.tn', phone: '98 111 222', status: 'inactive', category: 'Wholesale', totalSpent: 0, region: 'Sfax' },
  { id: 'c4', company: 'Banque Zitouna', name: 'Service Achat', email: 'achat@zitouna.com', phone: '71 000 000', status: 'active', category: 'Corporate', totalSpent: 120000.000, region: 'Tunis' },
  { id: 'c5', company: 'Clinique Espoir', name: 'Dr. F. Tounsi', email: 'ftounsi@espoir.tn', phone: '22 333 444', status: 'active', category: 'Corporate', totalSpent: 15400.000, region: 'Ariana' }
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MegaDistro', contactName: 'Jean Dupont', email: 'sales@megadistro.com', phone: '+33 1 23 45 67 89', category: 'Hardware', status: 'active', totalPurchased: 150000.000 },
  { id: 's2', company: 'Tunisie Cables', contactName: 'Mounir S.', email: 'mounir@tcables.tn', phone: '71 999 888', category: 'Cablage', status: 'active', totalPurchased: 25000.000 },
  { id: 's3', company: 'Office World', contactName: 'Alice Smith', email: 'alice@officeworld.com', phone: '+44 20 7123 4567', category: 'Mobilier', status: 'active', totalPurchased: 45000.000 },
  { id: 's4', company: 'SoftCorp', contactName: 'Bill Gates', email: 'bill@softcorp.com', phone: '+1 555 0199', category: 'Logiciel', status: 'active', totalPurchased: 8000.000 }
];

// Generate invoices across months for chart data
export const mockInvoices: Invoice[] = [
  // Jan
  { 
    id: 'inv1', number: 'FAC-24-001', type: 'invoice', clientId: 'c1', clientName: 'TechSolutions SARL', 
    date: `${currentYear}-01-15`, dueDate: `${currentYear}-02-15`, amount: 12500.000, status: 'paid', 
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 3, price: 3200 }, { id: 'p2', description: 'Ecran Dell', quantity: 2, price: 1450 } ],
    warehouseId: 'w1', subtotal: 12500, taxRate: 19
  },
  // Feb
  { 
    id: 'inv2', number: 'FAC-24-002', type: 'invoice', clientId: 'c4', clientName: 'Banque Zitouna', 
    date: `${currentYear}-02-10`, dueDate: `${currentYear}-03-10`, amount: 45000.000, status: 'paid',
    items: [ { id: 'p7', description: 'Routeur Cisco', quantity: 10, price: 1800 }, { id: 'p8', description: 'Win 11 Lic', quantity: 60, price: 450 } ],
    warehouseId: 'w1', subtotal: 45000, taxRate: 19
  },
  // Mar
  { 
    id: 'inv3', number: 'FAC-24-003', type: 'invoice', clientId: 'c2', clientName: 'Global Services', 
    date: `${currentYear}-03-05`, dueDate: `${currentYear}-03-20`, amount: 3250.000, status: 'paid',
    items: [ { id: 'p3', description: 'Imprimante Epson', quantity: 5, price: 650 } ],
    warehouseId: 'w2', subtotal: 3250, taxRate: 19
  },
  // Apr
  { 
    id: 'inv4', number: 'FAC-24-004', type: 'invoice', clientId: 'c1', clientName: 'TechSolutions SARL', 
    date: `${currentYear}-04-12`, dueDate: `${currentYear}-05-12`, amount: 8900.000, status: 'pending',
    items: [ { id: 'p6', description: 'Chaise Pro', quantity: 10, price: 450 }, { id: 'p2', description: 'Ecran Dell', quantity: 3, price: 1450 } ],
    warehouseId: 'w1', subtotal: 8900, taxRate: 19
  },
  // May (Current)
  { 
    id: 'inv5', number: 'FAC-24-005', type: 'invoice', clientId: 'c5', clientName: 'Clinique Espoir', 
    date: `${currentYear}-05-02`, dueDate: `${currentYear}-05-30`, amount: 15400.000, status: 'paid',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 4, price: 3200 }, { id: 'p4', description: 'Souris MX', quantity: 4, price: 380 } ],
    warehouseId: 'w1', subtotal: 15400, taxRate: 19
  },
  { 
    id: 'est1', number: 'DEV-24-001', type: 'estimate', clientId: 'c3', clientName: 'StartUp Hub', 
    date: `${currentYear}-05-10`, dueDate: `${currentYear}-05-25`, amount: 28000.000, status: 'draft',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 10, price: 2800 } ],
    warehouseId: 'w1'
  },
  { 
    id: 'ord1', number: 'CMD-24-001', type: 'order', clientId: 'c2', clientName: 'Global Services', 
    date: `${currentYear}-05-12`, amount: 4500.000, status: 'pending',
    items: [ { id: 'p6', description: 'Chaise Pro', quantity: 10, price: 450 } ],
    warehouseId: 'w2'
  },
  { 
    id: 'del1', number: 'BL-24-001', type: 'delivery', clientId: 'c4', clientName: 'Banque Zitouna', 
    date: `${currentYear}-05-01`, amount: 0, status: 'completed',
    items: [ { id: 'p7', description: 'Routeur Cisco', quantity: 10, price: 0 } ],
    warehouseId: 'w1', linkedDocumentId: 'inv2'
  }
];

export const mockPurchases: Purchase[] = [
  // Jan
  {
    id: 'po1', number: 'ACH-24-001', type: 'invoice', supplierId: 's1', supplierName: 'MegaDistro',
    date: `${currentYear}-01-05`, amount: 50000.000, status: 'completed',
    items: [{ id: 'p1', description: 'HP EliteBook', quantity: 20, price: 2400 }],
    warehouseId: 'w1', subtotal: 48000, taxRate: 19
  },
  // Feb
  {
    id: 'po2', number: 'ACH-24-002', type: 'invoice', supplierId: 's3', supplierName: 'Office World',
    date: `${currentYear}-02-02`, amount: 15000.000, status: 'completed',
    items: [{ id: 'p6', description: 'Chaise Ergonomique', quantity: 75, price: 200 }],
    warehouseId: 'w1', subtotal: 15000
  },
  // Mar
  {
    id: 'po3', number: 'ACH-24-003', type: 'invoice', supplierId: 's1', supplierName: 'MegaDistro',
    date: `${currentYear}-03-15`, amount: 8000.000, status: 'completed',
    items: [{ id: 'p2', description: 'Ecrans', quantity: 8, price: 980 }],
    warehouseId: 'w1', subtotal: 7840
  },
  // Apr
  {
    id: 'po4', number: 'ACH-24-004', type: 'invoice', supplierId: 's4', supplierName: 'SoftCorp',
    date: `${currentYear}-04-10`, amount: 2800.000, status: 'completed',
    items: [{ id: 'p8', description: 'Windows Lic', quantity: 10, price: 280 }],
    warehouseId: 'w1', subtotal: 2800
  },
  // May
  {
    id: 'po5', number: 'CMD-F-24-01', type: 'order', supplierId: 's1', supplierName: 'MegaDistro',
    date: `${currentYear}-05-12`, amount: 12000.000, status: 'pending',
    items: [{ id: 'p5', description: 'Serveur Dell', quantity: 5, price: 2100 }],
    warehouseId: 'w1'
  },
  // RFQs
  {
    id: 'rfq1', number: 'DC-24-001', type: 'rfq', supplierId: 's1', supplierName: 'MegaDistro',
    date: `${currentYear}-05-20`, deadline: `${currentYear}-05-25`, amount: 0, status: 'sent',
    items: [{ id: 'p1', description: 'HP EliteBook 840 G8', quantity: 10, price: 0 }],
    warehouseId: 'w1'
  },
  {
    id: 'rfq2', number: 'DC-24-002', type: 'rfq', supplierId: 's3', supplierName: 'Office World',
    date: `${currentYear}-05-21`, deadline: `${currentYear}-05-28`, amount: 0, status: 'responded',
    items: [{ id: 'p6', description: 'Chaise Ergonomique Pro', quantity: 50, price: 195.000 }],
    warehouseId: 'w1', subtotal: 9750
  },
  // Internal Purchase Requests
  {
    id: 'pr1', number: 'DA-24-001', type: 'pr', supplierId: '', supplierName: '',
    requesterName: 'Sami IT', department: 'Information Technology',
    date: `${currentYear}-05-28`, amount: 0, status: 'pending',
    items: [
        { id: 'p5', description: 'Serveur Dell PowerEdge T40', quantity: 1, price: 0 },
        { id: 'p2', description: 'Ecran Dell 27" 4K', quantity: 2, price: 0 }
    ],
    warehouseId: 'w1'
  }
];

// ... existing code for stock movements, bank accounts, transactions etc.
export const mockStockMovements: StockMovement[] = [
  { 
    id: 'sm1', productId: 'p1', productName: 'HP EliteBook 840 G8', warehouseId: 'w1', warehouseName: 'Dépôt Principal',
    date: `${currentYear}-01-01T08:00:00`, quantity: 10, type: 'initial', reference: 'INIT', notes: 'Stock initial', unitCost: 2400, costBefore: 0, costAfter: 2400
  },
  { 
    id: 'sm2', productId: 'p1', productName: 'HP EliteBook 840 G8', warehouseId: 'w1', warehouseName: 'Dépôt Principal',
    date: `${currentYear}-01-05T10:00:00`, quantity: 20, type: 'purchase', reference: 'ACH-24-001', notes: 'Achat MegaDistro', unitCost: 2400, costBefore: 2400, costAfter: 2400
  },
  { 
    id: 'sm3', productId: 'p1', productName: 'HP EliteBook 840 G8', warehouseId: 'w1', warehouseName: 'Dépôt Principal',
    date: `${currentYear}-01-15T14:30:00`, quantity: -3, type: 'sale', reference: 'FAC-24-001', notes: 'Vente TechSolutions', unitCost: 2400, costBefore: 2400, costAfter: 2400
  }
];

export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Compte Courant Principal', bankName: 'BIAT', accountNumber: '12345678901234567890', currency: 'TND', type: 'checking', balance: 125400.000 },
  { id: 'ba2', name: 'Compte Epargne', bankName: 'Amen Bank', accountNumber: '09876543210987654321', currency: 'TND', type: 'savings', balance: 45000.000 },
  { id: 'ba3', name: 'Devise EUR', bankName: 'STB', accountNumber: 'FR763000...', currency: 'EUR', type: 'checking', balance: 12500.00 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: `${currentYear}-05-02`, description: 'Virement Client Clinique Espoir', amount: 15400.000, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: `${currentYear}-05-01`, description: 'Loyer Bureau Mai', amount: -2500.000, type: 'payment', status: 'cleared' },
  { id: 'tx3', accountId: 'ba1', date: `${currentYear}-04-28`, description: 'Paiement STEG', amount: -450.000, type: 'payment', status: 'reconciled' },
  { id: 'tx4', accountId: 'ba1', date: `${currentYear}-04-25`, description: 'Virement MegaDistro', amount: -15000.000, type: 'payment', status: 'reconciled' }
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Alex Morgan', startTime: `${currentYear}-05-14T08:00:00`, openingBalance: 250.000, expectedBalance: 680.000, status: 'open' },
  { id: 'cs2', openedBy: 'Alex Morgan', startTime: `${currentYear}-05-13T08:00:00`, endTime: `${currentYear}-05-13T18:00:00`, openingBalance: 200.000, closingBalance: 1450.000, expectedBalance: 1450.000, status: 'closed' },
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ctx1', sessionId: 'cs1', date: `${currentYear}-05-14T10:30:00`, type: 'sale', amount: 450.000, description: 'Vente Comptoir #882' },
  { id: 'ctx2', sessionId: 'cs1', date: `${currentYear}-05-14T12:15:00`, type: 'expense', amount: -20.000, description: 'Fournitures bureau' },
];

export const mockStockTransfers: StockTransfer[] = [];

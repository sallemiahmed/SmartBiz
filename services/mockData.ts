
import { Client, DashboardStats, Invoice, Product, Supplier, Purchase, BankAccount, BankTransaction, CashSession, CashTransaction, Warehouse, StockTransfer, StockMovement } from '../types';

// Helper to get a date string relative to today
const getDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Mock Warehouses
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Dépôt Tunis', location: 'ZI Charguia 1', isDefault: true },
  { id: 'w2', name: 'Dépôt Sfax', location: 'Route de Gabès' },
  { id: 'w3', name: 'Showroom Lac 2', location: 'Les Berges du Lac 2' }
];

// Mock Stock Transfers
export const mockStockTransfers: StockTransfer[] = [
  { id: 'tr1', date: getDate(-5), productId: 'p1', productName: 'Chaise de Bureau Ergonomique', fromWarehouseId: 'w1', toWarehouseId: 'w3', quantity: 5, notes: 'Réapprovisionnement Showroom' }
];

// Mock Stock Movements (Traceability)
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'Chaise de Bureau Ergonomique', warehouseId: 'w1', warehouseName: 'Dépôt Tunis', date: getDate(-30), quantity: 50, type: 'initial', reference: 'INIT', notes: 'Stock Initial' },
  { id: 'sm2', productId: 'p1', productName: 'Chaise de Bureau Ergonomique', warehouseId: 'w1', warehouseName: 'Dépôt Tunis', date: getDate(-20), quantity: -2, type: 'sale', reference: 'F-2024-1001', notes: 'Facture Vente' },
  { id: 'sm3', productId: 'p1', productName: 'Chaise de Bureau Ergonomique', warehouseId: 'w1', warehouseName: 'Dépôt Tunis', date: getDate(-5), quantity: -5, type: 'transfer_out', reference: 'TR-001', notes: 'Transfert vers Showroom' },
  { id: 'sm4', productId: 'p1', productName: 'Chaise de Bureau Ergonomique', warehouseId: 'w3', warehouseName: 'Showroom Lac 2', date: getDate(-5), quantity: 5, type: 'transfer_in', reference: 'TR-001', notes: 'Transfert depuis Tunis' },
];

// Mock Clients
export const mockClients: Client[] = [
  { id: '1', name: 'Tunisie Télécom', email: 'achat@tunisietelecom.tn', phone: '+216 71 000 000', company: 'Tunisie Télécom', status: 'active', category: 'Corporate', region: 'Tunis', totalSpent: 45200.500, customFields: { matricule_fiscale: '123456/A/M/000' } },
  { id: '2', name: 'Monoprix', email: 'appro@monoprix.tn', phone: '+216 71 111 222', company: 'Société Nouvelle Maison de la Ville', status: 'active', category: 'Retail', region: 'Grand Tunis', totalSpent: 18500.000, customFields: { matricule_fiscale: '987654/B/A/000' } },
  { id: '3', name: 'SOTETEL', email: 'contact@sotetel.tn', phone: '+216 71 333 444', company: 'SOTETEL', status: 'active', category: 'Corporate', region: 'Ariana', totalSpent: 8900.250, customFields: { matricule_fiscale: '456789/C/P/000' } },
  { id: '4', name: 'Pharmacie Centrale', email: 'achat@pharma-centrale.tn', phone: '+216 71 555 666', company: 'PCT', status: 'active', category: 'Government', region: 'Ben Arous', totalSpent: 125000.000, customFields: { matricule_fiscale: '112233/D/N/000' } },
  { id: '5', name: 'Poulina Group', email: 'info@poulina.com', phone: '+216 79 777 888', company: 'Poulina Group Holding', status: 'active', category: 'Corporate', region: 'Ezzahra', totalSpent: 250000.750, customFields: { matricule_fiscale: '998877/E/P/000' } },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MyTek', contactName: 'Service Commercial', email: 'commercial@mytek.tn', phone: '+216 36 010 010', category: 'Informatique', status: 'active', totalPurchased: 54000.000 },
  { id: 's2', company: 'Meublatex', contactName: 'Ahmed Meuble', email: 'pro@meublatex.tn', phone: '+216 73 111 111', category: 'Mobilier', status: 'active', totalPurchased: 12500.000 },
  { id: 's3', company: 'SOTUVER', contactName: 'Hassan Verre', email: 'sales@sotuver.com.tn', phone: '+216 72 222 222', category: 'Matières Premières', status: 'active', totalPurchased: 89000.000 },
  { id: 's4', company: 'Aramex Tunisie', contactName: 'Logistique', email: 'tunis@aramex.com', phone: '+216 71 123 123', category: 'Logistique', status: 'active', totalPurchased: 3400.500 },
  { id: 's5', company: 'STEG', contactName: 'Service Facturation', email: 'facture@steg.com.tn', phone: '+216 71 888 888', category: 'Utilitaires', status: 'active', totalPurchased: 7600.000 },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  { id: '101', number: 'F-2024-001', type: 'invoice', clientId: '1', clientName: 'Tunisie Télécom', salespersonName: 'Ali Ben Salah', date: getDate(-60), dueDate: getDate(-45), amount: 3500.000, status: 'paid', items: [{id: 'p1', description: 'Chaise Bureau', quantity: 15, price: 199.000}, {id: 'p4', description: 'Câbles Réseau', quantity: 50, price: 10.000}], warehouseId: 'w1', fiscalStamp: 1.000, taxRate: 19 },
  { id: '102', number: 'F-2024-002', type: 'invoice', clientId: '5', clientName: 'Poulina Group', salespersonName: 'Sarra Jlassi', date: getDate(-45), dueDate: getDate(-30), amount: 12500.000, status: 'paid', items: [{id: 'p3', description: 'Ecran 27"', quantity: 20, price: 450.000}], warehouseId: 'w1', fiscalStamp: 1.000, taxRate: 19 },
  { id: '103', number: 'F-2024-003', type: 'invoice', clientId: '2', clientName: 'Société Nouvelle Maison de la Ville', salespersonName: 'Ali Ben Salah', date: getDate(-30), dueDate: getDate(-15), amount: 4200.000, status: 'paid', items: [{id: 'p2', description: 'Clavier Sans Fil', quantity: 50, price: 59.900}], warehouseId: 'w2', fiscalStamp: 1.000, taxRate: 19 },
  { id: '104', number: 'F-2024-004', type: 'invoice', clientId: '4', clientName: 'PCT', salespersonName: 'Mourad Tounsi', date: getDate(-10), dueDate: getDate(5), amount: 8900.000, status: 'pending', items: [{id: 'p1', description: 'Chaise Bureau', quantity: 40, price: 199.000}], warehouseId: 'w1', fiscalStamp: 1.000, taxRate: 19 },
  { id: '105', number: 'F-2024-005', type: 'invoice', clientId: '1', clientName: 'Tunisie Télécom', salespersonName: 'Ali Ben Salah', date: getDate(-2), dueDate: getDate(14), amount: 1200.000, status: 'pending', items: [{id: 'p4', description: 'Câble USB-C', quantity: 60, price: 19.900}], warehouseId: 'w1', fiscalStamp: 1.000, taxRate: 19 },
  { id: '106', number: 'F-2024-006', type: 'invoice', clientId: '5', clientName: 'Poulina Group', salespersonName: 'Sarra Jlassi', date: getDate(-5), dueDate: getDate(10), amount: 15000.000, status: 'paid', items: [{id: 'p3', description: 'Ecran 27"', quantity: 30, price: 450.000}], warehouseId: 'w1', fiscalStamp: 1.000, taxRate: 19 },
  { id: '201', number: 'BC-2024-001', type: 'order', clientId: '1', clientName: 'Tunisie Télécom', salespersonName: 'Ali Ben Salah', date: getDate(-1), dueDate: getDate(14), amount: 3200.000, status: 'pending', items: [], warehouseId: 'w1', taxRate: 19 },
  { id: '301', number: 'D-2024-001', type: 'estimate', clientId: '2', clientName: 'Monoprix', salespersonName: 'Ali Ben Salah', date: getDate(0), dueDate: getDate(30), amount: 5000.000, status: 'draft', items: [], warehouseId: 'w1', taxRate: 19 },
  { id: '401', number: 'BL-2024-001', type: 'delivery', clientId: '5', clientName: 'Poulina Group', salespersonName: 'Sarra Jlassi', date: getDate(-20), dueDate: getDate(-20), amount: 2200.000, status: 'completed', items: [], warehouseId: 'w1' },
];

// Mock Purchases
export const mockPurchases: Purchase[] = [
  { id: 'p101', number: 'BCF-2024-001', type: 'order', supplierId: 's1', supplierName: 'MyTek', date: getDate(-10), amount: 4500.000, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p102', number: 'BCF-2024-002', type: 'order', supplierId: 's3', supplierName: 'SOTUVER', date: getDate(-5), amount: 12000.000, status: 'pending', items: [], warehouseId: 'w1' },
  { id: 'p201', number: 'BR-2024-001', type: 'delivery', supplierId: 's1', supplierName: 'MyTek', date: getDate(-15), amount: 4500.000, status: 'received', items: [], warehouseId: 'w1' },
  { id: 'p301', number: 'FF-2024-001', type: 'invoice', supplierId: 's2', supplierName: 'Meublatex', date: getDate(-40), amount: 1500.000, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p302', number: 'FF-2024-002', type: 'invoice', supplierId: 's5', supplierName: 'STEG', date: getDate(-25), amount: 850.000, status: 'completed', items: [], warehouseId: 'w1' },
  { id: 'p303', number: 'FF-2024-003', type: 'invoice', supplierId: 's3', supplierName: 'SOTUVER', date: getDate(-5), amount: 6500.000, status: 'pending', items: [], warehouseId: 'w1' }
];

export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'CHA-001', name: 'Chaise de Bureau Ergonomique', category: 'Mobilier', 
    stock: 45, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 5 },
    price: 289.000, cost: 150.000, status: 'in_stock' 
  },
  { 
    id: 'p2', sku: 'TEC-002', name: 'Clavier Sans Fil Logitech', category: 'Informatique', 
    stock: 12, warehouseStock: { 'w1': 5, 'w2': 5, 'w3': 2 },
    price: 89.000, cost: 45.000, status: 'low_stock' 
  },
  { 
    id: 'p3', sku: 'TEC-003', name: 'Ecran Dell 27" 4K', category: 'Informatique', 
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 1250.000, cost: 980.000, status: 'low_stock' 
  },
  { 
    id: 'p4', sku: 'ACC-004', name: 'Câble HDMI 2m', category: 'Accessoires', 
    stock: 200, warehouseStock: { 'w1': 100, 'w2': 50, 'w3': 50 },
    price: 25.000, cost: 8.500, status: 'in_stock' 
  },
  { 
    id: 'p5', sku: 'ACC-005', name: 'Support PC Portable', category: 'Accessoires', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 75.000, cost: 35.000, status: 'out_of_stock' 
  },
];

// --- Banking Mock Data ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'b1', name: 'Compte Courant Principal', bankName: 'BIAT', accountNumber: '08 000 123456789 11', balance: 24500.000, currency: 'TND', type: 'checking' },
  { id: 'b2', name: 'Compte Épargne', bankName: 'Amen Bank', accountNumber: '07 111 987654321 22', balance: 8000.000, currency: 'TND', type: 'savings' },
  { id: 'b3', name: 'Carte Affaires', bankName: 'Attijari', accountNumber: '04 222 555555555 33', balance: -1250.000, currency: 'TND', type: 'credit' }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 't1', accountId: 'b1', date: getDate(0), description: 'Virement Client - Tunisie Télécom', amount: 3500.000, type: 'deposit', status: 'cleared', reference: 'F-2024-001' },
  { id: 't2', accountId: 'b1', date: getDate(-1), description: 'Abonnement Internet', amount: -89.000, type: 'payment', status: 'cleared' },
  { id: 't3', accountId: 'b1', date: getDate(-2), description: 'Virement vers Epargne', amount: -2000.000, type: 'transfer', status: 'cleared' },
  { id: 't4', accountId: 'b2', date: getDate(-2), description: 'Virement depuis Courant', amount: 2000.000, type: 'transfer', status: 'cleared' },
  { id: 't5', accountId: 'b3', date: getDate(-5), description: 'Déjeuner Client', amount: -125.500, type: 'payment', status: 'pending' },
];

// --- Cash Register Mock Data ---
export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Ali Ben Salah', startTime: getDate(-1) + 'T08:00:00', endTime: getDate(-1) + 'T17:00:00', openingBalance: 200.000, closingBalance: 1250.000, expectedBalance: 1255.000, status: 'closed', notes: 'Manque 5 TND' }
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ct1', sessionId: 'cs1', date: getDate(-1) + 'T09:30:00', type: 'sale', amount: 45.000, description: 'Vente Comptoir' },
  { id: 'ct2', sessionId: 'cs1', date: getDate(-1) + 'T11:00:00', type: 'expense', amount: -15.000, description: 'Café & Eau' },
];

export const mockStats: DashboardStats = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  pendingInvoices: 0,
};

export const chartData = [];


import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  BankAccount, BankTransaction, CashSession, CashTransaction, Technician, 
  ServiceItem, ServiceJob, ServiceSale 
} from '../types';

// --- CLIENTS ---
export const mockClients: Client[] = [
  { id: 'c1', company: 'Tunisie Telecom', name: 'Mohamed Ali Ben Salem', email: 'mohamed.bs@tunisietelecom.tn', phone: '+216 71 000 000', status: 'active', category: 'Corporate', totalSpent: 45000.00, region: 'Tunis', address: 'Jardins du Lac 2, 1053 Tunis', taxId: '1234567/A/M/000' },
  { id: 'c2', company: 'Clinique Internationale', name: 'Dr. Sarah Mzali', email: 'achat@clinique-inter.tn', phone: '+216 71 111 222', status: 'active', category: 'Santé', totalSpent: 8500.00, region: 'Ariana', address: 'Avenue UMA, La Soukra', taxId: '9876543/B/P/000' },
  { id: 'c3', company: 'StartUp Factory', name: 'Mehdi Jemaa', email: 'mehdi@startupfactory.tn', phone: '+216 55 123 456', status: 'inactive', category: 'Tech', totalSpent: 0, region: 'Sousse', address: 'Technopole Sousse', taxId: '4567890/D/N/000' },
  { id: 'c4', company: 'Banque de l\'Habitat', name: 'Direction Achat', email: 'achats@bh.tn', phone: '+216 71 333 444', status: 'active', category: 'Finance', totalSpent: 120000.00, region: 'Tunis', address: 'Avenue Mohamed V, Tunis', taxId: '1122334/K/A/000' },
  { id: 'c5', company: 'Groupe Délice', name: 'Fethi Tounsi', email: 'f.tounsi@delice.tn', phone: '+216 71 555 666', status: 'active', category: 'Industrie', totalSpent: 15400.00, region: 'Ben Arous', address: 'Zone Industrielle Soliman', taxId: '5544332/L/P/000' },
  { id: 'c6', company: 'Design & Co', name: 'Leila Ben Amor', email: 'leila@designco.tn', phone: '+216 22 999 888', status: 'active', category: 'Retail', totalSpent: 2200.00, region: 'Marsa', address: 'Rue Imam Moslim, La Marsa', taxId: '9988776/S/C/000' },
  { id: 'c7', company: 'Sahar Construction', name: 'Ahmed Trabelsi', email: 'ahmed@saharconst.tn', phone: '+216 98 777 666', status: 'active', category: 'BTP', totalSpent: 35000.00, region: 'Sfax', address: 'Route de Gremda Km 4, Sfax', taxId: '2233445/F/M/000' }
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'Office Depot', contactName: 'John Doe', email: 'sales@officedepot.com', phone: '123-456-7890', category: 'Office Supplies', status: 'active', totalPurchased: 5000, address: '123 Office St' },
];

export const mockInventory: Product[] = [
  { id: 'p1', name: 'Laptop Pro X1', sku: 'LPX1', category: 'Electronics', price: 1200, cost: 900, stock: 15, warehouseStock: {'w1': 10, 'w2': 5}, status: 'in_stock', marginPercent: 25 },
];

export const mockInvoices: Invoice[] = [
  { 
    id: 'i1', number: 'INV-001', type: 'invoice', items: [{ id: 'p1', description: 'Laptop Pro X1', quantity: 1, price: 1200 }], 
    clientId: 'c1', clientName: 'Tunisie Telecom', date: '2023-10-25', amount: 1200, status: 'paid', currency: 'TND', warehouseId: 'w1' 
  },
];

export const mockPurchases: Purchase[] = [];
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', location: 'Tunis', isDefault: true },
  { id: 'w2', name: 'Sousse Branch', location: 'Sousse' },
];
export const mockStockMovements: StockMovement[] = [];
export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Main Business Account', bankName: 'BIAT', accountNumber: '123456789', currency: 'TND', balance: 50000, type: 'checking' }
];
export const mockBankTransactions: BankTransaction[] = [];
export const mockCashSessions: CashSession[] = [];
export const mockCashTransactions: CashTransaction[] = [];
export const mockTechnicians: Technician[] = [
  { id: 't1', name: 'Ali Tech', specialty: 'General Repair', status: 'available', phone: '22222222' }
];
export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'PC Formatting', description: 'Format and reinstall OS', basePrice: 50, durationMinutes: 60 }
];
export const mockServiceJobs: ServiceJob[] = [];
export const mockServiceSales: ServiceSale[] = [];

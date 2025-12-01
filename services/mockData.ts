
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
  { id: 'w1', name: 'Dépôt Principal', location: 'Zone Industrielle Charguia', isDefault: true },
  { id: 'w2', name: 'Showroom Centre Urbain', location: 'Centre Urbain Nord' },
  { id: 'w3', name: 'Dépôt Sfax', location: 'Route de Tunis, Sfax' },
];

// --- INVENTORY ---
export const mockInventory: Product[] = [
  { 
    id: 'p1', sku: 'LAP-HP-001', name: 'HP EliteBook 840 G8', category: 'Ordinateurs', 
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=200',
    stock: 25, warehouseStock: { 'w1': 15, 'w2': 5, 'w3': 5 },
    price: 3200.00, cost: 2500.00, status: 'in_stock', marginPercent: 21.8
  },
  { 
    id: 'p2', sku: 'MON-DELL-27', name: 'Ecran Dell 27" 4K', category: 'Périphériques', 
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200',
    stock: 8, warehouseStock: { 'w1': 8, 'w2': 0, 'w3': 0 },
    price: 950.00, cost: 700.00, status: 'low_stock', marginPercent: 26.3
  },
  { 
    id: 'p3', sku: 'PRN-EPS-L3150', name: 'Epson EcoTank L3150', category: 'Imprimantes', 
    stock: 40, warehouseStock: { 'w1': 30, 'w2': 10, 'w3': 0 },
    price: 650.00, cost: 480.00, status: 'in_stock', marginPercent: 26.1
  },
  { 
    id: 'p4', sku: 'ACC-MSE-LOG', name: 'Souris Logitech MX Master', category: 'Accessoires', 
    stock: 5, warehouseStock: { 'w1': 2, 'w2': 3, 'w3': 0 },
    price: 350.00, cost: 220.00, status: 'low_stock', marginPercent: 37.1
  },
  { 
    id: 'p5', sku: 'SERV-DELL-T40', name: 'Serveur Dell PowerEdge', category: 'Serveurs', 
    stock: 0, warehouseStock: { 'w1': 0, 'w2': 0, 'w3': 0 },
    price: 4500.00, cost: 3800.00, status: 'out_of_stock', marginPercent: 15.5
  },
  {
    id: 'p6', sku: 'OFF-CHR-001', name: 'Chaise Bureau Ergonomique', category: 'Mobilier',
    stock: 120, warehouseStock: { 'w1': 100, 'w2': 10, 'w3': 10 },
    price: 450.00, cost: 250.00, status: 'in_stock', marginPercent: 44.4
  },
  {
    id: 'p7', sku: 'NET-RTR-CIS', name: 'Routeur Cisco ISR 1100', category: 'Réseau',
    stock: 12, warehouseStock: { 'w1': 12, 'w2': 0, 'w3': 0 },
    price: 1800.00, cost: 1300.00, status: 'in_stock', marginPercent: 27.7
  },
  {
    id: 'p8', sku: 'SOFT-WIN-11', name: 'Licence Windows 11 Pro', category: 'Logiciel',
    stock: 500, warehouseStock: { 'w1': 500 },
    price: 450.00, cost: 300.00, status: 'in_stock', marginPercent: 33.3
  },
  {
    id: 'p9', sku: 'ACC-KB-MECH', name: 'Clavier Mécanique RGB', category: 'Accessoires',
    stock: 15, warehouseStock: { 'w1': 10, 'w2': 5 },
    price: 280.00, cost: 150.00, status: 'in_stock', marginPercent: 46.4
  },
  {
    id: 'p10', sku: 'TAB-IPAD-AIR', name: 'iPad Air 5th Gen', category: 'Tablettes',
    stock: 3, warehouseStock: { 'w2': 3 },
    price: 2200.00, cost: 1800.00, status: 'low_stock', marginPercent: 18.1
  }
];

// --- CLIENTS ---
export const mockClients: Client[] = [
  { id: 'c1', company: 'Tunisie Telecom', name: 'Mohamed Ali Ben Salem', email: 'mohamed.bs@tunisietelecom.tn', phone: '+216 71 000 000', status: 'active', category: 'Corporate', totalSpent: 45000.00, region: 'Tunis', taxId: '1234567/A/M/000' },
  { id: 'c2', company: 'Clinique Internationale', name: 'Dr. Sarah Mzali', email: 'achat@clinique-inter.tn', phone: '+216 71 111 222', status: 'active', category: 'Santé', totalSpent: 8500.00, region: 'Ariana', taxId: '9876543/B/P/000' },
  { id: 'c3', company: 'StartUp Factory', name: 'Mehdi Jemaa', email: 'mehdi@startupfactory.tn', phone: '+216 55 123 456', status: 'inactive', category: 'Tech', totalSpent: 0, region: 'Sousse', taxId: '4567890/D/N/000' },
  { id: 'c4', company: 'Banque de l\'Habitat', name: 'Direction Achat', email: 'achats@bh.tn', phone: '+216 71 333 444', status: 'active', category: 'Finance', totalSpent: 120000.00, region: 'Tunis', taxId: '1122334/K/A/000' },
  { id: 'c5', company: 'Groupe Délice', name: 'Fethi Tounsi', email: 'f.tounsi@delice.tn', phone: '+216 71 555 666', status: 'active', category: 'Industrie', totalSpent: 15400.00, region: 'Ben Arous' },
  { id: 'c6', company: 'Design & Co', name: 'Leila Ben Amor', email: 'leila@designco.tn', phone: '+216 22 999 888', status: 'active', category: 'Retail', totalSpent: 2200.00, region: 'Marsa' },
  { id: 'c7', company: 'Sahar Construction', name: 'Ahmed Trabelsi', email: 'ahmed@saharconst.tn', phone: '+216 98 777 666', status: 'active', category: 'BTP', totalSpent: 35000.00, region: 'Sfax' }
];

// --- SUPPLIERS ---
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MyTek Informatique', contactName: 'Service Pro', email: 'pro@mytek.tn', phone: '+216 36 010 010', category: 'Matériel Info', status: 'active', totalPurchased: 150000.00 },
  { id: 's2', company: 'Tunisianet', contactName: 'Amine S.', email: 'commercial@tunisianet.com.tn', phone: '+216 31 320 320', category: 'Électronique', status: 'active', totalPurchased: 25000.00 },
  { id: 's3', company: 'Meublatex', contactName: 'Sihem K.', email: 'contact@meublatex.tn', phone: '+216 73 100 100', category: 'Mobilier', status: 'active', totalPurchased: 45000.00 },
  { id: 's4', company: 'Sotupap', contactName: 'Mounir G.', email: 'vente@sotupap.tn', phone: '+216 71 888 999', category: 'Bureautique', status: 'active', totalPurchased: 8000.00 },
  { id: 's5', company: 'Auto Pièces Tunisie', contactName: 'Ridha', email: 'ridha@autopieces.tn', phone: '+216 20 202 020', category: 'Pièces Rechange', status: 'active', totalPurchased: 12000.00 }
];

// --- INVOICES (SALES) ---
export const mockInvoices: Invoice[] = [
  // Paid Invoices (Past)
  { 
    id: 'inv1', number: 'FAC-2024-001', type: 'invoice', clientId: 'c1', clientName: 'Tunisie Telecom', 
    date: getDate(-30), dueDate: getDate(-15), amount: 12500.00, status: 'paid', 
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 3, price: 3200 }, { id: 'p3', description: 'Imprimante Epson', quantity: 4, price: 725 } ],
    warehouseId: 'w1', subtotal: 12500, taxRate: 19
  },
  { 
    id: 'inv2', number: 'FAC-2024-002', type: 'invoice', clientId: 'c4', clientName: 'Banque de l\'Habitat', 
    date: getDate(-25), dueDate: getDate(-5), amount: 45000.00, status: 'paid',
    items: [ { id: 'p7', description: 'Routeur Cisco', quantity: 15, price: 1800 }, { id: 'p8', description: 'Licence Win 11', quantity: 40, price: 450 } ],
    warehouseId: 'w1', subtotal: 45000, taxRate: 19
  },
  { 
    id: 'inv3', number: 'FAC-2024-003', type: 'invoice', clientId: 'c2', clientName: 'Clinique Internationale', 
    date: getDate(-10), dueDate: getDate(5), amount: 3250.00, status: 'overdue',
    items: [ { id: 'p3', description: 'Imprimante Epson', quantity: 5, price: 650 } ],
    warehouseId: 'w2', subtotal: 3250, taxRate: 19
  },
  // Active Invoices
  { 
    id: 'inv4', number: 'FAC-2024-004', type: 'invoice', clientId: 'c1', clientName: 'Tunisie Telecom', 
    date: getDate(-2), dueDate: getDate(28), amount: 8900.00, status: 'pending',
    items: [ { id: 'p6', description: 'Chaise Bureau', quantity: 15, price: 450 }, { id: 'p2', description: 'Ecran Dell', quantity: 2, price: 1075 } ],
    warehouseId: 'w1', subtotal: 8900, taxRate: 19
  },
  { 
    id: 'inv5', number: 'FAC-2024-005', type: 'invoice', clientId: 'c5', clientName: 'Groupe Délice', 
    date: getDate(0), dueDate: getDate(30), amount: 15400.00, status: 'pending',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 4, price: 3200 }, { id: 'p4', description: 'Souris Logitech', quantity: 8, price: 325 } ],
    warehouseId: 'w1', subtotal: 15400, taxRate: 19
  },
  // Estimates
  { 
    id: 'est1', number: 'DEV-24-101', type: 'estimate', clientId: 'c3', clientName: 'StartUp Factory', 
    date: getDate(-1), dueDate: getDate(14), amount: 28000.00, status: 'draft',
    items: [ { id: 'p1', description: 'HP EliteBook', quantity: 8, price: 3200 }, { id: 'p2', description: 'Ecran', quantity: 6, price: 400 } ],
    warehouseId: 'w1', subtotal: 28000
  },
  { 
    id: 'est2', number: 'DEV-24-102', type: 'estimate', clientId: 'c7', clientName: 'Sahar Construction', 
    date: getDate(0), dueDate: getDate(7), amount: 5500.00, status: 'sent',
    items: [ { id: 'p3', description: 'Imprimantes', quantity: 5, price: 650 }, { id: 'p8', description: 'Logiciels', quantity: 5, price: 450 } ],
    warehouseId: 'w1', subtotal: 5500
  },
  // Orders
  { 
    id: 'ord1', number: 'BC-24-055', type: 'order', clientId: 'c2', clientName: 'Clinique Internationale', 
    date: getDate(-5), amount: 4500.00, status: 'pending',
    items: [ { id: 'p6', description: 'Chaise Bureau', quantity: 10, price: 450 } ],
    warehouseId: 'w2', subtotal: 4500
  },
  // Deliveries
  { 
    id: 'del1', number: 'BL-24-882', type: 'delivery', clientId: 'c4', clientName: 'Banque de l\'Habitat', 
    date: getDate(-20), amount: 0, status: 'completed',
    items: [ { id: 'p7', description: 'Routeur Cisco', quantity: 5, price: 0 } ],
    warehouseId: 'w1', linkedDocumentId: 'inv2', subtotal: 0
  }
];

// --- PURCHASES ---
export const mockPurchases: Purchase[] = [
  {
    id: 'po1', number: 'ACH-24-001', type: 'invoice', supplierId: 's1', supplierName: 'MyTek Informatique',
    date: getDate(-45), amount: 50000.00, status: 'completed',
    items: [{ id: 'p1', description: 'HP EliteBook', quantity: 15, price: 2500 }, { id: 'p2', description: 'Ecrans', quantity: 18, price: 700 }],
    warehouseId: 'w1', subtotal: 50000
  },
  {
    id: 'po2', number: 'ACH-24-002', type: 'invoice', supplierId: 's3', supplierName: 'Meublatex',
    date: getDate(-30), amount: 15000.00, status: 'completed',
    items: [{ id: 'p6', description: 'Chaise Ergonomique', quantity: 60, price: 250 }],
    warehouseId: 'w1', subtotal: 15000
  },
  {
    id: 'po3', number: 'CMD-24-003', type: 'order', supplierId: 's1', supplierName: 'MyTek Informatique',
    date: getDate(-2), amount: 12000.00, status: 'pending',
    items: [{ id: 'p5', description: 'Serveur Dell', quantity: 3, price: 4000 }],
    warehouseId: 'w1'
  },
  {
    id: 'rfq1', number: 'RFQ-24-010', type: 'rfq', supplierId: 's5', supplierName: 'Auto Pièces Tunisie',
    date: getDate(0), deadline: getDate(7), amount: 0, status: 'sent',
    items: [{ id: 'p1', description: 'Pièces Rechange', quantity: 50, price: 0 }],
    warehouseId: 'w1'
  },
  {
    id: 'pr1', number: 'DA-24-005', type: 'pr', supplierId: '', supplierName: '',
    requesterName: 'Service IT', department: 'Support Technique',
    date: getDate(-1), amount: 0, status: 'pending',
    items: [
        { id: 'p9', description: 'Claviers Mécaniques', quantity: 5, price: 0 }
    ],
    warehouseId: 'w1'
  }
];

// --- BANKING & CASH ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Compte Courant', bankName: 'BIAT', accountNumber: '08 000 12345 67890 12', currency: 'TND', type: 'checking', balance: 125400.50 },
  { id: 'ba2', name: 'Compte Épargne', bankName: 'Attijari Bank', accountNumber: '04 111 22233 44455 66', currency: 'TND', type: 'savings', balance: 45000.00 },
  { id: 'ba3', name: 'Compte Devise', bankName: 'STB', accountNumber: '10 999 88877 66655 44', currency: 'EUR', type: 'checking', balance: 12500.00 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: getDate(0), description: 'Virement Client - Tunisie Telecom', amount: 12500.00, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: getDate(-1), description: 'Loyer Bureau - Mai', amount: -2500.00, type: 'payment', status: 'cleared' },
  { id: 'tx3', accountId: 'ba1', date: getDate(-3), description: 'STEG - Facture Élec', amount: -450.00, type: 'payment', status: 'reconciled' },
  { id: 'tx4', accountId: 'ba1', date: getDate(-5), description: 'Paiement Fournisseur - MyTek', amount: -15000.00, type: 'payment', status: 'reconciled' },
  { id: 'tx5', accountId: 'ba2', date: getDate(-10), description: 'Intérêts', amount: 120.50, type: 'deposit', status: 'reconciled' }
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Amine Tounsi', startTime: getTimestamp(0, 8), openingBalance: 250.00, expectedBalance: 680.00, status: 'open' },
  { id: 'cs2', openedBy: 'Amine Tounsi', startTime: getTimestamp(-1, 8), endTime: getTimestamp(-1, 18), openingBalance: 200.00, closingBalance: 1450.00, expectedBalance: 1450.00, status: 'closed' },
];

export const mockCashTransactions: CashTransaction[] = [
  { id: 'ctx1', sessionId: 'cs1', date: getTimestamp(0, 10), type: 'sale', amount: 450.00, description: 'Vente Comptoir #882' },
  { id: 'ctx2', sessionId: 'cs1', date: getTimestamp(0, 12), type: 'expense', amount: -20.00, description: 'Fournitures Bureau' },
  { id: 'ctx3', sessionId: 'cs2', date: getTimestamp(-1, 14), type: 'sale', amount: 1200.00, description: 'Grande Vente Cash' },
];

// --- SERVICES ---
export const mockTechnicians: Technician[] = [
  { id: 'tech1', name: 'Sami Ben Amor', specialty: 'Réparation Matériel', status: 'available', phone: '+216 50 111 111' },
  { id: 'tech2', name: 'Leila Trabelsi', specialty: 'Logiciel & Réseau', status: 'busy', phone: '+216 52 222 222' },
  { id: 'tech3', name: 'Youssef Gharbi', specialty: 'Diagnostic Avancé', status: 'off_duty', phone: '+216 98 333 333' },
  { id: 'tech4', name: 'Mouna Jaziri', specialty: 'Support Client', status: 'available', phone: '+216 25 444 444' },
  { id: 'tech5', name: 'Karim Saidi', specialty: 'Maintenance Serveur', status: 'busy', phone: '+216 97 555 555' }
];

export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Diagnostic & Devis', description: 'Inspection initiale', basePrice: 45.00, durationMinutes: 30 },
  { id: 'srv2', name: 'Installation OS', description: 'Windows/Linux + Drivers', basePrice: 80.00, durationMinutes: 60 },
  { id: 'srv3', name: 'Remplacement Écran', description: 'Main d\'oeuvre écran PC portable', basePrice: 100.00, durationMinutes: 45 },
  { id: 'srv4', name: 'Nettoyage Thermique', description: 'Nettoyage interne & pâte thermique', basePrice: 60.00, durationMinutes: 45 },
  { id: 'srv5', name: 'Configuration Réseau', description: 'Config routeur & wifi sur site', basePrice: 120.00, durationMinutes: 90 },
  { id: 'srv6', name: 'Récupération Données N1', description: 'Récupération logicielle', basePrice: 200.00, durationMinutes: 120 },
  { id: 'srv7', name: 'Maintenance Imprimante', description: 'Service complet LaserJet', basePrice: 75.00, durationMinutes: 60 }
];

export const mockServiceJobs: ServiceJob[] = [
  { 
    id: 'job1', ticketNumber: 'JOB-24-1001', clientId: 'c1', clientName: 'Tunisie Telecom', 
    date: getDate(-2), status: 'in_progress', priority: 'high', 
    technicianId: 'tech1', technicianName: 'Sami Ben Amor', deviceInfo: 'Dell Latitude 5420',
    problemDescription: 'Surchauffe et arrêts aléatoires.',
    estimatedCost: 160.00,
    services: [{ serviceId: 'srv4', name: 'Nettoyage Thermique', price: 60 }],
    usedParts: [{ productId: 'p1', name: 'Ventilateur', quantity: 1, price: 100 }]
  },
  { 
    id: 'job2', ticketNumber: 'JOB-24-1002', clientId: 'c5', clientName: 'Groupe Délice', 
    date: getDate(-1), status: 'pending', priority: 'medium', 
    deviceInfo: 'HP LaserJet Pro',
    problemDescription: 'Erreur bourrage papier persistante.',
    estimatedCost: 75.00,
    services: [{ serviceId: 'srv1', name: 'Diagnostic', price: 45 }],
    usedParts: []
  },
  { 
    id: 'job3', ticketNumber: 'JOB-24-0998', clientId: 'c2', clientName: 'Clinique Internationale', 
    date: getDate(-5), status: 'completed', priority: 'low', 
    technicianId: 'tech2', technicianName: 'Leila Trabelsi', deviceInfo: 'Serveur Fichiers',
    problemDescription: 'Mise à jour sécurité requise',
    resolutionNotes: 'OS patché et pare-feu mis à jour.',
    estimatedCost: 120.00,
    services: [{ serviceId: 'srv2', name: 'Mise à jour OS', price: 120 }],
    usedParts: [],
    rating: 5, resolutionHours: 2.5
  },
  {
    id: 'job4', ticketNumber: 'JOB-24-1003', clientId: 'c4', clientName: 'Banque de l\'Habitat',
    date: getDate(0), status: 'in_progress', priority: 'critical',
    technicianId: 'tech5', technicianName: 'Karim Saidi', deviceInfo: 'Routeur Principal',
    problemDescription: 'Perte de paquets sur ligne principale',
    estimatedCost: 350.00,
    services: [{ serviceId: 'srv5', name: 'Debug Réseau', price: 150 }],
    usedParts: []
  },
  {
    id: 'job5', ticketNumber: 'JOB-24-0995', clientId: 'c1', clientName: 'Tunisie Telecom',
    date: getDate(-10), status: 'invoiced', priority: 'low',
    technicianId: 'tech1', technicianName: 'Sami Ben Amor', deviceInfo: 'ThinkPad X1',
    problemDescription: 'Ecran clignote',
    resolutionNotes: 'Dalle écran remplacée.',
    estimatedCost: 300.00,
    services: [{ serviceId: 'srv3', name: 'Remplacement Écran', price: 100 }],
    usedParts: [{ productId: 'p1', name: 'Dalle LCD', quantity: 1, price: 200 }],
    rating: 4, resolutionHours: 48.0
  }
];

export const mockServiceSales: ServiceSale[] = [
  {
    id: 'ss1', reference: 'SRV-INV-501', date: getDate(-5), clientId: 'c1', clientName: 'Tunisie Telecom',
    technicianId: 'tech1', technicianName: 'Sami Ben Amor', status: 'paid',
    items: [
      { id: '1', description: 'Main d\'oeuvre Remplacement Écran', quantity: 1, unitPrice: 100, total: 100 },
      { id: '2', description: 'Dalle LCD 14"', quantity: 1, unitPrice: 200, total: 200 }
    ],
    subtotal: 300, discountType: 'amount', discountValue: 0, discountAmount: 0, taxRate: 19, taxAmount: 57, total: 357
  },
  {
    id: 'ss2', reference: 'SRV-INV-502', date: getDate(-3), clientId: 'c2', clientName: 'Clinique Internationale',
    technicianId: 'tech2', technicianName: 'Leila Trabelsi', status: 'pending',
    items: [
      { id: '1', description: 'Configuration Réseau', quantity: 2, unitPrice: 120, total: 240 }
    ],
    subtotal: 240, discountType: 'percent', discountValue: 10, discountAmount: 24, taxRate: 19, taxAmount: 41.04, total: 257.04
  }
];

// --- STOCK MOVEMENTS ---
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'HP EliteBook', warehouseId: 'w1', warehouseName: 'Dépôt Principal', date: getDate(-30), quantity: 50, type: 'initial', reference: 'INIT', notes: 'Stock Initial', unitCost: 2500 },
  { id: 'sm2', productId: 'p1', productName: 'HP EliteBook', warehouseId: 'w1', warehouseName: 'Dépôt Principal', date: getDate(-29), quantity: -10, type: 'sale', reference: 'FAC-2024-001', notes: 'Vente', unitCost: 2500 },
  { id: 'sm3', productId: 'p7', productName: 'Routeur Cisco', warehouseId: 'w1', warehouseName: 'Dépôt Principal', date: getDate(-25), quantity: -20, type: 'sale', reference: 'FAC-2024-002', notes: 'Vente', unitCost: 1300 },
];

export const mockStockTransfers: StockTransfer[] = [];

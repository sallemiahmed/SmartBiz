
import { 
  Client, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement, 
  BankAccount, BankTransaction, CashSession, CashTransaction, Technician, 
  ServiceItem, ServiceJob, ServiceSale, InventorySession, Vehicle, FleetMission, 
  FleetMaintenance, FleetExpense, FleetDocument, Employee, Contract, Payroll, 
  LeaveRequest, ExpenseReport, MaintenanceContract, ContactInteraction
} from '../types';

export const getDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

// --- CRM DATA ---
export const mockClients: Client[] = [
  { 
    id: 'c1', 
    company: 'SFBT', 
    name: 'M. Kamel Ben Ammar', 
    email: 'achat@sfbt.tn', 
    phone: '71 123 456', 
    status: 'active', 
    category: 'Industrie', 
    totalSpent: 125000, 
    address: 'Route de l\'Hôpital Militaire, Tunis', 
    taxId: '1234567/A/M/000', 
    zone: 'Grand Tunis',
    customFields: { 'Sector': 'Beverages' }
  },
  { 
    id: 'c2', 
    company: 'Poulina Group Holding', 
    name: 'Mme. Samia Trabelsi', 
    email: 'contact@poulina.com', 
    phone: '71 456 789', 
    status: 'active', 
    category: 'Holding', 
    totalSpent: 89000, 
    address: 'GP1 Ezzahra, Ben Arous', 
    taxId: '9876543/B/M/000', 
    zone: 'Ben Arous' 
  },
  { 
    id: 'c3', 
    company: 'Clinique Les Jasmins', 
    name: 'Dr. Faouzi Mahjoub', 
    email: 'info@cliniquejasmins.tn', 
    phone: '71 777 888', 
    status: 'active', 
    category: 'Santé', 
    totalSpent: 42000, 
    address: 'Centre Urbain Nord, Tunis', 
    taxId: '1122334/C/M/000', 
    zone: 'Tunis' 
  },
  { 
    id: 'c4', 
    company: 'Vermeg', 
    name: 'Amine Jlassi', 
    email: 'it@vermeg.com', 
    phone: '71 111 222', 
    status: 'active', 
    category: 'Tech', 
    totalSpent: 15500, 
    address: 'Les Berges du Lac 1', 
    taxId: '5566778/D/M/000', 
    zone: 'Lac 1' 
  },
  { 
    id: 'c5', 
    company: 'Magasin Général', 
    name: 'Service Achat', 
    email: 'appro@mg.tn', 
    phone: '71 900 900', 
    status: 'active', 
    category: 'Retail', 
    totalSpent: 67000, 
    address: 'Avenue Jean Jaurès, Tunis', 
    taxId: '3344556/E/M/000', 
    zone: 'Centre Ville' 
  }
];

// --- SRM DATA ---
export const mockSuppliers: Supplier[] = [
  { id: 's1', company: 'MyTek', contactName: 'Service Pro', email: 'pro@mytek.tn', phone: '36 010 010', status: 'active', category: 'Informatique', totalPurchased: 45000 },
  { id: 's2', company: 'Sotipapier', contactName: 'Ali Gharbi', email: 'ali@sotipapier.com', phone: '71 789 123', status: 'active', category: 'Papeterie', totalPurchased: 12000 },
  { id: 's3', company: 'TotalEnergies', contactName: 'Service Carte', email: 'cartes@total.tn', phone: '71 555 666', status: 'active', category: 'Carburant', totalPurchased: 28000 },
  { id: 's4', company: 'Tunisie Cables', contactName: 'Mounir', email: 'sales@tuncable.com', phone: '71 333 444', status: 'inactive', category: 'Matériaux', totalPurchased: 5600 }
];

// --- INVENTORY DATA ---
export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Dépôt Central', location: 'ZI Charguia 1', isDefault: true },
  { id: 'wh2', name: 'Magasin Sfax', location: 'Route de Gabès, Sfax' },
  { id: 'wh3', name: 'Agence Sousse', location: 'Sahloul, Sousse' }
];

export const mockInventory: Product[] = [
  { id: 'p1', name: 'Laptop Dell Latitude 5520', sku: 'DELL-5520', category: 'Informatique', price: 2800, cost: 2300, stock: 12, warehouseStock: { 'wh1': 8, 'wh2': 2, 'wh3': 2 }, status: 'in_stock', marginPercent: 17.8 },
  { id: 'p2', name: 'Imprimante HP LaserJet Pro', sku: 'HP-LJP-404', category: 'Informatique', price: 950, cost: 750, stock: 5, warehouseStock: { 'wh1': 5 }, status: 'low_stock', marginPercent: 21.0 },
  { id: 'p3', name: 'Papier A4 (Carton 5 Rames)', sku: 'PAP-A4-BOX', category: 'Bureautique', price: 65, cost: 45, stock: 150, warehouseStock: { 'wh1': 100, 'wh2': 30, 'wh3': 20 }, status: 'in_stock', marginPercent: 30.7 },
  { id: 'p4', name: 'Chaise Bureau Ergonomique', sku: 'FUR-CH-01', category: 'Mobilier', price: 450, cost: 280, stock: 8, warehouseStock: { 'wh1': 8 }, status: 'in_stock', marginPercent: 37.7 },
  { id: 'p5', name: 'Disque Dur SSD 1TB Samsung', sku: 'SSD-1TB-SAM', category: 'Composants', price: 380, cost: 290, stock: 0, warehouseStock: { 'wh1': 0 }, status: 'out_of_stock', marginPercent: 23.6 },
  { id: 'p6', name: 'Onduleur Eaton 5E 1100VA', sku: 'UPS-EAT-1100', category: 'Electricité', price: 290, cost: 210, stock: 20, warehouseStock: { 'wh1': 15, 'wh2': 5 }, status: 'in_stock', marginPercent: 27.5 },
  { id: 'p7', name: 'Routeur Cisco ISR 1100', sku: 'NET-CIS-1100', category: 'Réseau', price: 1800, cost: 1400, stock: 3, warehouseStock: { 'wh1': 3 }, status: 'low_stock', marginPercent: 22.2 }
];

// --- SALES DOCUMENTS ---
export const mockInvoices: Invoice[] = [
  { 
    id: 'inv1', number: 'FAC-2024-001', type: 'invoice', clientId: 'c1', clientName: 'SFBT', 
    date: getDate(-15), amount: 14600, amountPaid: 14600, status: 'paid', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 5, price: 2800}, {id: 'p3', description: 'Papier A4 (Carton)', quantity: 10, price: 60}], 
    warehouseId: 'wh1', taxRate: 19, subtotal: 14600, fiscalStamp: 1.000 
  },
  { 
    id: 'inv2', number: 'FAC-2024-002', type: 'invoice', clientId: 'c2', clientName: 'Poulina Group', 
    date: getDate(-5), amount: 9500, amountPaid: 0, status: 'pending', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p2', description: 'Imprimante HP', quantity: 10, price: 950}], 
    warehouseId: 'wh1', taxRate: 19, subtotal: 9500, fiscalStamp: 1.000, dueDate: getDate(25)
  },
  { 
    id: 'ord1', number: 'BC-2024-055', type: 'order', clientId: 'c3', clientName: 'Clinique Les Jasmins', 
    date: getDate(-2), amount: 4500, status: 'pending', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p4', description: 'Chaise Bureau Ergonomique', quantity: 10, price: 450}], 
    warehouseId: 'wh1', taxRate: 19, subtotal: 4500, paymentTerms: 'Net 30'
  },
  { 
    id: 'est1', number: 'DEV-2024-101', type: 'estimate', clientId: 'c4', clientName: 'Vermeg', 
    date: getDate(0), amount: 5600, status: 'sent', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 2, price: 2800}], 
    warehouseId: 'wh1', taxRate: 19, subtotal: 5600 
  }
];

// --- PURCHASE DOCUMENTS ---
export const mockPurchases: Purchase[] = [
  { 
    id: 'po1', number: 'BCF-2024-001', type: 'order', supplierId: 's1', supplierName: 'MyTek', 
    date: getDate(-20), amount: 23000, status: 'completed', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p1', description: 'Laptop Dell Latitude', quantity: 10, price: 2300}], 
    warehouseId: 'wh1', subtotal: 23000, taxRate: 19 
  },
  { 
    id: 'po2', number: 'BCF-2024-002', type: 'order', supplierId: 's2', supplierName: 'Sotipapier', 
    date: getDate(-10), amount: 4500, status: 'pending', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p3', description: 'Papier A4', quantity: 100, price: 45}], 
    warehouseId: 'wh1', subtotal: 4500, taxRate: 19 
  }
];

// --- MOVEMENTS ---
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'Laptop Dell', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-20), quantity: 10, type: 'purchase', unitCost: 2300 },
  { id: 'sm2', productId: 'p1', productName: 'Laptop Dell', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-15), quantity: -5, type: 'sale', reference: 'FAC-2024-001' }
];

// --- FINANCE ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Compte Courant', bankName: 'BIAT', accountNumber: '08 000 123456789 11', type: 'checking', currency: 'TND', balance: 145000 },
  { id: 'ba2', name: 'Compte Épargne', bankName: 'Attijari Bank', accountNumber: '04 500 987654321 22', type: 'savings', currency: 'TND', balance: 25000 },
  { id: 'ba3', name: 'Compte Devises', bankName: 'STB', accountNumber: '10 111 222333444 33', type: 'checking', currency: 'EUR', balance: 5000 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: getDate(-15), description: 'Virement Client SFBT - FAC-2024-001', amount: 14600, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: getDate(-10), description: 'Paiement Fournisseur MyTek', amount: -10000, type: 'payment', status: 'cleared' },
  { id: 'tx3', accountId: 'ba1', date: getDate(-5), description: 'STEG Facture Electricité', amount: -450, type: 'payment', status: 'cleared' },
  { id: 'tx4', accountId: 'ba1', date: getDate(-2), description: 'Frais Bancaires', amount: -25, type: 'fee', status: 'reconciled' }
];

export const mockCashSessions: CashSession[] = [
  { id: 'cs1', openedBy: 'Ahmed Tounsi', startTime: getDate(0) + 'T08:00:00', openingBalance: 250, expectedBalance: 450, status: 'open' }
];

export const mockCashTransactions: CashTransaction[] = [
    { id: 'ctx1', sessionId: 'cs1', date: getDate(0) + 'T10:30:00', type: 'sale', amount: 200, description: 'Vente Comptoir #88' }
];

// --- SERVICES ---
export const mockTechnicians: Technician[] = [
  { id: 't1', name: 'Karim Jaziri', specialty: 'Réseau & Sécurité', status: 'available', phone: '55 123 456' },
  { id: 't2', name: 'Mariem Kefi', specialty: 'Maintenance Hardware', status: 'busy', phone: '22 987 654' },
  { id: 't3', name: 'Sami Ben Ahmed', specialty: 'Imprimantes & Copieurs', status: 'off_duty', phone: '98 111 222' }
];

export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Formatage & Installation OS', description: 'Windows/Linux + Drivers', basePrice: 60, durationMinutes: 90 },
  { id: 'srv2', name: 'Nettoyage Interne PC', description: 'Dépoussiérage et Pâte thermique', basePrice: 45, durationMinutes: 45 },
  { id: 'srv3', name: 'Installation Réseau', description: 'Câblage et config routeur (par point)', basePrice: 35, durationMinutes: 60 },
  { id: 'srv4', name: 'Réparation Carte Mère', description: 'Diagnostic et réparation niveau composant', basePrice: 150, durationMinutes: 120 }
];

export const mockServiceJobs: ServiceJob[] = [
  { id: 'job1', ticketNumber: 'SAV-1001', clientId: 'c4', clientName: 'Vermeg', date: getDate(-2), status: 'in_progress', priority: 'high', technicianId: 't1', technicianName: 'Karim Jaziri', deviceInfo: 'Server Rack HP', problemDescription: 'Surchauffe anormale', estimatedCost: 250, services: [{serviceId: 'srv2', name: 'Nettoyage', price: 80}], usedParts: [] }
];

export const mockServiceSales: ServiceSale[] = [];

// --- FLEET ---
export const mockVehicles: Vehicle[] = [
  { id: 'v1', make: 'Peugeot', model: 'Partner', plate: '201 TN 4455', year: 2018, status: 'available', fuelType: 'Diesel', mileage: 145000, technicalCheckExpiry: getDate(120), insuranceExpiry: getDate(30) },
  { id: 'v2', make: 'Renault', model: 'Clio 4', plate: '185 TN 9988', year: 2016, status: 'in_use', fuelType: 'Petrol', mileage: 98000, technicalCheckExpiry: getDate(-5), insuranceExpiry: getDate(200) }, // Expired tech check
  { id: 'v3', make: 'Isuzu', model: 'D-Max', plate: '199 TN 1122', year: 2017, status: 'maintenance', fuelType: 'Diesel', mileage: 210000, technicalCheckExpiry: getDate(60), insuranceExpiry: getDate(60) }
];

export const mockFleetMissions: FleetMission[] = [
  { id: 'm1', vehicleId: 'v2', vehicleName: 'Renault Clio 4', driverName: 'Walid Jlassi', startDate: getDate(0), startTime: '08:00', endDate: getDate(0), endTime: '18:00', destination: 'Sousse - Client Meeting', status: 'in_progress', startMileage: 98000 }
];

export const mockFleetMaintenances: FleetMaintenance[] = [];
export const mockFleetExpenses: FleetExpense[] = [];
export const mockFleetDocuments: FleetDocument[] = [];

// --- HR ---
export const mockEmployees: Employee[] = [
  { id: 'e1', firstName: 'Mohamed', lastName: 'Ben Ali', email: 'mohamed@smartbiz.tn', phone: '20 123 123', position: 'Directeur Général', department: 'Direction', hireDate: '2015-01-01', status: 'active', salary: 4500 },
  { id: 'e2', firstName: 'Sarra', lastName: 'Trabelsi', email: 'sarra@smartbiz.tn', phone: '55 654 321', position: 'Responsable RH', department: 'RH', hireDate: '2018-05-15', status: 'active', salary: 2800 },
  { id: 'e3', firstName: 'Walid', lastName: 'Jlassi', email: 'walid@smartbiz.tn', phone: '98 777 888', position: 'Chauffeur / Coursier', department: 'Logistique', hireDate: '2020-09-01', status: 'active', salary: 1200 },
  { id: 'e4', firstName: 'Karim', lastName: 'Jaziri', email: 'karim@smartbiz.tn', phone: '55 123 456', position: 'Technicien Senior', department: 'Technique', hireDate: '2019-03-10', status: 'active', salary: 2200 }
];

export const mockContracts: Contract[] = [
  { id: 'cnt1', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', type: 'CDI', startDate: '2015-01-01', status: 'active' },
  { id: 'cnt2', employeeId: 'e3', employeeName: 'Walid Jlassi', type: 'CDD', startDate: '2023-09-01', endDate: '2024-08-31', status: 'active' }
];

export const mockPayroll: Payroll[] = [
  { id: 'pay1', employeeId: 'e3', employeeName: 'Walid Jlassi', month: '2024-04', baseSalary: 1200, bonuses: 150, deductions: 50, netSalary: 1300, status: 'paid', paymentDate: '2024-04-30' }
];

export const mockLeaves: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e2', employeeName: 'Sarra Trabelsi', type: 'Paid Leave', startDate: getDate(10), endDate: getDate(15), days: 5, status: 'approved' }
];

export const mockExpenses: ExpenseReport[] = [
  { id: 'er1', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-3), type: 'Transport', amount: 35, description: 'Taxi Client Intervention', status: 'pending' }
];

// --- MAINTENANCE CRM ---
export const mockMaintenanceContracts: MaintenanceContract[] = [
    { id: 'mc1', clientId: 'c1', title: 'Maintenance Préventive Climatisation', type: 'preventive', startDate: '2024-01-01', endDate: '2024-12-31', visitsPerYear: 4, slaResponseHours: 4, status: 'active', value: 12000 },
    { id: 'mc2', clientId: 'c2', title: 'Support Informatique N2', type: 'full', startDate: '2024-03-01', endDate: '2025-02-28', visitsPerYear: 12, slaResponseHours: 8, status: 'active', value: 24000 }
];

export const mockContactInteractions: ContactInteraction[] = [
    { id: 'ci1', clientId: 'c1', date: getDate(-5), type: 'meeting', summary: 'Réunion trimestrielle de suivi. Client satisfait.', contactPerson: 'M. Kamel' },
    { id: 'ci2', clientId: 'c2', date: getDate(-2), type: 'call', summary: 'Appel pour planification intervention préventive.', contactPerson: 'Mme. Samia' }
];

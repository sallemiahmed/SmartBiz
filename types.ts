
export type AppView = 
  | 'dashboard' 
  | 'clients' 
  | 'suppliers' 
  | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers' | 'inventory-audit'
  | 'sales' | 'sales-estimate' | 'sales-order' | 'sales-delivery' | 'sales-invoice' | 'sales-return' | 'sales-issue'
  | 'sales-estimate-create' | 'sales-order-create' | 'sales-delivery-create' | 'sales-invoice-create' | 'sales-return-create' | 'sales-issue-create'
  | 'purchases' | 'purchases-pr' | 'purchases-rfq' | 'purchases-order' | 'purchases-delivery' | 'purchases-invoice' | 'purchases-return'
  | 'purchases-pr-create' | 'purchases-rfq-create' | 'purchases-order-create' | 'purchases-delivery-create' | 'purchases-invoice-create' | 'purchases-return-create'
  | 'invoices' 
  | 'services' | 'services-dashboard' | 'services-jobs' | 'services-sales' | 'services-catalog' | 'services-technicians' | 'services-jobs-create'
  | 'fleet' | 'fleet-dashboard' | 'fleet-vehicles' | 'fleet-missions' | 'fleet-maintenance' | 'fleet-costs'
  | 'banking' | 'banking-accounts' | 'banking-transactions'
  | 'cash_register' | 'cost_analysis' | 'reports' 
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  status: 'active' | 'inactive';
  category: string;
  totalSpent: number;
  customFields?: Record<string, any>;
}

export interface Supplier {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  category: string;
  totalPurchased: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  warehouseStock: Record<string, number>;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  marginPercent: number;
  image?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  quantity: number;
  type: 'initial' | 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return';
  reference?: string;
  notes?: string;
  unitCost?: number;
  costBefore?: number;
  costAfter?: number;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
}

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'return' | 'issue' | 'credit';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  fulfilledQuantity?: number;
  historicalCost?: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: SalesDocumentType;
  clientId: string;
  clientName: string;
  date: string;
  dueDate?: string;
  amount: number;
  amountPaid?: number;
  currency: string;
  exchangeRate: number;
  status: 'draft' | 'sent' | 'pending' | 'viewed' | 'accepted' | 'rejected' | 'invoiced' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'completed' | 'processed' | 'received';
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  discount?: number;
  discountType?: 'percent' | 'amount';
  discountValue?: number;
  fiscalStamp?: number;
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  linkedDocumentId?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine';
  salespersonName?: string;
}

export type PurchaseDocumentType = 'pr' | 'rfq' | 'order' | 'delivery' | 'invoice' | 'return';

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  supplierId: string;
  supplierName: string;
  date: string;
  deadline?: string;
  amount: number;
  amountPaid?: number;
  currency: string;
  exchangeRate: number;
  status: 'draft' | 'sent' | 'pending' | 'approved' | 'rejected' | 'responded' | 'accepted' | 'completed' | 'partial' | 'received' | 'processed';
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  additionalCosts?: number;
  fiscalStamp?: number;
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  linkedDocumentId?: string;
  requesterName?: string;
  department?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine' | 'return_to_supplier';
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'investment';
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'payment' | 'deposit' | 'transfer' | 'fee' | 'withdrawal';
  status: 'pending' | 'cleared' | 'reconciled';
}

export interface CashSession {
  id: string;
  openedBy: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface CashTransaction {
  id: string;
  sessionId: string;
  date: string;
  type: 'sale' | 'expense' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  status: 'available' | 'busy' | 'off_duty';
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
}

export interface ServiceJobItem {
    serviceId?: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
}

export interface ServiceJob {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  deviceInfo: string;
  problemDescription: string;
  status: 'pending' | 'in_progress' | 'completed' | 'invoiced' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  technicianId?: string;
  technicianName?: string;
  estimatedCost: number;
  services: { serviceId: string; name: string; price: number }[];
  usedParts: { productId: string; name: string; quantity: number; price: number }[];
  resolutionNotes?: string;
  resolutionHours?: number;
  rating?: number;
}

export interface ServiceSaleItem {
    id: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface ServiceSale {
    id: string;
    reference: string;
    date: string;
    clientId: string;
    clientName: string;
    technicianId?: string;
    technicianName?: string;
    status: 'draft' | 'pending' | 'paid' | 'cancelled';
    items: ServiceSaleItem[];
    subtotal: number;
    discountType: 'percent' | 'amount';
    discountValue: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
}

export interface InventoryItem {
    productId: string;
    productName: string;
    sku: string;
    systemQty: number;
    physicalQty: number;
    variance: number;
    cost: number;
}

export interface InventorySession {
    id: string;
    reference: string;
    date: string;
    warehouseId: string;
    warehouseName: string;
    categoryFilter: string;
    status: 'in_progress' | 'completed';
    notes: string;
    items: InventoryItem[];
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    fuelType: 'Diesel' | 'Petrol' | 'Hybrid' | 'Electric';
    mileage: number;
    status: 'available' | 'in_use' | 'maintenance';
    image?: string;
    insuranceExpiry?: string;
    technicalCheckExpiry?: string;
}

export interface FleetMission {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  startMileage?: number;
  endMileage?: number;
  destination: string;
  purpose?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface FleetMaintenance {
    id: string;
    vehicleId: string;
    date: string;
    type: 'periodic' | 'repair' | 'inspection' | 'other';
    description: string;
    cost: number;
    status: 'scheduled' | 'completed';
    provider?: string;
}

export interface FleetExpense {
    id: string;
    vehicleId: string;
    date: string;
    type: 'fuel' | 'insurance' | 'tax' | 'other';
    amount: number;
    description: string;
}

export interface FleetDocument {
    id: string;
    vehicleId: string;
    type: 'insurance' | 'registration' | 'inspection' | 'other';
    number: string;
    issueDate?: string;
    expiryDate?: string;
    fileUrl?: string;
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    isDefault?: boolean;
}

export interface CustomField {
    id: string;
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    required: boolean;
}

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo: string;
  companyVatId?: string;
  currency: string;
  language: string;
  timezone: string;
  geminiApiKey: string;
  enableFiscalStamp: boolean;
  fiscalStampValue: number;
  taxRates: TaxRate[];
  customFields: {
      clients: CustomField[];
      suppliers: CustomField[];
  };
}

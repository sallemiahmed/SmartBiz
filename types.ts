
export type AppView = 
  | 'dashboard' 
  | 'clients' 
  | 'suppliers' 
  | 'sales' | 'sales-estimate' | 'sales-order' | 'sales-delivery' | 'sales-invoice' | 'sales-return' 
  | 'sales-estimate-create' | 'sales-order-create' | 'sales-delivery-create' | 'sales-invoice-create' | 'sales-return-create'
  | 'purchases' | 'purchases-pr' | 'purchases-rfq' | 'purchases-order' | 'purchases-delivery' | 'purchases-invoice' | 'purchases-return'
  | 'purchases-pr-create' | 'purchases-rfq-create' | 'purchases-order-create' | 'purchases-delivery-create' | 'purchases-invoice-create' | 'purchases-return-create'
  | 'services' | 'services-dashboard' | 'services-jobs' | 'services-jobs-create' | 'services-sales' | 'services-catalog' | 'services-technicians'
  | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers' | 'inventory-audit'
  | 'invoices' 
  | 'banking' | 'banking-accounts' | 'banking-transactions'
  | 'cash_register' 
  | 'cost_analysis' 
  | 'reports' 
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'credit' | 'return';
export type PurchaseDocumentType = 'pr' | 'rfq' | 'order' | 'delivery' | 'invoice' | 'return';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  fulfilledQuantity?: number;
  historicalCost?: number; // for cost analysis
}

export interface Client {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  category: string;
  totalSpent: number;
  region?: string;
  address?: string;
  taxId?: string; // Matricule Fiscal
  customFields?: Record<string, any>;
}

export interface Supplier {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  status: 'active' | 'inactive';
  totalPurchased: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  image?: string;
  stock: number;
  warehouseStock: Record<string, number>;
  price: number;
  cost: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  marginPercent: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  systemQty: number; // Snapshot of theoretical stock at start
  physicalQty: number; // Counted quantity
  variance: number; // physical - system
  cost: number;
}

export interface InventorySession {
  id: string;
  reference: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  status: 'in_progress' | 'completed';
  categoryFilter?: string; // 'All' or specific category
  items: InventoryItem[];
  notes?: string;
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
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'completed' | 'sent' | 'accepted' | 'rejected' | 'partial' | 'processed';
  items: InvoiceItem[];
  warehouseId?: string;
  subtotal: number;
  taxRate?: number; // percent
  discount?: number;
  discountType?: 'percent' | 'amount';
  discountValue?: number;
  fiscalStamp?: number;
  currency?: string;
  exchangeRate?: number;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  linkedDocumentId?: string;
  salespersonName?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine';
}

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  supplierId: string;
  supplierName: string;
  date: string;
  deadline?: string;
  requesterName?: string;
  department?: string;
  amount: number;
  amountPaid?: number;
  currency?: string;
  exchangeRate?: number;
  additionalCosts?: number;
  fiscalStamp?: number;
  status: 'pending' | 'completed' | 'received' | 'draft' | 'sent' | 'responded' | 'accepted' | 'rejected' | 'approved' | 'partial' | 'processed';
  items: InvoiceItem[];
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  taxRate?: number;
  subtotal?: number;
  linkedDocumentId?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine'; // reintegrate means "return to supplier" in purchase context contextually
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
  type: 'initial' | 'sale' | 'purchase' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
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

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number; // positive for deposit, negative for withdrawal
  type: 'deposit' | 'payment' | 'transfer' | 'fee' | 'withdrawal';
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
  amount: number; // positive or negative
  description: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'off_duty';
  phone: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
}

export interface ServiceJob {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'invoiced' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  technicianId?: string;
  technicianName?: string;
  deviceInfo: string;
  problemDescription?: string;
  resolutionNotes?: string;
  estimatedCost?: number;
  services: { serviceId: string; name: string; price: number }[];
  usedParts: { productId: string; name: string; quantity: number; price: number }[];
  rating?: number;
  resolutionHours?: number;
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
  discountType: 'amount' | 'percent';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
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
  required?: boolean;
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

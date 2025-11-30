
export type AppView =
  | 'dashboard'
  | 'clients'
  | 'suppliers'
  | 'sales' | 'sales-estimate' | 'sales-order' | 'sales-delivery' | 'sales-invoice' | 'sales-issue' | 'sales-estimate-create' | 'sales-order-create' | 'sales-delivery-create' | 'sales-invoice-create' | 'sales-issue-create'
  | 'purchases' | 'purchases-pr' | 'purchases-rfq' | 'purchases-order' | 'purchases-delivery' | 'purchases-invoice' | 'purchases-order-create' | 'purchases-delivery-create' | 'purchases-invoice-create' | 'purchases-rfq-create' | 'purchases-pr-create'
  | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers'
  | 'services' | 'services-dashboard' | 'services-jobs' | 'services-catalog' | 'services-technicians' | 'services-jobs-create' | 'services-sales'
  | 'invoices'
  | 'banking' | 'banking-accounts' | 'banking-transactions'
  | 'cash_register'
  | 'cost_analysis'
  | 'reports'
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export type PurchaseDocumentType = 'pr' | 'rfq' | 'order' | 'delivery' | 'invoice' | 'grn';
export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'issue' | 'credit';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  fulfilledQuantity?: number;
  historicalCost?: number;
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
  customFields?: Record<string, any>;
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
  description?: string;
  marginPercent: number; // Added for CostAnalysis
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
  amountPaid?: number; // Track partial payments
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'completed' | 'sent' | 'partial';
  items: InvoiceItem[];
  warehouseId?: string;
  currency?: string;
  exchangeRate?: number;
  subtotal?: number;
  discount?: number;
  discountValue?: number;
  discountType?: 'percent' | 'amount';
  taxRate?: number;
  fiscalStamp?: number;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  salespersonName?: string;
  linkedDocumentId?: string;
}

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  supplierId: string;
  supplierName: string;
  date: string;
  deadline?: string; // Specific for RFQ
  requesterName?: string; // Specific for PR
  department?: string; // Specific for PR
  amount: number;
  amountPaid?: number; // Track partial payments
  currency?: string;
  exchangeRate?: number;
  additionalCosts?: number;
  status: 'pending' | 'completed' | 'received' | 'draft' | 'sent' | 'responded' | 'accepted' | 'rejected' | 'approved' | 'partial';
  items: InvoiceItem[];
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  taxRate?: number;
  subtotal?: number;
  linkedDocumentId?: string;
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
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'fee';
  status: 'cleared' | 'pending' | 'reconciled';
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
}

export interface CashTransaction {
  id: string;
  sessionId: string;
  date: string;
  type: 'sale' | 'expense' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault?: boolean;
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

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  quantity: number;
  type: 'initial' | 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
  reference?: string;
  notes?: string;
  unitCost?: number;
  costBefore?: number;
  costAfter?: number;
  relatedWarehouseName?: string;
}

// --- Service Module Types ---

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'off_duty';
  email?: string;
  phone?: string;
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
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'invoiced';
  priority: 'low' | 'medium' | 'high' | 'critical';
  technicianId?: string;
  technicianName?: string;
  deviceInfo?: string; // E.g. "Laptop HP Omen", "Car Model X"
  problemDescription: string;
  resolutionNotes?: string;
  estimatedCost: number;
  services: { serviceId: string; name: string; price: number }[];
  usedParts: { productId: string; name: string; quantity: number; price: number }[];
  
  // New Metrics
  rating?: number; // 1-5 Stars (CSAT)
  resolutionHours?: number; // Time taken to complete
}

export interface ServiceSaleItem {
  id: string;
  serviceId?: string; // If linked to catalog
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

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault?: boolean;
}

export interface CustomFieldDefinition {
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
  companyLogo?: string;
  companyVatId?: string;
  currency: string;
  language: string;
  timezone: string;
  geminiApiKey: string;
  enableFiscalStamp: boolean;
  fiscalStampValue: number;
  taxRates: TaxRate[];
  customFields: {
    clients: CustomFieldDefinition[];
    suppliers: CustomFieldDefinition[];
  };
}

export type Language = 'en' | 'fr' | 'ar';

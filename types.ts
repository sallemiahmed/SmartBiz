
export type AppView = 
  | 'dashboard' | 'clients' | 'suppliers' | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers'
  | 'sales' | 'sales-estimate' | 'sales-estimate-create' | 'sales-order' | 'sales-order-create' | 'sales-delivery' | 'sales-delivery-create' | 'sales-invoice' | 'sales-invoice-create' | 'sales-return' | 'sales-return-create'
  | 'purchases' | 'purchases-pr' | 'purchases-pr-create' | 'purchases-rfq' | 'purchases-rfq-create' | 'purchases-order' | 'purchases-order-create' | 'purchases-delivery' | 'purchases-delivery-create' | 'purchases-invoice' | 'purchases-invoice-create' | 'purchases-return' | 'purchases-return-create'
  | 'invoices' | 'banking' | 'banking-overview' | 'banking-accounts' | 'banking-transactions' | 'cash_register' | 'cost_analysis' | 'reports'
  | 'services' | 'services-dashboard' | 'services-jobs' | 'services-jobs-create' | 'services-sales' | 'services-catalog' | 'services-technicians'
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'return';
export type PurchaseDocumentType = 'pr' | 'rfq' | 'order' | 'delivery' | 'invoice' | 'return';

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
  taxId?: string;
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
  address?: string;
  taxId?: string;
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
  image?: string;
  marginPercent: number;
}

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
  items: InvoiceItem[];
  clientId: string;
  clientName: string;
  date: string;
  dueDate?: string;
  amount: number;
  amountPaid?: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'completed' | 'partial' | 'processed';
  currency: string;
  exchangeRate?: number;
  subtotal?: number;
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
  stockAction?: 'reintegrate' | 'quarantine';
  returnReason?: string;
  salespersonName?: string;
}

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  items: InvoiceItem[];
  supplierId: string;
  supplierName: string;
  requesterName?: string;
  department?: string;
  date: string;
  deadline?: string;
  amount: number;
  amountPaid?: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sent' | 'responded' | 'accepted' | 'completed' | 'partial' | 'received' | 'processed';
  currency: string;
  exchangeRate?: number;
  additionalCosts?: number;
  subtotal?: number;
  taxRate?: number;
  fiscalStamp?: number;
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  linkedDocumentId?: string;
  stockAction?: 'reintegrate' | 'quarantine';
  returnReason?: string;
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
  type: 'initial' | 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
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
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'investment';
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer' | 'fee';
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
  status: 'available' | 'busy' | 'off_duty';
  phone?: string;
  email?: string;
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
  problemDescription: string;
  resolutionNotes?: string;
  resolutionHours?: number;
  estimatedCost: number;
  services: { serviceId: string; name: string; price: number }[];
  usedParts: { productId: string; name: string; quantity: number; price: number }[];
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

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault?: boolean;
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
  customFields?: {
    clients: any[];
    suppliers: any[];
  };
}

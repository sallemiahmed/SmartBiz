
export type AppView = 
  | 'dashboard' 
  | 'clients' 
  | 'suppliers' 
  | 'sales' | 'sales-estimate' | 'sales-order' | 'sales-delivery' | 'sales-invoice' | 'sales-issue' 
  | 'sales-estimate-create' | 'sales-order-create' | 'sales-delivery-create' | 'sales-invoice-create' | 'sales-issue-create'
  | 'purchases' | 'purchases-order' | 'purchases-delivery' | 'purchases-invoice'
  | 'purchases-order-create' | 'purchases-delivery-create' | 'purchases-invoice-create'
  | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers'
  | 'invoices' 
  | 'banking' | 'banking-accounts' | 'banking-transactions'
  | 'cash_register' 
  | 'cost_analysis' 
  | 'reports' 
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export interface Product {
  id: string;
  sku: string;
  name: string;
  image?: string;
  category: string;
  stock: number;
  warehouseStock: Record<string, number>;
  price: number;
  cost: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  marginPercent?: number; // derived
  margin?: number; // derived
}

export interface Client {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  category: string; // Retail, Wholesale etc
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

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number; // unit price
  historicalCost?: number;
}

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'issue' | 'return' | 'credit';

export interface Invoice {
  id: string;
  number: string;
  type: SalesDocumentType;
  clientId: string;
  clientName: string;
  date: string; // ISO date
  dueDate: string; // ISO date
  amount: number; // Total
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'completed';
  items: InvoiceItem[];
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  taxRate?: number;
  subtotal?: number;
  discount?: number;
  fiscalStamp?: number;
  linkedDocumentId?: string;
  salespersonName?: string;
}

export type PurchaseDocumentType = 'order' | 'delivery' | 'invoice';

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  additionalCosts?: number;
  status: 'pending' | 'completed' | 'received'; // received for GRN
  items: InvoiceItem[]; // Reusing InvoiceItem structure for simplicity
  warehouseId?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  taxRate?: number;
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
  relatedWarehouseId?: string; // for transfers
  relatedWarehouseName?: string; // for transfers
  date: string;
  quantity: number; // positive for in, negative for out
  type: 'initial' | 'adjustment' | 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'return';
  reference?: string;
  notes?: string;
  unitCost: number;
  costBefore: number;
  costAfter: number;
}

export interface StockTransfer {
  id: string;
  date: string;
  reference?: string;
  productId: string;
  productName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
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
  type: 'deposit' | 'withdrawal' | 'sale' | 'expense';
  amount: number;
  description: string;
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
  companyVatId?: string;
  currency: string;
  language: string;
  timezone: string;
  companyLogo?: string;
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

export interface DashboardStats {
  revenue: number;
  expenses: number;
  profit: number;
  pendingInvoices: number;
}

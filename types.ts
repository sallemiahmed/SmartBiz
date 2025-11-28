
export type AppView = 
  | 'dashboard' 
  | 'clients' 
  | 'suppliers' 
  | 'sales' | 'sales-estimate' | 'sales-estimate-create' | 'sales-order' | 'sales-order-create' | 'sales-delivery' | 'sales-delivery-create' | 'sales-invoice' | 'sales-invoice-create' | 'sales-issue' | 'sales-issue-create' | 'sales-return' | 'sales-credit'
  | 'purchases' | 'purchases-order' | 'purchases-order-create' | 'purchases-delivery' | 'purchases-delivery-create' | 'purchases-invoice' | 'purchases-invoice-create'
  | 'inventory' 
  | 'invoices' 
  | 'banking'
  | 'cash_register'
  | 'reports' 
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications' | 'settings-custom-fields';

export type Language = 'en' | 'fr' | 'ar';

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
  companyVatId: string;
  currency: string;
  language: Language;
  timezone: string;
  taxRates: TaxRate[];
  customFields: {
    clients: CustomFieldDefinition[];
    suppliers: CustomFieldDefinition[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: string;
  avatar: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  totalSpent: number;
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

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'issue' | 'return' | 'credit';

export interface Invoice {
  id: string;
  number: string;
  type: SalesDocumentType; 
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'completed' | 'returned';
  items: InvoiceItem[];
  linkedDocumentId?: string; // For Credit Notes linking to Invoices
  warehouseId?: string; // The warehouse items were deducted from
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
  status: 'completed' | 'pending' | 'received';
  items: InvoiceItem[];
  warehouseId?: string; // The warehouse items were added to
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number; // Total calculated stock across all warehouses
  warehouseStock: Record<string, number>; // Map of warehouseId -> quantity
  price: number;
  cost: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface DashboardStats {
  revenue: number;
  expenses: number;
  profit: number;
  pendingInvoices: number;
}

// --- WAREHOUSE MANAGEMENT ---

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault?: boolean;
}

export interface StockTransfer {
  id: string;
  date: string;
  productId: string;
  productName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

// --- BANKING MODULE TYPES ---

export interface BankAccount {
  id: string;
  name: string; // e.g. Main Checking
  bankName: string; // e.g. Chase, BNP
  accountNumber: string;
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'credit';
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number; // Positive for deposit, negative for withdrawal
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'payment';
  status: 'cleared' | 'pending' | 'reconciled';
  reference?: string; // Link to invoice ID or check number
}

// --- CASH REGISTER MODULE TYPES ---

export interface CashSession {
  id: string;
  openedBy: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance: number; // Calculated system balance
  status: 'open' | 'closed';
  notes?: string;
}

export interface CashTransaction {
  id: string;
  sessionId: string;
  date: string;
  type: 'sale' | 'expense' | 'deposit' | 'withdrawal';
  amount: number; // Positive for In, Negative for Out
  description: string;
  reference?: string;
}

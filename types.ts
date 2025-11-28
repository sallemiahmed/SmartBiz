export type AppView = 
  | 'dashboard' 
  | 'clients' 
  | 'suppliers' 
  | 'sales' | 'sales-estimate' | 'sales-estimate-create' | 'sales-order' | 'sales-order-create' | 'sales-delivery' | 'sales-delivery-create' | 'sales-invoice' | 'sales-invoice-create' | 'sales-issue' | 'sales-issue-create'
  | 'purchases' | 'purchases-order' | 'purchases-order-create' | 'purchases-delivery' | 'purchases-delivery-create' | 'purchases-invoice' | 'purchases-invoice-create'
  | 'inventory' 
  | 'invoices' 
  | 'reports' 
  | 'settings' | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export type Language = 'en' | 'fr' | 'ar';

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
  companyVatId: string; // Added VAT/ID field
  currency: string;
  language: Language;
  timezone: string;
  taxRates: TaxRate[];
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

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'issue';

export interface Invoice {
  id: string;
  number: string;
  type: SalesDocumentType; 
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'completed';
  items: InvoiceItem[];
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
  stock: number;
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
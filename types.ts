
export type AppView = 
  | 'dashboard' | 'clients' | 'suppliers' | 'sales' | 'sales-estimate' | 'sales-order' | 'sales-delivery' | 'sales-invoice' | 'sales-return' | 'sales-issue' 
  | 'purchases' | 'purchases-pr' | 'purchases-rfq' | 'purchases-order' | 'purchases-delivery' | 'purchases-invoice' | 'purchases-return'
  | 'services' | 'services-dashboard' | 'services-jobs' | 'services-sales' | 'services-catalog' | 'services-technicians' | 'services-crm'
  | 'inventory' | 'inventory-products' | 'inventory-warehouses' | 'inventory-transfers' | 'inventory-audit'
  | 'fleet' | 'fleet-dashboard' | 'fleet-vehicles' | 'fleet-missions' | 'fleet-maintenance' | 'fleet-costs'
  | 'hr' | 'hr-dashboard' | 'hr-employees' | 'hr-contracts' | 'hr-payroll' | 'hr-leave' | 'hr-expenses' | 'hr-performance' | 'hr-attendance' | 'hr-settings'
  | 'invoices' | 'banking' | 'banking-accounts' | 'banking-transactions' | 'cash_register' | 'cost_analysis' | 'reports' | 'settings'
  | 'sales-estimate-create' | 'sales-order-create' | 'sales-delivery-create' | 'sales-invoice-create' | 'sales-return-create' | 'sales-issue-create'
  | 'purchases-pr-create' | 'purchases-rfq-create' | 'purchases-order-create' | 'purchases-delivery-create' | 'purchases-invoice-create' | 'purchases-return-create'
  | 'services-jobs-create'
  | 'settings-general' | 'settings-profile' | 'settings-security' | 'settings-billing' | 'settings-notifications';

export interface Client {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  category: string;
  totalSpent: number;
  address?: string;
  taxId?: string;
  customFields?: Record<string, any>;
  zone?: string; // Geographic zone
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

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault?: boolean;
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

export type SalesDocumentType = 'estimate' | 'order' | 'delivery' | 'invoice' | 'return' | 'issue';
export type PurchaseDocumentType = 'pr' | 'rfq' | 'order' | 'delivery' | 'invoice' | 'return';

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
  amount: number;
  amountPaid?: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'pending' | 'partial' | 'paid' | 'overdue' | 'completed' | 'cancelled' | 'processed';
  currency: string;
  exchangeRate: number;
  items: InvoiceItem[];
  warehouseId: string;
  taxRate: number;
  subtotal: number;
  fiscalStamp?: number;
  dueDate?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  discount?: number;
  discountType?: 'percent' | 'amount';
  discountValue?: number;
  linkedDocumentId?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine';
  salespersonName?: string;
}

export interface Purchase {
  id: string;
  number: string;
  type: PurchaseDocumentType;
  supplierId: string;
  supplierName: string;
  requesterName?: string;
  department?: string;
  date: string;
  deadline?: string;
  amount: number;
  amountPaid?: number;
  status: 'pending' | 'approved' | 'rejected' | 'sent' | 'responded' | 'accepted' | 'completed' | 'partial' | 'received' | 'processed';
  currency: string;
  exchangeRate: number;
  items: InvoiceItem[];
  warehouseId: string;
  subtotal: number;
  taxRate?: number;
  additionalCosts?: number;
  fiscalStamp?: number;
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  linkedDocumentId?: string;
  returnReason?: string;
  stockAction?: 'reintegrate' | 'quarantine';
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
  type: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
  balance: number;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'payment' | 'transfer' | 'fee' | 'withdrawal';
  status: 'pending' | 'cleared' | 'reconciled';
}

export interface CashSession {
  id: string;
  openedBy: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  expectedBalance: number;
  closingBalance?: number;
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
  problemDescription: string;
  estimatedCost: number;
  services: { serviceId: string; name: string; price: number }[];
  usedParts: { productId: string; name: string; quantity: number; price: number }[];
  resolutionNotes?: string;
  resolutionHours?: number;
  rating?: number;
  linkedMissionId?: string; 
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

export interface MaintenanceContract {
  id: string;
  clientId: string;
  title: string;
  type: 'preventive' | 'corrective' | 'full';
  startDate: string;
  endDate: string;
  visitsPerYear: number;
  slaResponseHours: number;
  status: 'active' | 'expired' | 'pending';
  value: number;
}

export interface ContactInteraction {
  id: string;
  clientId: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  summary: string;
  contactPerson?: string;
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
  status: 'in_progress' | 'completed';
  categoryFilter: string;
  items: InventoryItem[];
  notes: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance';
  fuelType: 'Diesel' | 'Petrol' | 'Hybrid' | 'Electric';
  mileage: number;
  technicalCheckExpiry?: string;
  insuranceExpiry?: string;
  image?: string;
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
  destination: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startMileage?: number;
  endMileage?: number;
  purpose?: string;
}

export interface FleetMaintenance {
  id: string;
  vehicleId: string;
  date: string;
  type: 'regular' | 'repair' | 'inspection';
  description: string;
  cost: number;
  status: 'scheduled' | 'completed';
}

export interface FleetExpense {
  id: string;
  vehicleId: string;
  date: string;
  type: 'fuel' | 'insurance' | 'tax' | 'other';
  description: string;
  amount: number;
}

export interface FleetDocument {
  id: string;
  vehicleId: string;
  type: 'insurance' | 'registration' | 'inspection' | 'other';
  number: string;
  expiryDate: string;
}

// HR Interfaces

// Core HR entities
export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  description?: string;
}

export interface Position {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  description?: string;
}

export interface Employee {
  id: string;
  matricule: string; // Employee number
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  positionId?: string;
  department: string;
  departmentId?: string;
  managerId?: string;
  site?: string; // Office location
  hireDate: string;
  birthDate?: string;
  nationality?: string;
  address?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  salary: number;
  photo?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents?: {
    id: string;
    type: 'id' | 'passport' | 'contract' | 'certificate' | 'other';
    name: string;
    uploadDate: string;
    expiryDate?: string;
    fileUrl?: string;
  }[];
  customFields?: Record<string, any>;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Internship' | 'Freelance' | 'Part-time';
  startDate: string;
  endDate?: string;
  trialPeriodEnd?: string;
  status: 'draft' | 'active' | 'suspended' | 'expired' | 'terminated';
  baseSalary: number;
  currency: string;
  workingHours: number; // per week
  bonuses?: {
    type: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  }[];
  benefits?: string[];
  signedDate?: string;
  fileUrl?: string;
  amendments?: {
    id: string;
    date: string;
    description: string;
    fileUrl?: string;
  }[];
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'paid';
  paymentDate?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Paid Leave' | 'Sick Leave' | 'Unpaid' | 'Remote';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface ExpenseReport {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'Transport' | 'Food' | 'Accommodation' | 'Mileage' | 'Other';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected';
  receipt?: string;
  approvedBy?: string;
  approvedDate?: string;
  reimbursedDate?: string;
  items?: {
    id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    receipt?: string;
  }[];
}

// Time & Attendance
export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;  // HH:MM
  checkOut?: string; // HH:MM
  breakDuration?: number; // minutes
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'remote';
  notes?: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStarting: string; // YYYY-MM-DD (Monday)
  weekEnding: string;
  entries: {
    date: string;
    regularHours: number;
    overtimeHours: number;
    projectId?: string;
    projectName?: string;
    task?: string;
    notes?: string;
  }[];
  totalRegular: number;
  totalOvertime: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
}

// Leave Policies
export interface LeavePolicy {
  id: string;
  name: string;
  type: string; // 'annual', 'sick', 'maternity', etc.
  daysPerYear: number;
  maxCarryover?: number;
  requiresApproval: boolean;
  paidLeave: boolean;
  description?: string;
}

// HR Performance Interfaces
export interface ReviewCycle {
  id: string;
  name: string; // e.g., "Q1 2024 Performance Review"
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  cycleId: string;
  cycleName: string;
  date: string;
  reviewerName: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'acknowledged';
  score: number; // 0-5 or 0-100
  ratings: {
    category: string;
    score: number; // 1-5
    comment?: string;
  }[];
  overallFeedback: string;
  goals?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isDefault?: boolean;
}

// Extended HR Interfaces

// Payroll Run & Payslip
export interface PayrollElement {
  id: string;
  code: string;
  name: string;
  type: 'earning' | 'deduction' | 'benefit';
  formula?: string; // Expression formula or fixed amount
  isSystemGenerated?: boolean;
}

export interface PayrollRun {
  id: string;
  reference: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  status: 'draft' | 'calculated' | 'validated' | 'paid' | 'closed';
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeesCount: number;
  createdBy: string;
  createdDate: string;
  closedDate?: string;
  paymentDate?: string;
  notes?: string;
}

export interface Payslip {
  id: string;
  runId: string;
  employeeId: string;
  employeeName: string;
  employeeMatricule: string;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  workDays: number;
  workedDays: number;
  earnings: {
    elementId: string;
    name: string;
    amount: number;
    taxable: boolean;
  }[];
  deductions: {
    elementId: string;
    name: string;
    amount: number;
    type: 'social' | 'tax' | 'other';
  }[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'final';
  pdfUrl?: string;
  generatedDate: string;
}

// Shifts & Schedules
export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakDuration: number; // minutes
  isActive: boolean;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string; // YYYY-MM-DD
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

// Onboarding & Offboarding
export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  assigneeRole: 'hr' | 'manager' | 'employee' | 'it';
  dueInDays: number; // Days from hire date
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
  requiresDocument?: boolean;
  documentUrl?: string;
}

export interface OnboardingChecklist {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: OnboardingTask[];
  completionPercentage: number;
  notes?: string;
}

export interface OffboardingChecklist {
  id: string;
  employeeId: string;
  employeeName: string;
  lastWorkingDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: OnboardingTask[];
  exitInterview?: {
    conducted: boolean;
    date?: string;
    feedback?: string;
  };
  completionPercentage: number;
  notes?: string;
}

// Document Management
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: 'id' | 'passport' | 'contract' | 'certificate' | 'medical' | 'rib' | 'other';
  name: string;
  uploadDate: string;
  expiryDate?: string;
  version: number;
  fileUrl?: string;
  uploadedBy: string;
  status: 'active' | 'expired' | 'archived';
}

// Goals & Objectives (OKR)
export interface Objective {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  weight: number; // percentage
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  keyResults: {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
  }[];
}

// Audit Log
export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'view_sensitive';
  resource: string; // e.g., 'employee', 'payroll', 'contract'
  resourceId: string;
  before?: any;
  after?: any;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

// HR Settings
export interface HRSettings {
  id: string;
  // Leave Policies
  leaveYearStart: string; // MM-DD
  carryoverAllowed: boolean;
  maxCarryoverDays: number;
  // Payroll
  payrollFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  payrollCutoffDay: number; // Day of month
  paymentDay: number; // Day of month
  defaultWorkingDaysPerWeek: number;
  overtimeRateMultiplier: number; // e.g., 1.5
  // Working Hours
  standardWorkingHoursPerDay: number;
  standardWorkingHoursPerWeek: number;
  weekendDays: string[]; // ['saturday', 'sunday']
  // Compliance
  dataRetentionYears: number;
  anonymizeOnExit: boolean;
  requireTwoFactorForSalaryAccess: boolean;
  // Notifications
  alertDocumentExpiryDays: number;
  alertTrialPeriodEndDays: number;
  alertContractEndDays: number;
}

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo: string;
  currency: string;
  language: string;
  timezone: string;
  geminiApiKey: string;
  enableFiscalStamp: boolean;
  fiscalStampValue: number;
  taxRates: TaxRate[];
  customFields: {
    clients: any[];
    suppliers: any[];
  };
  companyVatId?: string;
}

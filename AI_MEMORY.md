# AI Project Memory: SmartBiz Manager

**Last Updated:** 2024-05-22
**Project Type:** SaaS Business Management Platform (Frontend Prototype)
**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Google GenAI SDK.

## 1. Project Summary
SmartBiz Manager is a comprehensive, multi-module single-page application (SPA) designed to manage various business aspects including CRM, SRM, Inventory, Sales, Purchasing, Services, and Finance. It features a modern UI with dark mode support, multi-language capabilities (LTR/RTL), and an AI assistant. Currently, it operates on mock data managed via React Context.

## 2. File & Folder Structure

```text
/
├── index.html              # Entry HTML
├── index.tsx               # Entry Point
├── App.tsx                 # Main Layout & Manual Routing
├── types.ts                # TypeScript Interfaces (Models)
├── vite.config.ts          # Vite Configuration
├── metadata.json           # App Metadata
├── README.md               # Project Documentation
├── AI_MEMORY.md            # Technical Memory (This file)
│
├── components/             # Reusable UI Components
│   ├── Sidebar.tsx         # Main Navigation
│   ├── TopBar.tsx          # Header (Search, Theme, Profile)
│   ├── StatsCard.tsx       # Dashboard KPI Cards
│   ├── Pagination.tsx      # Table Pagination
│   ├── ProgressBar.tsx     # Loading Indicator
│   ├── SearchableSelect.tsx # Custom Dropdown
│   └── AIAssistant.tsx     # Gemini-powered Chatbot
│
├── context/                # State Management
│   └── AppContext.tsx      # Global State (CRUD, Logic, Mock Data)
│
├── services/               # Data & External Services
│   ├── mockData.ts         # Static Data for all modules
│   └── translations.ts     # I18n Loader
│
├── utils/                  # Helper Functions
│   ├── currencyList.ts     # Supported Currencies
│   └── printGenerator.ts   # PDF/Print generation logic
│
├── views/                  # Page Views
│   ├── App.tsx             # (Duplicate/Alternate Entry?)
│   ├── Dashboard.tsx       # Main Analytics
│   ├── Settings.tsx        # Config (Company, Tax, Security)
│   ├── Reports.tsx         # Analytics Hub
│   ├── Clients.tsx         # CRM
│   ├── Suppliers.tsx       # SRM
│   │
│   ├── Sales.tsx           # Generic Sales Form (Create/Edit)
│   ├── SalesEstimates.tsx  # Quotes List
│   ├── SalesOrders.tsx     # SO List
│   ├── SalesDeliveries.tsx # Delivery Notes List
│   ├── SalesInvoices.tsx   # Sales Invoices List
│   ├── SalesIssues.tsx     # Issue Notes List
│   │
│   ├── Purchases.tsx       # Generic Purchase Form (Create/Edit)
│   ├── InternalPurchaseRequest.tsx # PR List
│   ├── RequestForQuotation.tsx     # RFQ List
│   ├── PurchaseOrders.tsx          # PO List
│   ├── PurchaseDeliveries.tsx      # GRN List
│   ├── PurchaseInvoices.tsx        # Purchase Invoices List
│   │
│   ├── Inventory.tsx           # Product List
│   ├── InventoryWarehouses.tsx # Warehouse Management
│   ├── InventoryTransfers.tsx  # Stock Movement/Transfer
│   │
│   ├── Services.tsx            # Generic Service Job Form
│   ├── ServiceDashboard.tsx    # Service KPIs
│   ├── ServiceJobs.tsx         # Repair/Job Tickets
│   ├── ServiceCatalog.tsx      # Service Definitions
│   ├── ServiceSales.tsx        # Service-specific Sales
│   ├── Technicians.tsx         # Staff Management
│   │
│   ├── Invoices.tsx        # General Document History
│   ├── BankManagement.tsx  # Bank Accounts & Transactions
│   ├── CashRegister.tsx    # Petty Cash / Register Shifts
│   └── CostAnalysis.tsx    # Profitability & COGS Analysis
│
└── languages/              # Localization Files
    ├── manifest.json
    ├── en.json, fr.json, ar.json, zh.json, he.json, ja.json
    └── (Legacy XML files present but JSON seems active)
```

## 3. Core Architecture

### State Management (`AppContext.tsx`)
*   **Centralized Store**: Holds all data (`clients`, `products`, `invoices`, `stockMovements`, etc.) in React State.
*   **Persistence**: Currently purely in-memory (resets on reload), initialized from `mockData.ts`.
*   **Actions**: Exports CRUD functions (`addClient`, `updateInvoice`, `transferStock`, etc.) available via `useApp()` hook.

### Routing (`App.tsx`)
*   **Manual Routing**: Uses a state variable `currentView` (Type: `AppView`) to conditionally render components in the main layout.
*   **Navigation**: Handled by `Sidebar.tsx` (sets `currentView`) and internal links (e.g., "Add New" buttons).

### Internationalization
*   **Dynamic Loading**: `translations.ts` fetches JSON files from `/languages/`.
*   **RTL Support**: `App.tsx` toggles `dir="rtl"` on `<html>` based on selected language (Arabic/Hebrew).

## 4. Key Business Logic

### Sales Cycle
1.  **Estimate**: Proposal stage.
2.  **Order**: Confirmation.
3.  **Delivery**: Deducts physical stock (via `SalesDeliveries`).
4.  **Invoice**: Financial record (Revenue).
5.  **Issue Note**: Manual stock deduction.

### Purchase Cycle
1.  **PR (Internal Request)**: Internal approval step.
2.  **RFQ**: Request pricing from suppliers.
3.  **Order (PO)**: Official order to supplier.
4.  **Delivery (GRN)**: Increases physical stock.
5.  **Invoice**: Financial record (Expense).

### Inventory Logic
*   **Multi-Warehouse**: Stock is tracked per warehouse in `product.warehouseStock`.
*   **Movements**: All changes (sales, purchases, transfers) are logged in `stockMovements`.
*   **Costing**: Supports WAC (Weighted Average Cost) simulation in `CostAnalysis.tsx`.

### Services Logic
*   **Jobs**: Track repair tickets with status (Pending -> In Progress -> Completed).
*   **Billing**: Jobs can include Services (Labor) and Parts (Products). Can be converted to Invoices.

## 5. UI/UX Patterns
*   **Layout**: Fixed Sidebar (Left) + TopBar (Header) + Scrollable Content Area.
*   **Modals**: Heavy use of overlay modals for Forms (Add/Edit) and Details views to keep context.
*   **Tables**: Custom table implementation with `Pagination.tsx`.
*   **Theme**: Tailwind `dark:` classes used extensively for full Dark Mode support.

## 6. Known Issues / TODOs
*   **Persistence**: Data is lost on refresh (Mock data only).
*   **App.tsx Duplication**: `views/App.tsx` appears to be a copy or alternate version of root `App.tsx`.
*   **Validation**: Form validation is basic (HTML5 attributes).
*   **Routing**: No URL history/deep linking due to manual state-based routing.
*   **Localization**: XML files exist in `languages/` but `translations.ts` logic points to JSON.

## 7. AI Capabilities
*   **Google Gemini**: Integrated in `components/AIAssistant.tsx`.
*   **Context**: Feeds current dashboard stats (Revenue, Expenses) to the LLM to answer business questions.
*   **Configuration**: Requires API Key in `Settings`.

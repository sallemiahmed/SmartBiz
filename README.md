# SmartBiz Manager

A modern, comprehensive SaaS business management platform built with React, TypeScript, and Tailwind CSS. SmartBiz Manager integrates CRM, Inventory, Invoicing, Purchasing, and Analytics into a single, intuitive interface.

## 🚀 Key Features

### 📊 Dashboard & Analytics
- **Real-time Overview**: Instant view of Revenue, Expenses, Net Profit, and Active Clients.
- **Visual Charts**: Revenue vs. Expenses area charts and Monthly Sales bar charts using `Recharts`.
- **Trend Indicators**: Comparative percentage growth against previous periods.

### 🤖 AI-Powered Assistant
- **Google Gemini Integration**: Built-in AI assistant using the `gemini-3-pro-preview` model.
- **Context-Aware**: The AI has access to current dashboard stats, top clients, and low stock items to provide relevant business insights.
- **Thinking Mode**: Enabled with a high token budget for complex business reasoning.

### 👥 CRM (Client Relationship Management)
- **Client Database**: Manage client profiles, contact details, and status.
- **Financial Tracking**: Track total spend per client.
- **Search & Filter**: specific searching and status filtering.

### 🏪 SRM (Supplier Relationship Management)
- **Vendor Management**: Track suppliers, categories, and procurement history.
- **Contact Details**: Centralized contact information for all vendors.

### 📦 Inventory Management
- **Product Catalog**: SKU-based tracking, categorization, pricing (Cost vs. Sell Price).
- **Stock Levels**: Visual stock indicators with auto-status updates (In Stock, Low Stock, Out of Stock).
- **Valuation**: Real-time calculation of total inventory value.

### 💸 Sales Cycle Management
Complete workflow support from initial quote to final payment:
1.  **Estimates/Quotes**: Create and manage proposals. Convert them to Orders or Invoices.
2.  **Sales Orders**: Track confirmed customer orders.
3.  **Delivery Notes**: Manage shipments and deduct stock automatically upon creation.
4.  **Invoices**: Generate professional invoices, track payment status (Paid, Pending, Overdue).
5.  **Issue Notes**: Handle manual stock issuance.
- **POS-like Interface**: Visual product picker with cart functionality for creating documents.

### 🧾 Purchase Cycle Management
Procurement workflow to manage costs and stock replenishment:
1.  **Purchase Orders (PO)**: Send orders to suppliers.
2.  **Goods Received Notes (GRN)**: Receive items and automatically increase stock levels.
3.  **Supplier Invoices**: Record expenses and manage accounts payable.

### 📈 Reports & Reporting
- **Sales Reports**: Sales by Customer, VAT declarations, Transaction history.
- **Purchase Reports**: Supplier purchases, Input VAT.
- **Inventory Reports**: Product margins, Profitability analysis, Stock movement logs.
- **Financials**: Monthly profit and aging receivables.

### ⚙️ Settings & Configuration
- **Company Profile**: Manage business details, logos, and contact info.
- **Localization**:
    - **Multi-Language**: Support for English, French, and Arabic.
    - **RTL Support**: Automatic Right-to-Left layout adjustment for Arabic.
    - **Multi-Currency**: Support for USD, EUR, TND, GBP, SAR.
- **Tax Configuration**: Dynamic tax rate management (e.g., VAT 19%, Zero-rated).
- **Security**: Password management and (mock) 2FA toggle.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: @google/genai SDK
- **State Management**: React Context API

## 📂 Project Structure

- **`views/`**: Contains the main page components (Dashboard, Clients, Sales, etc.).
- **`components/`**: Reusable UI components (Sidebar, TopBar, Pagination, StatsCard).
- **`context/`**: Global state logic (`AppContext.tsx`) handling CRUD and business logic.
- **`types.ts`**: TypeScript definitions for data models.
- **`utils/`**: Helper functions, including the Invoice Print Generator.

## 🖨️ Print Generator
The app includes a dedicated print utility that generates clean, printer-friendly HTML invoices and documents, respecting the selected language (LTR/RTL) and currency settings.

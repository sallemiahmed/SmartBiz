# CLAUDE.md - SmartBiz Manager

This document provides context and guidance for AI assistants working on the SmartBiz Manager codebase.

## Project Overview

SmartBiz Manager is a comprehensive SaaS business management platform built with React, TypeScript, and Tailwind CSS. It integrates multiple business functions including CRM, Inventory, Invoicing, Purchasing, HR, and Analytics into a single unified interface.

## Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React Context API (`AppContext`)
- **Data Persistence**: Dexie.js (IndexedDB wrapper) for local storage
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (`gemini-3-pro-preview`)

### Project Structure

```
SmartBiz/
├── src/
│   ├── views/              # Main page components
│   │   ├── Dashboard.tsx   # Overview with stats and charts
│   │   ├── Clients.tsx     # CRM module
│   │   ├── Suppliers.tsx   # SRM module
│   │   ├── Products.tsx    # Inventory management
│   │   ├── Sales.tsx       # Sales cycle (Quotes, Orders, Invoices, Delivery Notes)
│   │   ├── Purchases.tsx   # Purchase cycle (POs, GRNs, Supplier Invoices)
│   │   ├── Reports.tsx     # Reporting and analytics
│   │   ├── Settings.tsx    # Configuration and preferences
│   │   └── HR/             # Human Resources module
│   │       ├── Employees.tsx
│   │       ├── Payroll.tsx
│   │       ├── LeaveManagement.tsx
│   │       └── PerformanceManagement.tsx
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── TopBar.tsx      # Top navigation with user profile
│   │   ├── Pagination.tsx  # Generic pagination component
│   │   ├── StatsCard.tsx   # Dashboard statistics card
│   │   └── ...
│   ├── context/
│   │   └── AppContext.tsx  # Global state and business logic
│   ├── services/
│   │   └── db.ts          # Dexie.js database configuration
│   ├── types.ts           # TypeScript type definitions
│   └── utils/
│       └── printGenerator.ts # Invoice/document print utility
```

## Core Concepts

### Data Models (types.ts)

Key entities:
- **Client**: Customer information with contact details and financial tracking
- **Supplier**: Vendor management with contact information
- **Product**: Inventory items with SKU, pricing, and stock levels
- **Estimate/Quote**: Sales proposals that can be converted to orders or invoices
- **SalesOrder**: Confirmed customer orders
- **DeliveryNote**: Shipment records that automatically deduct stock
- **Invoice**: Billing documents with payment status tracking
- **IssueNote**: Manual stock issuance records
- **PurchaseOrder**: Orders sent to suppliers
- **GoodsReceivedNote**: Receipt records that automatically increase stock
- **SupplierInvoice**: Supplier bills and accounts payable
- **Employee**: HR records with department, position, and compensation
- **MaintenanceContract**: Service agreements for CRM
- **Settings**: Company profile, localization, and tax configuration

### AppContext (Global State)

The `AppContext` provides:
- **Data Arrays**: All entities (clients, products, invoices, etc.)
- **CRUD Operations**: Add, update, delete functions for each entity
- **Business Logic**: Stock calculations, financial aggregations, status updates
- **Localization**: Language (en, fr, ar), currency, RTL support
- **AI Integration**: Context-aware business assistant

### Sales Cycle Workflow

1. **Estimate** → Convert to → **Sales Order** or **Invoice**
2. **Sales Order** → Generate → **Delivery Note** (deducts stock)
3. **Delivery Note** → Generate → **Invoice**
4. **Invoice** → Track payment status (Pending, Paid, Overdue)

### Purchase Cycle Workflow

1. **Purchase Order** → Send to supplier
2. **Goods Received Note** → Receive items (increases stock)
3. **Supplier Invoice** → Record expense

### Stock Management

- **Automatic Updates**:
  - Delivery Notes deduct stock
  - GRNs increase stock
  - Issue Notes deduct stock
- **Status Indicators**: In Stock (>20), Low Stock (1-20), Out of Stock (0)
- **Real-time Valuation**: Total inventory value based on cost price

## Key Features

### 1. Multi-Language Support
- Languages: English (en), French (fr), Arabic (ar)
- RTL layout automatically enabled for Arabic
- All UI strings should be localizable

### 2. Multi-Currency Support
- Supported currencies: USD, EUR, TND, GBP, SAR
- Currency symbols and formatting handled throughout the app

### 3. AI Assistant
- Powered by Google Gemini API
- Context-aware: Has access to dashboard stats, clients, and inventory
- Thinking mode enabled for complex reasoning
- Provides business insights and recommendations

### 4. Print Generator
- Generates printer-friendly HTML documents
- Respects language direction (LTR/RTL)
- Supports invoices, delivery notes, and other business documents

### 5. Reports & Analytics
- Sales reports: by customer, VAT declarations, transaction history
- Purchase reports: supplier analysis, input VAT
- Inventory reports: margins, profitability, stock movements
- Financial reports: P&L, aging receivables

### 6. HR Management
- Employee records with department and position tracking
- Payroll management with salary calculations
- Leave management system
- Performance evaluations and reviews

## Development Guidelines

### Adding New Features

1. **Define Types**: Add TypeScript interfaces in `types.ts`
2. **Update AppContext**: Add state arrays and CRUD operations
3. **Create View Component**: Add page component in `views/`
4. **Add Navigation**: Update Sidebar navigation links
5. **Implement Business Logic**: Add calculations and validations in AppContext
6. **Add Dexie Tables**: Update `services/db.ts` if persistence is needed

### Code Conventions

- Use TypeScript for all new code
- Follow React hooks best practices
- Use Tailwind CSS utility classes for styling
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks or utils
- Maintain consistent naming conventions

### State Management Pattern

```typescript
// AppContext pattern for CRUD operations
const addEntity = (entity: EntityType) => {
  setEntities([...entities, { ...entity, id: generateId() }]);
};

const updateEntity = (id: string, updates: Partial<EntityType>) => {
  setEntities(entities.map(e => e.id === id ? { ...e, ...updates } : e));
};

const deleteEntity = (id: string) => {
  setEntities(entities.filter(e => e.id !== id));
};
```

### Localization Pattern

Settings context provides:
- `language`: Current language code
- `currency`: Current currency code
- `isRTL`: Boolean for RTL layout
- Tax rates and company profile

## Important Notes for AI Assistants

1. **Data Persistence**: The app uses Dexie.js for local storage. Check `services/db.ts` for database schema.

2. **Stock Updates**: When creating Delivery Notes, GRNs, or Issue Notes, ensure stock quantities are updated automatically.

3. **Document Conversion**: When converting Estimates to Orders or Invoices, maintain item details and customer information.

4. **Financial Calculations**:
   - Net Sales = Total - VAT
   - Gross Profit = Revenue - COGS
   - Respect tax rates from settings

5. **Validation**: Always validate required fields before creating/updating entities.

6. **Status Management**: Auto-update document status (e.g., invoices become "Overdue" after due date).

7. **Relationships**: Maintain relationships between entities (e.g., delivery note → invoice, PO → GRN).

## Testing Considerations

- Test multi-language switching (especially RTL)
- Verify stock calculations after transactions
- Test document conversions (estimate → order → invoice)
- Validate financial calculations and reports
- Test AI assistant responses with different contexts

## Common Tasks

### Adding a New Document Type
1. Define type in `types.ts`
2. Add state array in AppContext
3. Create CRUD functions
4. Add view component with list and form
5. Add navigation link
6. Update print generator if needed

### Modifying Business Logic
1. Locate logic in AppContext
2. Update calculation/validation functions
3. Test with existing data
4. Update dependent components

### Adding Localization
1. Update language check in Settings
2. Add translations for UI strings
3. Test RTL layout if applicable

## Recent Changes

- Added HR management module with Employees, Payroll, Leave Management, and Performance Management
- Integrated Dexie.js for persistent local storage
- Added CRM Maintenance Contracts feature
- Implemented performance management with reviews and evaluations
- Fixed net sales calculation to properly subtract VAT

## Support & Resources

- React 19 Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Dexie.js: https://dexie.org
- Recharts: https://recharts.org


import { Language } from '../types';

const enXml = `<?xml version="1.0" encoding="UTF-8"?>
<resources>
    <!-- Sidebar -->
    <string name="dashboard">Dashboard</string>
    <string name="clients">Clients</string>
    <string name="suppliers">Suppliers</string>
    <string name="sales">Sales</string>
    <string name="purchases">Purchases</string>
    <string name="inventory">Inventory</string>
    <string name="documents">Documents</string>
    <string name="reports">Reports</string>
    <string name="settings">Settings</string>
    <string name="banking">Banking</string>
    <string name="cash_register">Cash Register</string>
    <string name="cost_analysis">Cost Analysis</string>

    <!-- Submenus -->
    <string name="estimate">Estimate</string>
    <string name="client_order">Client Order</string>
    <string name="delivery_note">Delivery Note</string>
    <string name="invoice">Invoice</string>
    <string name="issue_note">Issue Note</string>
    <string name="supplier_order">Supplier Order</string>
    <string name="supplier_delivery">Supplier Delivery</string>
    <string name="supplier_invoice">Supplier Invoice</string>
    
    <!-- Inventory Submenus -->
    <string name="products">Products</string>
    <string name="warehouses">Warehouses</string>
    <string name="stock_transfers">Stock Transfers</string>

    <!-- Banking Submenus -->
    <string name="overview">Overview</string>
    <string name="accounts">Accounts</string>
    <string name="transactions">Transactions</string>

    <!-- Cost Analysis -->
    <string name="cost_analysis_title">Real Cost &amp; Profitability</string>
    <string name="cost_analysis_desc">Analyze Product Costs, COGS, and Margins based on real stock movements.</string>
    <string name="avg_cost">Avg. Unit Cost</string>
    <string name="selling_price">Selling Price</string>
    <string name="margin_percent">Margin %</string>
    <string name="cogs">COGS</string>
    <string name="total_inventory_value">Inventory Value</string>
    <string name="potential_profit">Potential Profit</string>
    <string name="cost_simulation">Cost Simulator</string>
    <string name="sim_purchase_qty">Purchase Qty</string>
    <string name="sim_unit_price">Unit Price</string>
    <string name="sim_additional_cost">Extra Costs (Shipping/Tax)</string>
    <string name="sim_calculate">Calculate New Cost</string>
    <string name="sim_new_cost">Estimated New Unit Cost</string>
    <string name="additional_expenses">Additional Expenses (Freight/Tax)</string>

    <!-- Dashboard -->
    <string name="dashboard_overview">Dashboard Overview</string>
    <string name="welcome_message">Welcome back! Here's what's happening today.</string>
    <string name="export_report">Export Report</string>
    <string name="new_invoice">New Invoice</string>
    <string name="revenue_vs_expenses">Revenue vs Expenses</string>
    <string name="monthly_sales">Monthly Sales</string>
    <string name="total_revenue">Total Revenue</string>
    <string name="total_expenses">Total Expenses</string>
    <string name="net_profit">Net Profit</string>
    <string name="active_clients">Active Clients</string>

    <!-- Clients -->
    <string name="client_management">Client Management</string>
    <string name="client_desc">Manage your customer relationships.</string>
    <string name="add_client">Add Client</string>
    <string name="search_clients">Search by company, name or email...</string>
    <string name="contact_details">Contact Details</string>
    <string name="total_spent">Total Spent</string>
    <string name="no_clients">No clients found matching your search.</string>
    <string name="company_contact">Company / Contact</string>
    <string name="edit_client">Edit Client</string>
    <string name="client_details">Client Details</string>

    <!-- Suppliers -->
    <string name="supplier_management">Supplier Management</string>
    <string name="supplier_desc">Manage your vendor relationships and procurement.</string>
    <string name="add_supplier">Add Supplier</string>
    <string name="add_new_supplier">Add New Supplier</string>
    <string name="search_suppliers">Search by company or contact name...</string>
    <string name="total_purchased">Total Purchased</string>
    <string name="no_suppliers">No suppliers found matching your criteria.</string>
    <string name="contact_name">Contact Name</string>
    <string name="delete_supplier_title">Delete Supplier?</string>
    <string name="delete_supplier_msg">Are you sure you want to delete this supplier? This action cannot be undone.</string>

    <!-- Inventory -->
    <string name="inventory_management">Inventory Management</string>
    <string name="inventory_desc">Track stock levels, value, and product details.</string>
    <string name="add_product">Add Product</string>
    <string name="total_products">Total Products</string>
    <string name="needs_attention">Needs Attention</string>
    <string name="total_value">Total Inventory Value</string>
    <string name="search_products">Search by name, SKU or category...</string>
    <string name="product_name">Product Name</string>
    <string name="sku">SKU</string>
    <string name="category">Category</string>
    <string name="stock_level">Stock Level</string>
    <string name="price">Price</string>
    <string name="cost">Cost</string>
    <string name="stock_qty">Stock Qty</string>
    <string name="no_products">No products found matching your search.</string>
    <string name="edit_product">Edit Product</string>
    <string name="product_history">Product History</string>
    <string name="movement_type">Movement Type</string>
    <string name="reference">Reference</string>
    <string name="reason">Reason</string>
    <string name="quantity">Quantity</string>
    <string name="purchase">Purchase</string>
    <string name="sale">Sale</string>
    <string name="transfer_in">Transfer In</string>
    <string name="transfer_out">Transfer Out</string>
    <string name="adjustment">Adjustment</string>
    <string name="return">Return</string>
    <string name="initial">Initial Stock</string>

    <!-- Documents -->
    <string name="documents_history">Documents History</string>
    <string name="documents_desc">View and manage all sales documents.</string>
    <string name="search_documents">Search documents by # or client...</string>
    <string name="ref_num">Ref #</string>
    <string name="type">Type</string>
    <string name="client">Client</string>
    <string name="date">Date</string>
    <string name="due_date">Due Date</string>
    <string name="amount">Amount</string>
    <string name="no_documents">No documents found matching criteria.</string>

    <!-- Sales Pages -->
    <string name="catalog">Catalog</string>
    <string name="cart">Current Sale</string>
    <string name="select_customer">Select Customer...</string>
    <string name="subtotal">Subtotal</string>
    <string name="discount">Discount</string>
    <string name="tax">Tax</string>
    <string name="clear">Clear</string>
    <string name="success">Success!</string>
    <string name="print">Print</string>
    <string name="custom_item">Custom Item</string>
    <string name="add_custom_item">Add Custom Item</string>
    <string name="item_name">Item Name</string>
    <string name="save_estimate">Save Estimate</string>
    <string name="confirm_order">Confirm Order</string>
    <string name="create_delivery">Create Delivery Note</string>
    <string name="charge_create">Charge &amp; Create Invoice</string>
    <string name="payment_terms">Payment Terms</string>
    <string name="payment_method">Payment Method</string>
    <string name="notes_conditions">Notes / Conditions</string>
    <string name="due_on_receipt">Due on Receipt</string>
    <string name="bank_transfer">Bank Transfer</string>
    <string name="cash">Cash</string>
    <string name="check">Check</string>

    <string name="estimates_quotes">Estimates / Quotes</string>
    <string name="estimates_desc">Manage client quotations and proposals.</string>
    <string name="new_estimate">New Estimate</string>
    <string name="search_estimates">Search estimates...</string>
    <string name="estimate_details">Estimate Details</string>
    <string name="issued_date">Issued Date</string>
    <string name="valid_until">Valid Until</string>
    <string name="convert_to_order">Convert to Order</string>
    <string name="convert_to_invoice">Convert to Invoice</string>

    <string name="sales_orders">Sales Orders</string>
    <string name="sales_orders_desc">Manage customer orders.</string>
    <string name="new_order">New Order</string>
    <string name="search_orders">Search by order # or client...</string>
    <string name="order_details">Order Details</string>
    <string name="generate_invoice">Generate Invoice</string>

    <string name="delivery_notes">Delivery Notes</string>
    <string name="delivery_notes_desc">Track shipments and delivery status.</string>
    <string name="new_delivery">New Delivery</string>
    <string name="search_deliveries">Search delivery notes...</string>
    <string name="delivery_details">Delivery Details</string>
    <string name="shipped_date">Shipped Date</string>
    <string name="shipped_items">Shipped Items</string>

    <string name="sales_invoices">Sales Invoices</string>
    <string name="sales_invoices_desc">Manage issued invoices and payments.</string>
    <string name="new_invoice_btn">New Invoice</string>
    <string name="search_invoices">Search invoices...</string>
    <string name="invoice_details">Invoice Details</string>
    <string name="mark_paid">Mark Paid</string>
    <string name="print_invoice">Print Invoice</string>

    <string name="issue_notes">Issue Notes</string>
    <string name="issue_notes_desc">Manage stock issues and manual outbound notes.</string>
    <string name="new_issue_note">New Issue Note</string>
    <string name="search_issue_notes">Search issue notes...</string>
    <string name="issue_note_details">Issue Note Details</string>
    <string name="recipient">Recipient</string>
    <string name="issued_items">Issued Items</string>

    <!-- Purchase Pages -->
    <string name="purchase_orders">Purchase Orders</string>
    <string name="purchase_orders_desc">Manage supplier orders and procurement.</string>
    <string name="new_po">New PO</string>
    <string name="search_pos">Search by PO # or supplier...</string>
    <string name="po_details">PO Details</string>

    <string name="goods_received_grn">Goods Received (GRN)</string>
    <string name="goods_received_desc">Track incoming stock deliveries from suppliers.</string>
    <string name="receive_goods">Receive Goods</string>
    <string name="search_grns">Search GRNs...</string>
    <string name="date_received">Date Received</string>
    <string name="received_items">Received Items</string>

    <string name="purchase_invoices">Purchase Invoices</string>
    <string name="purchase_invoices_desc">Manage supplier invoices and expenses.</string>
    <string name="register_invoice">Register Invoice</string>
    <string name="search_purchase_invoices">Search by Invoice # or supplier...</string>

    <!-- Reports -->
    <string name="reports_analytics">Reports &amp; Analytics</string>
    <string name="reports_desc">Select a category to view detailed metrics.</string>
    <string name="sales_report">Sales Report</string>
    <string name="purchase_report">Purchase Report</string>
    <string name="inventory_stock_report">Inventory &amp; Stock</string>
    <string name="financials_report">Financials</string>
    <string name="rep_sales_customer">Sales by Customer (Summary)</string>
    <string name="rep_sales_customer_detailed">Detailed Customer Analysis</string>
    <string name="rep_sales_product_detailed">Detailed Product Analysis</string>
    <string name="rep_sales_vat">Sales VAT</string>
    <string name="rep_cust_trans">Customer Transactions</string>
    <string name="rep_supp_purch">Suppliers Purchases</string>
    <string name="rep_purch_vat">Purchase VAT</string>
    <string name="rep_stock_mov">Stock Movements</string>
    <string name="rep_prod_perf">Product Performance</string>
    <string name="rep_monthly_profit">Monthly Profit</string>
    <string name="rep_aging_receivables">Aging Receivables</string>
    <string name="salesperson">Salesperson</string>
    <string name="region">Region</string>
    <string name="margin">Margin</string>
    <string name="avg_price">Avg. Price</string>
    <string name="total_sold">Total Sold</string>
    <string name="invoices_count">Invoices</string>
    <string name="balance_due">Balance Due</string>

    <!-- Settings -->
    <string name="general">General</string>
    <string name="profile">Profile</string>
    <string name="security">Security</string>
    <string name="billing">Billing</string>
    <string name="notifications">Notifications</string>
    <string name="company_details">Company Details</string>
    <string name="company_name">Company Name</string>
    <string name="company_email">Company Email</string>
    <string name="company_phone">Company Phone</string>
    <string name="company_vat_id">Company VAT / Tax ID</string>
    <string name="address">Address</string>
    <string name="localization">Localization &amp; Preferences</string>
    <string name="language">Language</string>
    <string name="currency">Currency</string>
    <string name="timezone">Timezone</string>
    <string name="tax_configuration">Tax Configuration</string>
    <string name="tax_rates_list">Configured Tax Rates</string>
    <string name="rate_name">Name (e.g. VAT)</string>
    <string name="rate_value">Rate (%)</string>
    <string name="add_rate">Add Rate</string>
    <string name="save_changes">Save Changes</string>
    <string name="settings_saved">Settings Saved Successfully</string>
    <string name="manage_preferences">Manage your preferences and company information.</string>
    <string name="password_auth">Password &amp; Authentication</string>
    <string name="current_password">Current Password</string>
    <string name="new_password">New Password</string>
    <string name="confirm_password">Confirm New Password</string>
    <string name="two_factor_auth">Two-Factor Authentication</string>
    <string name="secure_account">Secure your account</string>
    <string name="secure_account_desc">Add an extra layer of security to your account.</string>
    <string name="enable_2fa">Enable 2FA</string>
    <string name="disable_2fa">Disable 2FA</string>
    <string name="personal_information">Personal Information</string>
    <string name="email_notifications">Email Notifications</string>
    <string name="change_avatar">Change Avatar</string>
    <string name="full_name">Full Name</string>
    <string name="email_address">Email Address</string>
    <string name="role">Role</string>
    <string name="ai_integration">AI Integration</string>
    <string name="gemini_api_key">Google Gemini API Key</string>

    <!-- Banking -->
    <string name="bank_management">Bank Management</string>
    <string name="bank_desc">Track bank accounts, transactions, and perform reconciliations.</string>
    <string name="add_account">Add Account</string>
    <string name="total_liquidity">Total Liquidity</string>
    <string name="account_name">Account Name</string>
    <string name="bank_name">Bank Name</string>
    <string name="account_number">Account Number</string>
    <string name="balance">Balance</string>
    <string name="add_transaction">Add Transaction</string>
    <string name="transaction_history">Transaction History</string>
    <string name="reconcile">Reconcile</string>
    <string name="description">Description</string>
    <string name="deposit">Deposit</string>
    <string name="withdrawal">Withdrawal</string>
    <string name="transfer">Transfer</string>
    <string name="fee">Fee</string>
    <string name="payment">Payment</string>
    <string name="cleared">Cleared</string>
    <string name="reconciled">Reconciled</string>
    <string name="new_account">New Account</string>
    <string name="edit_account">Edit Account</string>
    <string name="delete_account_confirm_msg">Are you sure you want to delete this account? This will not delete associated transactions from history, but may affect reports.</string>
    <string name="account_type">Account Type</string>
    <string name="checking">Checking</string>
    <string name="savings">Savings</string>
    <string name="credit">Credit</string>
    <string name="investment">Investment</string>
    <string name="initial_balance">Initial Balance</string>
    <string name="no_transactions">No transactions found.</string>
    <string name="no_accounts">No accounts found.</string>

    <!-- Cash Register -->
    <string name="cash_register_management">Cash Register</string>
    <string name="cash_desc">Manage daily cash shifts, sales, and petty cash expenses.</string>
    <string name="open_register">Open Register</string>
    <string name="close_register">Close Register</string>
    <string name="current_session">Current Session</string>
    <string name="register_closed">Register Closed</string>
    <string name="opening_amount">Opening Amount</string>
    <string name="expected_cash">Expected Cash</string>
    <string name="closing_amount">Closing Amount</string>
    <string name="difference">Difference</string>
    <string name="add_cash">Add Cash</string>
    <string name="remove_cash">Remove Cash</string>
    <string name="session_history">Session History</string>
    <string name="opened_at">Opened At</string>
    <string name="closed_at">Closed At</string>
    <string name="movement_log">Movement Log</string>
    <string name="reason">Reason</string>

    <!-- Common / Status -->
    <string name="search">Search...</string>
    <string name="new">New</string>
    <string name="view_details">View Details</string>
    <string name="delete">Delete</string>
    <string name="edit">Edit</string>
    <string name="status">Status</string>
    <string name="actions">Actions</string>
    <string name="total">Total</string>
    <string name="cancel">Cancel</string>
    <string name="save">Save</string>
    <string name="ask_ai">Ask AI</string>
    <string name="ai_greeting">Hello! I'm your SmartBiz AI assistant. I have access to your current dashboard data. How can I help you today?</string>
    <string name="ai_placeholder">Ask complex business questions...</string>
    <string name="ai_error_generic">I'm having trouble connecting to the AI service right now.</string>
    <string name="ai_error_config">Please configure your Google Gemini API key in Settings > General.</string>
    
    <string name="all_status">All Status</string>
    <string name="all_categories">All Categories</string>
    <string name="all_types">All Types</string>
    
    <string name="active">Active</string>
    <string name="inactive">Inactive</string>
    <string name="paid">Paid</string>
    <string name="pending">Pending</string>
    <string name="overdue">Overdue</string>
    <string name="draft">Draft</string>
    <string name="completed">Completed</string>
    <string name="received">Received</string>
    <string name="in_stock">In Stock</string>
    <string name="low_stock">Low Stock</string>
    <string name="out_of_stock">Out of Stock</string>
    
    <string name="delete_confirm_title">Delete Item?</string>
    <string name="delete_confirm_msg">Are you sure you want to delete this item? This action cannot be undone.</string>
    <string name="yes_delete">Yes, Delete</string>

    <!-- Warehouses -->
    <string name="warehouse_management">Warehouse Management</string>
    <string name="warehouses">Warehouses</string>
    <string name="warehouse">Warehouse</string>
    <string name="warehouse_name">Warehouse Name</string>
    <string name="add_warehouse">Add Warehouse</string>
    <string name="edit_warehouse">Edit Warehouse</string>
    <string name="warehouse_locations">Warehouse Locations</string>
    <string name="location">Location</string>
    <string name="default_warehouse">Default</string>
    <string name="transfer_stock">Transfer Stock</string>
    <string name="stock_transfer">Stock Transfer</string>
    <string name="stock_transfers">Stock Transfers</string>
    <string name="source_warehouse">Source Warehouse</string>
    <string name="destination_warehouse">Destination Warehouse</string>
    <string name="from">From</string>
    <string name="to">To</string>
    <string name="products_list">Products List</string>
    <string name="product">Product</string>
    <string name="quantity">Quantity</string>
    <string name="notes">Notes</string>
    <string name="transfer_reason">Reason for transfer</string>
    <string name="confirm_transfer">Confirm Transfer</string>
    <string name="added_to_default_warehouse">Added to Default Warehouse</string>
    <string name="stock_edit_warning">Stock quantity cannot be edited directly here to maintain integrity. Use "Transfer Stock" or create Purchase Orders to adjust stock levels.</string>
    
    <!-- Custom Fields -->
    <string name="custom_fields">Custom Fields</string>
    <string name="field_label">Field Label</string>
    <string name="field_type">Field Type</string>
    <string name="text">Text</string>
    <string name="number">Number</string>
    <string name="date_type">Date</string>
    <string name="boolean">Yes/No</string>
    <string name="yes">Yes</string>
    <string name="no">No</string>
    <string name="add">Add</string>
    <string name="client_fields">Client Fields</string>
    <string name="supplier_fields">Supplier Fields</string>
    <string name="no_custom_fields">No custom fields defined.</string>
</resources>`;

const frXml = `<?xml version="1.0" encoding="UTF-8"?>
<resources>
    <!-- Sidebar -->
    <string name="dashboard">Tableau de bord</string>
    <string name="clients">Clients</string>
    <string name="suppliers">Fournisseurs</string>
    <string name="sales">Ventes</string>
    <string name="purchases">Achats</string>
    <string name="inventory">Stock</string>
    <string name="documents">Documents</string>
    <string name="reports">Rapports</string>
    <string name="settings">Paramètres</string>
    <string name="banking">Banque</string>
    <string name="cash_register">Caisse</string>
    <string name="cost_analysis">Coûts &amp; Marge</string>

    <!-- Submenus -->
    <string name="estimate">Devis</string>
    <string name="client_order">Commande Client</string>
    <string name="delivery_note">Bon de Livraison</string>
    <string name="invoice">Facture</string>
    <string name="issue_note">Bon de Sortie</string>
    <string name="supplier_order">Commande Fourn.</string>
    <string name="supplier_delivery">Bon de Réception</string>
    <string name="supplier_invoice">Facture Fourn.</string>

    <!-- Inventory Submenus -->
    <string name="products">Produits</string>
    <string name="warehouses">Entrepôts</string>
    <string name="stock_transfers">Transferts de Stock</string>

    <!-- Banking Submenus -->
    <string name="overview">Vue d'ensemble</string>
    <string name="accounts">Comptes</string>
    <string name="transactions">Transactions</string>

    <!-- Cost Analysis -->
    <string name="cost_analysis_title">Analyse des Coûts</string>
    <string name="cost_analysis_desc">Analysez les coûts produits, le COGS et les marges basés sur les mouvements réels.</string>
    <string name="avg_cost">Coût Moyen Unitaire</string>
    <string name="selling_price">Prix de Vente</string>
    <string name="margin_percent">Marge %</string>
    <string name="cogs">COGS (Coût des Ventes)</string>
    <string name="total_inventory_value">Valeur du Stock</string>
    <string name="potential_profit">Profit Potentiel</string>
    <string name="cost_simulation">Simulateur de Coût</string>
    <string name="sim_purchase_qty">Qté Achat</string>
    <string name="sim_unit_price">Prix Unitaire</string>
    <string name="sim_additional_cost">Frais (Transport/Taxe)</string>
    <string name="sim_calculate">Calculer Nouveau Coût</string>
    <string name="sim_new_cost">Nouveau Coût Estimé</string>
    <string name="additional_expenses">Frais Supplémentaires</string>

    <!-- Dashboard -->
    <string name="dashboard_overview">Vue d'ensemble</string>
    <string name="welcome_message">Bon retour ! Voici ce qui se passe aujourd'hui.</string>
    <string name="export_report">Exporter Rapport</string>
    <string name="new_invoice">Nouvelle Facture</string>
    <string name="revenue_vs_expenses">Revenus vs Dépenses</string>
    <string name="monthly_sales">Ventes Mensuelles</string>
    <string name="total_revenue">Revenu Total</string>
    <string name="total_expenses">Dépenses Totales</string>
    <string name="net_profit">Bénéfice Net</string>
    <string name="active_clients">Clients Actifs</string>

    <!-- Clients -->
    <string name="client_management">Gestion des Clients</string>
    <string name="client_desc">Gérez vos relations clients.</string>
    <string name="add_client">Ajouter Client</string>
    <string name="search_clients">Chercher par société, nom ou email...</string>
    <string name="contact_details">Coordonnées</string>
    <string name="total_spent">Total Dépensé</string>
    <string name="no_clients">Aucun client trouvé.</string>
    <string name="company_contact">Société / Contact</string>
    <string name="edit_client">Modifier Client</string>
    <string name="client_details">Détails Client</string>

    <!-- Suppliers -->
    <string name="supplier_management">Gestion Fournisseurs</string>
    <string name="supplier_desc">Gérez vos relations fournisseurs et achats.</string>
    <string name="add_supplier">Ajouter Fournisseur</string>
    <string name="add_new_supplier">Ajouter Nouveau Fournisseur</string>
    <string name="search_suppliers">Chercher par société ou contact...</string>
    <string name="total_purchased">Total Acheté</string>
    <string name="no_suppliers">Aucun fournisseur trouvé.</string>
    <string name="contact_name">Nom du Contact</string>
    <string name="delete_supplier_title">Supprimer Fournisseur ?</string>
    <string name="delete_supplier_msg">Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.</string>

    <!-- Inventory -->
    <string name="inventory_management">Gestion de Stock</string>
    <string name="inventory_desc">Suivi des niveaux de stock et détails produits.</string>
    <string name="add_product">Ajouter Produit</string>
    <string name="total_products">Total Produits</string>
    <string name="needs_attention">Nécessite Attention</string>
    <string name="total_value">Valeur Totale Stock</string>
    <string name="search_products">Chercher par nom, SKU ou catégorie...</string>
    <string name="product_name">Nom du Produit</string>
    <string name="sku">SKU</string>
    <string name="category">Catégorie</string>
    <string name="stock_level">Niveau Stock</string>
    <string name="price">Prix</string>
    <string name="cost">Coût</string>
    <string name="stock_qty">Qté Stock</string>
    <string name="no_products">Aucun produit trouvé.</string>
    <string name="edit_product">Modifier Produit</string>
    <string name="product_history">Historique Produit</string>
    <string name="movement_type">Type Mouvement</string>
    <string name="reference">Référence</string>
    <string name="reason">Motif</string>
    <string name="quantity">Quantité</string>
    <string name="purchase">Achat</string>
    <string name="sale">Vente</string>
    <string name="transfer_in">Transfert Entrant</string>
    <string name="transfer_out">Transfert Sortant</string>
    <string name="adjustment">Ajustement</string>
    <string name="return">Retour</string>
    <string name="initial">Stock Initial</string>

    <!-- Documents -->
    <string name="documents_history">Historique Documents</string>
    <string name="documents_desc">Voir et gérer tous les documents de vente.</string>
    <string name="search_documents">Chercher par n° ou client...</string>
    <string name="ref_num">Réf #</string>
    <string name="type">Type</string>
    <string name="client">Client</string>
    <string name="date">Date</string>
    <string name="due_date">Échéance</string>
    <string name="amount">Montant</string>
    <string name="no_documents">Aucun document trouvé.</string>

    <!-- Sales Pages -->
    <string name="catalog">Catalogue</string>
    <string name="cart">Vente en cours</string>
    <string name="select_customer">Sélectionner Client...</string>
    <string name="subtotal">Sous-total</string>
    <string name="discount">Remise</string>
    <string name="tax">Taxe</string>
    <string name="clear">Effacer</string>
    <string name="success">Succès !</string>
    <string name="print">Imprimer</string>
    <string name="custom_item">Article Personnalisé</string>
    <string name="add_custom_item">Ajouter Article</string>
    <string name="item_name">Nom de l'article</string>
    <string name="save_estimate">Enregistrer Devis</string>
    <string name="confirm_order">Confirmer Commande</string>
    <string name="create_delivery">Créer Bon Livraison</string>
    <string name="charge_create">Facturer &amp; Créer</string>
    <string name="payment_terms">Conditions de Paiement</string>
    <string name="payment_method">Moyen de Paiement</string>
    <string name="notes_conditions">Notes / Conditions</string>
    <string name="due_on_receipt">À réception</string>
    <string name="bank_transfer">Virement</string>
    <string name="cash">Espèces</string>
    <string name="check">Chèque</string>

    <string name="estimates_quotes">Devis / Estimations</string>
    <string name="estimates_desc">Gérez les devis et propositions clients.</string>
    <string name="new_estimate">Nouveau Devis</string>
    <string name="search_estimates">Rechercher devis...</string>
    <string name="estimate_details">Détails du Devis</string>
    <string name="issued_date">Date d'émission</string>
    <string name="valid_until">Valable jusqu'au</string>
    <string name="convert_to_order">Convertir en Commande</string>
    <string name="convert_to_invoice">Convertir en Facture</string>

    <string name="sales_orders">Commandes Clients</string>
    <string name="sales_orders_desc">Gérez les commandes clients.</string>
    <string name="new_order">Nouvelle Commande</string>
    <string name="search_orders">Chercher commande ou client...</string>
    <string name="order_details">Détails de la Commande</string>
    <string name="generate_invoice">Générer Facture</string>

    <string name="delivery_notes">Bons de Livraison</string>
    <string name="delivery_notes_desc">Suivi des expéditions et livraisons.</string>
    <string name="new_delivery">Nouveau Bon de Livraison</string>
    <string name="search_deliveries">Rechercher bons de livraison...</string>
    <string name="delivery_details">Détails Livraison</string>
    <string name="shipped_date">Date d'expédition</string>
    <string name="shipped_items">Articles Expédiés</string>

    <string name="sales_invoices">Factures de Vente</string>
    <string name="sales_invoices_desc">Gérez les factures émises et paiements.</string>
    <string name="new_invoice_btn">Nouvelle Facture</string>
    <string name="search_invoices">Rechercher factures...</string>
    <string name="invoice_details">Détails de la Facture</string>
    <string name="mark_paid">Marquer comme Payé</string>
    <string name="print_invoice">Imprimer Facture</string>

    <string name="issue_notes">Bons de Sortie</string>
    <string name="issue_notes_desc">Gérez les sorties de stock manuelles.</string>
    <string name="new_issue_note">Nouveau Bon de Sortie</string>
    <string name="search_issue_notes">Rechercher bons de sortie...</string>
    <string name="issue_note_details">Détails Bon de Sortie</string>
    <string name="recipient">Destinataire</string>
    <string name="issued_items">Articles Sortis</string>

    <!-- Purchase Pages -->
    <string name="purchase_orders">Commandes Fournisseurs</string>
    <string name="purchase_orders_desc">Gérez les commandes aux fournisseurs.</string>
    <string name="new_po">Nouvelle Commande</string>
    <string name="search_pos">Chercher par n° ou fournisseur...</string>
    <string name="po_details">Détails Commande</string>

    <string name="goods_received_grn">Réception Marchandises (BR)</string>
    <string name="goods_received_desc">Suivi des arrivages de stock fournisseurs.</string>
    <string name="receive_goods">Recevoir Marchandises</string>
    <string name="search_grns">Rechercher bons réception...</string>
    <string name="date_received">Date Réception</string>
    <string name="received_items">Articles Reçus</string>

    <string name="purchase_invoices">Factures Fournisseurs</string>
    <string name="purchase_invoices_desc">Gérez les factures fournisseurs et dépenses.</string>
    <string name="register_invoice">Enregistrer Facture</string>
    <string name="search_purchase_invoices">Chercher facture ou fournisseur...</string>

    <!-- Reports -->
    <string name="reports_analytics">Rapports et Analyses</string>
    <string name="reports_desc">Sélectionnez une catégorie pour voir les détails.</string>
    <string name="sales_report">Rapport des Ventes</string>
    <string name="purchase_report">Rapport des Achats</string>
    <string name="inventory_stock_report">Inventaire et Stock</string>
    <string name="financials_report">Finances</string>
    <string name="rep_sales_customer">Ventes par Client (Sommaire)</string>
    <string name="rep_sales_customer_detailed">Analyse Client Détaillée</string>
    <string name="rep_sales_product_detailed">Analyse Produit Détaillée</string>
    <string name="rep_sales_vat">TVA sur Ventes</string>
    <string name="rep_cust_trans">Transactions Client</string>
    <string name="rep_supp_purch">Achats par Fournisseur</string>
    <string name="rep_purch_vat">TVA sur Achats</string>
    <string name="rep_stock_mov">Mouvements de Stock</string>
    <string name="rep_prod_perf">Performance Produits</string>
    <string name="rep_monthly_profit">Profit Mensuel</string>
    <string name="rep_aging_receivables">Créances Clients</string>
    <string name="salesperson">Vendeur</string>
    <string name="region">Région</string>
    <string name="margin">Marge</string>
    <string name="avg_price">Prix Moyen</string>
    <string name="total_sold">Total Vendu</string>
    <string name="invoices_count">Factures</string>
    <string name="balance_due">Solde Dû</string>

    <!-- Settings -->
    <string name="general">Général</string>
    <string name="profile">Profil</string>
    <string name="security">Sécurité</string>
    <string name="billing">Facturation</string>
    <string name="notifications">Notifications</string>
    <string name="company_details">Détails de l'entreprise</string>
    <string name="company_name">Nom de l'entreprise</string>
    <string name="company_email">Email</string>
    <string name="company_phone">Téléphone</string>
    <string name="company_vat_id">Numéro de TVA / MF</string>
    <string name="address">Adresse</string>
    <string name="localization">Localisation &amp; Préférences</string>
    <string name="language">Langue</string>
    <string name="currency">Devise</string>
    <string name="timezone">Fuseau horaire</string>
    <string name="tax_configuration">Configuration des taxes</string>
    <string name="tax_rates_list">Taux de taxe configurés</string>
    <string name="rate_name">Nom (ex. TVA)</string>
    <string name="rate_value">Taux (%)</string>
    <string name="add_rate">Ajouter un taux</string>
    <string name="save_changes">Enregistrer</string>
    <string name="settings_saved">Paramètres enregistrés</string>
    <string name="manage_preferences">Gérez vos préférences et les informations de l'entreprise.</string>
    <string name="password_auth">Mot de passe et authentification</string>
    <string name="current_password">Mot de passe actuel</string>
    <string name="new_password">Nouveau mot de passe</string>
    <string name="confirm_password">Confirmer le nouveau mot de passe</string>
    <string name="two_factor_auth">Authentification à deux facteurs</string>
    <string name="secure_account">Sécurisez votre compte</string>
    <string name="secure_account_desc">Ajoutez une couche de sécurité supplémentaire.</string>
    <string name="enable_2fa">Activer A2F</string>
    <string name="disable_2fa">Désactiver A2F</string>
    <string name="personal_information">Informations Personnelles</string>
    <string name="email_notifications">Notifications par Email</string>
    <string name="change_avatar">Changer Avatar</string>
    <string name="full_name">Nom Complet</string>
    <string name="email_address">Adresse Email</string>
    <string name="role">Rôle</string>
    <string name="ai_integration">Intégration IA</string>
    <string name="gemini_api_key">Clé API Google Gemini</string>

    <!-- Banking -->
    <string name="bank_management">Gestion Bancaire</string>
    <string name="bank_desc">Suivi des comptes, transactions et rapprochements bancaires.</string>
    <string name="add_account">Ajouter Compte</string>
    <string name="total_liquidity">Liquidité Totale</string>
    <string name="account_name">Nom du Compte</string>
    <string name="bank_name">Banque</string>
    <string name="account_number">Numéro de Compte</string>
    <string name="balance">Solde</string>
    <string name="add_transaction">Ajouter Transaction</string>
    <string name="transaction_history">Historique</string>
    <string name="reconcile">Rapprocher</string>
    <string name="description">Description</string>
    <string name="deposit">Dépôt</string>
    <string name="withdrawal">Retrait</string>
    <string name="transfer">Virement</string>
    <string name="fee">Frais</string>
    <string name="payment">Paiement</string>
    <string name="cleared">Effectué</string>
    <string name="reconciled">Lettré</string>
    <string name="new_account">Nouveau Compte</string>
    <string name="edit_account">Modifier Compte</string>
    <string name="delete_account_confirm_msg">Êtes-vous sûr de vouloir supprimer ce compte ? Cela n'effacera pas l'historique des transactions mais peut affecter les rapports.</string>
    <string name="account_type">Type de Compte</string>
    <string name="checking">Courant</string>
    <string name="savings">Épargne</string>
    <string name="credit">Crédit</string>
    <string name="investment">Investissement</string>
    <string name="initial_balance">Solde Initial</string>
    <string name="no_transactions">Aucune transaction trouvée.</string>
    <string name="no_accounts">Aucun compte trouvé.</string>

    <!-- Cash Register -->
    <string name="cash_register_management">Caisse</string>
    <string name="cash_desc">Gérez les sessions de caisse, ventes et dépenses.</string>
    <string name="open_register">Ouvrir la Caisse</string>
    <string name="close_register">Fermer la Caisse</string>
    <string name="current_session">Session Actuelle</string>
    <string name="register_closed">Caisse Fermée</string>
    <string name="opening_amount">Fond de Caisse</string>
    <string name="expected_cash">Montant Attendu</string>
    <string name="closing_amount">Montant Compté</string>
    <string name="difference">Écart</string>
    <string name="add_cash">Entrée Espèces</string>
    <string name="remove_cash">Sortie Espèces</string>
    <string name="session_history">Historique Sessions</string>
    <string name="opened_at">Ouvert le</string>
    <string name="closed_at">Fermé le</string>
    <string name="movement_log">Mouvements</string>
    <string name="reason">Motif</string>

    <!-- Common / Status -->
    <string name="search">Rechercher...</string>
    <string name="new">Nouveau</string>
    <string name="view_details">Voir détails</string>
    <string name="delete">Supprimer</string>
    <string name="edit">Modifier</string>
    <string name="status">Statut</string>
    <string name="actions">Actions</string>
    <string name="total">Total</string>
    <string name="cancel">Annuler</string>
    <string name="save">Enregistrer</string>
    <string name="ask_ai">Assistant IA</string>
    <string name="ai_greeting">Bonjour ! Je suis votre assistant IA SmartBiz. J'ai accès aux données de votre tableau de bord. Comment puis-je vous aider ?</string>
    <string name="ai_placeholder">Posez des questions d'affaires complexes...</string>
    <string name="ai_error_generic">Je rencontre des problèmes de connexion au service d'IA pour le moment.</string>
    <string name="ai_error_config">Veuillez configurer votre clé API Google Gemini dans Paramètres > Général.</string>

    <string name="all_status">Tous les statuts</string>
    <string name="all_categories">Toutes catégories</string>
    <string name="all_types">Tous types</string>

    <string name="active">Actif</string>
    <string name="inactive">Inactif</string>
    <string name="paid">Payé</string>
    <string name="pending">En attente</string>
    <string name="overdue">En retard</string>
    <string name="draft">Brouillon</string>
    <string name="completed">Terminé</string>
    <string name="received">Reçu</string>
    <string name="in_stock">En Stock</string>
    <string name="low_stock">Stock Faible</string>
    <string name="out_of_stock">Rupture</string>
    
    <string name="delete_confirm_title">Supprimer ?</string>
    <string name="delete_confirm_msg">Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</string>
    <string name="yes_delete">Oui, Supprimer</string>

    <!-- Warehouses -->
    <string name="warehouse_management">Gestion Entrepôts</string>
    <string name="warehouses">Entrepôts</string>
    <string name="warehouse">Entrepôt</string>
    <string name="warehouse_name">Nom Entrepôt</string>
    <string name="add_warehouse">Ajouter Entrepôt</string>
    <string name="edit_warehouse">Modifier Entrepôt</string>
    <string name="warehouse_locations">Emplacements d'Entrepôt</string>
    <string name="location">Emplacement</string>
    <string name="default_warehouse">Défaut</string>
    <string name="transfer_stock">Transférer Stock</string>
    <string name="stock_transfer">Transfert de Stock</string>
    <string name="stock_transfers">Transferts de Stock</string>
    <string name="source_warehouse">Entrepôt Source</string>
    <string name="destination_warehouse">Entrepôt Destination</string>
    <string name="from">De</string>
    <string name="to">À</string>
    <string name="products_list">Liste Produits</string>
    <string name="product">Produit</string>
    <string name="quantity">Quantité</string>
    <string name="notes">Notes</string>
    <string name="transfer_reason">Motif du transfert</string>
    <string name="confirm_transfer">Confirmer Transfert</string>
    <string name="added_to_default_warehouse">Ajouté à l'entrepôt par défaut</string>
    <string name="stock_edit_warning">La quantité de stock ne peut pas être modifiée directement ici pour maintenir l'intégrité. Utilisez "Transférer Stock" ou créez des commandes d'achat pour ajuster les niveaux.</string>

    <!-- Custom Fields -->
    <string name="custom_fields">Champs Personnalisés</string>
    <string name="field_label">Libellé</string>
    <string name="field_type">Type</string>
    <string name="text">Texte</string>
    <string name="number">Nombre</string>
    <string name="date_type">Date</string>
    <string name="boolean">Oui/Non</string>
    <string name="yes">Oui</string>
    <string name="no">Non</string>
    <string name="add">Ajouter</string>
    <string name="client_fields">Champs Clients</string>
    <string name="supplier_fields">Champs Fournisseurs</string>
    <string name="no_custom_fields">Aucun champ personnalisé défini.</string>
</resources>`;

const arXml = `<?xml version="1.0" encoding="UTF-8"?>
<resources>
    <!-- Sidebar -->
    <string name="dashboard">لوحة القيادة</string>
    <string name="clients">العملاء</string>
    <string name="suppliers">الموردين</string>
    <string name="sales">المبيعات</string>
    <string name="purchases">المشتريات</string>
    <string name="inventory">المخزون</string>
    <string name="documents">المستندات</string>
    <string name="reports">التقارير</string>
    <string name="settings">الإعدادات</string>
    <string name="banking">البنوك</string>
    <string name="cash_register">الخزينة</string>
    <string name="cost_analysis">تحليل التكاليف</string>

    <!-- Submenus -->
    <string name="estimate">عرض سعر</string>
    <string name="client_order">طلب عميل</string>
    <string name="delivery_note">مذكرة تسليم</string>
    <string name="invoice">فاتورة</string>
    <string name="issue_note">مذكرة صرف</string>
    <string name="supplier_order">طلب مورد</string>
    <string name="supplier_delivery">استلام بضاعة</string>
    <string name="supplier_invoice">فاتورة مورد</string>

    <!-- Inventory Submenus -->
    <string name="products">المنتجات</string>
    <string name="warehouses">المستودعات</string>
    <string name="stock_transfers">نقل المخزون</string>

    <!-- Banking Submenus -->
    <string name="overview">نظرة عامة</string>
    <string name="accounts">الحسابات</string>
    <string name="transactions">المعاملات</string>

    <!-- Cost Analysis -->
    <string name="cost_analysis_title">التكلفة الحقيقية والربحية</string>
    <string name="cost_analysis_desc">تحليل تكاليف المنتجات، تكلفة البضائع المباعة، والهوامش بناءً على حركات المخزون الحقيقية.</string>
    <string name="avg_cost">متوسط تكلفة الوحدة</string>
    <string name="selling_price">سعر البيع</string>
    <string name="margin_percent">نسبة الهامش</string>
    <string name="cogs">تكلفة البضائع المباعة</string>
    <string name="total_inventory_value">قيمة المخزون</string>
    <string name="potential_profit">الربح المحتمل</string>
    <string name="cost_simulation">محاكي التكلفة</string>
    <string name="sim_purchase_qty">كمية الشراء</string>
    <string name="sim_unit_price">سعر الوحدة</string>
    <string name="sim_additional_cost">تكاليف إضافية (شحن/ضريبة)</string>
    <string name="sim_calculate">حساب التكلفة الجديدة</string>
    <string name="sim_new_cost">التكلفة الجديدة المقدرة</string>
    <string name="additional_expenses">مصاريف إضافية (شحن/ضريبة)</string>

    <!-- Dashboard -->
    <string name="dashboard_overview">نظرة عامة</string>
    <string name="welcome_message">مرحباً بعودتك! إليك ما يحدث اليوم.</string>
    <string name="export_report">تصدير تقرير</string>
    <string name="new_invoice">فاتورة جديدة</string>
    <string name="revenue_vs_expenses">الإيرادات والمصروفات</string>
    <string name="monthly_sales">المبيعات الشهرية</string>
    <string name="total_revenue">إجمالي الإيرادات</string>
    <string name="total_expenses">إجمالي المصروفات</string>
    <string name="net_profit">صافي الربح</string>
    <string name="active_clients">العملاء النشطين</string>

    <!-- Clients -->
    <string name="client_management">إدارة العملاء</string>
    <string name="client_desc">إدارة علاقات العملاء.</string>
    <string name="add_client">إضافة عميل</string>
    <string name="search_clients">بحث بالشركة، الاسم أو البريد...</string>
    <string name="contact_details">تفاصيل الاتصال</string>
    <string name="total_spent">إجمالي الإنفاق</string>
    <string name="no_clients">لم يتم العثور على عملاء.</string>
    <string name="company_contact">الشركة / جهة الاتصال</string>
    <string name="edit_client">تعديل عميل</string>
    <string name="client_details">تفاصيل العميل</string>

    <!-- Suppliers -->
    <string name="supplier_management">إدارة الموردين</string>
    <string name="supplier_desc">إدارة الموردين والمشتريات.</string>
    <string name="add_supplier">إضافة مورد</string>
    <string name="add_new_supplier">إضافة مورد جديد</string>
    <string name="search_suppliers">بحث بالشركة أو جهة الاتصال...</string>
    <string name="total_purchased">إجمالي المشتريات</string>
    <string name="no_suppliers">لم يتم العثور على موردين.</string>
    <string name="contact_name">اسم جهة الاتصال</string>
    <string name="delete_supplier_title">حذف المورد؟</string>
    <string name="delete_supplier_msg">هل أنت متأكد من أنك تريد حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.</string>

    <!-- Inventory -->
    <string name="inventory_management">إدارة المخزون</string>
    <string name="inventory_desc">تتبع مستويات المخزون والمنتجات.</string>
    <string name="add_product">إضافة منتج</string>
    <string name="total_products">إجمالي المنتجات</string>
    <string name="needs_attention">يحتاج انتباه</string>
    <string name="total_value">قيمة المخزون</string>
    <string name="search_products">بحث بالاسم، الرمز أو الفئة...</string>
    <string name="product_name">اسم المنتج</string>
    <string name="sku">الرمز (SKU)</string>
    <string name="category">الفئة</string>
    <string name="stock_level">مستوى المخزون</string>
    <string name="price">السعر</string>
    <string name="cost">التكلفة</string>
    <string name="stock_qty">الكمية</string>
    <string name="no_products">لم يتم العثور على منتجات.</string>
    <string name="edit_product">تعديل منتج</string>

    <!-- Documents -->
    <string name="documents_history">سجل المستندات</string>
    <string name="documents_desc">عرض وإدارة جميع مستندات المبيعات.</string>
    <string name="search_documents">بحث برقم المستند أو العميل...</string>
    <string name="ref_num">رقم مرجعي</string>
    <string name="type">النوع</string>
    <string name="client">العميل</string>
    <string name="date">التاريخ</string>
    <string name="due_date">تاريخ الاستحقاق</string>
    <string name="amount">المبلغ</string>
    <string name="no_documents">لم يتم العثور على مستندات.</string>

    <!-- Sales Pages -->
    <string name="catalog">الكتالوج</string>
    <string name="cart">البيع الحالي</string>
    <string name="select_customer">اختر العميل...</string>
    <string name="subtotal">المجموع الفرعي</string>
    <string name="discount">خصم</string>
    <string name="tax">ضريبة</string>
    <string name="clear">مسح</string>
    <string name="success">نجاح!</string>
    <string name="print">طباعة</string>
    <string name="custom_item">عنصر مخصص</string>
    <string name="add_custom_item">إضافة عنصر</string>
    <string name="item_name">اسم العنصر</string>
    <string name="save_estimate">حفظ عرض السعر</string>
    <string name="confirm_order">تأكيد الطلب</string>
    <string name="create_delivery">إنشاء مذكرة تسليم</string>
    <string name="charge_create">دفع وإنشاء فاتورة</string>
    <string name="payment_terms">شروط الدفع</string>
    <string name="payment_method">طريقة الدفع</string>
    <string name="notes_conditions">ملاحظات / شروط</string>
    <string name="due_on_receipt">الدفع عند الاستلام</string>
    <string name="bank_transfer">تحويل بنكي</string>
    <string name="cash">نقد</string>
    <string name="check">شيك</string>

    <string name="estimates_quotes">عروض الأسعار</string>
    <string name="estimates_desc">إدارة عروض الأسعار والمقترحات للعملاء.</string>
    <string name="new_estimate">عرض سعر جديد</string>
    <string name="search_estimates">بحث في عروض الأسعار...</string>
    <string name="estimate_details">تفاصيل عرض السعر</string>
    <string name="issued_date">تاريخ الإصدار</string>
    <string name="valid_until">ساري حتى</string>
    <string name="convert_to_order">تحويل إلى طلب</string>
    <string name="convert_to_invoice">تحويل إلى فاتورة</string>

    <string name="sales_orders">طلبات العملاء</string>
    <string name="sales_orders_desc">إدارة طلبات العملاء.</string>
    <string name="new_order">طلب جديد</string>
    <string name="search_orders">بحث برقم الطلب أو العميل...</string>
    <string name="order_details">تفاصيل الطلب</string>
    <string name="generate_invoice">إنشاء فاتورة</string>

    <string name="delivery_notes">مذكرات التسليم</string>
    <string name="delivery_notes_desc">تتبع الشحنات وحالة التسليم.</string>
    <string name="new_delivery">مذكرة تسليم جديدة</string>
    <string name="search_deliveries">بحث في مذكرات التسليم...</string>
    <string name="delivery_details">تفاصيل التسليم</string>
    <string name="shipped_date">تاريخ الشحن</string>
    <string name="shipped_items">العناصر المشحونة</string>

    <string name="sales_invoices">فواتير المبيعات</string>
    <string name="sales_invoices_desc">إدارة الفواتير الصادرة والمدفوعات.</string>
    <string name="new_invoice_btn">فاتورة جديدة</string>
    <string name="search_invoices">بحث في الفواتير...</string>
    <string name="invoice_details">تفاصيل الفاتورة</string>
    <string name="mark_paid">تحديد كمدفوع</string>
    <string name="print_invoice">طباعة الفاتورة</string>

    <string name="issue_notes">مذكرات الصرف</string>
    <string name="issue_notes_desc">إدارة صرف المخزون والمذكرات الصادرة يدوياً.</string>
    <string name="new_issue_note">مذكرة صرف جديدة</string>
    <string name="search_issue_notes">بحث في مذكرات الصرف...</string>
    <string name="issue_note_details">تفاصيل مذكرة الصرف</string>
    <string name="recipient">المستلم</string>
    <string name="issued_items">العناصر المصروفة</string>

    <!-- Purchase Pages -->
    <string name="purchase_orders">طلبات الشراء</string>
    <string name="purchase_orders_desc">إدارة طلبات الموردين والمشتريات.</string>
    <string name="new_po">طلب شراء جديد</string>
    <string name="search_pos">بحث برقم الطلب أو المورد...</string>
    <string name="po_details">تفاصيل طلب الشراء</string>

    <string name="goods_received_grn">استلام البضائع (GRN)</string>
    <string name="goods_received_desc">تتبع شحنات المخزون الواردة من الموردين.</string>
    <string name="receive_goods">استلام بضائع</string>
    <string name="search_grns">بحث في سندات الاستلام...</string>
    <string name="date_received">تاريخ الاستلام</string>
    <string name="received_items">العناصر المستلمة</string>

    <string name="purchase_invoices">فواتير الشراء</string>
    <string name="purchase_invoices_desc">إدارة فواتير الموردين والمصاريف.</string>
    <string name="register_invoice">تسجيل فاتورة</string>
    <string name="search_purchase_invoices">بحث برقم الفاتورة أو المورد...</string>

    <!-- Reports -->
    <string name="reports_analytics">التقارير والتحليلات</string>
    <string name="reports_desc">اختر فئة لعرض المقاييس التفصيلية.</string>
    <string name="sales_report">تقرير المبيعات</string>
    <string name="purchase_report">تقرير المشتريات</string>
    <string name="inventory_stock_report">المخزون والمستودع</string>
    <string name="financials_report">المالية</string>
    <string name="rep_sales_customer">مبيعات العملاء (ملخص)</string>
    <string name="rep_sales_customer_detailed">تحليل العملاء التفصيلي</string>
    <string name="rep_sales_product_detailed">تحليل المنتجات التفصيلي</string>
    <string name="rep_sales_vat">ضريبة المبيعات</string>
    <string name="rep_cust_trans">معاملات العملاء</string>
    <string name="rep_supp_purch">مشتريات الموردين</string>
    <string name="rep_purch_vat">ضريبة المشتريات</string>
    <string name="rep_stock_mov">حركات المخزون</string>
    <string name="rep_prod_perf">أداء المنتجات</string>
    <string name="rep_monthly_profit">الربح الشهري</string>
    <string name="rep_aging_receivables">الذمم المدينة القديمة</string>
    <string name="salesperson">البائع</string>
    <string name="region">المنطقة</string>
    <string name="margin">الهامش</string>
    <string name="avg_price">متوسط السعر</string>
    <string name="total_sold">إجمالي المباع</string>
    <string name="invoices_count">الفواتير</string>
    <string name="balance_due">الرصيد المستحق</string>

    <!-- Settings -->
    <string name="general">عام</string>
    <string name="profile">الملف الشخصي</string>
    <string name="security">الأمان</string>
    <string name="billing">الفوترة</string>
    <string name="notifications">الإشعارات</string>
    <string name="company_details">تفاصيل الشركة</string>
    <string name="company_name">اسم الشركة</string>
    <string name="company_email">البريد الإلكتروني</string>
    <string name="company_phone">الهاتف</string>
    <string name="company_vat_id">الرقم الضريبي</string>
    <string name="address">العنوان</string>
    <string name="localization">الموقع والتفضيلات</string>
    <string name="language">اللغة</string>
    <string name="currency">العملة</string>
    <string name="timezone">المنطقة الزمنية</string>
    <string name="tax_configuration">إعدادات الضرائب</string>
    <string name="tax_rates_list">معدلات الضرائب المكونة</string>
    <string name="rate_name">الاسم (مثل ضريبة القيمة المضافة)</string>
    <string name="rate_value">المعدل (%)</string>
    <string name="add_rate">إضافة معدل</string>
    <string name="save_changes">حفظ التغييرات</string>
    <string name="settings_saved">تم حفظ الإعدادات بنجاح</string>
    <string name="manage_preferences">إدارة تفضيلاتك ومعلومات الشركة.</string>
    <string name="password_auth">كلمة المرور والمصادقة</string>
    <string name="current_password">كلمة المرور الحالية</string>
    <string name="new_password">كلمة المرور الجديدة</string>
    <string name="confirm_password">تأكيد كلمة المرور الجديدة</string>
    <string name="two_factor_auth">المصادقة الثنائية</string>
    <string name="secure_account">تأمين حسابك</string>
    <string name="secure_account_desc">أضف طبقة إضافية من الأمان.</string>
    <string name="enable_2fa">تفعيل المصادقة الثنائية</string>
    <string name="disable_2fa">تعطيل المصادقة الثنائية</string>
    <string name="personal_information">المعلومات الشخصية</string>
    <string name="email_notifications">إشعارات البريد الإلكتروني</string>
    <string name="change_avatar">تغيير الصورة</string>
    <string name="full_name">الاسم الكامل</string>
    <string name="email_address">عنوان البريد الإلكتروني</string>
    <string name="role">الدور</string>
    <string name="ai_integration">تكامل الذكاء الاصطناعي</string>
    <string name="gemini_api_key">مفتاح Google Gemini API</string>

    <!-- Banking -->
    <string name="bank_management">البنوك</string>
    <string name="bank_desc">تتبع الحسابات البنكية، المعاملات، وإجراء التسويات.</string>
    <string name="add_account">إضافة حساب</string>
    <string name="total_liquidity">إجمالي السيولة</string>
    <string name="account_name">اسم الحساب</string>
    <string name="bank_name">اسم البنك</string>
    <string name="account_number">رقم الحساب</string>
    <string name="balance">الرصيد</string>
    <string name="add_transaction">إضافة معاملة</string>
    <string name="transaction_history">سجل المعاملات</string>
    <string name="reconcile">تسوية</string>
    <string name="description">الوصف</string>
    <string name="deposit">إيداع</string>
    <string name="withdrawal">سحب</string>
    <string name="transfer">تحويل</string>
    <string name="fee">رسوم</string>
    <string name="payment">دفع</string>
    <string name="cleared">تمت</string>
    <string name="reconciled">تمت التسوية</string>
    <string name="new_account">حساب جديد</string>
    <string name="edit_account">تعديل الحساب</string>
    <string name="delete_account_confirm_msg">هل أنت متأكد من حذف هذا الحساب؟ لن يتم حذف المعاملات المرتبطة به من السجل، ولكن قد يؤثر ذلك على التقارير.</string>
    <string name="account_type">نوع الحساب</string>
    <string name="checking">جاري</string>
    <string name="savings">توفير</string>
    <string name="credit">ائتمان</string>
    <string name="investment">استثمار</string>
    <string name="initial_balance">الرصيد الأولي</string>
    <string name="no_transactions">لا توجد معاملات.</string>
    <string name="no_accounts">لا توجد حسابات.</string>

    <!-- Cash Register -->
    <string name="cash_register_management">الخزينة</string>
    <string name="cash_desc">إدارة جلسات الكاشير، المبيعات والمصاريف النثرية.</string>
    <string name="open_register">فتح الخزينة</string>
    <string name="close_register">إغلاق الخزينة</string>
    <string name="current_session">الجلسة الحالية</string>
    <string name="register_closed">الخزينة مغلقة</string>
    <string name="opening_amount">رصيد الافتتاح</string>
    <string name="expected_cash">النقد المتوقع</string>
    <string name="closing_amount">المبلغ الفعلي</string>
    <string name="difference">الفرق</string>
    <string name="add_cash">إضافة نقد</string>
    <string name="remove_cash">سحب نقد</string>
    <string name="session_history">سجل الجلسات</string>
    <string name="opened_at">فُتحت في</string>
    <string name="closed_at">أُغلقت في</string>
    <string name="movement_log">سجل الحركات</string>
    <string name="reason">السبب</string>

    <!-- Common / Status -->
    <string name="search">بحث...</string>
    <string name="new">جديد</string>
    <string name="view_details">عرض التفاصيل</string>
    <string name="delete">حذف</string>
    <string name="edit">تعديل</string>
    <string name="status">الحالة</string>
    <string name="actions">إجراءات</string>
    <string name="total">المجموع</string>
    <string name="cancel">إلغاء</string>
    <string name="save">حفظ</string>
    <string name="ask_ai">مساعد AI</string>
    <string name="ai_greeting">مرحبًا! أنا مساعد SmartBiz الذكي. لدي إمكانية الوصول إلى بيانات لوحة القيادة الخاصة بك. كيف يمكنني مساعدتك اليوم؟</string>
    <string name="ai_placeholder">اطرح أسئلة عمل معقدة...</string>
    <string name="ai_error_generic">أواجه مشكلة في الاتصال بخدمة الذكاء الاصطناعي الآن.</string>
    <string name="ai_error_config">يرجى تكوين مفتاح Google Gemini API الخاص بك في الإعدادات > عام.</string>

    <string name="all_status">كل الحالات</string>
    <string name="all_categories">كل الفئات</string>
    <string name="all_types">كل الأنواع</string>

    <string name="active">نشط</string>
    <string name="inactive">غير نشط</string>
    <string name="paid">مدفوع</string>
    <string name="pending">قيد الانتظار</string>
    <string name="overdue">متأخر</string>
    <string name="draft">مسودة</string>
    <string name="completed">مكتمل</string>
    <string name="received">مستلم</string>
    <string name="in_stock">في المخزون</string>
    <string name="low_stock">مخزون منخفض</string>
    <string name="out_of_stock">نفذ المخزون</string>
    
    <string name="delete_confirm_title">حذف العنصر؟</string>
    <string name="delete_confirm_msg">هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</string>
    <string name="yes_delete">نعم، حذف</string>

    <!-- Warehouses -->
    <string name="warehouse_management">إدارة المستودعات</string>
    <string name="warehouses">المستودعات</string>
    <string name="warehouse">مستودع</string>
    <string name="warehouse_name">اسم المستودع</string>
    <string name="add_warehouse">إضافة مستودع</string>
    <string name="edit_warehouse">تعديل مستودع</string>
    <string name="warehouse_locations">مواقع المستودعات</string>
    <string name="location">الموقع</string>
    <string name="default_warehouse">افتراضي</string>
    <string name="transfer_stock">نقل مخزون</string>
    <string name="stock_transfer">نقل مخزون</string>
    <string name="stock_transfers">تحويلات المخزون</string>
    <string name="source_warehouse">مستودع المصدر</string>
    <string name="destination_warehouse">مستودع الوجهة</string>
    <string name="from">من</string>
    <string name="to">إلى</string>
    <string name="products_list">قائمة المنتجات</string>
    <string name="product">المنتج</string>
    <string name="quantity">الكمية</string>
    <string name="notes">ملاحظات</string>
    <string name="transfer_reason">سبب النقل</string>
    <string name="confirm_transfer">تأكيد النقل</string>
    <string name="added_to_default_warehouse">تمت الإضافة إلى المستودع الافتراضي</string>
    <string name="stock_edit_warning">لا يمكن تعديل كمية المخزون مباشرة هنا للحفاظ على السلامة. استخدم "نقل مخزون" أو أنشئ أوامر شراء لضبط المستويات.</string>

    <!-- Custom Fields -->
    <string name="custom_fields">حقول مخصصة</string>
    <string name="field_label">تسمية الحقل</string>
    <string name="field_type">نوع الحقل</string>
    <string name="text">نص</string>
    <string name="number">رقم</string>
    <string name="date_type">تاريخ</string>
    <string name="boolean">نعم/لا</string>
    <string name="yes">نعم</string>
    <string name="no">لا</string>
    <string name="add">إضافة</string>
    <string name="client_fields">حقول العملاء</string>
    <string name="supplier_fields">حقول الموردين</string>
    <string name="no_custom_fields">لم يتم تعريف حقول مخصصة.</string>
</resources>`;

export const loadTranslations = async (lang: string): Promise<Record<string, string>> => {
  let xmlContent = enXml;
  if (lang === 'fr') xmlContent = frXml;
  if (lang === 'ar') xmlContent = arXml;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const resources = xmlDoc.getElementsByTagName("string");
  const translations: Record<string, string> = {};

  for (let i = 0; i < resources.length; i++) {
    const key = resources[i].getAttribute("name");
    const value = resources[i].textContent;
    if (key && value) {
      translations[key] = value;
    }
  }

  return translations;
};

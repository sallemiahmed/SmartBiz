import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    clients: 'Clients',
    suppliers: 'Suppliers',
    sales: 'Sales',
    purchases: 'Purchases',
    inventory: 'Inventory',
    documents: 'Documents',
    reports: 'Reports',
    settings: 'Settings',
    
    // Submenus
    estimate: 'Estimate',
    client_order: 'Client Order',
    delivery_note: 'Delivery Note',
    invoice: 'Invoice',
    issue_note: 'Issue Note',
    supplier_order: 'Supplier Order',
    supplier_delivery: 'Supplier Delivery',
    supplier_invoice: 'Supplier Invoice',

    // Settings - General
    general: 'General',
    profile: 'Profile',
    security: 'Security',
    billing: 'Billing',
    notifications: 'Notifications',
    
    company_details: 'Company Details',
    company_name: 'Company Name',
    company_email: 'Company Email',
    company_phone: 'Company Phone',
    company_vat_id: 'Company VAT / Tax ID',
    address: 'Address',
    
    localization: 'Localization & Preferences',
    language: 'Language',
    currency: 'Currency',
    timezone: 'Timezone',
    tax_configuration: 'Tax Configuration',
    tax_rates_list: 'Configured Tax Rates',
    rate_name: 'Name (e.g. VAT)',
    rate_value: 'Rate (%)',
    add_rate: 'Add Rate',
    
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    settings_saved: 'Settings Saved Successfully',
    manage_preferences: 'Manage your preferences and company information.',

    // Settings - Security
    password_auth: 'Password & Authentication',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm New Password',
    two_factor_auth: 'Two-Factor Authentication',
    secure_account: 'Secure your account',
    secure_account_desc: 'Add an extra layer of security to your account.',
    enable_2fa: 'Enable 2FA',
    disable_2fa: 'Disable 2FA',
    
    // Common
    search: 'Search...',
    new: 'New',
    view_details: 'View Details',
    delete: 'Delete',
    status: 'Status',
    actions: 'Actions',
    total: 'Total'
  },
  fr: {
    // Sidebar
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    suppliers: 'Fournisseurs',
    sales: 'Ventes',
    purchases: 'Achats',
    inventory: 'Stock',
    documents: 'Documents',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Submenus
    estimate: 'Devis',
    client_order: 'Commande Client',
    delivery_note: 'Bon de Livraison',
    invoice: 'Facture',
    issue_note: 'Bon de Sortie',
    supplier_order: 'Commande Fourn.',
    supplier_delivery: 'Bon de Réception',
    supplier_invoice: 'Facture Fourn.',

    // Settings - General
    general: 'Général',
    profile: 'Profil',
    security: 'Sécurité',
    billing: 'Facturation',
    notifications: 'Notifications',
    
    company_details: 'Détails de l\'entreprise',
    company_name: 'Nom de l\'entreprise',
    company_email: 'Email',
    company_phone: 'Téléphone',
    company_vat_id: 'Numéro de TVA / MF',
    address: 'Adresse',
    
    localization: 'Localisation & Préférences',
    language: 'Langue',
    currency: 'Devise',
    timezone: 'Fuseau horaire',
    tax_configuration: 'Configuration des taxes',
    tax_rates_list: 'Taux de taxe configurés',
    rate_name: 'Nom (ex. TVA)',
    rate_value: 'Taux (%)',
    add_rate: 'Ajouter un taux',
    
    save_changes: 'Enregistrer',
    cancel: 'Annuler',
    settings_saved: 'Paramètres enregistrés',
    manage_preferences: 'Gérez vos préférences et les informations de l\'entreprise.',

    // Settings - Security
    password_auth: 'Mot de passe et authentification',
    current_password: 'Mot de passe actuel',
    new_password: 'Nouveau mot de passe',
    confirm_password: 'Confirmer le nouveau mot de passe',
    two_factor_auth: 'Authentification à deux facteurs',
    secure_account: 'Sécurisez votre compte',
    secure_account_desc: 'Ajoutez une couche de sécurité supplémentaire.',
    enable_2fa: 'Activer A2F',
    disable_2fa: 'Désactiver A2F',
    
    // Common
    search: 'Rechercher...',
    new: 'Nouveau',
    view_details: 'Voir détails',
    delete: 'Supprimer',
    status: 'Statut',
    actions: 'Actions',
    total: 'Total'
  },
  ar: {
    // Sidebar
    dashboard: 'لوحة القيادة',
    clients: 'العملاء',
    suppliers: 'الموردين',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    inventory: 'المخزون',
    documents: 'المستندات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    
    // Submenus
    estimate: 'عرض سعر',
    client_order: 'طلب عميل',
    delivery_note: 'مذكرة تسليم',
    invoice: 'فاتورة',
    issue_note: 'مذكرة صرف',
    supplier_order: 'طلب مورد',
    supplier_delivery: 'استلام بضاعة',
    supplier_invoice: 'فاتورة مورد',

    // Settings - General
    general: 'عام',
    profile: 'الملف الشخصي',
    security: 'الأمان',
    billing: 'الفوترة',
    notifications: 'الإشعارات',
    
    company_details: 'تفاصيل الشركة',
    company_name: 'اسم الشركة',
    company_email: 'البريد الإلكتروني',
    company_phone: 'الهاتف',
    company_vat_id: 'الرقم الضريبي',
    address: 'العنوان',
    
    localization: 'الموقع والتفضيلات',
    language: 'اللغة',
    currency: 'العملة',
    timezone: 'المنطقة الزمنية',
    tax_configuration: 'إعدادات الضرائب',
    tax_rates_list: 'معدلات الضرائب المكونة',
    rate_name: 'الاسم (مثل ضريبة القيمة المضافة)',
    rate_value: 'المعدل (%)',
    add_rate: 'إضافة معدل',
    
    save_changes: 'حفظ التغييرات',
    cancel: 'إلغاء',
    settings_saved: 'تم حفظ الإعدادات بنجاح',
    manage_preferences: 'إدارة تفضيلاتك ومعلومات الشركة.',

    // Settings - Security
    password_auth: 'كلمة المرور والمصادقة',
    current_password: 'كلمة المرور الحالية',
    new_password: 'كلمة المرور الجديدة',
    confirm_password: 'تأكيد كلمة المرور الجديدة',
    two_factor_auth: 'المصادقة الثنائية',
    secure_account: 'تأمين حسابك',
    secure_account_desc: 'أضف طبقة إضافية من الأمان.',
    enable_2fa: 'تفعيل المصادقة الثنائية',
    disable_2fa: 'تعطيل المصادقة الثنائية',
    
    // Common
    search: 'بحث...',
    new: 'جديد',
    view_details: 'عرض التفاصيل',
    delete: 'حذف',
    status: 'الحالة',
    actions: 'إجراءات',
    total: 'المجموع'
  }
};
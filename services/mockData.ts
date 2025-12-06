
import {
  Client, ClientContact, ClientInteraction, Supplier, Product, Invoice, Purchase, Warehouse, StockMovement,
  BankAccount, BankTransaction, CashRegister, CashSession, CashTransaction, Technician,
  ServiceItem, ServiceJob, ServiceSale, InventorySession, Vehicle, FleetMission,
  FleetMaintenance, FleetExpense, FleetDocument, Employee, Contract, Payroll,
  LeaveRequest, ExpenseReport, MaintenanceContract, ContactInteraction,
  Department, Position, PayrollRun, Payslip, PayrollElement, Shift, ShiftAssignment,
  OnboardingChecklist, OffboardingChecklist, Objective, AuditLog, HRSettings,
  Attendance, Timesheet, LeavePolicy, PerformanceReview, ReviewCycle,
  Project, ProjectTask, ProjectTimeEntry, ProjectExpense, ProjectMilestone,
  Opportunity, Prospect, ProspectInteraction
} from '../types';

export const getDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

// --- COMMERCIAUX (utilisés pour assigner aux clients/opportunités) ---
export const mockSalesReps = [
  { id: 'sr1', name: 'Alex Morgan', employeeId: 'e8' },
  { id: 'sr2', name: 'Sophie Martin', employeeId: 'e9' },
  { id: 'sr3', name: 'Karim Ben Ali', employeeId: 'e10' },
];

// --- CRM DATA ---
export const mockClients: Client[] = [
  {
    id: 'c1',
    code: 'CLI-10001234',
    company: 'SFBT',
    name: 'M. Kamel Ben Ammar',
    email: 'achat@sfbt.tn',
    phone: '71 123 456',
    status: 'active',
    category: 'Industrie',
    totalSpent: 285000,
    address: 'Route de l\'Hôpital Militaire, Tunis',
    taxId: '1234567/A/M/000',
    zone: 'Grand Tunis',
    customFields: { 'Sector': 'Beverages' },
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc1-1', clientId: 'c1', firstName: 'Kamel', lastName: 'Ben Ammar', email: 'kamel.benammar@sfbt.tn', phone: '71 123 456', mobile: '98 111 222', role: 'decision_maker', jobTitle: 'Directeur des Achats', department: 'Achats', isPrimary: true, createdAt: getDate(-180) },
      { id: 'cc1-2', clientId: 'c1', firstName: 'Fatma', lastName: 'Gharbi', email: 'fatma.gharbi@sfbt.tn', phone: '71 123 457', mobile: '55 222 333', role: 'accounting', jobTitle: 'Comptable', department: 'Finance', isPrimary: false, createdAt: getDate(-150) },
      { id: 'cc1-3', clientId: 'c1', firstName: 'Ahmed', lastName: 'Souissi', email: 'ahmed.souissi@sfbt.tn', phone: '71 123 458', role: 'technical', jobTitle: 'Responsable Technique', department: 'Production', isPrimary: false, createdAt: getDate(-120) }
    ]
  },
  {
    id: 'c2',
    code: 'CLI-10001235',
    company: 'Poulina Group Holding',
    name: 'Mme. Samia Trabelsi',
    email: 'contact@poulina.com',
    phone: '71 456 789',
    status: 'active',
    category: 'Holding',
    totalSpent: 189000,
    address: 'GP1 Ezzahra, Ben Arous',
    taxId: '9876543/B/M/000',
    zone: 'Ben Arous',
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    contacts: [
      { id: 'cc2-1', clientId: 'c2', firstName: 'Samia', lastName: 'Trabelsi', email: 'samia.trabelsi@poulina.com', phone: '71 456 789', mobile: '22 333 444', role: 'decision_maker', jobTitle: 'Directrice Générale', department: 'Direction', isPrimary: true, createdAt: getDate(-200) },
      { id: 'cc2-2', clientId: 'c2', firstName: 'Mondher', lastName: 'Bouaziz', email: 'mondher.bouaziz@poulina.com', phone: '71 456 790', role: 'purchasing', jobTitle: 'Responsable Achats', department: 'Achats', isPrimary: false, createdAt: getDate(-180) }
    ]
  },
  {
    id: 'c3',
    code: 'CLI-10001236',
    company: 'Clinique Les Jasmins',
    name: 'Dr. Faouzi Mahjoub',
    email: 'info@cliniquejasmins.tn',
    phone: '71 777 888',
    status: 'active',
    category: 'Santé',
    totalSpent: 92000,
    address: 'Centre Urbain Nord, Tunis',
    taxId: '1122334/C/M/000',
    zone: 'Tunis',
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc3-1', clientId: 'c3', firstName: 'Faouzi', lastName: 'Mahjoub', email: 'dr.mahjoub@cliniquejasmins.tn', phone: '71 777 888', mobile: '98 444 555', role: 'decision_maker', jobTitle: 'Médecin Directeur', department: 'Direction', isPrimary: true, createdAt: getDate(-300) },
      { id: 'cc3-2', clientId: 'c3', firstName: 'Leila', lastName: 'Mechergui', email: 'leila.mechergui@cliniquejasmins.tn', phone: '71 777 889', role: 'operations', jobTitle: 'Responsable Opérations', department: 'Administration', isPrimary: false, createdAt: getDate(-250) }
    ]
  },
  {
    id: 'c4',
    code: 'CLI-10001237',
    company: 'Vermeg',
    name: 'Amine Jlassi',
    email: 'it@vermeg.com',
    phone: '71 111 222',
    status: 'active',
    category: 'Tech',
    totalSpent: 155000,
    address: 'Les Berges du Lac 1',
    taxId: '5566778/D/M/000',
    zone: 'Lac 1',
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc4-1', clientId: 'c4', firstName: 'Amine', lastName: 'Jlassi', email: 'amine.jlassi@vermeg.com', phone: '71 111 222', mobile: '55 666 777', role: 'technical', jobTitle: 'CTO', department: 'IT', isPrimary: true, createdAt: getDate(-365) },
      { id: 'cc4-2', clientId: 'c4', firstName: 'Hichem', lastName: 'Riahi', email: 'hichem.riahi@vermeg.com', phone: '71 111 223', role: 'purchasing', jobTitle: 'Procurement Manager', department: 'Achats', isPrimary: false, createdAt: getDate(-300) },
      { id: 'cc4-3', clientId: 'c4', firstName: 'Nour', lastName: 'Belhaj', email: 'nour.belhaj@vermeg.com', phone: '71 111 224', role: 'accounting', jobTitle: 'Financial Controller', department: 'Finance', isPrimary: false, createdAt: getDate(-280) }
    ]
  },
  {
    id: 'c5',
    code: 'CLI-10001238',
    company: 'Magasin Général',
    name: 'Service Achat',
    email: 'appro@mg.tn',
    phone: '71 900 900',
    status: 'active',
    category: 'Retail',
    totalSpent: 167000,
    address: 'Avenue Jean Jaurès, Tunis',
    taxId: '3344556/E/M/000',
    zone: 'Centre Ville',
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    contacts: [
      { id: 'cc5-1', clientId: 'c5', firstName: 'Salah', lastName: 'Dridi', email: 'salah.dridi@mg.tn', phone: '71 900 900', mobile: '22 888 999', role: 'decision_maker', jobTitle: 'Directeur Commercial', department: 'Commercial', isPrimary: true, createdAt: getDate(-400) },
      { id: 'cc5-2', clientId: 'c5', firstName: 'Mariem', lastName: 'Oueslati', email: 'mariem.oueslati@mg.tn', phone: '71 900 901', role: 'purchasing', jobTitle: 'Acheteuse Senior', department: 'Achats', isPrimary: false, createdAt: getDate(-350) }
    ]
  },
  {
    id: 'c6',
    code: 'CLI-10001239',
    company: 'Tunisie Telecom',
    name: 'M. Ridha Chouchane',
    email: 'enterprise@tunisietelecom.tn',
    phone: '71 800 800',
    status: 'active',
    category: 'Telecom',
    totalSpent: 320000,
    address: 'Avenue Habib Bourguiba, Tunis',
    taxId: '7788990/F/M/000',
    zone: 'Centre Ville',
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc6-1', clientId: 'c6', firstName: 'Ridha', lastName: 'Chouchane', email: 'ridha.chouchane@tunisietelecom.tn', phone: '71 800 800', mobile: '98 000 111', role: 'decision_maker', jobTitle: 'Directeur SI', department: 'IT', isPrimary: true, createdAt: getDate(-500) },
      { id: 'cc6-2', clientId: 'c6', firstName: 'Khaled', lastName: 'Messaoudi', email: 'khaled.messaoudi@tunisietelecom.tn', phone: '71 800 801', role: 'technical', jobTitle: 'Architecte Technique', department: 'IT', isPrimary: false, createdAt: getDate(-450) }
    ]
  },
  {
    id: 'c7',
    code: 'CLI-10001240',
    company: 'Banque de Tunisie',
    name: 'Mme. Amel Ksouri',
    email: 'achats@bt.com.tn',
    phone: '71 333 000',
    status: 'active',
    category: 'Finance',
    totalSpent: 245000,
    address: 'Avenue Habib Bourguiba, Tunis',
    taxId: '1122556/G/M/000',
    zone: 'Centre Ville',
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc7-1', clientId: 'c7', firstName: 'Amel', lastName: 'Ksouri', email: 'amel.ksouri@bt.com.tn', phone: '71 333 000', mobile: '55 444 000', role: 'purchasing', jobTitle: 'Responsable Achats', department: 'Achats', isPrimary: true, createdAt: getDate(-600) }
    ]
  },
  {
    id: 'c8',
    code: 'CLI-10001241',
    company: 'Délice Holding',
    name: 'M. Sofiane Rebai',
    email: 'contact@delice.tn',
    phone: '71 222 333',
    status: 'active',
    category: 'Agroalimentaire',
    totalSpent: 178000,
    address: 'Zone Industrielle Ben Arous',
    taxId: '3344778/H/M/000',
    zone: 'Ben Arous',
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    contacts: [
      { id: 'cc8-1', clientId: 'c8', firstName: 'Sofiane', lastName: 'Rebai', email: 'sofiane.rebai@delice.tn', phone: '71 222 333', mobile: '22 777 888', role: 'decision_maker', jobTitle: 'Directeur Supply Chain', department: 'Supply Chain', isPrimary: true, createdAt: getDate(-400) },
      { id: 'cc8-2', clientId: 'c8', firstName: 'Olfa', lastName: 'Maalej', email: 'olfa.maalej@delice.tn', phone: '71 222 334', role: 'accounting', jobTitle: 'DAF', department: 'Finance', isPrimary: false, createdAt: getDate(-380) }
    ]
  },
  {
    id: 'c9',
    code: 'CLI-10001242',
    company: 'Startup XYZ',
    name: 'M. Yassine Gargouri',
    email: 'yassine@startupxyz.tn',
    phone: '98 765 432',
    status: 'active',
    category: 'Tech',
    totalSpent: 25000,
    address: 'Technopole El Ghazela, Ariana',
    taxId: '9988776/I/M/000',
    zone: 'Ariana',
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    contacts: [
      { id: 'cc9-1', clientId: 'c9', firstName: 'Yassine', lastName: 'Gargouri', email: 'yassine@startupxyz.tn', phone: '98 765 432', role: 'decision_maker', jobTitle: 'CEO', department: 'Direction', isPrimary: true, createdAt: getDate(-90) }
    ]
  },
  {
    id: 'c10',
    code: 'CLI-10001243',
    company: 'Hôtel Laico',
    name: 'Mme. Rim Hajji',
    email: 'procurement@laicotunis.com',
    phone: '71 909 090',
    status: 'inactive',
    category: 'Hôtellerie',
    totalSpent: 45000,
    address: 'Avenue Mohamed V, Tunis',
    taxId: '5566112/J/M/000',
    zone: 'Tunis',
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    contacts: [
      { id: 'cc10-1', clientId: 'c10', firstName: 'Rim', lastName: 'Hajji', email: 'rim.hajji@laicotunis.com', phone: '71 909 090', role: 'purchasing', jobTitle: 'Purchasing Manager', department: 'Achats', isPrimary: true, createdAt: getDate(-700) }
    ]
  }
];

// --- PROSPECTS DATA ---
export const mockProspects: Prospect[] = [
  {
    id: 'p1',
    company: 'DataLogix Tunisia',
    contactName: 'Mehdi Trabelsi',
    email: 'mehdi@datalogix.tn',
    phone: '98 111 222',
    source: 'website',
    status: 'qualified',
    priority: 'high',
    estimatedValue: 75000,
    probability: 60,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'IT / Data Analytics',
    website: 'www.datalogix.tn',
    address: 'Technopole El Ghazela',
    notes: 'Très intéressé par notre solution ERP. Budget confirmé pour Q1.',
    nextFollowUp: getDate(3),
    lastContactDate: getDate(-2),
    tags: ['ERP', 'Priorité'],
    createdAt: getDate(-30),
    updatedAt: getDate(-2)
  },
  {
    id: 'p2',
    company: 'Green Farm Agricole',
    contactName: 'Fatma Bouzid',
    email: 'fbouzid@greenfarm.tn',
    phone: '71 888 999',
    source: 'trade_show',
    status: 'proposal',
    priority: 'hot',
    estimatedValue: 120000,
    probability: 75,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Agriculture',
    address: 'Route de Zaghouan, Mornag',
    notes: 'Rencontré au SIAT 2024. Proposition envoyée, en attente de validation.',
    nextFollowUp: getDate(1),
    lastContactDate: getDate(-5),
    tags: ['Salon', 'Grande entreprise'],
    createdAt: getDate(-45),
    updatedAt: getDate(-5)
  },
  {
    id: 'p3',
    company: 'MedEquip Distribution',
    contactName: 'Dr. Hichem Nasri',
    email: 'hnasri@medequip.tn',
    phone: '71 444 555',
    source: 'referral',
    status: 'negotiation',
    priority: 'hot',
    estimatedValue: 95000,
    probability: 80,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Équipement médical',
    website: 'www.medequip-tunisia.com',
    address: 'Centre Urbain Nord, Tunis',
    notes: 'Recommandé par Clinique Les Jasmins. Négociation sur les conditions de paiement.',
    nextFollowUp: getDate(2),
    lastContactDate: getDate(-1),
    tags: ['Recommandation', 'Médical', 'VIP'],
    createdAt: getDate(-60),
    updatedAt: getDate(-1)
  },
  {
    id: 'p4',
    company: 'TechnoSmart',
    contactName: 'Wissem Karoui',
    email: 'wkaroui@technosmart.tn',
    phone: '55 666 777',
    source: 'cold_call',
    status: 'contacted',
    priority: 'medium',
    estimatedValue: 35000,
    probability: 30,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Commerce électronique',
    website: 'www.technosmart.tn',
    notes: 'Premier contact positif, à relancer après envoi de la documentation.',
    nextFollowUp: getDate(7),
    lastContactDate: getDate(-3),
    tags: ['E-commerce', 'PME'],
    createdAt: getDate(-14),
    updatedAt: getDate(-3)
  },
  {
    id: 'p5',
    company: 'Carthage Logistics',
    contactName: 'Nabil Ouertani',
    email: 'nouertani@carthagelogistics.tn',
    phone: '71 222 111',
    source: 'advertising',
    status: 'new',
    priority: 'medium',
    estimatedValue: 55000,
    probability: 20,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Transport & Logistique',
    address: 'Zone Portuaire Radès',
    notes: 'A répondu à notre campagne LinkedIn. Premier rdv à planifier.',
    nextFollowUp: getDate(5),
    tags: ['LinkedIn', 'Logistique'],
    createdAt: getDate(-7),
    updatedAt: getDate(-7)
  },
  {
    id: 'p6',
    company: 'Bijouterie Medina Gold',
    contactName: 'Sami Bouslama',
    email: 'sbouslama@medinagold.tn',
    phone: '71 999 888',
    source: 'referral',
    status: 'qualified',
    priority: 'high',
    estimatedValue: 45000,
    probability: 50,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Bijouterie / Luxe',
    address: 'Souk El Berka, Médina Tunis',
    notes: 'Recherche solution de gestion de stock pour bijouterie. Recommandé par un client existant.',
    nextFollowUp: getDate(4),
    lastContactDate: getDate(-8),
    tags: ['Luxe', 'Recommandation'],
    createdAt: getDate(-20),
    updatedAt: getDate(-8)
  },
  {
    id: 'p7',
    company: 'EcoBuild Construction',
    contactName: 'Raouf Miled',
    email: 'rmiled@ecobuild.tn',
    phone: '71 333 222',
    source: 'website',
    status: 'proposal',
    priority: 'medium',
    estimatedValue: 85000,
    probability: 55,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'BTP / Construction',
    website: 'www.ecobuild-tunisia.com',
    address: 'Route de Bizerte, Ariana',
    notes: 'Intéressé par le module gestion de chantier. Proposition technique envoyée.',
    nextFollowUp: getDate(6),
    lastContactDate: getDate(-4),
    tags: ['BTP', 'Projet important'],
    createdAt: getDate(-35),
    updatedAt: getDate(-4)
  },
  {
    id: 'p8',
    company: 'Institut Supérieur de Gestion',
    contactName: 'Prof. Leila Gharbi',
    email: 'lgharbi@isg.tn',
    phone: '71 777 111',
    source: 'cold_call',
    status: 'contacted',
    priority: 'low',
    estimatedValue: 25000,
    probability: 25,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Éducation',
    website: 'www.isg.rnu.tn',
    address: 'Le Bardo, Tunis',
    notes: 'Besoin de solution de gestion académique. Budget limité, cycle de décision long.',
    nextFollowUp: getDate(14),
    lastContactDate: getDate(-10),
    tags: ['Éducation', 'Public'],
    createdAt: getDate(-25),
    updatedAt: getDate(-10)
  },
  {
    id: 'p9',
    company: 'Café Liwan Chain',
    contactName: 'Ines Mansour',
    email: 'imansour@liwan.tn',
    phone: '98 444 333',
    source: 'social_media',
    status: 'won',
    priority: 'high',
    estimatedValue: 40000,
    probability: 100,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Restauration',
    website: 'www.cafeliwan.tn',
    address: 'Multiple locations, Tunis',
    notes: 'Converti en client! Contrat signé le 15/11.',
    lastContactDate: getDate(-5),
    tags: ['Restauration', 'Chaîne'],
    createdAt: getDate(-90),
    updatedAt: getDate(-5),
    convertedToClientId: 'c11',
    convertedDate: getDate(-5)
  },
  {
    id: 'p10',
    company: 'AutoParts Tunisia',
    contactName: 'Khaled Ben Salah',
    email: 'kbensalah@autoparts.tn',
    phone: '71 555 444',
    source: 'trade_show',
    status: 'lost',
    priority: 'medium',
    estimatedValue: 60000,
    probability: 0,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Automobile',
    notes: 'Perdu au profit d\'un concurrent. Prix trop élevé selon le client.',
    lostReason: 'Prix trop élevé par rapport à la concurrence',
    lastContactDate: getDate(-20),
    tags: ['Automobile', 'Perdu'],
    createdAt: getDate(-75),
    updatedAt: getDate(-20)
  },
  {
    id: 'p11',
    company: 'Fashion House Tunis',
    contactName: 'Amira Jelassi',
    email: 'ajelassi@fashionhouse.tn',
    phone: '71 666 555',
    source: 'website',
    status: 'new',
    priority: 'low',
    estimatedValue: 30000,
    probability: 15,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Mode / Textile',
    website: 'www.fashionhousetunis.com',
    address: 'La Marsa',
    notes: 'Demande d\'information via formulaire web. À contacter.',
    nextFollowUp: getDate(2),
    tags: ['Mode', 'Retail'],
    createdAt: getDate(-3),
    updatedAt: getDate(-3)
  },
  {
    id: 'p12',
    company: 'Clinique Dentaire Sousse',
    contactName: 'Dr. Anis Hammami',
    email: 'ahammami@clindentsousse.tn',
    phone: '73 222 111',
    source: 'referral',
    status: 'qualified',
    priority: 'medium',
    estimatedValue: 50000,
    probability: 45,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Santé / Dentaire',
    address: 'Avenue Habib Bourguiba, Sousse',
    notes: 'Recommandé par Clinique Les Jasmins. Intéressé par module RDV et facturation.',
    nextFollowUp: getDate(8),
    lastContactDate: getDate(-6),
    tags: ['Santé', 'Sousse', 'Recommandation'],
    createdAt: getDate(-40),
    updatedAt: getDate(-6)
  },
  {
    id: 'p13',
    company: 'Solar Energy TN',
    contactName: 'Mohamed Agrebi',
    email: 'magrebi@solartn.com',
    phone: '71 888 777',
    source: 'advertising',
    status: 'negotiation',
    priority: 'high',
    estimatedValue: 110000,
    probability: 70,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Énergie renouvelable',
    website: 'www.solarenergy-tn.com',
    address: 'Zone Industrielle Sousse',
    notes: 'Grand projet d\'installation. Négociation finale sur l\'échéancier de paiement.',
    nextFollowUp: getDate(1),
    lastContactDate: getDate(-1),
    tags: ['Énergie', 'Grand compte', 'Priorité'],
    createdAt: getDate(-55),
    updatedAt: getDate(-1)
  },
  {
    id: 'p14',
    company: 'Pharmacie Centrale Sfax',
    contactName: 'Mme. Sonia Baklouti',
    email: 'sbaklouti@phcsfax.tn',
    phone: '74 333 222',
    source: 'cold_call',
    status: 'contacted',
    priority: 'medium',
    estimatedValue: 38000,
    probability: 35,
    assignedTo: 'e11',
    assignedToName: 'Salma Dridi',
    industry: 'Pharmacie',
    address: 'Centre Ville Sfax',
    notes: 'Besoin de solution de gestion de stock pharmaceutique. En attente de budget.',
    nextFollowUp: getDate(10),
    lastContactDate: getDate(-12),
    tags: ['Pharmacie', 'Sfax'],
    createdAt: getDate(-30),
    updatedAt: getDate(-12)
  },
  {
    id: 'p15',
    company: 'TunisPay Fintech',
    contactName: 'Youssef Mejri',
    email: 'ymejri@tunispay.tn',
    phone: '98 777 666',
    source: 'social_media',
    status: 'proposal',
    priority: 'hot',
    estimatedValue: 150000,
    probability: 65,
    assignedTo: 'e8',
    assignedToName: 'Riadh Hammami',
    industry: 'Fintech',
    website: 'www.tunispay.tn',
    address: 'Les Berges du Lac 2',
    notes: 'Startup en forte croissance. Proposition technique et commerciale envoyée. Très prometteur!',
    nextFollowUp: getDate(3),
    lastContactDate: getDate(-2),
    tags: ['Fintech', 'Startup', 'VIP', 'Priorité'],
    createdAt: getDate(-28),
    updatedAt: getDate(-2)
  }
];

// --- OPPORTUNITIES DATA ---
export const mockOpportunities: Opportunity[] = [
  // Opportunities for existing clients
  {
    id: 'opp1',
    title: 'Extension module RH - SFBT',
    clientId: 'c1',
    clientName: 'SFBT',
    amount: 45000,
    probability: 80,
    weightedAmount: 36000,
    currency: 'TND',
    stage: 'negotiation',
    expectedCloseDate: getDate(15),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Finaliser les conditions contractuelles',
    nextActionDate: getDate(3),
    source: 'Upsell',
    notes: 'Le client souhaite étendre son utilisation au module RH complet.',
    tags: ['Upsell', 'RH', 'Priorité'],
    createdAt: getDate(-30),
    updatedAt: getDate(-1)
  },
  {
    id: 'opp2',
    title: 'Nouveau projet CRM - Poulina',
    clientId: 'c2',
    clientName: 'Poulina Group Holding',
    amount: 85000,
    probability: 60,
    weightedAmount: 51000,
    currency: 'TND',
    stage: 'proposal',
    expectedCloseDate: getDate(30),
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    nextAction: 'Présentation technique à l\'équipe IT',
    nextActionDate: getDate(7),
    source: 'Cross-sell',
    notes: 'Intéressés par notre nouveau module CRM pour leur équipe commerciale.',
    tags: ['CRM', 'Cross-sell'],
    createdAt: getDate(-45),
    updatedAt: getDate(-5)
  },
  {
    id: 'opp3',
    title: 'Maintenance annuelle - Vermeg',
    clientId: 'c4',
    clientName: 'Vermeg',
    amount: 25000,
    probability: 90,
    weightedAmount: 22500,
    currency: 'TND',
    stage: 'negotiation',
    expectedCloseDate: getDate(10),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Envoyer contrat pour signature',
    nextActionDate: getDate(2),
    source: 'Renouvellement',
    notes: 'Renouvellement du contrat de maintenance annuel.',
    tags: ['Maintenance', 'Renouvellement'],
    createdAt: getDate(-15),
    updatedAt: getDate(-2)
  },
  {
    id: 'opp4',
    title: 'Déploiement régional - Tunisie Telecom',
    clientId: 'c6',
    clientName: 'Tunisie Telecom',
    amount: 180000,
    probability: 50,
    weightedAmount: 90000,
    currency: 'TND',
    stage: 'qualified',
    expectedCloseDate: getDate(60),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Réunion avec le comité de direction',
    nextActionDate: getDate(14),
    source: 'Expansion',
    notes: 'Extension de notre solution aux agences régionales.',
    tags: ['Grand compte', 'Expansion', 'Priorité'],
    createdAt: getDate(-60),
    updatedAt: getDate(-10)
  },
  {
    id: 'opp5',
    title: 'Module Comptabilité - Banque de Tunisie',
    clientId: 'c7',
    clientName: 'Banque de Tunisie',
    amount: 120000,
    probability: 40,
    weightedAmount: 48000,
    currency: 'TND',
    stage: 'qualified',
    expectedCloseDate: getDate(45),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Préparation POC',
    nextActionDate: getDate(10),
    source: 'Cross-sell',
    notes: 'Besoin d\'intégration avec leur système bancaire existant.',
    tags: ['Finance', 'Comptabilité', 'POC'],
    createdAt: getDate(-40),
    updatedAt: getDate(-8)
  },
  // Opportunities for prospects
  {
    id: 'opp6',
    title: 'Implémentation ERP complète - DataLogix',
    prospectId: 'p1',
    prospectName: 'DataLogix Tunisia',
    amount: 75000,
    probability: 60,
    weightedAmount: 45000,
    currency: 'TND',
    stage: 'qualified',
    expectedCloseDate: getDate(25),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Démonstration personnalisée',
    nextActionDate: getDate(3),
    source: 'Inbound',
    notes: 'Prospect très qualifié, budget confirmé.',
    tags: ['ERP', 'Nouveau client'],
    createdAt: getDate(-30),
    updatedAt: getDate(-2)
  },
  {
    id: 'opp7',
    title: 'Solution Agricole - Green Farm',
    prospectId: 'p2',
    prospectName: 'Green Farm Agricole',
    amount: 120000,
    probability: 75,
    weightedAmount: 90000,
    currency: 'TND',
    stage: 'proposal',
    expectedCloseDate: getDate(20),
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    nextAction: 'Suivi proposition',
    nextActionDate: getDate(1),
    source: 'Salon',
    notes: 'Proposition technique envoyée, très bon feeling.',
    tags: ['Agriculture', 'Grand projet'],
    createdAt: getDate(-45),
    updatedAt: getDate(-5)
  },
  {
    id: 'opp8',
    title: 'Gestion Équipements - MedEquip',
    prospectId: 'p3',
    prospectName: 'MedEquip Distribution',
    amount: 95000,
    probability: 80,
    weightedAmount: 76000,
    currency: 'TND',
    stage: 'negotiation',
    expectedCloseDate: getDate(12),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Négociation conditions de paiement',
    nextActionDate: getDate(2),
    source: 'Recommandation',
    notes: 'Négociation avancée, client pressé de démarrer.',
    tags: ['Médical', 'Priorité', 'Recommandation'],
    createdAt: getDate(-60),
    updatedAt: getDate(-1)
  },
  {
    id: 'opp9',
    title: 'E-commerce Solution - TechnoSmart',
    prospectId: 'p4',
    prospectName: 'TechnoSmart',
    amount: 35000,
    probability: 30,
    weightedAmount: 10500,
    currency: 'TND',
    stage: 'new',
    expectedCloseDate: getDate(45),
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    nextAction: 'Envoi documentation',
    nextActionDate: getDate(7),
    source: 'Prospection',
    notes: 'Premier contact, à développer.',
    tags: ['E-commerce', 'PME'],
    createdAt: getDate(-14),
    updatedAt: getDate(-3)
  },
  {
    id: 'opp10',
    title: 'Gestion Logistique - Carthage Logistics',
    prospectId: 'p5',
    prospectName: 'Carthage Logistics',
    amount: 55000,
    probability: 20,
    weightedAmount: 11000,
    currency: 'TND',
    stage: 'new',
    expectedCloseDate: getDate(60),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Planifier premier RDV',
    nextActionDate: getDate(5),
    source: 'LinkedIn',
    notes: 'Lead LinkedIn à qualifier.',
    tags: ['Logistique', 'À qualifier'],
    createdAt: getDate(-7),
    updatedAt: getDate(-7)
  },
  {
    id: 'opp11',
    title: 'Gestion Stock Bijouterie - Medina Gold',
    prospectId: 'p6',
    prospectName: 'Bijouterie Medina Gold',
    amount: 45000,
    probability: 50,
    weightedAmount: 22500,
    currency: 'TND',
    stage: 'qualified',
    expectedCloseDate: getDate(35),
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    nextAction: 'Démonstration sur site',
    nextActionDate: getDate(4),
    source: 'Recommandation',
    notes: 'Besoin spécifique de traçabilité pour métaux précieux.',
    tags: ['Bijouterie', 'Stock'],
    createdAt: getDate(-20),
    updatedAt: getDate(-8)
  },
  {
    id: 'opp12',
    title: 'Gestion Chantiers - EcoBuild',
    prospectId: 'p7',
    prospectName: 'EcoBuild Construction',
    amount: 85000,
    probability: 55,
    weightedAmount: 46750,
    currency: 'TND',
    stage: 'proposal',
    expectedCloseDate: getDate(40),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Présentation référence BTP',
    nextActionDate: getDate(6),
    source: 'Inbound',
    notes: 'Proposition technique envoyée pour module chantier.',
    tags: ['BTP', 'Chantier'],
    createdAt: getDate(-35),
    updatedAt: getDate(-4)
  },
  {
    id: 'opp13',
    title: 'Solution Solaire - Solar Energy',
    prospectId: 'p13',
    prospectName: 'Solar Energy TN',
    amount: 110000,
    probability: 70,
    weightedAmount: 77000,
    currency: 'TND',
    stage: 'negotiation',
    expectedCloseDate: getDate(18),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Finalisation contrat',
    nextActionDate: getDate(1),
    source: 'Publicité',
    notes: 'En cours de négociation finale, très prometteur.',
    tags: ['Énergie', 'Priorité', 'Grand compte'],
    createdAt: getDate(-55),
    updatedAt: getDate(-1)
  },
  {
    id: 'opp14',
    title: 'Plateforme Fintech - TunisPay',
    prospectId: 'p15',
    prospectName: 'TunisPay Fintech',
    amount: 150000,
    probability: 65,
    weightedAmount: 97500,
    currency: 'TND',
    stage: 'proposal',
    expectedCloseDate: getDate(28),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    nextAction: 'Réponse aux questions techniques',
    nextActionDate: getDate(3),
    source: 'Réseaux sociaux',
    notes: 'Startup en forte croissance, gros potentiel.',
    tags: ['Fintech', 'Startup', 'VIP'],
    createdAt: getDate(-28),
    updatedAt: getDate(-2)
  },
  // Won & Lost opportunities
  {
    id: 'opp15',
    title: 'Système Café Chain - Liwan',
    prospectId: 'p9',
    prospectName: 'Café Liwan Chain',
    amount: 40000,
    probability: 100,
    weightedAmount: 40000,
    currency: 'TND',
    stage: 'won',
    expectedCloseDate: getDate(-10),
    actualCloseDate: getDate(-5),
    salesRepId: 'e8',
    salesRepName: 'Riadh Hammami',
    wonReason: 'Excellente démo et références similaires',
    notes: 'Contrat signé! Déploiement prévu en janvier.',
    tags: ['Restauration', 'Gagné'],
    createdAt: getDate(-90),
    updatedAt: getDate(-5)
  },
  {
    id: 'opp16',
    title: 'Gestion Auto - AutoParts',
    prospectId: 'p10',
    prospectName: 'AutoParts Tunisia',
    amount: 60000,
    probability: 0,
    weightedAmount: 0,
    currency: 'TND',
    stage: 'lost',
    expectedCloseDate: getDate(-25),
    actualCloseDate: getDate(-20),
    salesRepId: 'e11',
    salesRepName: 'Salma Dridi',
    lostReason: 'Prix trop élevé par rapport à la concurrence',
    notes: 'Perdu au profit de [Concurrent X]. À recontacter dans 6 mois.',
    tags: ['Automobile', 'Perdu'],
    createdAt: getDate(-75),
    updatedAt: getDate(-20)
  }
];

// --- CLIENT INTERACTIONS DATA ---
export const mockClientInteractions: ClientInteraction[] = [
  // SFBT interactions
  {
    id: 'ci1',
    clientId: 'c1',
    type: 'meeting',
    date: getDate(-60),
    subject: 'Réunion de lancement projet RH',
    description: 'Présentation du module RH et définition du périmètre.',
    outcome: 'Périmètre validé, planning défini',
    nextAction: 'Envoyer documentation technique',
    nextActionDate: getDate(-55),
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 120,
    opportunityId: 'opp1',
    createdAt: getDate(-60)
  },
  {
    id: 'ci2',
    clientId: 'c1',
    type: 'call',
    date: getDate(-45),
    subject: 'Point d\'avancement',
    description: 'Appel de suivi sur le projet RH.',
    outcome: 'Client satisfait, demande de démo complémentaire',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 30,
    createdAt: getDate(-45)
  },
  {
    id: 'ci3',
    clientId: 'c1',
    type: 'demo',
    date: getDate(-30),
    subject: 'Démonstration module Paie',
    description: 'Présentation détaillée du module de paie.',
    outcome: 'Très positif, validation pour phase finale',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 90,
    opportunityId: 'opp1',
    createdAt: getDate(-30)
  },
  {
    id: 'ci4',
    clientId: 'c1',
    type: 'email',
    date: getDate(-15),
    subject: 'Envoi proposition commerciale finale',
    description: 'Proposition avec conditions négociées.',
    outcome: 'En attente de validation direction',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    createdAt: getDate(-15)
  },
  // Poulina interactions
  {
    id: 'ci5',
    clientId: 'c2',
    type: 'meeting',
    date: getDate(-40),
    subject: 'Présentation nouvelle offre CRM',
    description: 'Réunion avec équipe commerciale pour présenter le nouveau module CRM.',
    outcome: 'Intérêt confirmé, demande de POC',
    nextAction: 'Préparer environnement POC',
    nextActionDate: getDate(-35),
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 90,
    opportunityId: 'opp2',
    createdAt: getDate(-40)
  },
  {
    id: 'ci6',
    clientId: 'c2',
    type: 'demo',
    date: getDate(-25),
    subject: 'POC Module CRM',
    description: 'Démonstration du POC avec données réelles du client.',
    outcome: 'POC concluant, passage en phase proposition',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 120,
    opportunityId: 'opp2',
    createdAt: getDate(-25)
  },
  {
    id: 'ci7',
    clientId: 'c2',
    type: 'call',
    date: getDate(-10),
    subject: 'Suivi proposition CRM',
    description: 'Appel pour discuter de la proposition envoyée.',
    outcome: 'Quelques ajustements demandés, budget OK',
    nextAction: 'Réviser proposition',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 45,
    createdAt: getDate(-10)
  },
  // Vermeg interactions
  {
    id: 'ci8',
    clientId: 'c4',
    type: 'email',
    date: getDate(-20),
    subject: 'Notification renouvellement maintenance',
    description: 'Envoi du rappel de renouvellement du contrat de maintenance.',
    outcome: 'Accusé de réception',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    opportunityId: 'opp3',
    createdAt: getDate(-20)
  },
  {
    id: 'ci9',
    clientId: 'c4',
    type: 'call',
    date: getDate(-12),
    subject: 'Discussion renouvellement',
    description: 'Appel pour discuter des conditions de renouvellement.',
    outcome: 'Accord de principe, demande petit geste commercial',
    nextAction: 'Validation direction pour remise',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 25,
    createdAt: getDate(-12)
  },
  {
    id: 'ci10',
    clientId: 'c4',
    type: 'note',
    date: getDate(-5),
    subject: 'Note interne - Négociation',
    description: 'Remise de 5% accordée par la direction. Contrat à finaliser.',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    createdAt: getDate(-5)
  },
  // Tunisie Telecom interactions
  {
    id: 'ci11',
    clientId: 'c6',
    type: 'meeting',
    date: getDate(-50),
    subject: 'Réunion stratégique - Expansion régionale',
    description: 'Discussion sur le déploiement de notre solution dans les agences régionales.',
    outcome: 'Projet validé en principe, étude détaillée demandée',
    nextAction: 'Préparer étude de cadrage',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 180,
    opportunityId: 'opp4',
    createdAt: getDate(-50)
  },
  {
    id: 'ci12',
    clientId: 'c6',
    type: 'meeting',
    date: getDate(-30),
    subject: 'Présentation étude de cadrage',
    description: 'Présentation du document de cadrage pour le projet régional.',
    outcome: 'Document approuvé, passage en comité direction',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 120,
    opportunityId: 'opp4',
    createdAt: getDate(-30)
  },
  {
    id: 'ci13',
    clientId: 'c6',
    type: 'email',
    date: getDate(-15),
    subject: 'Envoi proposition technique et commerciale',
    description: 'Envoi de la proposition complète pour le projet régional.',
    outcome: 'Réception confirmée, analyse en cours',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    createdAt: getDate(-15)
  },
  // Magasin Général interactions
  {
    id: 'ci14',
    clientId: 'c5',
    type: 'call',
    date: getDate(-8),
    subject: 'Appel de courtoisie',
    description: 'Point régulier sur la satisfaction client.',
    outcome: 'Client satisfait, pas de besoin immédiat',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 15,
    createdAt: getDate(-8)
  },
  {
    id: 'ci15',
    clientId: 'c5',
    type: 'email',
    date: getDate(-3),
    subject: 'Invitation événement client',
    description: 'Invitation à notre événement annuel clients.',
    outcome: 'Confirmation participation',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    createdAt: getDate(-3)
  },
  // Banque de Tunisie interactions
  {
    id: 'ci16',
    clientId: 'c7',
    type: 'meeting',
    date: getDate(-35),
    subject: 'Présentation module Comptabilité',
    description: 'Présentation des fonctionnalités comptables et d\'intégration.',
    outcome: 'Intérêt fort, besoin d\'étude d\'intégration',
    nextAction: 'Analyse système existant',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 90,
    opportunityId: 'opp5',
    createdAt: getDate(-35)
  },
  {
    id: 'ci17',
    clientId: 'c7',
    type: 'task',
    date: getDate(-20),
    subject: 'Analyse technique intégration',
    description: 'Étude des APIs et formats d\'échange avec le core banking.',
    outcome: 'Rapport technique livré',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 480,
    createdAt: getDate(-20)
  },
  // Délice interactions
  {
    id: 'ci18',
    clientId: 'c8',
    type: 'call',
    date: getDate(-25),
    subject: 'Support - Question technique',
    description: 'Assistance sur l\'utilisation du module stock.',
    outcome: 'Problème résolu',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 20,
    createdAt: getDate(-25)
  },
  {
    id: 'ci19',
    clientId: 'c8',
    type: 'meeting',
    date: getDate(-5),
    subject: 'Revue annuelle',
    description: 'Bilan annuel de l\'utilisation et perspectives.',
    outcome: 'Client satisfait, discussion sur évolutions futures',
    performedById: 'e11',
    performedByName: 'Salma Dridi',
    duration: 60,
    createdAt: getDate(-5)
  },
  // Clinique Les Jasmins interactions
  {
    id: 'ci20',
    clientId: 'c3',
    type: 'call',
    date: getDate(-15),
    subject: 'Recommandation client',
    description: 'Le Dr. Mahjoub nous recommande à MedEquip Distribution.',
    outcome: 'Coordonnées transmises, prospect créé',
    performedById: 'e8',
    performedByName: 'Riadh Hammami',
    duration: 20,
    createdAt: getDate(-15)
  }
];

// --- SRM DATA ---
export const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    code: 'FOUR-20001001',
    company: 'MyTek',
    contactName: 'Service Pro',
    email: 'pro@mytek.tn',
    phone: '36 010 010',
    status: 'active',
    category: 'Informatique',
    totalPurchased: 45000,
    address: 'Route X, km 8.5, Ariana',
    taxId: '0987654/B/N/000',
    purchaseRepId: 'e1',
    purchaseRepName: 'Mohamed Ben Ali',
    contacts: [
      {
        id: 'spc1-1',
        supplierId: 's1',
        firstName: 'Mehdi',
        lastName: 'Hammami',
        email: 'mehdi.hammami@mytek.tn',
        phone: '71 222 333',
        mobile: '98 123 456',
        role: 'sales',
        jobTitle: 'Responsable Commercial',
        department: 'Ventes',
        isPrimary: true,
        createdAt: getDate(-200)
      },
      {
        id: 'spc1-2',
        supplierId: 's1',
        firstName: 'Sana',
        lastName: 'Toumi',
        email: 'sana.toumi@mytek.tn',
        phone: '71 222 334',
        mobile: '22 987 654',
        role: 'technical',
        jobTitle: 'Ingénieur Support',
        department: 'Support Technique',
        isPrimary: false,
        createdAt: getDate(-180)
      }
    ]
  },
  {
    id: 's2',
    code: 'FOUR-20001002',
    company: 'Sotipapier',
    contactName: 'Ali Gharbi',
    email: 'ali@sotipapier.com',
    phone: '71 789 123',
    status: 'active',
    category: 'Papeterie',
    totalPurchased: 12000,
    address: 'Zone Industrielle, Ben Arous',
    taxId: '1122334/P/M/000',
    purchaseRepId: 'e2',
    purchaseRepName: 'Sarra Trabelsi',
    contacts: [
      {
        id: 'spc2-1',
        supplierId: 's2',
        firstName: 'Ali',
        lastName: 'Gharbi',
        email: 'ali.gharbi@sotipapier.com',
        phone: '71 789 123',
        mobile: '98 765 432',
        role: 'decision_maker',
        jobTitle: 'Directeur Commercial',
        department: 'Direction',
        isPrimary: true,
        createdAt: getDate(-250)
      },
      {
        id: 'spc2-2',
        supplierId: 's2',
        firstName: 'Fatma',
        lastName: 'Slimi',
        email: 'fatma.slimi@sotipapier.com',
        phone: '71 789 124',
        role: 'logistics',
        jobTitle: 'Responsable Logistique',
        department: 'Logistique',
        isPrimary: false,
        createdAt: getDate(-220)
      }
    ]
  },
  {
    id: 's3',
    code: 'FOUR-20001003',
    company: 'TotalEnergies',
    contactName: 'Service Carte',
    email: 'cartes@total.tn',
    phone: '71 555 666',
    status: 'active',
    category: 'Carburant',
    totalPurchased: 28000,
    address: 'Avenue de la Liberté, Tunis',
    taxId: '5544332/T/M/000',
    purchaseRepId: 'e3',
    purchaseRepName: 'Karim Jaziri',
    contacts: [
      {
        id: 'spc3-1',
        supplierId: 's3',
        firstName: 'Youssef',
        lastName: 'Ben Salah',
        email: 'youssef.bensalah@total.tn',
        phone: '71 555 666',
        mobile: '55 111 222',
        role: 'sales',
        jobTitle: 'Chargé de Compte Entreprise',
        department: 'B2B',
        isPrimary: true,
        createdAt: getDate(-180)
      }
    ]
  },
  {
    id: 's4',
    code: 'FOUR-20001004',
    company: 'Tunisie Cables',
    contactName: 'Mounir',
    email: 'sales@tuncable.com',
    phone: '71 333 444',
    status: 'inactive',
    category: 'Matériaux',
    totalPurchased: 5600,
    address: 'Route de Bizerte, Ariana',
    taxId: '7788990/C/M/000',
    contacts: [
      {
        id: 'spc4-1',
        supplierId: 's4',
        firstName: 'Mounir',
        lastName: 'Jendoubi',
        email: 'mounir.jendoubi@tuncable.com',
        phone: '71 333 444',
        mobile: '98 222 333',
        role: 'sales',
        jobTitle: 'Commercial',
        department: 'Ventes',
        isPrimary: true,
        createdAt: getDate(-300)
      }
    ]
  }
];

// --- INVENTORY DATA ---
export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Dépôt Central', location: 'ZI Charguia 1', isDefault: true },
  { id: 'wh2', name: 'Magasin Sfax', location: 'Route de Gabès, Sfax' },
  { id: 'wh3', name: 'Agence Sousse', location: 'Sahloul, Sousse' }
];

export const mockInventory: Product[] = [
  { id: 'p1', name: 'Laptop Dell Latitude 5520', sku: 'DELL-5520', category: 'Informatique', price: 2800, cost: 2300, stock: 12, warehouseStock: { 'wh1': 8, 'wh2': 2, 'wh3': 2 }, status: 'in_stock', marginPercent: 17.8 },
  { id: 'p2', name: 'Imprimante HP LaserJet Pro', sku: 'HP-LJP-404', category: 'Informatique', price: 950, cost: 750, stock: 5, warehouseStock: { 'wh1': 5 }, status: 'low_stock', marginPercent: 21.0 },
  { id: 'p3', name: 'Papier A4 (Carton 5 Rames)', sku: 'PAP-A4-BOX', category: 'Bureautique', price: 65, cost: 45, stock: 150, warehouseStock: { 'wh1': 100, 'wh2': 30, 'wh3': 20 }, status: 'in_stock', marginPercent: 30.7 },
  { id: 'p4', name: 'Chaise Bureau Ergonomique', sku: 'FUR-CH-01', category: 'Mobilier', price: 450, cost: 280, stock: 8, warehouseStock: { 'wh1': 8 }, status: 'in_stock', marginPercent: 37.7 },
  { id: 'p5', name: 'Disque Dur SSD 1TB Samsung', sku: 'SSD-1TB-SAM', category: 'Composants', price: 380, cost: 290, stock: 0, warehouseStock: { 'wh1': 0 }, status: 'out_of_stock', marginPercent: 23.6 },
  { id: 'p6', name: 'Onduleur Eaton 5E 1100VA', sku: 'UPS-EAT-1100', category: 'Electricité', price: 290, cost: 210, stock: 20, warehouseStock: { 'wh1': 15, 'wh2': 5 }, status: 'in_stock', marginPercent: 27.5 },
  { id: 'p7', name: 'Routeur Cisco ISR 1100', sku: 'NET-CIS-1100', category: 'Réseau', price: 1800, cost: 1400, stock: 3, warehouseStock: { 'wh1': 3 }, status: 'low_stock', marginPercent: 22.2 },
  { id: 'p8', name: 'Écran Dell 24" Full HD', sku: 'DELL-MON-24', category: 'Informatique', price: 650, cost: 480, stock: 25, warehouseStock: { 'wh1': 15, 'wh2': 6, 'wh3': 4 }, status: 'in_stock', marginPercent: 26.1 },
  { id: 'p9', name: 'Clavier Logitech K780', sku: 'LOG-KB-780', category: 'Périphériques', price: 95, cost: 65, stock: 45, warehouseStock: { 'wh1': 30, 'wh2': 10, 'wh3': 5 }, status: 'in_stock', marginPercent: 31.5 },
  { id: 'p10', name: 'Souris Logitech MX Master 3', sku: 'LOG-MS-MX3', category: 'Périphériques', price: 120, cost: 85, stock: 18, warehouseStock: { 'wh1': 12, 'wh2': 4, 'wh3': 2 }, status: 'low_stock', marginPercent: 29.1 },
  { id: 'p11', name: 'Switch TP-Link 24 Ports', sku: 'TPL-SW-24', category: 'Réseau', price: 380, cost: 280, stock: 8, warehouseStock: { 'wh1': 6, 'wh2': 2 }, status: 'in_stock', marginPercent: 26.3 },
  { id: 'p12', name: 'Câble HDMI 2m', sku: 'CAB-HDMI-2M', category: 'Câbles', price: 25, cost: 12, stock: 120, warehouseStock: { 'wh1': 80, 'wh2': 25, 'wh3': 15 }, status: 'in_stock', marginPercent: 52.0 },
  { id: 'p13', name: 'Disque Dur Externe 2TB Seagate', sku: 'SEA-HDD-2TB', category: 'Stockage', price: 280, cost: 210, stock: 14, warehouseStock: { 'wh1': 10, 'wh2': 4 }, status: 'in_stock', marginPercent: 25.0 },
  { id: 'p14', name: 'Webcam Logitech C920', sku: 'LOG-WC-920', category: 'Périphériques', price: 180, cost: 135, stock: 1, warehouseStock: { 'wh1': 1 }, status: 'low_stock', marginPercent: 25.0 },
  { id: 'p15', name: 'Casque Jabra Evolve 40', sku: 'JAB-HS-E40', category: 'Audio', price: 165, cost: 120, stock: 22, warehouseStock: { 'wh1': 15, 'wh2': 7 }, status: 'in_stock', marginPercent: 27.2 },
  { id: 'p16', name: 'Hub USB-C 7 Ports', sku: 'HUB-USBC-7P', category: 'Accessoires', price: 75, cost: 45, stock: 35, warehouseStock: { 'wh1': 25, 'wh2': 6, 'wh3': 4 }, status: 'in_stock', marginPercent: 40.0 },
  { id: 'p17', name: 'Sacoche Laptop 15.6"', sku: 'BAG-LAP-15', category: 'Accessoires', price: 55, cost: 30, stock: 28, warehouseStock: { 'wh1': 18, 'wh2': 6, 'wh3': 4 }, status: 'in_stock', marginPercent: 45.4 },
  { id: 'p18', name: 'Multiprise Parasurtension 6P', sku: 'PWR-SPT-6P', category: 'Électricité', price: 45, cost: 28, stock: 0, warehouseStock: { 'wh1': 0 }, status: 'out_of_stock', marginPercent: 37.7 },
  { id: 'p19', name: 'Toner HP 26A Noir', sku: 'HP-TNR-26A', category: 'Consommables', price: 180, cost: 125, stock: 16, warehouseStock: { 'wh1': 12, 'wh2': 4 }, status: 'low_stock', marginPercent: 30.5 },
  { id: 'p20', name: 'Ramette Papier A4 80g', sku: 'PAP-A4-80G', category: 'Bureautique', price: 12, cost: 8, stock: 280, warehouseStock: { 'wh1': 180, 'wh2': 60, 'wh3': 40 }, status: 'in_stock', marginPercent: 33.3 }
];

// --- SALES DOCUMENTS ---
export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', number: 'FAC-2024-001', type: 'invoice', clientId: 'c1', clientName: 'SFBT',
    projectId: 'prj1', projectName: 'Refonte Site Web Corporate',
    date: getDate(-15), amount: 14600, amountPaid: 14600, status: 'paid', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 5, price: 2800}, {id: 'p3', description: 'Papier A4 (Carton)', quantity: 10, price: 60}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 14600, fiscalStamp: 1.000
  },
  {
    id: 'inv2', number: 'FAC-2024-002', type: 'invoice', clientId: 'c2', clientName: 'Poulina Group',
    projectId: 'prj2', projectName: 'Application Mobile E-Commerce',
    date: getDate(-5), amount: 9500, amountPaid: 0, status: 'pending', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p2', description: 'Imprimante HP', quantity: 10, price: 950}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 9500, fiscalStamp: 1.000, dueDate: getDate(25)
  },
  {
    id: 'ord1', number: 'BC-2024-055', type: 'order', clientId: 'c3', clientName: 'Clinique Les Jasmins',
    projectId: 'prj4', projectName: 'Migration Cloud AWS',
    date: getDate(-2), amount: 4500, status: 'pending', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p4', description: 'Chaise Bureau Ergonomique', quantity: 10, price: 450}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 4500, paymentTerms: 'Net 30'
  },
  {
    id: 'est1', number: 'DEV-2024-101', type: 'estimate', clientId: 'c4', clientName: 'Vermeg',
    projectId: 'prj3', projectName: 'Audit Sécurité Infrastructure',
    date: getDate(0), amount: 5600, status: 'sent', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 2, price: 2800}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 5600
  },
  {
    id: 'inv3', number: 'FAC-2024-003', type: 'invoice', clientId: 'c1', clientName: 'SFBT',
    projectId: 'prj1', projectName: 'Refonte Site Web Corporate',
    date: getDate(-40), amount: 12500, amountPaid: 12500, status: 'paid', currency: 'TND', exchangeRate: 1,
    items: [{id: 'srv1', description: 'Développement Frontend React', quantity: 80, price: 150}, {id: 'srv2', description: 'Design UI/UX', quantity: 5, price: 500}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 12500, fiscalStamp: 1.000,
    notes: 'Phase 1 - Développement Frontend'
  },
  {
    id: 'inv4', number: 'FAC-2024-004', type: 'invoice', clientId: 'c2', clientName: 'Poulina Group',
    projectId: 'prj2', projectName: 'Application Mobile E-Commerce',
    date: getDate(-20), amount: 18500, amountPaid: 9250, status: 'partial', currency: 'TND', exchangeRate: 1,
    items: [{id: 'srv3', description: 'Développement Mobile iOS', quantity: 100, price: 120}, {id: 'srv4', description: 'Développement Mobile Android', quantity: 50, price: 110}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 18500, fiscalStamp: 1.000, dueDate: getDate(10),
    notes: 'Paiement échelonné - 50% à la livraison'
  },
  {
    id: 'ord2', number: 'BC-2024-056', type: 'order', clientId: 'c4', clientName: 'Vermeg',
    projectId: 'prj3', projectName: 'Audit Sécurité Infrastructure',
    date: getDate(-10), amount: 8900, status: 'accepted', currency: 'TND', exchangeRate: 1,
    items: [{id: 'srv5', description: 'Audit de sécurité niveau 1', quantity: 40, price: 200}, {id: 'srv6', description: 'Tests de pénétration', quantity: 5, price: 180}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 8900, paymentTerms: 'Net 30'
  },
  {
    id: 'est2', number: 'DEV-2024-102', type: 'estimate', clientId: 'c3', clientName: 'Clinique Les Jasmins',
    date: getDate(-5), amount: 15800, status: 'sent', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'srv7', description: 'Formation Personnel - Sécurité Informatique', quantity: 10, price: 450},
      {id: 'srv8', description: 'Installation Pare-feu Enterprise', quantity: 1, price: 11300}
    ],
    warehouseId: 'wh1', taxRate: 19, subtotal: 15800,
    notes: 'Proposition pour nouveau projet sécurité 2024'
  },
  {
    id: 'est3', number: 'DEV-2024-103', type: 'estimate', clientId: 'c5', clientName: 'Magasin Général',
    projectId: 'prj6', projectName: 'Maintenance Annuelle ERP',
    date: getDate(-2), amount: 6200, status: 'draft', currency: 'TND', exchangeRate: 1,
    items: [{id: 'srv9', description: 'Support Maintenance Mensuel', quantity: 12, price: 500}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 6200,
    notes: 'Renouvellement contrat maintenance 2024'
  },
  {
    id: 'del1', number: 'BL-2024-001', type: 'delivery', clientId: 'c1', clientName: 'SFBT',
    projectId: 'prj1', projectName: 'Refonte Site Web Corporate',
    date: getDate(-16), amount: 14600, status: 'completed', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 5, price: 2800}, {id: 'p3', description: 'Papier A4 (Carton)', quantity: 10, price: 60}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 14600,
    linkedDocumentId: 'inv1'
  },
  {
    id: 'del2', number: 'BL-2024-002', type: 'delivery', clientId: 'c2', clientName: 'Poulina Group',
    projectId: 'prj2', projectName: 'Application Mobile E-Commerce',
    date: getDate(-21), amount: 18500, status: 'completed', currency: 'TND', exchangeRate: 1,
    items: [{id: 'srv3', description: 'Développement Mobile iOS', quantity: 100, price: 120}],
    warehouseId: 'wh1', taxRate: 19, subtotal: 18500,
    linkedDocumentId: 'inv4'
  }
];

// --- PURCHASE DOCUMENTS ---
export const mockPurchases: Purchase[] = [
  { 
    id: 'po1', number: 'BCF-2024-001', type: 'order', supplierId: 's1', supplierName: 'MyTek', 
    date: getDate(-20), amount: 23000, status: 'completed', currency: 'TND', exchangeRate: 1, 
    items: [{id: 'p1', description: 'Laptop Dell Latitude', quantity: 10, price: 2300}], 
    warehouseId: 'wh1', subtotal: 23000, taxRate: 19 
  },
  {
    id: 'po2', number: 'BCF-2024-002', type: 'order', supplierId: 's2', supplierName: 'Sotipapier',
    date: getDate(-10), amount: 4500, status: 'pending', currency: 'TND', exchangeRate: 1,
    items: [{id: 'p3', description: 'Papier A4', quantity: 100, price: 45}],
    warehouseId: 'wh1', subtotal: 4500, taxRate: 19
  },
  // Factures Fournisseurs
  {
    id: 'pinv1', number: 'FF-2024-001', type: 'invoice', supplierId: 's1', supplierName: 'MyTek',
    date: getDate(-25), amount: 11970, amountPaid: 0, status: 'draft', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 5, price: 2300},
      {id: 'p2', description: 'Écran Samsung 24"', quantity: 3, price: 450}
    ],
    warehouseId: 'wh1', subtotal: 11970, taxRate: 19, fiscalStamp: 1,
    paymentTerms: 'Net 30', paymentMethod: 'Virement bancaire',
    notes: 'Facture en brouillon - À valider après vérification'
  },
  {
    id: 'pinv2', number: 'FF-2024-002', type: 'invoice', supplierId: 's2', supplierName: 'Sotipapier',
    date: getDate(-18), amount: 5355, amountPaid: 0, status: 'validated', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'p3', description: 'Papier A4 (Carton)', quantity: 50, price: 60},
      {id: 'p4', description: 'Enveloppes (Paquet)', quantity: 20, price: 15},
      {id: 'p5', description: 'Stylos (Boîte 50u)', quantity: 10, price: 45}
    ],
    warehouseId: 'wh1', subtotal: 4500, taxRate: 19, fiscalStamp: 1,
    paymentTerms: 'Net 60', paymentMethod: 'Chèque',
    notes: 'Facture validée - En attente de paiement'
  },
  {
    id: 'pinv3', number: 'FF-2024-003', type: 'invoice', supplierId: 's3', supplierName: 'TotalEnergies',
    date: getDate(-12), amount: 5950, amountPaid: 3000, status: 'partial', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'fuel1', description: 'Carburant - Bon N°001234', quantity: 250, price: 2.20},
      {id: 'fuel2', description: 'Carburant - Bon N°001235', quantity: 300, price: 2.20}
    ],
    warehouseId: 'wh1', subtotal: 5000, taxRate: 19, fiscalStamp: 0,
    paymentTerms: 'Net 30', paymentMethod: 'Virement bancaire',
    notes: 'Premier versement de 3000 TND effectué le ' + getDate(-5)
  },
  {
    id: 'pinv4', number: 'FF-2024-004', type: 'invoice', supplierId: 's1', supplierName: 'MyTek',
    date: getDate(-30), amount: 27370, amountPaid: 27370, status: 'completed', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'p1', description: 'Laptop Dell Latitude 5520', quantity: 10, price: 2300},
      {id: 'p2', description: 'Écran Samsung 24"', quantity: 5, price: 450},
      {id: 'kbd1', description: 'Clavier + Souris sans fil', quantity: 10, price: 45}
    ],
    warehouseId: 'wh1', subtotal: 23000, taxRate: 19, fiscalStamp: 1,
    paymentTerms: 'Net 30', paymentMethod: 'Virement bancaire',
    notes: 'Facture payée intégralement le ' + getDate(-15)
  },
  {
    id: 'pinv5', number: 'FF-2024-005', type: 'invoice', supplierId: 's2', supplierName: 'Sotipapier',
    date: getDate(-5), amount: 1785, amountPaid: 0, status: 'validated', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'p3', description: 'Papier A4 (Carton)', quantity: 20, price: 60},
      {id: 'p5', description: 'Stylos (Boîte 50u)', quantity: 10, price: 45}
    ],
    warehouseId: 'wh1', subtotal: 1500, taxRate: 19, fiscalStamp: 1,
    paymentTerms: 'Net 30', paymentMethod: 'Espèces',
    notes: 'Livraison urgente effectuée'
  },
  {
    id: 'pinv6', number: 'FF-2024-006', type: 'invoice', supplierId: 's1', supplierName: 'MyTek',
    date: getDate(-2), amount: 8925, amountPaid: 0, status: 'draft', currency: 'TND', exchangeRate: 1,
    items: [
      {id: 'p2', description: 'Écran Samsung 24"', quantity: 15, price: 450},
      {id: 'cable1', description: 'Câbles HDMI (Lot 10)', quantity: 5, price: 75}
    ],
    warehouseId: 'wh1', subtotal: 7500, taxRate: 19, fiscalStamp: 0,
    paymentTerms: 'Net 60', paymentMethod: 'Virement bancaire',
    notes: 'Facture en cours de vérification - Articles à contrôler'
  }
];

// --- MOVEMENTS ---
export const mockStockMovements: StockMovement[] = [
  // Achats (Entrées de stock)
  { id: 'sm1', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-20), quantity: 10, type: 'purchase', unitCost: 2300, reference: 'BC-2024-001' },
  { id: 'sm2', productId: 'p8', productName: 'Écran Dell 24" Full HD', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-18), quantity: 20, type: 'purchase', unitCost: 480, reference: 'BC-2024-002' },
  { id: 'sm3', productId: 'p9', productName: 'Clavier Logitech K780', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-18), quantity: 50, type: 'purchase', unitCost: 65, reference: 'BC-2024-002' },
  { id: 'sm4', productId: 'p12', productName: 'Câble HDMI 2m', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-17), quantity: 100, type: 'purchase', unitCost: 12, reference: 'BC-2024-003' },
  { id: 'sm5', productId: 'p20', productName: 'Ramette Papier A4 80g', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-16), quantity: 200, type: 'purchase', unitCost: 8, reference: 'BC-2024-004' },
  { id: 'sm6', productId: 'p6', productName: 'Onduleur Eaton 5E 1100VA', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-14), quantity: 25, type: 'purchase', unitCost: 210, reference: 'BC-2024-005' },
  { id: 'sm7', productId: 'p13', productName: 'Disque Dur Externe 2TB Seagate', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-12), quantity: 15, type: 'purchase', unitCost: 210, reference: 'BC-2024-006' },
  { id: 'sm8', productId: 'p15', productName: 'Casque Jabra Evolve 40', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-10), quantity: 30, type: 'purchase', unitCost: 120, reference: 'BC-2024-007' },

  // Ventes (Sorties de stock)
  { id: 'sm9', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-15), quantity: -5, type: 'sale', reference: 'FAC-2024-001' },
  { id: 'sm10', productId: 'p8', productName: 'Écran Dell 24" Full HD', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-15), quantity: -8, type: 'sale', reference: 'FAC-2024-001' },
  { id: 'sm11', productId: 'p9', productName: 'Clavier Logitech K780', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-14), quantity: -12, type: 'sale', reference: 'FAC-2024-002' },
  { id: 'sm12', productId: 'p12', productName: 'Câble HDMI 2m', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-14), quantity: -15, type: 'sale', reference: 'FAC-2024-002' },
  { id: 'sm13', productId: 'p20', productName: 'Ramette Papier A4 80g', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-13), quantity: -25, type: 'sale', reference: 'FAC-2024-003' },
  { id: 'sm14', productId: 'p6', productName: 'Onduleur Eaton 5E 1100VA', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-11), quantity: -8, type: 'sale', reference: 'FAC-2024-004' },
  { id: 'sm15', productId: 'p13', productName: 'Disque Dur Externe 2TB Seagate', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-9), quantity: -3, type: 'sale', reference: 'FAC-2024-005' },
  { id: 'sm16', productId: 'p15', productName: 'Casque Jabra Evolve 40', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-8), quantity: -10, type: 'sale', reference: 'FAC-2024-006' },
  { id: 'sm17', productId: 'p10', productName: 'Souris Logitech MX Master 3', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-7), quantity: -6, type: 'sale', reference: 'FAC-2024-007' },

  // Transferts entre entrepôts (Sortie source + Entrée destination)
  { id: 'sm18', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-12), quantity: -3, type: 'transfer_out', reference: 'TRF-001', transferTo: 'wh2' },
  { id: 'sm19', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh2', warehouseName: 'Magasin Sfax', date: getDate(-12), quantity: 3, type: 'transfer_in', reference: 'TRF-001', transferFrom: 'wh1' },
  { id: 'sm20', productId: 'p8', productName: 'Écran Dell 24" Full HD', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-11), quantity: -7, type: 'transfer_out', reference: 'TRF-002', transferTo: 'wh2' },
  { id: 'sm21', productId: 'p8', productName: 'Écran Dell 24" Full HD', warehouseId: 'wh2', warehouseName: 'Magasin Sfax', date: getDate(-11), quantity: 7, type: 'transfer_in', reference: 'TRF-002', transferFrom: 'wh1' },
  { id: 'sm22', productId: 'p9', productName: 'Clavier Logitech K780', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-10), quantity: -8, type: 'transfer_out', reference: 'TRF-003', transferTo: 'wh3' },
  { id: 'sm23', productId: 'p9', productName: 'Clavier Logitech K780', warehouseId: 'wh3', warehouseName: 'Agence Sousse', date: getDate(-10), quantity: 8, type: 'transfer_in', reference: 'TRF-003', transferFrom: 'wh1' },
  { id: 'sm24', productId: 'p12', productName: 'Câble HDMI 2m', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-9), quantity: -5, type: 'transfer_out', reference: 'TRF-004', transferTo: 'wh2' },
  { id: 'sm25', productId: 'p12', productName: 'Câble HDMI 2m', warehouseId: 'wh2', warehouseName: 'Magasin Sfax', date: getDate(-9), quantity: 5, type: 'transfer_in', reference: 'TRF-004', transferFrom: 'wh1' },
  { id: 'sm26', productId: 'p20', productName: 'Ramette Papier A4 80g', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-8), quantity: -25, type: 'transfer_out', reference: 'TRF-005', transferTo: 'wh3' },
  { id: 'sm27', productId: 'p20', productName: 'Ramette Papier A4 80g', warehouseId: 'wh3', warehouseName: 'Agence Sousse', date: getDate(-8), quantity: 25, type: 'transfer_in', reference: 'TRF-005', transferFrom: 'wh1' },

  // Ajustements de stock (inventaire, casse, vol, etc.)
  { id: 'sm28', productId: 'p2', productName: 'Imprimante HP LaserJet Pro', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-6), quantity: -1, type: 'adjustment', reference: 'ADJ-001', reason: 'Appareil défectueux' },
  { id: 'sm29', productId: 'p14', productName: 'Webcam Logitech C920', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-5), quantity: -2, type: 'adjustment', reference: 'ADJ-002', reason: 'Casse lors manipulation' },
  { id: 'sm30', productId: 'p10', productName: 'Souris Logitech MX Master 3', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-4), quantity: 2, type: 'adjustment', reference: 'ADJ-003', reason: 'Correction après inventaire' },
  { id: 'sm31', productId: 'p19', productName: 'Toner HP 26A Noir', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-3), quantity: -1, type: 'adjustment', reference: 'ADJ-004', reason: 'Utilisation interne' },

  // Retours clients
  { id: 'sm32', productId: 'p8', productName: 'Écran Dell 24" Full HD', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-2), quantity: 1, type: 'return', reference: 'RET-001', reason: 'Pixel mort - échange' },
  { id: 'sm33', productId: 'p10', productName: 'Souris Logitech MX Master 3', warehouseId: 'wh2', warehouseName: 'Magasin Sfax', date: getDate(-1), quantity: 1, type: 'return', reference: 'RET-002', reason: 'Client insatisfait' },

  // Mouvements récents pour distribution entrepôts
  { id: 'sm34', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-13), quantity: -1, type: 'transfer_out', reference: 'TRF-006', transferTo: 'wh3' },
  { id: 'sm35', productId: 'p1', productName: 'Laptop Dell Latitude 5520', warehouseId: 'wh3', warehouseName: 'Agence Sousse', date: getDate(-13), quantity: 1, type: 'transfer_in', reference: 'TRF-006', transferFrom: 'wh1' },
  { id: 'sm36', productId: 'p6', productName: 'Onduleur Eaton 5E 1100VA', warehouseId: 'wh1', warehouseName: 'Dépôt Central', date: getDate(-7), quantity: -3, type: 'transfer_out', reference: 'TRF-007', transferTo: 'wh2' },
  { id: 'sm37', productId: 'p6', productName: 'Onduleur Eaton 5E 1100VA', warehouseId: 'wh2', warehouseName: 'Magasin Sfax', date: getDate(-7), quantity: 3, type: 'transfer_in', reference: 'TRF-007', transferFrom: 'wh1' }
];

// --- FINANCE ---
export const mockBankAccounts: BankAccount[] = [
  { id: 'ba1', name: 'Compte Courant', bankName: 'BIAT', accountNumber: '08 000 123456789 11', type: 'checking', currency: 'TND', balance: 145000 },
  { id: 'ba2', name: 'Compte Épargne', bankName: 'Attijari Bank', accountNumber: '04 500 987654321 22', type: 'savings', currency: 'TND', balance: 25000 },
  { id: 'ba3', name: 'Compte Devises', bankName: 'STB', accountNumber: '10 111 222333444 33', type: 'checking', currency: 'EUR', balance: 5000 }
];

export const mockBankTransactions: BankTransaction[] = [
  { id: 'tx1', accountId: 'ba1', date: getDate(-15), description: 'Virement Client SFBT - FAC-2024-001', amount: 14600, type: 'deposit', status: 'cleared' },
  { id: 'tx2', accountId: 'ba1', date: getDate(-10), description: 'Paiement Fournisseur MyTek', amount: -10000, type: 'payment', status: 'cleared' },
  { id: 'tx3', accountId: 'ba1', date: getDate(-5), description: 'STEG Facture Electricité', amount: -450, type: 'payment', status: 'cleared' },
  { id: 'tx4', accountId: 'ba1', date: getDate(-2), description: 'Frais Bancaires', amount: -25, type: 'fee', status: 'reconciled' }
];

// --- CAISSES ---
export const mockCashRegisters: CashRegister[] = [
  {
    id: 'cr1',
    name: 'Caisse Principale',
    location: 'Comptoir Principal',
    status: 'active',
    initialBalance: 500,
    currentBalance: 450,
    assignedUserId: 'e1',
    assignedUserName: 'Ahmed Tounsi',
    notes: 'Caisse principale du magasin',
    createdAt: getDate(-180)
  },
  {
    id: 'cr2',
    name: 'Caisse Comptoir 2',
    location: 'Comptoir Secondaire',
    status: 'active',
    initialBalance: 300,
    currentBalance: 300,
    assignedUserId: 'e2',
    assignedUserName: 'Sarra Trabelsi',
    notes: 'Caisse secondaire pour les périodes de forte affluence',
    createdAt: getDate(-150)
  },
  {
    id: 'cr3',
    name: 'Caisse Succursale Nord',
    location: 'Succursale Ariana',
    status: 'inactive',
    initialBalance: 200,
    currentBalance: 200,
    notes: 'Caisse de la succursale Ariana (fermée temporairement)',
    createdAt: getDate(-90)
  }
];

export const mockCashSessions: CashSession[] = [
  {
    id: 'cs1',
    registerId: 'cr1',
    registerName: 'Caisse Principale',
    openedBy: 'Ahmed Tounsi',
    startTime: getDate(0) + 'T08:00:00',
    openingBalance: 250,
    expectedBalance: 450,
    status: 'open'
  }
];

export const mockCashTransactions: CashTransaction[] = [
    { id: 'ctx1', sessionId: 'cs1', date: getDate(0) + 'T10:30:00', type: 'sale', amount: 200, description: 'Vente Comptoir #88' }
];

// --- SERVICES ---
export const mockTechnicians: Technician[] = [
  { id: 't1', name: 'Karim Jaziri', specialty: 'Réseau & Sécurité', status: 'available', phone: '55 123 456' },
  { id: 't2', name: 'Mariem Kefi', specialty: 'Maintenance Hardware', status: 'busy', phone: '22 987 654' },
  { id: 't3', name: 'Sami Ben Ahmed', specialty: 'Imprimantes & Copieurs', status: 'off_duty', phone: '98 111 222' }
];

export const mockServiceCatalog: ServiceItem[] = [
  { id: 'srv1', name: 'Formatage & Installation OS', description: 'Windows/Linux + Drivers', basePrice: 60, durationMinutes: 90 },
  { id: 'srv2', name: 'Nettoyage Interne PC', description: 'Dépoussiérage et Pâte thermique', basePrice: 45, durationMinutes: 45 },
  { id: 'srv3', name: 'Installation Réseau', description: 'Câblage et config routeur (par point)', basePrice: 35, durationMinutes: 60 },
  { id: 'srv4', name: 'Réparation Carte Mère', description: 'Diagnostic et réparation niveau composant', basePrice: 150, durationMinutes: 120 }
];

export const mockServiceJobs: ServiceJob[] = [
  {
    id: 'job1',
    ticketNumber: 'SAV-1001',
    clientId: 'c4',
    clientName: 'Vermeg',
    date: getDate(-2),
    status: 'in_progress',
    priority: 'high',
    technicianId: 't1',
    technicianName: 'Karim Jaziri',
    deviceInfo: 'Server Rack HP ProLiant DL380',
    problemDescription: 'Surchauffe anormale des serveurs, ventilateurs bruyants',
    estimatedCost: 350,
    services: [{serviceId: 'srv2', name: 'Nettoyage complet', price: 80}, {serviceId: 'srv3', name: 'Diagnostic thermique', price: 120}],
    usedParts: [{productId: 'p1', name: 'Ventilateur serveur 120mm', quantity: 2, price: 75}]
  },
  {
    id: 'job2',
    ticketNumber: 'SAV-1002',
    clientId: 'c3',
    clientName: 'Clinique Les Jasmins',
    date: getDate(-5),
    status: 'completed',
    priority: 'critical',
    technicianId: 't2',
    technicianName: 'Sofiane Bouazizi',
    deviceInfo: 'Imprimante HP LaserJet Pro M404',
    problemDescription: 'Bourrage papier récurrent, qualité impression dégradée',
    estimatedCost: 180,
    services: [{serviceId: 'srv1', name: 'Réparation', price: 120}],
    usedParts: [{productId: 'p2', name: 'Kit rouleau', quantity: 1, price: 60}],
    resolutionNotes: 'Remplacement kit rouleau et nettoyage complet effectués'
  },
  {
    id: 'job3',
    ticketNumber: 'SAV-1003',
    clientId: 'c1',
    clientName: 'SFBT',
    date: getDate(-1),
    status: 'pending',
    priority: 'medium',
    deviceInfo: 'PC Dell OptiPlex 7090',
    problemDescription: 'Lenteur système, disque dur bruyant',
    estimatedCost: 450,
    services: [],
    usedParts: []
  },
  {
    id: 'job4',
    ticketNumber: 'SAV-1004',
    clientId: 'c6',
    clientName: 'Tunisie Telecom',
    date: getDate(-7),
    status: 'invoiced',
    priority: 'high',
    technicianId: 't1',
    technicianName: 'Karim Jaziri',
    deviceInfo: 'Switch Cisco Catalyst 2960',
    problemDescription: 'Perte de connexion intermittente sur ports 10-15',
    estimatedCost: 680,
    services: [{serviceId: 'srv3', name: 'Diagnostic réseau', price: 150}, {serviceId: 'srv1', name: 'Réparation', price: 280}],
    usedParts: [{productId: 'p3', name: 'Module SFP+', quantity: 2, price: 125}],
    resolutionNotes: 'Remplacement modules défectueux, reconfiguration switch',
    linkedInvoiceId: 'inv123'
  },
  {
    id: 'job5',
    ticketNumber: 'SAV-1005',
    clientId: 'c2',
    clientName: 'Poulina Group Holding',
    date: getDate(0),
    status: 'in_progress',
    priority: 'medium',
    technicianId: 't2',
    technicianName: 'Sofiane Bouazizi',
    deviceInfo: 'Onduleur APC Smart-UPS 3000VA',
    problemDescription: 'Alarme batterie faible, autonomie réduite',
    estimatedCost: 520,
    services: [{serviceId: 'srv1', name: 'Maintenance préventive', price: 90}],
    usedParts: [{productId: 'p4', name: 'Batterie 12V 9Ah', quantity: 4, price: 85}]
  },
  {
    id: 'job6',
    ticketNumber: 'SAV-1006',
    clientId: 'c7',
    clientName: 'Banque de Tunisie',
    date: getDate(-3),
    status: 'completed',
    priority: 'critical',
    technicianId: 't1',
    technicianName: 'Karim Jaziri',
    deviceInfo: 'Serveur Dell PowerEdge R740',
    problemDescription: 'Serveur ne démarre plus, LED erreur RAID',
    estimatedCost: 890,
    services: [{serviceId: 'srv3', name: 'Diagnostic urgence', price: 200}, {serviceId: 'srv1', name: 'Réparation', price: 350}],
    usedParts: [{productId: 'p5', name: 'Disque SAS 2TB', quantity: 2, price: 170}],
    resolutionNotes: 'Remplacement 2 disques défaillants, reconstruction RAID 5 effectuée avec succès'
  }
];

export const mockServiceSales: ServiceSale[] = [];

// --- FLEET ---
export const mockVehicles: Vehicle[] = [
  { id: 'v1', make: 'Peugeot', model: 'Partner', plate: '201 TN 4455', year: 2018, status: 'available', fuelType: 'Diesel', mileage: 145000, technicalCheckExpiry: getDate(120), insuranceExpiry: getDate(30) },
  { id: 'v2', make: 'Renault', model: 'Clio 4', plate: '185 TN 9988', year: 2016, status: 'in_use', fuelType: 'Petrol', mileage: 98000, technicalCheckExpiry: getDate(-5), insuranceExpiry: getDate(200) }, // Expired tech check
  { id: 'v3', make: 'Isuzu', model: 'D-Max', plate: '199 TN 1122', year: 2017, status: 'maintenance', fuelType: 'Diesel', mileage: 210000, technicalCheckExpiry: getDate(60), insuranceExpiry: getDate(60) }
];

export const mockFleetMissions: FleetMission[] = [
  { id: 'm1', reference: 'MISS-30001101', vehicleId: 'v2', vehicleName: 'Renault Clio 4', driverName: 'Walid Jlassi', startDate: getDate(0), startTime: '08:00', endDate: getDate(0), endTime: '18:00', destination: 'Sousse - Client Meeting', status: 'in_progress', startMileage: 98000 },
  { id: 'm2', reference: 'MISS-30001102', vehicleId: 'v1', vehicleName: 'Peugeot Partner', driverName: 'Ahmed Trabelsi', startDate: getDate(-2), startTime: '09:00', endDate: getDate(-2), endTime: '17:00', destination: 'Sfax - Livraison Matériel', status: 'completed', startMileage: 145000, endMileage: 145320 },
  { id: 'm3', reference: 'MISS-30001103', vehicleId: 'v1', vehicleName: 'Peugeot Partner', driverName: 'Mohamed Dridi', startDate: getDate(2), startTime: '07:30', endDate: getDate(2), endTime: '19:00', destination: 'Bizerte - Installation Client', status: 'pending', startMileage: 145320 }
];

export const mockFleetMaintenances: FleetMaintenance[] = [];
export const mockFleetExpenses: FleetExpense[] = [];
export const mockFleetDocuments: FleetDocument[] = [];

// --- HR ---
export const mockDepartments: Department[] = [
  { id: 'dept1', name: 'Direction', code: 'DIR', managerId: 'e1', description: 'Direction Générale' },
  { id: 'dept2', name: 'RH', code: 'HR', managerId: 'e2', description: 'Ressources Humaines' },
  { id: 'dept3', name: 'Logistique', code: 'LOG', description: 'Logistique et Transport' },
  { id: 'dept4', name: 'Technique', code: 'TECH', description: 'Service Technique' },
  { id: 'dept5', name: 'Commercial', code: 'COM', description: 'Service Commercial' },
  { id: 'dept6', name: 'Finance', code: 'FIN', description: 'Finance et Comptabilité' }
];

export const mockPositions: Position[] = [
  { id: 'pos1', title: 'Directeur Général', code: 'DG', departmentId: 'dept1', level: 'executive', description: 'Direction générale de l\'entreprise' },
  { id: 'pos2', title: 'Responsable RH', code: 'RH-MGR', departmentId: 'dept2', level: 'manager', description: 'Gestion des ressources humaines' },
  { id: 'pos3', title: 'Chauffeur / Coursier', code: 'LOG-DRV', departmentId: 'dept3', level: 'junior', description: 'Transport et livraison' },
  { id: 'pos4', title: 'Technicien Senior', code: 'TECH-SR', departmentId: 'dept4', level: 'senior', description: 'Maintenance et interventions techniques' },
  { id: 'pos5', title: 'Commercial Senior', code: 'COM-SR', departmentId: 'dept5', level: 'senior', description: 'Vente et développement commercial' },
  { id: 'pos6', title: 'Comptable', code: 'FIN-ACC', departmentId: 'dept6', level: 'mid', description: 'Comptabilité et finances' }
];

export const mockEmployees: Employee[] = [
  {
    id: 'e1',
    matricule: 'MAT-001',
    firstName: 'Mohamed',
    lastName: 'Ben Ali',
    email: 'mohamed@smartbiz.tn',
    phone: '20 123 123',
    position: 'Directeur Général',
    department: 'Direction',
    hireDate: '2015-01-01',
    birthDate: '1978-05-12',
    status: 'active',
    salary: 4500,
    bonuses: 1200,
    maritalStatus: 'married',
    numberOfChildren: 3,
    benefits: 'Voiture de fonction, Assurance famille complète, Smartphone',
    address: '15 Avenue Habib Bourguiba, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e2',
    matricule: 'MAT-002',
    firstName: 'Sarra',
    lastName: 'Trabelsi',
    email: 'sarra@smartbiz.tn',
    phone: '55 654 321',
    position: 'Responsable RH',
    department: 'RH',
    hireDate: '2018-05-15',
    birthDate: '1985-09-22',
    status: 'active',
    salary: 2800,
    bonuses: 400,
    maritalStatus: 'single',
    numberOfChildren: 0,
    benefits: 'Assurance santé, Tickets restaurant, Formation continue',
    address: '28 Rue de Marseille, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e3',
    matricule: 'MAT-003',
    firstName: 'Walid',
    lastName: 'Jlassi',
    email: 'walid@smartbiz.tn',
    phone: '98 777 888',
    position: 'Chauffeur / Coursier',
    department: 'Logistique',
    hireDate: '2020-09-01',
    birthDate: '1990-03-15',
    status: 'active',
    salary: 1200,
    bonuses: 150,
    maritalStatus: 'married',
    numberOfChildren: 2,
    benefits: 'Assurance santé de base, Prime de transport',
    address: 'Cité Ettahrir, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e4',
    matricule: 'MAT-004',
    firstName: 'Karim',
    lastName: 'Jaziri',
    email: 'karim@smartbiz.tn',
    phone: '55 123 456',
    position: 'Technicien Senior',
    department: 'Technique',
    hireDate: '2019-03-10',
    birthDate: '1988-11-08',
    status: 'active',
    salary: 2200,
    bonuses: 350,
    maritalStatus: 'divorced',
    numberOfChildren: 1,
    benefits: 'Assurance santé, Véhicule de service, Téléphone professionnel',
    address: 'Ariana Ville, Ariana',
    nationality: 'Tunisienne'
  },
  {
    id: 'e5',
    matricule: 'MAT-005',
    firstName: 'Amira',
    lastName: 'Mansouri',
    email: 'amira@smartbiz.tn',
    phone: '22 456 789',
    position: 'Chef Comptable',
    department: 'Finance',
    hireDate: '2017-06-20',
    birthDate: '1983-07-14',
    status: 'active',
    salary: 3200,
    bonuses: 600,
    maritalStatus: 'married',
    numberOfChildren: 2,
    benefits: 'Assurance santé famille, Ordinateur portable, Bonus annuel',
    address: 'Les Berges du Lac, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e6',
    matricule: 'MAT-006',
    firstName: 'Youssef',
    lastName: 'Bouazizi',
    email: 'youssef@smartbiz.tn',
    phone: '54 789 123',
    position: 'Développeur Full Stack',
    department: 'IT',
    hireDate: '2021-02-01',
    birthDate: '1992-04-25',
    status: 'active',
    salary: 2600,
    bonuses: 500,
    maritalStatus: 'single',
    numberOfChildren: 0,
    benefits: 'Assurance santé, Abonnement gym, Formations techniques',
    address: 'Menzah 6, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e7',
    matricule: 'MAT-007',
    firstName: 'Nesrine',
    lastName: 'Khalil',
    email: 'nesrine@smartbiz.tn',
    phone: '29 654 987',
    position: 'Assistante Administrative',
    department: 'Administration',
    hireDate: '2022-01-10',
    birthDate: '1995-12-03',
    status: 'active',
    salary: 1500,
    bonuses: 200,
    maritalStatus: 'single',
    numberOfChildren: 0,
    benefits: 'Assurance santé, Tickets restaurant',
    address: 'Manar 2, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e8',
    matricule: 'MAT-008',
    firstName: 'Riadh',
    lastName: 'Hammami',
    email: 'riadh@smartbiz.tn',
    phone: '98 321 654',
    position: 'Commercial Senior',
    department: 'Commercial',
    hireDate: '2016-09-15',
    birthDate: '1980-06-18',
    status: 'active',
    salary: 2400,
    bonuses: 800,
    maritalStatus: 'married',
    numberOfChildren: 3,
    benefits: 'Voiture de fonction, Assurance famille, Commission sur ventes',
    address: 'La Marsa, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e9',
    matricule: 'MAT-009',
    firstName: 'Leila',
    lastName: 'Gharbi',
    email: 'leila@smartbiz.tn',
    phone: '55 987 321',
    position: 'Ingénieur Qualité',
    department: 'Qualité',
    hireDate: '2019-11-05',
    birthDate: '1987-02-20',
    status: 'on_leave',
    salary: 2900,
    bonuses: 450,
    maritalStatus: 'married',
    numberOfChildren: 1,
    benefits: 'Assurance santé, Congés supplémentaires, Horaires flexibles',
    address: 'Carthage, Tunis',
    nationality: 'Tunisienne'
  },
  {
    id: 'e10',
    matricule: 'MAT-010',
    firstName: 'Fares',
    lastName: 'Amor',
    email: 'fares@smartbiz.tn',
    phone: '26 147 258',
    position: 'Magasinier',
    department: 'Logistique',
    hireDate: '2020-04-20',
    birthDate: '1991-08-30',
    status: 'active',
    salary: 1400,
    bonuses: 180,
    maritalStatus: 'single',
    numberOfChildren: 0,
    benefits: 'Assurance santé de base, Prime de rendement',
    address: 'Ben Arous, Ben Arous',
    nationality: 'Tunisienne'
  },
  {
    id: 'e11',
    matricule: 'MAT-011',
    firstName: 'Salma',
    lastName: 'Dridi',
    email: 'salma@smartbiz.tn',
    phone: '52 369 147',
    position: 'Marketing Manager',
    department: 'Marketing',
    hireDate: '2018-08-12',
    birthDate: '1986-10-05',
    status: 'active',
    salary: 3000,
    bonuses: 700,
    maritalStatus: 'widowed',
    numberOfChildren: 2,
    benefits: 'Assurance famille, Télétravail 2 jours/semaine, Budget marketing',
    address: 'Ennasr 1, Ariana',
    nationality: 'Tunisienne'
  },
  {
    id: 'e12',
    matricule: 'MAT-012',
    firstName: 'Hichem',
    lastName: 'Oueslati',
    email: 'hichem@smartbiz.tn',
    phone: '28 753 951',
    position: 'Technicien Junior',
    department: 'Technique',
    hireDate: '2023-03-01',
    birthDate: '1997-01-16',
    status: 'active',
    salary: 1600,
    bonuses: 150,
    maritalStatus: 'single',
    numberOfChildren: 0,
    benefits: 'Assurance santé, Formation technique, Équipement professionnel',
    address: 'Sfax Ville, Sfax',
    nationality: 'Tunisienne'
  }
];

export const mockContracts: Contract[] = [
  { id: 'cnt1', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', type: 'CDI', startDate: '2015-01-01', status: 'active', salary: 4500, position: 'Directeur Général' },
  { id: 'cnt2', employeeId: 'e2', employeeName: 'Sarra Trabelsi', type: 'CDI', startDate: '2018-05-15', status: 'active', salary: 2800, position: 'Responsable RH' },
  { id: 'cnt3', employeeId: 'e3', employeeName: 'Walid Jlassi', type: 'CDD', startDate: '2023-09-01', endDate: '2024-08-31', status: 'active', salary: 1200, position: 'Chauffeur / Coursier' },
  { id: 'cnt4', employeeId: 'e4', employeeName: 'Karim Jaziri', type: 'CDI', startDate: '2019-03-10', status: 'active', salary: 2200, position: 'Technicien Senior' },
  { id: 'cnt5', employeeId: 'e5', employeeName: 'Amira Mansouri', type: 'CDI', startDate: '2017-06-20', status: 'active', salary: 3200, position: 'Chef Comptable' },
  { id: 'cnt6', employeeId: 'e6', employeeName: 'Youssef Bouazizi', type: 'CDI', startDate: '2021-02-01', status: 'active', salary: 2600, position: 'Développeur Full Stack' },
  { id: 'cnt7', employeeId: 'e7', employeeName: 'Nesrine Khalil', type: 'CDD', startDate: '2022-01-10', endDate: '2024-12-31', status: 'active', salary: 1500, position: 'Assistante Administrative' },
  { id: 'cnt8', employeeId: 'e8', employeeName: 'Riadh Hammami', type: 'CDI', startDate: '2016-09-15', status: 'active', salary: 2400, position: 'Commercial Senior' },
  { id: 'cnt9', employeeId: 'e9', employeeName: 'Leila Gharbi', type: 'CDI', startDate: '2019-11-05', status: 'active', salary: 2900, position: 'Ingénieur Qualité' },
  { id: 'cnt10', employeeId: 'e10', employeeName: 'Fares Amor', type: 'CDD', startDate: '2020-04-20', endDate: '2025-04-19', status: 'active', salary: 1400, position: 'Magasinier' },
  { id: 'cnt11', employeeId: 'e11', employeeName: 'Salma Dridi', type: 'CDI', startDate: '2018-08-12', status: 'active', salary: 3000, position: 'Marketing Manager' },
  { id: 'cnt12', employeeId: 'e12', employeeName: 'Hichem Oueslati', type: 'Stage', startDate: '2023-03-01', endDate: '2024-02-28', status: 'active', salary: 1600, position: 'Technicien Junior' }
];

export const mockPayroll: Payroll[] = [
  { id: 'pay1', employeeId: 'e3', employeeName: 'Walid Jlassi', month: '2024-04', baseSalary: 1200, bonuses: 150, deductions: 50, netSalary: 1300, status: 'paid', paymentDate: '2024-04-30' }
];

export const mockLeaves: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e2', employeeName: 'Sarra Trabelsi', type: 'Paid Leave', startDate: getDate(10), endDate: getDate(15), days: 6, status: 'approved', reason: 'Vacances familiales' },
  { id: 'l2', employeeId: 'e4', employeeName: 'Karim Jaziri', type: 'Sick Leave', startDate: getDate(-5), endDate: getDate(-3), days: 3, status: 'approved', reason: 'Grippe' },
  { id: 'l3', employeeId: 'e6', employeeName: 'Youssef Bouazizi', type: 'Paid Leave', startDate: getDate(20), endDate: getDate(25), days: 6, status: 'pending', reason: 'Congé annuel été' },
  { id: 'l4', employeeId: 'e9', employeeName: 'Leila Gharbi', type: 'Paid Leave', startDate: getDate(-10), endDate: getDate(10), days: 21, status: 'approved', reason: 'Congé maternité' },
  { id: 'l5', employeeId: 'e8', employeeName: 'Riadh Hammami', type: 'Remote', startDate: getDate(5), endDate: getDate(5), days: 1, status: 'approved', reason: 'Télétravail' },
  { id: 'l6', employeeId: 'e5', employeeName: 'Amira Mansouri', type: 'Paid Leave', startDate: getDate(2), endDate: getDate(4), days: 3, status: 'pending', reason: 'Événement familial' },
  { id: 'l7', employeeId: 'e11', employeeName: 'Salma Dridi', type: 'Unpaid', startDate: getDate(30), endDate: getDate(45), days: 16, status: 'pending', reason: 'Voyage personnel' },
  { id: 'l8', employeeId: 'e3', employeeName: 'Walid Jlassi', type: 'Sick Leave', startDate: getDate(-2), endDate: getDate(-1), days: 2, status: 'approved', reason: 'Consultation médicale' },
  { id: 'l9', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', type: 'Paid Leave', startDate: getDate(-20), endDate: getDate(-15), days: 6, status: 'approved', reason: 'Congé annuel' },
  { id: 'l10', employeeId: 'e7', employeeName: 'Nesrine Khalil', type: 'Paid Leave', startDate: getDate(15), endDate: getDate(17), days: 3, status: 'rejected', reason: 'Demande tardive - période chargée' },
  { id: 'l11', employeeId: 'e10', employeeName: 'Fares Amor', type: 'Sick Leave', startDate: getDate(-1), endDate: getDate(-1), days: 1, status: 'pending', reason: 'Urgence dentaire' },
  { id: 'l12', employeeId: 'e12', employeeName: 'Hichem Oueslati', type: 'Paid Leave', startDate: getDate(7), endDate: getDate(9), days: 3, status: 'approved', reason: 'Week-end prolongé' }
];

export const mockExpenses: ExpenseReport[] = [
  { id: 'er1', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-3), type: 'Transport', amount: 35, description: 'Taxi Client Intervention Vermeg', status: 'pending', category: 'Transport' },
  { id: 'er2', employeeId: 'e8', employeeName: 'Riadh Hammami', date: getDate(-5), type: 'Meals', amount: 85, description: 'Déjeuner Client SFBT', status: 'approved', category: 'Repas d\'affaires' },
  { id: 'er3', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', date: getDate(-10), type: 'Travel', amount: 450, description: 'Vol Tunis-Paris pour conférence', status: 'approved', category: 'Voyage' },
  { id: 'er4', employeeId: 'e11', employeeName: 'Salma Dridi', date: getDate(-2), type: 'Office', amount: 120, description: 'Fournitures marketing (brochures)', status: 'pending', category: 'Fournitures' },
  { id: 'er5', employeeId: 'e6', employeeName: 'Youssef Bouazizi', date: getDate(-7), type: 'Training', amount: 300, description: 'Formation React Advanced', status: 'approved', category: 'Formation' },
  { id: 'er6', employeeId: 'e2', employeeName: 'Sarra Trabelsi', date: getDate(-4), type: 'Transport', amount: 25, description: 'Taxi Réunion externe', status: 'approved', category: 'Transport' },
  { id: 'er7', employeeId: 'e5', employeeName: 'Amira Mansouri', date: getDate(-1), type: 'Office', amount: 65, description: 'Cartouches imprimante comptabilité', status: 'pending', category: 'Fournitures' },
  { id: 'er8', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-8), type: 'Equipment', amount: 180, description: 'Outils diagnostic réseau', status: 'approved', category: 'Équipement' },
  { id: 'er9', employeeId: 'e3', employeeName: 'Walid Jlassi', date: getDate(-6), type: 'Fuel', amount: 90, description: 'Carburant livraisons semaine', status: 'approved', category: 'Carburant' },
  { id: 'er10', employeeId: 'e12', employeeName: 'Hichem Oueslati', date: getDate(0), type: 'Transport', amount: 18, description: 'Métro déplacement client', status: 'pending', category: 'Transport' },
  { id: 'er11', employeeId: 'e8', employeeName: 'Riadh Hammami', date: getDate(-12), type: 'Meals', amount: 95, description: 'Dîner prospection nouveau client', status: 'approved', category: 'Repas d\'affaires' },
  { id: 'er12', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', date: getDate(-15), type: 'Hotel', amount: 280, description: 'Hôtel Paris 2 nuits', status: 'approved', category: 'Hébergement' }
];

// --- MAINTENANCE CRM ---
export const mockMaintenanceContracts: MaintenanceContract[] = [
    { id: 'mc1', clientId: 'c1', title: 'Maintenance Préventive Climatisation', type: 'preventive', startDate: '2024-01-01', endDate: '2024-12-31', visitsPerYear: 4, slaResponseHours: 4, status: 'active', value: 12000 },
    { id: 'mc2', clientId: 'c2', title: 'Support Informatique N2', type: 'full', startDate: '2024-03-01', endDate: '2025-02-28', visitsPerYear: 12, slaResponseHours: 8, status: 'active', value: 24000 }
];

export const mockContactInteractions: ContactInteraction[] = [
    { id: 'ci1', clientId: 'c1', date: getDate(-5), type: 'meeting', summary: 'Réunion trimestrielle de suivi. Client satisfait.', contactPerson: 'M. Kamel' },
    { id: 'ci2', clientId: 'c2', date: getDate(-2), type: 'call', summary: 'Appel pour planification intervention préventive.', contactPerson: 'Mme. Samia' }
];

// --- EXTENDED HR DATA ---

// Payroll Elements
export const mockPayrollElements: PayrollElement[] = [
  { id: 'pe1', code: 'BASE', name: 'Salaire de Base', type: 'earning', isSystemGenerated: true },
  { id: 'pe2', code: 'OT', name: 'Heures Supplémentaires', type: 'earning', formula: 'hours * rate * 1.5' },
  { id: 'pe3', code: 'BONUS', name: 'Prime de Performance', type: 'earning' },
  { id: 'pe4', code: 'TRANS', name: 'Indemnité Transport', type: 'earning' },
  { id: 'pe5', code: 'CNSS', name: 'Cotisation CNSS', type: 'deduction', formula: 'base * 0.0945', isSystemGenerated: true },
  { id: 'pe6', code: 'IRPP', name: 'IRPP', type: 'deduction', isSystemGenerated: true },
  { id: 'pe7', code: 'ADV', name: 'Avance sur Salaire', type: 'deduction' }
];

// Payroll Runs
export const mockPayrollRuns: PayrollRun[] = [
  {
    id: 'pr1',
    reference: 'PAY-2024-04',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30',
    status: 'closed',
    totalGross: 11200,
    totalNet: 9240,
    totalDeductions: 1960,
    employeesCount: 4,
    createdBy: 'Sarra Trabelsi',
    createdDate: '2024-04-28T10:00:00Z',
    closedDate: '2024-04-30T16:00:00Z',
    paymentDate: '2024-05-01',
    notes: 'Paie mensuelle avril 2024 - Clôturée et payée'
  },
  {
    id: 'pr2',
    reference: 'PAY-2024-05',
    periodStart: '2024-05-01',
    periodEnd: '2024-05-31',
    status: 'calculated',
    totalGross: 11350,
    totalNet: 9365,
    totalDeductions: 1985,
    employeesCount: 4,
    createdBy: 'Sarra Trabelsi',
    createdDate: '2024-05-28T10:00:00Z',
    notes: 'Paie mensuelle mai 2024 - En attente validation'
  }
];

// Payslips
export const mockPayslips: Payslip[] = [
  {
    id: 'ps1',
    runId: 'pr1',
    employeeId: 'e1',
    employeeName: 'Mohamed Ben Ali',
    employeeMatricule: 'MAT-001',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30',

    // Informations famille
    numberOfChildren: 3,
    maritalStatus: 'married',

    // Salaire et heures
    baseSalary: 4500,
    workDays: 22,
    workedDays: 22,
    absenceDays: 0,

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 4500, taxable: true },
      { elementId: 'bonus', name: 'Primes', amount: 1200, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 150, taxable: false }
    ],
    grossSalary: 5700,

    // Cotisations sociales (employé)
    cnssEmployee: 523.26, // 5700 × 0.0918
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 517.47, // (5700 - 523.26) × 0.10
    childrenAllowance: 75, // 3 enfants × 25 DT
    spouseAllowance: 150,
    totalAllowances: 742.47,
    taxableBase: 4434.27, // 5700 - 523.26 - 742.47

    // IRPP détaillé par tranches (annuel: 53211.24 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 10000, rate: 28, tax: 2800 },
      { bracket: '30,000 - 50,000 DT', amount: 20000, rate: 32, tax: 6400 },
      { bracket: '50,000+ DT', amount: 3211.24, rate: 35, tax: 1123.93 }
    ],
    irppTotal: 1185.33, // 14223.93 / 12

    // CSS
    css: 57, // 5700 × 0.01
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 523.26, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 1185.33, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 57, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 1765.59,
    netSalaryBeforeAdvances: 3934.41,
    netSalary: 3934.41,

    // Cotisations patronales
    cnssEmployer: 944.49, // 5700 × 0.1657
    cnssEmployerRate: 0.1657,
    tfp: 57, // 5700 × 0.01
    tfpRate: 0.01,
    foprolos: 114, // 5700 × 0.02
    foprolosRate: 0.02,
    totalEmployerContributions: 1115.49,
    totalEmployerCost: 6815.49,

    status: 'final',
    pdfUrl: '/bulletins/2024-04/ps1.pdf',
    generatedDate: '2024-04-30T16:00:00Z'
  },
  {
    id: 'ps2',
    runId: 'pr1',
    employeeId: 'e2',
    employeeName: 'Sarra Trabelsi',
    employeeMatricule: 'MAT-002',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30',

    // Informations famille
    numberOfChildren: 0,
    maritalStatus: 'single',

    // Salaire et heures
    baseSalary: 2800,
    workDays: 22,
    workedDays: 22,
    absenceDays: 0,

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 2800, taxable: true },
      { elementId: 'bonus', name: 'Primes', amount: 400, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 120, taxable: false }
    ],
    grossSalary: 3200,

    // Cotisations sociales (employé)
    cnssEmployee: 293.76, // 3200 × 0.0918
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 290.62, // (3200 - 293.76) × 0.10
    childrenAllowance: 0,
    spouseAllowance: 0,
    totalAllowances: 290.62,
    taxableBase: 2615.62,

    // IRPP détaillé par tranches (annuel: 31387.44 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 10000, rate: 28, tax: 2800 },
      { bracket: '30,000 - 50,000 DT', amount: 1387.44, rate: 32, tax: 443.98 }
    ],
    irppTotal: 595.33, // 7143.98 / 12

    // CSS
    css: 32, // 3200 × 0.01
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 293.76, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 595.33, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 32, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 921.09,
    netSalaryBeforeAdvances: 2278.91,
    netSalary: 2278.91,

    // Cotisations patronales
    cnssEmployer: 530.24, // 3200 × 0.1657
    cnssEmployerRate: 0.1657,
    tfp: 32,
    tfpRate: 0.01,
    foprolos: 64,
    foprolosRate: 0.02,
    totalEmployerContributions: 626.24,
    totalEmployerCost: 3826.24,

    status: 'final',
    pdfUrl: '/bulletins/2024-04/ps2.pdf',
    generatedDate: '2024-04-30T16:00:00Z'
  },
  {
    id: 'ps3',
    runId: 'pr1',
    employeeId: 'e4',
    employeeName: 'Karim Jaziri',
    employeeMatricule: 'MAT-004',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30',

    // Informations famille
    numberOfChildren: 1,
    maritalStatus: 'divorced',

    // Salaire et heures
    baseSalary: 2200,
    workDays: 22,
    workedDays: 21,
    absenceDays: 1,

    // Heures supplémentaires détaillées
    overtimeDetails: {
      regularHours: 176, // 8h × 22 jours
      dayOvertimeHours: 12, // 12 heures supplémentaires diurnes
      nightOvertimeHours: 4, // 4 heures supplémentaires nocturnes
      holidayOvertimeHours: 0,
      hourlyRate: 12.5, // 2200 / 176
      dayOvertimePay: 187.5, // 12 × 12.5 × 1.25
      nightOvertimePay: 75, // 4 × 12.5 × 1.5
      holidayOvertimePay: 0,
      totalOvertimePay: 262.5
    },

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 2200, taxable: true },
      { elementId: 'bonus', name: 'Primes', amount: 350, taxable: true },
      { elementId: 'overtime', name: 'Heures Supplémentaires', amount: 262.5, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 100, taxable: false }
    ],
    grossSalary: 2812.5,

    // Cotisations sociales (employé)
    cnssEmployee: 258.19, // 2812.5 × 0.0918
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 255.43, // (2812.5 - 258.19) × 0.10
    childrenAllowance: 25, // 1 enfant × 25 DT
    spouseAllowance: 0,
    totalAllowances: 280.43,
    taxableBase: 2273.88,

    // IRPP détaillé par tranches (annuel: 27286.56 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 7286.56, rate: 28, tax: 2040.24 }
    ],
    irppTotal: 495.02, // 5940.24 / 12

    // CSS
    css: 28.13, // 2812.5 × 0.01
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 258.19, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 495.02, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 28.13, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 781.34,
    netSalaryBeforeAdvances: 2031.16,
    netSalary: 2031.16,

    // Cotisations patronales
    cnssEmployer: 466.03, // 2812.5 × 0.1657
    cnssEmployerRate: 0.1657,
    tfp: 28.13,
    tfpRate: 0.01,
    foprolos: 56.25,
    foprolosRate: 0.02,
    totalEmployerContributions: 550.41,
    totalEmployerCost: 3362.91,

    status: 'final',
    pdfUrl: '/bulletins/2024-04/ps3.pdf',
    generatedDate: '2024-04-30T16:00:00Z'
  },
  {
    id: 'ps4',
    runId: 'pr1',
    employeeId: 'e8',
    employeeName: 'Riadh Hammami',
    employeeMatricule: 'MAT-008',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30',

    // Informations famille
    numberOfChildren: 3,
    maritalStatus: 'married',

    // Salaire et heures
    baseSalary: 2400,
    workDays: 22,
    workedDays: 22,
    absenceDays: 0,

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 2400, taxable: true },
      { elementId: 'bonus', name: 'Prime de Performance', amount: 800, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 150, taxable: false }
    ],
    grossSalary: 3200,

    // Cotisations sociales (employé)
    cnssEmployee: 293.76,
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 290.62,
    childrenAllowance: 75, // 3 enfants
    spouseAllowance: 150,
    totalAllowances: 515.62,
    taxableBase: 2390.62,

    // IRPP détaillé par tranches (annuel: 28687.44 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 8687.44, rate: 28, tax: 2432.48 }
    ],
    irppTotal: 527.71, // 6332.48 / 12

    // CSS
    css: 32,
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 293.76, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 527.71, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 32, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 853.47,
    netSalaryBeforeAdvances: 2346.53,
    netSalary: 2346.53,

    // Cotisations patronales
    cnssEmployer: 530.24,
    cnssEmployerRate: 0.1657,
    tfp: 32,
    tfpRate: 0.01,
    foprolos: 64,
    foprolosRate: 0.02,
    totalEmployerContributions: 626.24,
    totalEmployerCost: 3826.24,

    status: 'final',
    pdfUrl: '/bulletins/2024-04/ps4.pdf',
    generatedDate: '2024-04-30T16:00:00Z'
  },
  {
    id: 'ps5',
    runId: 'pr2',
    employeeId: 'e5',
    employeeName: 'Amira Mansouri',
    employeeMatricule: 'MAT-005',
    periodStart: '2024-05-01',
    periodEnd: '2024-05-31',

    // Informations famille
    numberOfChildren: 2,
    maritalStatus: 'married',

    // Salaire et heures
    baseSalary: 3200,
    workDays: 22,
    workedDays: 22,
    absenceDays: 0,

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 3200, taxable: true },
      { elementId: 'bonus', name: 'Prime de Performance', amount: 600, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 140, taxable: false }
    ],
    grossSalary: 3800,

    // Cotisations sociales (employé)
    cnssEmployee: 348.84,
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 345.12, // (3800 - 348.84) × 0.10
    childrenAllowance: 50, // 2 enfants
    spouseAllowance: 150,
    totalAllowances: 545.12,
    taxableBase: 2906.04,

    // IRPP détaillé par tranches (annuel: 34872.48 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 10000, rate: 28, tax: 2800 },
      { bracket: '30,000 - 50,000 DT', amount: 4872.48, rate: 32, tax: 1559.19 }
    ],
    irppTotal: 688.27, // 8259.19 / 12

    // CSS
    css: 38,
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 348.84, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 688.27, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 38, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 1075.11,
    netSalaryBeforeAdvances: 2724.89,
    netSalary: 2724.89,

    // Cotisations patronales
    cnssEmployer: 629.66,
    cnssEmployerRate: 0.1657,
    tfp: 38,
    tfpRate: 0.01,
    foprolos: 76,
    foprolosRate: 0.02,
    totalEmployerContributions: 743.66,
    totalEmployerCost: 4543.66,

    status: 'draft',
    generatedDate: '2024-05-28T10:00:00Z'
  },
  {
    id: 'ps6',
    runId: 'pr2',
    employeeId: 'e6',
    employeeName: 'Youssef Bouazizi',
    employeeMatricule: 'MAT-006',
    periodStart: '2024-05-01',
    periodEnd: '2024-05-31',

    // Informations famille
    numberOfChildren: 0,
    maritalStatus: 'single',

    // Salaire et heures
    baseSalary: 2600,
    workDays: 22,
    workedDays: 22,
    absenceDays: 0,

    // Composantes du salaire
    earnings: [
      { elementId: 'base', name: 'Salaire de Base', amount: 2600, taxable: true },
      { elementId: 'bonus', name: 'Prime de Performance', amount: 500, taxable: true },
      { elementId: 'transport', name: 'Indemnité Transport', amount: 130, taxable: false }
    ],
    grossSalary: 3100,

    // Cotisations sociales (employé)
    cnssEmployee: 284.58,
    cnssEmployeeRate: 0.0918,

    // Base imposable IRPP
    professionalExpenseAllowance: 281.54, // (3100 - 284.58) × 0.10
    childrenAllowance: 0,
    spouseAllowance: 0,
    totalAllowances: 281.54,
    taxableBase: 2533.88,

    // IRPP détaillé par tranches (annuel: 30406.56 DT)
    irppBrackets: [
      { bracket: '0 - 5,000 DT', amount: 5000, rate: 0, tax: 0 },
      { bracket: '5,000 - 20,000 DT', amount: 15000, rate: 26, tax: 3900 },
      { bracket: '20,000 - 30,000 DT', amount: 10000, rate: 28, tax: 2800 },
      { bracket: '30,000 - 50,000 DT', amount: 406.56, rate: 32, tax: 130.10 }
    ],
    irppTotal: 569.18, // 6830.10 / 12

    // CSS
    css: 31,
    cssRate: 0.01,

    // Autres retenues
    deductions: [
      { elementId: 'cnss', name: 'CNSS (9,18%)', amount: 284.58, type: 'social' },
      { elementId: 'irpp', name: 'IRPP', amount: 569.18, type: 'tax' },
      { elementId: 'css', name: 'CSS (1%)', amount: 31, type: 'tax' }
    ],

    // Totaux
    totalDeductions: 884.76,
    netSalaryBeforeAdvances: 2215.24,
    netSalary: 2215.24,

    // Cotisations patronales
    cnssEmployer: 513.67,
    cnssEmployerRate: 0.1657,
    tfp: 31,
    tfpRate: 0.01,
    foprolos: 62,
    foprolosRate: 0.02,
    totalEmployerContributions: 606.67,
    totalEmployerCost: 3706.67,

    status: 'draft',
    generatedDate: '2024-05-28T10:00:00Z'
  }
];

// Shifts
export const mockShifts: Shift[] = [
  { id: 'sh1', name: 'Matin (08:00-16:00)', startTime: '08:00', endTime: '16:00', breakDuration: 60, isActive: true },
  { id: 'sh2', name: 'Après-midi (14:00-22:00)', startTime: '14:00', endTime: '22:00', breakDuration: 30, isActive: true },
  { id: 'sh3', name: 'Nuit (22:00-06:00)', startTime: '22:00', endTime: '06:00', breakDuration: 30, isActive: true },
  { id: 'sh4', name: 'Journée Continue (09:00-17:00)', startTime: '09:00', endTime: '17:00', breakDuration: 60, isActive: true }
];

// Shift Assignments
export const mockShiftAssignments: ShiftAssignment[] = [
  { id: 'sa1', employeeId: 'e4', shiftId: 'sh1', date: getDate(0), status: 'confirmed' },
  { id: 'sa2', employeeId: 'e4', shiftId: 'sh1', date: getDate(1), status: 'scheduled' },
  { id: 'sa3', employeeId: 'e4', shiftId: 'sh1', date: getDate(2), status: 'scheduled' },
  { id: 'sa4', employeeId: 'e12', shiftId: 'sh1', date: getDate(0), status: 'confirmed' },
  { id: 'sa5', employeeId: 'e12', shiftId: 'sh1', date: getDate(1), status: 'scheduled' },
  { id: 'sa6', employeeId: 'e3', shiftId: 'sh4', date: getDate(0), status: 'confirmed' },
  { id: 'sa7', employeeId: 'e3', shiftId: 'sh4', date: getDate(1), status: 'scheduled' },
  { id: 'sa8', employeeId: 'e10', shiftId: 'sh1', date: getDate(0), status: 'confirmed' },
  { id: 'sa9', employeeId: 'e10', shiftId: 'sh1', date: getDate(1), status: 'scheduled' }
];

// Attendances
export const mockAttendances: Attendance[] = [
  // Jour -1
  { id: 'att1', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', date: getDate(-1), checkIn: '08:05', checkOut: '17:10', breakDuration: 60, totalHours: 8.08, status: 'present' },
  { id: 'att2', employeeId: 'e2', employeeName: 'Sarra Trabelsi', date: getDate(-1), checkIn: '08:00', checkOut: '17:00', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att3', employeeId: 'e3', employeeName: 'Walid Jlassi', date: getDate(-1), checkIn: '09:30', checkOut: '17:00', breakDuration: 60, totalHours: 6.5, status: 'late' },
  { id: 'att4', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-1), status: 'absent' },
  { id: 'att5', employeeId: 'e5', employeeName: 'Amira Mansouri', date: getDate(-1), checkIn: '08:30', checkOut: '17:30', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att6', employeeId: 'e6', employeeName: 'Youssef Bouazizi', date: getDate(-1), checkIn: '09:00', checkOut: '18:15', breakDuration: 60, totalHours: 8.25, status: 'present' },
  { id: 'att7', employeeId: 'e7', employeeName: 'Nesrine Khalil', date: getDate(-1), checkIn: '08:15', checkOut: '17:00', breakDuration: 60, totalHours: 7.75, status: 'present' },
  { id: 'att8', employeeId: 'e8', employeeName: 'Riadh Hammami', date: getDate(-1), checkIn: '08:45', checkOut: '18:30', breakDuration: 60, totalHours: 8.75, status: 'present' },
  { id: 'att10', employeeId: 'e10', employeeName: 'Fares Amor', date: getDate(-1), checkIn: '07:45', checkOut: '16:30', breakDuration: 60, totalHours: 7.75, status: 'present' },
  { id: 'att11', employeeId: 'e11', employeeName: 'Salma Dridi', date: getDate(-1), checkIn: '09:15', checkOut: '17:45', breakDuration: 60, totalHours: 7.5, status: 'late' },
  { id: 'att12', employeeId: 'e12', employeeName: 'Hichem Oueslati', date: getDate(-1), checkIn: '08:00', checkOut: '17:00', breakDuration: 60, totalHours: 8.0, status: 'present' },

  // Jour -2
  { id: 'att13', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', date: getDate(-2), checkIn: '08:10', checkOut: '18:00', breakDuration: 60, totalHours: 8.83, status: 'present' },
  { id: 'att14', employeeId: 'e2', employeeName: 'Sarra Trabelsi', date: getDate(-2), checkIn: '07:55', checkOut: '17:10', breakDuration: 60, totalHours: 8.25, status: 'present' },
  { id: 'att15', employeeId: 'e3', employeeName: 'Walid Jlassi', date: getDate(-2), checkIn: '08:00', checkOut: '16:45', breakDuration: 60, totalHours: 7.75, status: 'present' },
  { id: 'att16', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-2), checkIn: '08:30', checkOut: '19:00', breakDuration: 60, totalHours: 9.5, status: 'overtime' },
  { id: 'att17', employeeId: 'e5', employeeName: 'Amira Mansouri', date: getDate(-2), checkIn: '08:00', checkOut: '17:30', breakDuration: 60, totalHours: 8.5, status: 'present' },
  { id: 'att18', employeeId: 'e6', employeeName: 'Youssef Bouazizi', date: getDate(-2), checkIn: '09:30', checkOut: '18:30', breakDuration: 60, totalHours: 8.0, status: 'late' },
  { id: 'att19', employeeId: 'e7', employeeName: 'Nesrine Khalil', date: getDate(-2), checkIn: '08:05', checkOut: '17:05', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att20', employeeId: 'e8', employeeName: 'Riadh Hammami', date: getDate(-2), status: 'leave' },
  { id: 'att21', employeeId: 'e10', employeeName: 'Fares Amor', date: getDate(-2), checkIn: '07:50', checkOut: '16:30', breakDuration: 60, totalHours: 7.67, status: 'present' },
  { id: 'att22', employeeId: 'e11', employeeName: 'Salma Dridi', date: getDate(-2), checkIn: '08:30', checkOut: '17:30', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att23', employeeId: 'e12', employeeName: 'Hichem Oueslati', date: getDate(-2), checkIn: '08:15', checkOut: '17:30', breakDuration: 60, totalHours: 8.25, status: 'present' },

  // Jour -3
  { id: 'att24', employeeId: 'e1', employeeName: 'Mohamed Ben Ali', date: getDate(-3), checkIn: '08:00', checkOut: '17:30', breakDuration: 60, totalHours: 8.5, status: 'present' },
  { id: 'att25', employeeId: 'e2', employeeName: 'Sarra Trabelsi', date: getDate(-3), checkIn: '08:05', checkOut: '17:00', breakDuration: 60, totalHours: 7.92, status: 'present' },
  { id: 'att26', employeeId: 'e3', employeeName: 'Walid Jlassi', date: getDate(-3), status: 'leave' },
  { id: 'att27', employeeId: 'e4', employeeName: 'Karim Jaziri', date: getDate(-3), status: 'sick' },
  { id: 'att28', employeeId: 'e5', employeeName: 'Amira Mansouri', date: getDate(-3), checkIn: '08:15', checkOut: '17:45', breakDuration: 60, totalHours: 8.5, status: 'present' },
  { id: 'att29', employeeId: 'e6', employeeName: 'Youssef Bouazizi', date: getDate(-3), checkIn: '09:00', checkOut: '18:00', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att30', employeeId: 'e7', employeeName: 'Nesrine Khalil', date: getDate(-3), checkIn: '08:10', checkOut: '17:10', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att31', employeeId: 'e8', employeeName: 'Riadh Hammami', date: getDate(-3), checkIn: '08:30', checkOut: '17:30', breakDuration: 60, totalHours: 8.0, status: 'present' },
  { id: 'att32', employeeId: 'e10', employeeName: 'Fares Amor', date: getDate(-3), checkIn: '07:45', checkOut: '16:15', breakDuration: 60, totalHours: 7.5, status: 'present' },
  { id: 'att33', employeeId: 'e11', employeeName: 'Salma Dridi', date: getDate(-3), checkIn: '09:00', checkOut: '17:30', breakDuration: 60, totalHours: 7.5, status: 'present' },
  { id: 'att34', employeeId: 'e12', employeeName: 'Hichem Oueslati', date: getDate(-3), checkIn: '08:00', checkOut: '17:15', breakDuration: 60, totalHours: 8.25, status: 'present' }
];

// Timesheets
export const mockTimesheets: Timesheet[] = [
  {
    id: 'ts1',
    employeeId: 'e4',
    employeeName: 'Karim Jaziri',
    weekStarting: getDate(-7),
    weekEnding: getDate(-1),
    entries: [
      { date: getDate(-7), regularHours: 8, overtimeHours: 0, projectId: 'proj1', projectName: 'Client Vermeg', task: 'Installation réseau' },
      { date: getDate(-6), regularHours: 8, overtimeHours: 2, projectId: 'proj1', projectName: 'Client Vermeg', task: 'Configuration serveurs' },
      { date: getDate(-5), regularHours: 7, overtimeHours: 0, projectId: 'proj2', projectName: 'Maintenance interne', task: 'Mise à jour systèmes' },
      { date: getDate(-4), regularHours: 8, overtimeHours: 0, projectId: 'proj1', projectName: 'Client Vermeg', task: 'Tests et validation' },
      { date: getDate(-3), regularHours: 6, overtimeHours: 0, projectId: 'proj2', projectName: 'Maintenance interne', task: 'Support utilisateurs' }
    ],
    totalRegular: 37,
    totalOvertime: 2,
    status: 'submitted',
    submittedDate: getDate(-1)
  },
  {
    id: 'ts2',
    employeeId: 'e6',
    employeeName: 'Youssef Bouazizi',
    weekStarting: getDate(-7),
    weekEnding: getDate(-1),
    entries: [
      { date: getDate(-7), regularHours: 8, overtimeHours: 0, projectId: 'proj3', projectName: 'Application Mobile', task: 'Développement frontend' },
      { date: getDate(-6), regularHours: 8, overtimeHours: 0, projectId: 'proj3', projectName: 'Application Mobile', task: 'Intégration API' },
      { date: getDate(-5), regularHours: 8, overtimeHours: 1, projectId: 'proj3', projectName: 'Application Mobile', task: 'Tests unitaires' },
      { date: getDate(-4), regularHours: 8, overtimeHours: 0, projectId: 'proj4', projectName: 'Refactoring Backend', task: 'Code review et optimisation' },
      { date: getDate(-3), regularHours: 8, overtimeHours: 0, projectId: 'proj3', projectName: 'Application Mobile', task: 'Déploiement staging' }
    ],
    totalRegular: 40,
    totalOvertime: 1,
    status: 'approved',
    submittedDate: getDate(-2),
    approvedBy: 'Mohamed Ben Ali',
    approvedDate: getDate(-1)
  },
  {
    id: 'ts3',
    employeeId: 'e8',
    employeeName: 'Riadh Hammami',
    weekStarting: getDate(-14),
    weekEnding: getDate(-8),
    entries: [
      { date: getDate(-14), regularHours: 8, overtimeHours: 0, projectId: 'proj5', projectName: 'Prospection SFBT', task: 'Rendez-vous client' },
      { date: getDate(-13), regularHours: 7, overtimeHours: 0, projectId: 'proj6', projectName: 'Suivi Poulina', task: 'Présentation produits' },
      { date: getDate(-12), regularHours: 8, overtimeHours: 1, projectId: 'proj5', projectName: 'Prospection SFBT', task: 'Négociation contrat' },
      { date: getDate(-11), regularHours: 8, overtimeHours: 0, projectId: 'proj7', projectName: 'Formation équipe', task: 'Formation nouveaux produits' },
      { date: getDate(-10), regularHours: 6, overtimeHours: 0, projectId: 'proj6', projectName: 'Suivi Poulina', task: 'Closing contrat' }
    ],
    totalRegular: 37,
    totalOvertime: 1,
    status: 'approved',
    submittedDate: getDate(-9),
    approvedBy: 'Mohamed Ben Ali',
    approvedDate: getDate(-8)
  },
  {
    id: 'ts4',
    employeeId: 'e12',
    employeeName: 'Hichem Oueslati',
    weekStarting: getDate(-7),
    weekEnding: getDate(-1),
    entries: [
      { date: getDate(-7), regularHours: 8, overtimeHours: 0, projectId: 'proj8', projectName: 'Support Client Clinique', task: 'Installation équipements' },
      { date: getDate(-6), regularHours: 8, overtimeHours: 0, projectId: 'proj8', projectName: 'Support Client Clinique', task: 'Configuration réseau' },
      { date: getDate(-5), regularHours: 8, overtimeHours: 0, projectId: 'proj9', projectName: 'Formation interne', task: 'Formation outils diagnostic' },
      { date: getDate(-4), regularHours: 8, overtimeHours: 0, projectId: 'proj2', projectName: 'Maintenance interne', task: 'Assistance Karim' },
      { date: getDate(-3), regularHours: 8, overtimeHours: 0, projectId: 'proj8', projectName: 'Support Client Clinique', task: 'Tests finaux' }
    ],
    totalRegular: 40,
    totalOvertime: 0,
    status: 'draft'
  }
];

// Leave Policies
export const mockLeavePolicies: LeavePolicy[] = [
  { id: 'lp1', name: 'Congé Annuel', type: 'annual', daysPerYear: 20, maxCarryover: 5, requiresApproval: true, paidLeave: true, description: 'Congé annuel payé selon le code du travail' },
  { id: 'lp2', name: 'Congé Maladie', type: 'sick', daysPerYear: 15, maxCarryover: 0, requiresApproval: true, paidLeave: true, description: 'Congé maladie avec certificat médical' },
  { id: 'lp3', name: 'RTT', type: 'rtt', daysPerYear: 12, maxCarryover: 0, requiresApproval: true, paidLeave: true, description: 'Réduction du Temps de Travail' },
  { id: 'lp4', name: 'Congé Sans Solde', type: 'unpaid', daysPerYear: 0, requiresApproval: true, paidLeave: false, description: 'Congé exceptionnel non payé' },
  { id: 'lp5', name: 'Télétravail', type: 'remote', daysPerYear: 52, requiresApproval: true, paidLeave: true, description: 'Jour de travail à distance' }
];

// Performance Review Cycles
export const mockReviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Évaluation Annuelle 2023', startDate: '2023-12-01', endDate: '2024-01-31', status: 'closed' },
  { id: 'rc2', name: 'Évaluation Mi-année 2024', startDate: '2024-06-01', endDate: '2024-07-15', status: 'active' }
];

// Performance Reviews
export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 'rev1',
    employeeId: 'e4',
    employeeName: 'Karim Jaziri',
    cycleId: 'rc1',
    cycleName: 'Évaluation Annuelle 2023',
    date: '2024-01-15',
    reviewerName: 'Mohamed Ben Ali',
    status: 'completed',
    score: 4.2,
    ratings: [
      { category: 'Compétences Techniques', score: 5, comment: 'Excellente maîtrise technique' },
      { category: 'Qualité du Travail', score: 4, comment: 'Très bon travail, quelques points à améliorer' },
      { category: 'Communication', score: 4, comment: 'Bonne communication avec les clients' },
      { category: 'Ponctualité', score: 4, comment: 'Respect des délais dans la plupart des cas' }
    ],
    overallFeedback: 'Karim démontre d\'excellentes compétences techniques et un bon relationnel client. Points d\'amélioration: gestion du temps sur certains projets complexes.',
    goals: 'Objectifs 2024: Formation certification avancée réseau, mentorat junior techniciens, améliorer documentation interventions'
  },
  {
    id: 'rev2',
    employeeId: 'e2',
    employeeName: 'Sarra Trabelsi',
    cycleId: 'rc1',
    cycleName: 'Évaluation Annuelle 2023',
    date: '2024-01-10',
    reviewerName: 'Mohamed Ben Ali',
    status: 'completed',
    score: 4.5,
    ratings: [
      { category: 'Leadership', score: 5, comment: 'Excellent leadership et gestion d\'équipe' },
      { category: 'Organisation', score: 5, comment: 'Très organisée et méthodique' },
      { category: 'Communication', score: 4, comment: 'Bonne communication interpersonnelle' },
      { category: 'Résolution de Problèmes', score: 4, comment: 'Approche pragmatique et efficace' }
    ],
    overallFeedback: 'Sarra a considérablement amélioré les processus RH cette année. Elle gère très bien son département et maintient d\'excellentes relations avec tous les collaborateurs.',
    goals: 'Objectifs 2024: Mise en place SIRH complet, développement programme formation, améliorer rétention talents'
  },
  {
    id: 'rev3',
    employeeId: 'e5',
    employeeName: 'Amira Mansouri',
    cycleId: 'rc1',
    cycleName: 'Évaluation Annuelle 2023',
    date: '2024-01-20',
    reviewerName: 'Mohamed Ben Ali',
    status: 'completed',
    score: 4.7,
    ratings: [
      { category: 'Expertise Comptable', score: 5, comment: 'Maîtrise parfaite des normes comptables' },
      { category: 'Rigueur', score: 5, comment: 'Travail extrêmement rigoureux et précis' },
      { category: 'Respect des Délais', score: 5, comment: 'Toujours dans les temps, même sous pression' },
      { category: 'Initiative', score: 4, comment: 'Propose régulièrement des améliorations' }
    ],
    overallFeedback: 'Amira est un pilier du département finance. Sa rigueur et son professionnalisme sont exemplaires. Elle a géré parfaitement tous les audits et clôtures comptables.',
    goals: 'Objectifs 2024: Formation contrôle de gestion avancé, automatisation processus comptables, formation junior comptables'
  },
  {
    id: 'rev4',
    employeeId: 'e6',
    employeeName: 'Youssef Bouazizi',
    cycleId: 'rc2',
    cycleName: 'Évaluation Mi-année 2024',
    date: '2024-06-15',
    reviewerName: 'Mohamed Ben Ali',
    status: 'in_progress',
    score: 4.3,
    ratings: [
      { category: 'Compétences Techniques', score: 5, comment: 'Excellentes compétences en développement' },
      { category: 'Innovation', score: 5, comment: 'Propose des solutions innovantes' },
      { category: 'Travail d\'Équipe', score: 4, comment: 'Bon esprit d\'équipe' },
      { category: 'Documentation', score: 3, comment: 'Pourrait mieux documenter son code' }
    ],
    overallFeedback: 'Youssef est un développeur très talentueux. Il maîtrise parfaitement le stack technique et livre un code de qualité. Point d\'amélioration: documentation du code.',
    goals: 'Objectifs H2 2024: Finaliser refonte application mobile, améliorer documentation code, mentorat développeurs juniors'
  },
  {
    id: 'rev5',
    employeeId: 'e8',
    employeeName: 'Riadh Hammami',
    cycleId: 'rc1',
    cycleName: 'Évaluation Annuelle 2023',
    date: '2024-01-25',
    reviewerName: 'Mohamed Ben Ali',
    status: 'completed',
    score: 4.6,
    ratings: [
      { category: 'Performance Commerciale', score: 5, comment: 'Dépassement objectifs ventes de 25%' },
      { category: 'Relation Client', score: 5, comment: 'Excellentes relations avec les clients' },
      { category: 'Négociation', score: 5, comment: 'Très bon négociateur' },
      { category: 'Reporting', score: 4, comment: 'Reporting régulier et complet' }
    ],
    overallFeedback: 'Riadh a eu une excellente année commerciale. Il a développé le portefeuille clients et maintenu d\'excellentes relations. Meilleur commercial de l\'année 2023.',
    goals: 'Objectifs 2024: Développer 10 nouveaux comptes majeurs, augmenter CA de 30%, former nouveaux commerciaux'
  },
  {
    id: 'rev6',
    employeeId: 'e11',
    employeeName: 'Salma Dridi',
    cycleId: 'rc1',
    cycleName: 'Évaluation Annuelle 2023',
    date: '2024-01-18',
    reviewerName: 'Mohamed Ben Ali',
    status: 'completed',
    score: 4.4,
    ratings: [
      { category: 'Créativité', score: 5, comment: 'Campagnes marketing très créatives' },
      { category: 'Stratégie', score: 4, comment: 'Bonne vision stratégique' },
      { category: 'Gestion Budget', score: 4, comment: 'Respect du budget marketing' },
      { category: 'Analyse ROI', score: 4, comment: 'Suivi efficace des performances' }
    ],
    overallFeedback: 'Salma a développé d\'excellentes campagnes cette année. La visibilité de l\'entreprise a considérablement augmenté. Elle gère bien son budget et analyse les résultats.',
    goals: 'Objectifs 2024: Lancement nouvelle identité visuelle, augmentation notoriété marque, digitalisation marketing'
  }
];

// Objectives (OKR)
export const mockObjectives: Objective[] = [
  {
    id: 'obj1',
    employeeId: 'e4',
    title: 'Améliorer la satisfaction client sur les interventions',
    description: 'Augmenter le taux de satisfaction client et réduire les temps d\'intervention',
    weight: 40,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    status: 'active',
    progress: 65,
    keyResults: [
      { id: 'kr1', description: 'Obtenir un score NPS supérieur à 8/10', target: 8, current: 7.5, unit: 'score' },
      { id: 'kr2', description: 'Réduire le temps moyen d\'intervention', target: 90, current: 105, unit: 'minutes' },
      { id: 'kr3', description: 'Zéro réclamation client', target: 0, current: 1, unit: 'réclamations' }
    ]
  },
  {
    id: 'obj2',
    employeeId: 'e2',
    title: 'Digitaliser les processus RH',
    description: 'Mettre en place un système de gestion RH digitalisé',
    weight: 60,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    progress: 45,
    keyResults: [
      { id: 'kr4', description: 'Déployer le module de congés en ligne', target: 100, current: 80, unit: '%' },
      { id: 'kr5', description: 'Former 100% des employés au nouvel outil', target: 100, current: 60, unit: '%' },
      { id: 'kr6', description: 'Réduire le temps de traitement des demandes', target: 50, current: 35, unit: '%' }
    ]
  },
  {
    id: 'obj3',
    employeeId: 'e8',
    title: 'Développer le portefeuille clients',
    description: 'Augmenter le nombre de clients actifs et le chiffre d\'affaires',
    weight: 70,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    progress: 55,
    keyResults: [
      { id: 'kr7', description: 'Acquérir 10 nouveaux comptes majeurs', target: 10, current: 6, unit: 'clients' },
      { id: 'kr8', description: 'Augmenter le CA de 30%', target: 30, current: 18, unit: '%' },
      { id: 'kr9', description: 'Taux de conversion leads >25%', target: 25, current: 22, unit: '%' }
    ]
  },
  {
    id: 'obj4',
    employeeId: 'e6',
    title: 'Moderniser l\'infrastructure technique',
    description: 'Refactoriser le code et améliorer les performances de l\'application',
    weight: 50,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    status: 'active',
    progress: 30,
    keyResults: [
      { id: 'kr10', description: 'Réduire le temps de chargement de 40%', target: 40, current: 15, unit: '%' },
      { id: 'kr11', description: 'Atteindre 80% de couverture de tests', target: 80, current: 45, unit: '%' },
      { id: 'kr12', description: 'Migrer 100% du code vers TypeScript', target: 100, current: 60, unit: '%' }
    ]
  },
  {
    id: 'obj5',
    employeeId: 'e11',
    title: 'Renforcer la présence digitale',
    description: 'Améliorer la visibilité en ligne et l\'engagement sur les réseaux sociaux',
    weight: 60,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    progress: 70,
    keyResults: [
      { id: 'kr13', description: 'Augmenter le trafic web de 50%', target: 50, current: 42, unit: '%' },
      { id: 'kr14', description: 'Atteindre 5000 followers LinkedIn', target: 5000, current: 3800, unit: 'followers' },
      { id: 'kr15', description: 'Lancer 12 campagnes marketing', target: 12, current: 9, unit: 'campagnes' }
    ]
  },
  {
    id: 'obj6',
    employeeId: 'e5',
    title: 'Optimiser les processus comptables',
    description: 'Automatiser les processus et réduire les délais de clôture',
    weight: 50,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    progress: 80,
    keyResults: [
      { id: 'kr16', description: 'Réduire le délai de clôture mensuelle à 3 jours', target: 3, current: 4, unit: 'jours' },
      { id: 'kr17', description: 'Automatiser 80% des écritures récurrentes', target: 80, current: 75, unit: '%' },
      { id: 'kr18', description: 'Zéro écart lors des audits', target: 0, current: 0, unit: 'écarts' }
    ]
  }
];

// Onboarding Checklists
export const mockOnboardingChecklists: OnboardingChecklist[] = [
  {
    id: 'onb1',
    employeeId: 'e4',
    employeeName: 'Karim Jaziri',
    startDate: '2019-03-10',
    status: 'completed',
    completionPercentage: 100,
    tasks: [
      { id: 'task1', title: 'Préparer poste de travail', description: 'PC, téléphone, accès réseau', assigneeRole: 'it', dueInDays: 0, completed: true, completedDate: '2019-03-10', completedBy: 'IT Team' },
      { id: 'task2', title: 'Remettre contrat signé', description: 'Contrat de travail + annexes', assigneeRole: 'hr', dueInDays: 0, completed: true, completedDate: '2019-03-10', completedBy: 'Sarra Trabelsi', requiresDocument: true, documentUrl: '/docs/contract-e4.pdf' },
      { id: 'task3', title: 'Visite médicale d\'embauche', description: 'Certificat médical obligatoire', assigneeRole: 'hr', dueInDays: 7, completed: true, completedDate: '2019-03-15', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task4', title: 'Formation sécurité', description: 'Formation obligatoire sécurité au travail', assigneeRole: 'manager', dueInDays: 7, completed: true, completedDate: '2019-03-17', completedBy: 'Mohamed Ben Ali' },
      { id: 'task5', title: 'Présentation équipe', description: 'Tour des bureaux et présentation collègues', assigneeRole: 'manager', dueInDays: 1, completed: true, completedDate: '2019-03-11', completedBy: 'Mohamed Ben Ali' }
    ],
    notes: 'Onboarding complété avec succès. Nouvelle recrue opérationnelle rapidement.'
  },
  {
    id: 'onb2',
    employeeId: 'e7',
    employeeName: 'Nesrine Khalil',
    startDate: '2022-01-10',
    status: 'completed',
    completionPercentage: 100,
    tasks: [
      { id: 'task6', title: 'Préparer poste de travail', description: 'PC, téléphone, accès réseau', assigneeRole: 'it', dueInDays: 0, completed: true, completedDate: '2022-01-10', completedBy: 'IT Team' },
      { id: 'task7', title: 'Remettre contrat signé', description: 'Contrat CDD + annexes', assigneeRole: 'hr', dueInDays: 0, completed: true, completedDate: '2022-01-10', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task8', title: 'Visite médicale', description: 'Certificat médical', assigneeRole: 'hr', dueInDays: 7, completed: true, completedDate: '2022-01-14', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task9', title: 'Formation outils bureautiques', description: 'Formation Word, Excel, logiciel interne', assigneeRole: 'manager', dueInDays: 3, completed: true, completedDate: '2022-01-13', completedBy: 'Mohamed Ben Ali' },
      { id: 'task10', title: 'Présentation des procédures administratives', description: 'Règlement intérieur, procédures', assigneeRole: 'hr', dueInDays: 2, completed: true, completedDate: '2022-01-12', completedBy: 'Sarra Trabelsi' }
    ],
    notes: 'Intégration réussie. Employée motivée et organisée.'
  },
  {
    id: 'onb3',
    employeeId: 'e12',
    employeeName: 'Hichem Oueslati',
    startDate: '2023-03-01',
    status: 'in_progress',
    completionPercentage: 80,
    tasks: [
      { id: 'task11', title: 'Préparer poste de travail', description: 'PC, téléphone, outils techniques', assigneeRole: 'it', dueInDays: 0, completed: true, completedDate: '2023-03-01', completedBy: 'IT Team' },
      { id: 'task12', title: 'Remettre convention de stage signée', description: 'Convention tripartite', assigneeRole: 'hr', dueInDays: 0, completed: true, completedDate: '2023-03-01', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task13', title: 'Visite médicale', description: 'Certificat médical obligatoire', assigneeRole: 'hr', dueInDays: 7, completed: true, completedDate: '2023-03-07', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task14', title: 'Formation technique de base', description: 'Outils de diagnostic, procédures intervention', assigneeRole: 'manager', dueInDays: 14, completed: true, completedDate: '2023-03-14', completedBy: 'Karim Jaziri' },
      { id: 'task15', title: 'Évaluation mi-parcours stage', description: 'Évaluation 3 mois', assigneeRole: 'manager', dueInDays: 90, completed: false }
    ],
    notes: 'Stagiaire prometteur. Bonne progression technique.'
  },
  {
    id: 'onb4',
    employeeId: 'e6',
    employeeName: 'Youssef Bouazizi',
    startDate: '2021-02-01',
    status: 'completed',
    completionPercentage: 100,
    tasks: [
      { id: 'task16', title: 'Préparer environnement de développement', description: 'PC, accès Git, serveurs dev', assigneeRole: 'it', dueInDays: 0, completed: true, completedDate: '2021-02-01', completedBy: 'IT Team' },
      { id: 'task17', title: 'Remettre contrat signé', description: 'CDI développeur', assigneeRole: 'hr', dueInDays: 0, completed: true, completedDate: '2021-02-01', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task18', title: 'Visite médicale', description: 'Certificat médical', assigneeRole: 'hr', dueInDays: 7, completed: true, completedDate: '2021-02-05', completedBy: 'Sarra Trabelsi', requiresDocument: true },
      { id: 'task19', title: 'Formation architecture applicative', description: 'Documentation technique, architecture', assigneeRole: 'manager', dueInDays: 5, completed: true, completedDate: '2021-02-06', completedBy: 'Mohamed Ben Ali' },
      { id: 'task20', title: 'Code review et bonnes pratiques', description: 'Standards de code, Git flow', assigneeRole: 'manager', dueInDays: 3, completed: true, completedDate: '2021-02-04', completedBy: 'Mohamed Ben Ali' }
    ],
    notes: 'Excellent développeur. Opérationnel dès la première semaine.'
  }
];

// Offboarding Checklists
export const mockOffboardingChecklists: OffboardingChecklist[] = [
  {
    id: 'off1',
    employeeId: 'e9',
    employeeName: 'Leila Gharbi',
    lastWorkingDay: '2024-12-31',
    reason: 'Démission - Nouvelle opportunité',
    status: 'scheduled',
    completionPercentage: 0,
    tasks: [
      { id: 'offtask1', title: 'Récupérer matériel entreprise', description: 'PC portable, téléphone, badge accès', assigneeRole: 'it', dueInDays: 0, completed: false },
      { id: 'offtask2', title: 'Solde de tout compte', description: 'Calcul et paiement final', assigneeRole: 'hr', dueInDays: 0, completed: false, requiresDocument: true },
      { id: 'offtask3', title: 'Désactiver accès systèmes', description: 'Email, VPN, applications métiers', assigneeRole: 'it', dueInDays: 0, completed: false },
      { id: 'offtask4', title: 'Entretien de départ', description: 'Feedback et raisons du départ', assigneeRole: 'hr', dueInDays: -5, completed: false },
      { id: 'offtask5', title: 'Transfert de connaissances', description: 'Documentation et passation dossiers', assigneeRole: 'manager', dueInDays: -10, completed: false }
    ],
    notes: 'Départ prévu fin décembre. Préparer le recrutement du remplaçant.'
  },
  {
    id: 'off2',
    employeeId: 'e10',
    employeeName: 'Fares Amor',
    lastWorkingDay: '2025-04-19',
    reason: 'Fin de CDD',
    status: 'scheduled',
    completionPercentage: 0,
    tasks: [
      { id: 'offtask6', title: 'Récupérer équipements', description: 'Scanner, chariot, badge', assigneeRole: 'manager', dueInDays: 0, completed: false },
      { id: 'offtask7', title: 'Solde de tout compte', description: 'Paiement final + certificat de travail', assigneeRole: 'hr', dueInDays: 0, completed: false, requiresDocument: true },
      { id: 'offtask8', title: 'Désactiver accès', description: 'Système de gestion stock', assigneeRole: 'it', dueInDays: 0, completed: false },
      { id: 'offtask9', title: 'Entretien de fin de contrat', description: 'Évaluation performance globale', assigneeRole: 'hr', dueInDays: -3, completed: false },
      { id: 'offtask10', title: 'Inventaire magasin', description: 'Vérification stock avant départ', assigneeRole: 'manager', dueInDays: -1, completed: false }
    ],
    notes: 'Bon élément. Possibilité de renouvellement du CDD à évaluer.'
  }
];

// Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    timestamp: '2024-04-30T16:00:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'payroll_run',
    resourceId: 'pr1',
    after: { reference: 'PAY-2024-04', status: 'closed' },
    notes: 'Clôture de la paie du mois d\'avril'
  },
  {
    id: 'log2',
    timestamp: '2024-05-10T14:30:00Z',
    actorId: 'e1',
    actorName: 'Mohamed Ben Ali',
    action: 'approve',
    resource: 'leave_request',
    resourceId: 'l1',
    before: { status: 'pending' },
    after: { status: 'approved' },
    notes: 'Validation congé Sarra Trabelsi'
  },
  {
    id: 'log3',
    timestamp: '2024-05-15T09:15:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'update',
    resource: 'employee',
    resourceId: 'e4',
    before: { salary: 2000 },
    after: { salary: 2200 },
    notes: 'Augmentation salariale suite à évaluation annuelle'
  },
  {
    id: 'log4',
    timestamp: '2024-05-20T11:00:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'view_sensitive',
    resource: 'payslip',
    resourceId: 'ps1',
    notes: 'Consultation bulletin de paie pour vérification'
  },
  {
    id: 'log5',
    timestamp: '2024-05-01T08:30:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'employee',
    resourceId: 'e12',
    after: { firstName: 'Hichem', lastName: 'Oueslati', position: 'Technicien Junior' },
    notes: 'Nouveau stagiaire - Convention de stage validée'
  },
  {
    id: 'log6',
    timestamp: '2024-04-15T10:20:00Z',
    actorId: 'e1',
    actorName: 'Mohamed Ben Ali',
    action: 'reject',
    resource: 'leave_request',
    resourceId: 'l10',
    before: { status: 'pending' },
    after: { status: 'rejected' },
    notes: 'Rejet demande congé Nesrine - Période chargée'
  },
  {
    id: 'log7',
    timestamp: '2024-03-20T15:45:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'performance_review',
    resourceId: 'rev1',
    after: { employeeId: 'e4', score: 4.2 },
    notes: 'Évaluation annuelle Karim Jaziri finalisée'
  },
  {
    id: 'log8',
    timestamp: '2024-05-28T10:00:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'payroll_run',
    resourceId: 'pr2',
    after: { reference: 'PAY-2024-05', status: 'calculated' },
    notes: 'Calcul de la paie du mois de mai'
  },
  {
    id: 'log9',
    timestamp: '2024-04-10T09:00:00Z',
    actorId: 'e1',
    actorName: 'Mohamed Ben Ali',
    action: 'approve',
    resource: 'expense_report',
    resourceId: 'er2',
    before: { status: 'pending' },
    after: { status: 'approved' },
    notes: 'Validation note de frais Riadh Hammami'
  },
  {
    id: 'log10',
    timestamp: '2024-03-15T14:00:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'update',
    resource: 'employee',
    resourceId: 'e5',
    before: { salary: 3000 },
    after: { salary: 3200 },
    notes: 'Augmentation salariale Amira Mansouri'
  },
  {
    id: 'log11',
    timestamp: '2024-02-28T16:30:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'onboarding_checklist',
    resourceId: 'onb3',
    after: { employeeId: 'e12', status: 'in_progress' },
    notes: 'Création checklist onboarding Hichem Oueslati'
  },
  {
    id: 'log12',
    timestamp: '2024-05-25T11:15:00Z',
    actorId: 'e1',
    actorName: 'Mohamed Ben Ali',
    action: 'approve',
    resource: 'timesheet',
    resourceId: 'ts2',
    before: { status: 'submitted' },
    after: { status: 'approved' },
    notes: 'Validation feuille de temps Youssef Bouazizi'
  },
  {
    id: 'log13',
    timestamp: '2024-11-15T09:30:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'create',
    resource: 'offboarding_checklist',
    resourceId: 'off1',
    after: { employeeId: 'e9', lastWorkingDay: '2024-12-31' },
    notes: 'Processus de départ initié pour Leila Gharbi'
  },
  {
    id: 'log14',
    timestamp: '2024-04-20T13:45:00Z',
    actorId: 'e1',
    actorName: 'Mohamed Ben Ali',
    action: 'approve',
    resource: 'leave_request',
    resourceId: 'l4',
    before: { status: 'pending' },
    after: { status: 'approved' },
    notes: 'Validation congé maternité Leila Gharbi'
  },
  {
    id: 'log15',
    timestamp: '2024-03-10T10:00:00Z',
    actorId: 'e2',
    actorName: 'Sarra Trabelsi',
    action: 'update',
    resource: 'objective',
    resourceId: 'obj1',
    before: { progress: 50 },
    after: { progress: 65 },
    notes: 'Mise à jour progression objectif Karim Jaziri'
  }
];

// HR Settings
export const mockHRSettings: HRSettings = {
  id: 'hr-settings-1',
  // Leave Policies
  leaveYearStart: '01-01',
  carryoverAllowed: true,
  maxCarryoverDays: 5,
  // Payroll
  payrollFrequency: 'monthly',
  payrollCutoffDay: 25,
  paymentDay: 1,
  defaultWorkingDaysPerWeek: 5,
  overtimeRateMultiplier: 1.5,
  // Working Hours
  standardWorkingHoursPerDay: 8,
  standardWorkingHoursPerWeek: 40,
  weekendDays: ['saturday', 'sunday'],
  // Compliance
  dataRetentionYears: 10,
  anonymizeOnExit: true,
  requireTwoFactorForSalaryAccess: false,
  // Notifications
  alertDocumentExpiryDays: 30,
  alertTrialPeriodEndDays: 15,
  alertContractEndDays: 60
};

// ============================================
// PROJECT MANAGEMENT DATA
// ============================================

export const mockProjects: Project[] = [
  {
    id: 'prj1',
    code: 'PRJ-001',
    name: 'Refonte Site Web Corporate',
    description: 'Refonte complète du site web corporate avec nouveau design et CMS moderne',
    clientId: 'c1',
    clientName: 'SFBT',
    managerId: 'e1',
    managerName: 'Mohamed Ben Ali',
    startDate: getDate(-60),
    endDate: getDate(30),
    deadline: getDate(30),
    budget: 45000,
    currency: 'TND',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    category: 'Web Development',
    tags: ['web', 'design', 'corporate'],
    teamMembers: [
      { employeeId: 'e1', employeeName: 'Mohamed Ben Ali', role: 'Chef de Projet', hourlyRate: 75 },
      { employeeId: 'e2', employeeName: 'Sarra Trabelsi', role: 'Designer UI/UX', hourlyRate: 60 },
      { employeeId: 'e3', employeeName: 'Karim Jaziri', role: 'Développeur Frontend', hourlyRate: 55 }
    ],
    createdAt: getDate(-65),
    notes: 'Client prioritaire - livraison avant fin du trimestre'
  },
  {
    id: 'prj2',
    code: 'PRJ-002',
    name: 'Application Mobile E-Commerce',
    description: 'Développement d\'une application mobile iOS/Android pour la vente en ligne',
    clientId: 'c2',
    clientName: 'Poulina Group Holding',
    managerId: 'e1',
    managerName: 'Mohamed Ben Ali',
    startDate: getDate(-30),
    endDate: getDate(90),
    deadline: getDate(90),
    budget: 85000,
    currency: 'TND',
    status: 'in_progress',
    priority: 'critical',
    progress: 35,
    category: 'Mobile Development',
    tags: ['mobile', 'e-commerce', 'iOS', 'Android'],
    teamMembers: [
      { employeeId: 'e1', employeeName: 'Mohamed Ben Ali', role: 'Chef de Projet', hourlyRate: 75 },
      { employeeId: 'e4', employeeName: 'Leila Gharbi', role: 'Développeur Mobile', hourlyRate: 65 },
      { employeeId: 'e5', employeeName: 'Ahmed Mansour', role: 'Backend Developer', hourlyRate: 60 }
    ],
    createdAt: getDate(-35),
    notes: 'Intégration avec le système ERP existant requise'
  },
  {
    id: 'prj3',
    code: 'PRJ-003',
    name: 'Audit Sécurité Infrastructure',
    description: 'Audit complet de la sécurité informatique et recommandations',
    clientId: 'c4',
    clientName: 'Vermeg',
    managerId: 'e2',
    managerName: 'Sarra Trabelsi',
    startDate: getDate(-15),
    endDate: getDate(15),
    deadline: getDate(15),
    budget: 25000,
    currency: 'TND',
    status: 'in_progress',
    priority: 'high',
    progress: 80,
    category: 'Security',
    tags: ['security', 'audit', 'infrastructure'],
    teamMembers: [
      { employeeId: 'e2', employeeName: 'Sarra Trabelsi', role: 'Lead Security', hourlyRate: 80 },
      { employeeId: 'e5', employeeName: 'Ahmed Mansour', role: 'Security Analyst', hourlyRate: 60 }
    ],
    createdAt: getDate(-20)
  },
  {
    id: 'prj4',
    code: 'PRJ-004',
    name: 'Migration Cloud AWS',
    description: 'Migration de l\'infrastructure on-premise vers AWS',
    clientId: 'c3',
    clientName: 'Clinique Les Jasmins',
    managerId: 'e1',
    managerName: 'Mohamed Ben Ali',
    startDate: getDate(-90),
    endDate: getDate(-10),
    deadline: getDate(-10),
    budget: 55000,
    currency: 'TND',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    category: 'Cloud',
    tags: ['cloud', 'AWS', 'migration'],
    teamMembers: [
      { employeeId: 'e1', employeeName: 'Mohamed Ben Ali', role: 'Architecte Cloud', hourlyRate: 75 },
      { employeeId: 'e5', employeeName: 'Ahmed Mansour', role: 'DevOps Engineer', hourlyRate: 60 }
    ],
    createdAt: getDate(-95),
    notes: 'Projet terminé avec succès - documentation livrée'
  },
  {
    id: 'prj5',
    code: 'PRJ-005',
    name: 'Système de Gestion RH',
    description: 'Développement d\'un système de gestion RH interne',
    managerId: 'e2',
    managerName: 'Sarra Trabelsi',
    startDate: getDate(5),
    endDate: getDate(120),
    deadline: getDate(120),
    budget: 35000,
    currency: 'TND',
    status: 'planning',
    priority: 'medium',
    progress: 0,
    category: 'Internal',
    tags: ['HR', 'internal', 'management'],
    teamMembers: [
      { employeeId: 'e2', employeeName: 'Sarra Trabelsi', role: 'Chef de Projet', hourlyRate: 70 },
      { employeeId: 'e3', employeeName: 'Karim Jaziri', role: 'Développeur Full Stack', hourlyRate: 55 }
    ],
    createdAt: getDate(-5),
    notes: 'Projet interne - démarrage prévu la semaine prochaine'
  },
  {
    id: 'prj6',
    code: 'PRJ-006',
    name: 'Maintenance Annuelle ERP',
    description: 'Contrat de maintenance annuel pour le système ERP',
    clientId: 'c5',
    clientName: 'Magasin Général',
    managerId: 'e1',
    managerName: 'Mohamed Ben Ali',
    startDate: getDate(-120),
    endDate: getDate(245),
    budget: 18000,
    currency: 'TND',
    status: 'in_progress',
    priority: 'low',
    progress: 45,
    category: 'Maintenance',
    tags: ['maintenance', 'ERP', 'support'],
    teamMembers: [
      { employeeId: 'e1', employeeName: 'Mohamed Ben Ali', role: 'Account Manager', hourlyRate: 75 },
      { employeeId: 'e3', employeeName: 'Karim Jaziri', role: 'Support Technique', hourlyRate: 45 }
    ],
    createdAt: getDate(-125)
  }
];

export const mockProjectTasks: ProjectTask[] = [
  // Tasks for PRJ-001 (Website Redesign)
  {
    id: 'tsk1',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    code: 'TSK-001',
    title: 'Analyse des besoins et wireframes',
    description: 'Réunions client et création des wireframes pour toutes les pages',
    assigneeId: 'e2',
    assigneeName: 'Sarra Trabelsi',
    startDate: getDate(-60),
    dueDate: getDate(-45),
    completedDate: getDate(-44),
    estimatedHours: 40,
    actualHours: 38,
    priority: 'high',
    status: 'completed',
    progress: 100,
    createdAt: getDate(-60)
  },
  {
    id: 'tsk2',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    code: 'TSK-002',
    title: 'Design UI/UX',
    description: 'Création des maquettes graphiques haute fidélité',
    assigneeId: 'e2',
    assigneeName: 'Sarra Trabelsi',
    startDate: getDate(-44),
    dueDate: getDate(-25),
    completedDate: getDate(-26),
    estimatedHours: 60,
    actualHours: 55,
    priority: 'high',
    status: 'completed',
    progress: 100,
    createdAt: getDate(-60)
  },
  {
    id: 'tsk3',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    code: 'TSK-003',
    title: 'Développement Frontend',
    description: 'Intégration HTML/CSS/JS responsive',
    assigneeId: 'e3',
    assigneeName: 'Karim Jaziri',
    startDate: getDate(-25),
    dueDate: getDate(5),
    estimatedHours: 80,
    actualHours: 52,
    priority: 'high',
    status: 'in_progress',
    progress: 65,
    createdAt: getDate(-60)
  },
  {
    id: 'tsk4',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    code: 'TSK-004',
    title: 'Intégration CMS',
    description: 'Installation et configuration du CMS WordPress',
    assigneeId: 'e3',
    assigneeName: 'Karim Jaziri',
    startDate: getDate(5),
    dueDate: getDate(20),
    estimatedHours: 40,
    priority: 'medium',
    status: 'todo',
    progress: 0,
    createdAt: getDate(-60)
  },
  {
    id: 'tsk5',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    code: 'TSK-005',
    title: 'Tests et corrections',
    description: 'Tests cross-browser et corrections bugs',
    assigneeId: 'e3',
    assigneeName: 'Karim Jaziri',
    startDate: getDate(20),
    dueDate: getDate(28),
    estimatedHours: 24,
    priority: 'high',
    status: 'todo',
    progress: 0,
    createdAt: getDate(-60)
  },
  // Tasks for PRJ-002 (Mobile App)
  {
    id: 'tsk6',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    code: 'TSK-006',
    title: 'Architecture et spécifications',
    description: 'Définition de l\'architecture technique et des API',
    assigneeId: 'e5',
    assigneeName: 'Ahmed Mansour',
    startDate: getDate(-30),
    dueDate: getDate(-20),
    completedDate: getDate(-21),
    estimatedHours: 32,
    actualHours: 35,
    priority: 'critical',
    status: 'completed',
    progress: 100,
    createdAt: getDate(-30)
  },
  {
    id: 'tsk7',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    code: 'TSK-007',
    title: 'Développement API Backend',
    description: 'Création des API REST pour l\'application',
    assigneeId: 'e5',
    assigneeName: 'Ahmed Mansour',
    startDate: getDate(-20),
    dueDate: getDate(15),
    estimatedHours: 120,
    actualHours: 65,
    priority: 'critical',
    status: 'in_progress',
    progress: 55,
    createdAt: getDate(-30)
  },
  {
    id: 'tsk8',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    code: 'TSK-008',
    title: 'Développement App iOS',
    description: 'Développement de l\'application iOS native',
    assigneeId: 'e4',
    assigneeName: 'Leila Gharbi',
    startDate: getDate(-15),
    dueDate: getDate(45),
    estimatedHours: 160,
    actualHours: 40,
    priority: 'high',
    status: 'in_progress',
    progress: 25,
    createdAt: getDate(-30)
  },
  {
    id: 'tsk9',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    code: 'TSK-009',
    title: 'Développement App Android',
    description: 'Développement de l\'application Android native',
    assigneeId: 'e4',
    assigneeName: 'Leila Gharbi',
    startDate: getDate(10),
    dueDate: getDate(60),
    estimatedHours: 160,
    priority: 'high',
    status: 'todo',
    progress: 0,
    createdAt: getDate(-30)
  },
  // Tasks for PRJ-003 (Security Audit)
  {
    id: 'tsk10',
    projectId: 'prj3',
    projectName: 'Audit Sécurité Infrastructure',
    code: 'TSK-010',
    title: 'Scan de vulnérabilités',
    description: 'Scan automatisé de l\'infrastructure',
    assigneeId: 'e5',
    assigneeName: 'Ahmed Mansour',
    startDate: getDate(-15),
    dueDate: getDate(-10),
    completedDate: getDate(-11),
    estimatedHours: 16,
    actualHours: 14,
    priority: 'high',
    status: 'completed',
    progress: 100,
    createdAt: getDate(-15)
  },
  {
    id: 'tsk11',
    projectId: 'prj3',
    projectName: 'Audit Sécurité Infrastructure',
    code: 'TSK-011',
    title: 'Tests de pénétration',
    description: 'Tests manuels d\'intrusion',
    assigneeId: 'e2',
    assigneeName: 'Sarra Trabelsi',
    startDate: getDate(-10),
    dueDate: getDate(-2),
    completedDate: getDate(-3),
    estimatedHours: 40,
    actualHours: 42,
    priority: 'critical',
    status: 'completed',
    progress: 100,
    createdAt: getDate(-15)
  },
  {
    id: 'tsk12',
    projectId: 'prj3',
    projectName: 'Audit Sécurité Infrastructure',
    code: 'TSK-012',
    title: 'Rédaction rapport final',
    description: 'Rédaction du rapport d\'audit avec recommandations',
    assigneeId: 'e2',
    assigneeName: 'Sarra Trabelsi',
    startDate: getDate(-2),
    dueDate: getDate(5),
    estimatedHours: 24,
    actualHours: 12,
    priority: 'high',
    status: 'in_progress',
    progress: 50,
    createdAt: getDate(-15)
  }
];

export const mockProjectTimeEntries: ProjectTimeEntry[] = [
  // Time entries for various projects
  {
    id: 'te1',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    taskId: 'tsk3',
    taskName: 'Développement Frontend',
    employeeId: 'e3',
    employeeName: 'Karim Jaziri',
    date: getDate(-5),
    hours: 8,
    description: 'Intégration page d\'accueil',
    billable: true,
    hourlyRate: 55,
    totalCost: 440,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-4),
    createdAt: getDate(-5)
  },
  {
    id: 'te2',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    taskId: 'tsk3',
    taskName: 'Développement Frontend',
    employeeId: 'e3',
    employeeName: 'Karim Jaziri',
    date: getDate(-4),
    hours: 7.5,
    description: 'Intégration pages services',
    billable: true,
    hourlyRate: 55,
    totalCost: 412.5,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-3),
    createdAt: getDate(-4)
  },
  {
    id: 'te3',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    taskId: 'tsk3',
    taskName: 'Développement Frontend',
    employeeId: 'e3',
    employeeName: 'Karim Jaziri',
    date: getDate(-3),
    hours: 8,
    description: 'Responsive design mobile',
    billable: true,
    hourlyRate: 55,
    totalCost: 440,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-2),
    createdAt: getDate(-3)
  },
  {
    id: 'te4',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    taskId: 'tsk3',
    taskName: 'Développement Frontend',
    employeeId: 'e3',
    employeeName: 'Karim Jaziri',
    date: getDate(-2),
    hours: 6,
    description: 'Corrections CSS',
    billable: true,
    hourlyRate: 55,
    totalCost: 330,
    status: 'submitted',
    createdAt: getDate(-2)
  },
  {
    id: 'te5',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    taskId: 'tsk3',
    taskName: 'Développement Frontend',
    employeeId: 'e3',
    employeeName: 'Karim Jaziri',
    date: getDate(-1),
    hours: 8,
    description: 'Animations et transitions',
    billable: true,
    hourlyRate: 55,
    totalCost: 440,
    status: 'draft',
    createdAt: getDate(-1)
  },
  {
    id: 'te6',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    taskId: 'tsk7',
    taskName: 'Développement API Backend',
    employeeId: 'e5',
    employeeName: 'Ahmed Mansour',
    date: getDate(-3),
    hours: 8,
    description: 'API authentification',
    billable: true,
    hourlyRate: 60,
    totalCost: 480,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-2),
    createdAt: getDate(-3)
  },
  {
    id: 'te7',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    taskId: 'tsk7',
    taskName: 'Développement API Backend',
    employeeId: 'e5',
    employeeName: 'Ahmed Mansour',
    date: getDate(-2),
    hours: 7,
    description: 'API produits et catalogue',
    billable: true,
    hourlyRate: 60,
    totalCost: 420,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-1),
    createdAt: getDate(-2)
  },
  {
    id: 'te8',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    taskId: 'tsk8',
    taskName: 'Développement App iOS',
    employeeId: 'e4',
    employeeName: 'Leila Gharbi',
    date: getDate(-2),
    hours: 8,
    description: 'Setup projet Xcode et architecture',
    billable: true,
    hourlyRate: 65,
    totalCost: 520,
    status: 'approved',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-1),
    createdAt: getDate(-2)
  },
  {
    id: 'te9',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    taskId: 'tsk8',
    taskName: 'Développement App iOS',
    employeeId: 'e4',
    employeeName: 'Leila Gharbi',
    date: getDate(-1),
    hours: 8,
    description: 'Écran de login et onboarding',
    billable: true,
    hourlyRate: 65,
    totalCost: 520,
    status: 'submitted',
    createdAt: getDate(-1)
  },
  {
    id: 'te10',
    projectId: 'prj3',
    projectName: 'Audit Sécurité Infrastructure',
    taskId: 'tsk12',
    taskName: 'Rédaction rapport final',
    employeeId: 'e2',
    employeeName: 'Sarra Trabelsi',
    date: getDate(-1),
    hours: 6,
    description: 'Rédaction section vulnérabilités',
    billable: true,
    hourlyRate: 80,
    totalCost: 480,
    status: 'submitted',
    createdAt: getDate(-1)
  }
];

export const mockProjectExpenses: ProjectExpense[] = [
  {
    id: 'exp1',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    category: 'software',
    description: 'Licence Adobe Creative Cloud (1 an)',
    amount: 1200,
    currency: 'TND',
    date: getDate(-55),
    vendorName: 'Adobe',
    invoiceNumber: 'INV-2024-001',
    status: 'approved',
    submittedBy: 'Sarra Trabelsi',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-54),
    createdAt: getDate(-55)
  },
  {
    id: 'exp2',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    category: 'software',
    description: 'Hébergement WordPress Premium (1 an)',
    amount: 450,
    currency: 'TND',
    date: getDate(-50),
    vendorName: 'OVH',
    invoiceNumber: 'OVH-2024-1234',
    status: 'approved',
    submittedBy: 'Karim Jaziri',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-49),
    createdAt: getDate(-50)
  },
  {
    id: 'exp3',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    category: 'software',
    description: 'Apple Developer Program (1 an)',
    amount: 300,
    currency: 'TND',
    date: getDate(-25),
    vendorName: 'Apple',
    invoiceNumber: 'APL-2024-5678',
    status: 'approved',
    submittedBy: 'Leila Gharbi',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-24),
    createdAt: getDate(-25)
  },
  {
    id: 'exp4',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    category: 'software',
    description: 'Google Play Developer (1 an)',
    amount: 75,
    currency: 'TND',
    date: getDate(-25),
    vendorName: 'Google',
    invoiceNumber: 'GOO-2024-9012',
    status: 'approved',
    submittedBy: 'Leila Gharbi',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-24),
    createdAt: getDate(-25)
  },
  {
    id: 'exp5',
    projectId: 'prj2',
    projectName: 'Application Mobile E-Commerce',
    category: 'equipment',
    description: 'iPhone 15 Pro pour tests',
    amount: 4500,
    currency: 'TND',
    date: getDate(-20),
    vendorName: 'iStore Tunisia',
    invoiceNumber: 'IST-2024-3456',
    status: 'approved',
    submittedBy: 'Leila Gharbi',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-19),
    createdAt: getDate(-20)
  },
  {
    id: 'exp6',
    projectId: 'prj3',
    projectName: 'Audit Sécurité Infrastructure',
    category: 'software',
    description: 'Licence Burp Suite Professional',
    amount: 1500,
    currency: 'TND',
    date: getDate(-14),
    vendorName: 'PortSwigger',
    invoiceNumber: 'PS-2024-7890',
    status: 'approved',
    submittedBy: 'Sarra Trabelsi',
    approvedBy: 'Mohamed Ben Ali',
    approvedAt: getDate(-13),
    createdAt: getDate(-14)
  },
  {
    id: 'exp7',
    projectId: 'prj4',
    projectName: 'Migration Cloud AWS',
    category: 'subcontractor',
    description: 'Consultation architecte AWS certifié',
    amount: 3500,
    currency: 'TND',
    date: getDate(-80),
    vendorName: 'CloudExperts TN',
    invoiceNumber: 'CE-2024-1111',
    status: 'reimbursed',
    submittedBy: 'Mohamed Ben Ali',
    approvedBy: 'Admin',
    approvedAt: getDate(-78),
    createdAt: getDate(-80)
  },
  {
    id: 'exp8',
    projectId: 'prj1',
    projectName: 'Refonte Site Web Corporate',
    category: 'travel',
    description: 'Déplacement client pour présentation maquettes',
    amount: 85,
    currency: 'TND',
    date: getDate(-30),
    status: 'pending',
    submittedBy: 'Sarra Trabelsi',
    createdAt: getDate(-30),
    notes: 'Transport + parking'
  }
];

export const mockProjectMilestones: ProjectMilestone[] = [
  // Milestones for PRJ-001
  {
    id: 'ms1',
    projectId: 'prj1',
    name: 'Livraison Wireframes',
    description: 'Validation des wireframes par le client',
    dueDate: getDate(-45),
    completedDate: getDate(-44),
    status: 'completed',
    deliverables: ['Wireframes desktop', 'Wireframes mobile', 'User flows'],
    payment: 9000
  },
  {
    id: 'ms2',
    projectId: 'prj1',
    name: 'Livraison Design Final',
    description: 'Validation des maquettes graphiques',
    dueDate: getDate(-25),
    completedDate: getDate(-26),
    status: 'completed',
    deliverables: ['Maquettes HD', 'Style guide', 'Assets graphiques'],
    payment: 13500
  },
  {
    id: 'ms3',
    projectId: 'prj1',
    name: 'Livraison Site Développé',
    description: 'Site fonctionnel prêt pour tests',
    dueDate: getDate(20),
    status: 'pending',
    deliverables: ['Site responsive', 'Back-office CMS', 'Documentation'],
    payment: 18000
  },
  {
    id: 'ms4',
    projectId: 'prj1',
    name: 'Mise en Production',
    description: 'Déploiement final et formation',
    dueDate: getDate(30),
    status: 'pending',
    deliverables: ['Site en production', 'Formation utilisateurs', 'Support 30j'],
    payment: 4500
  },
  // Milestones for PRJ-002
  {
    id: 'ms5',
    projectId: 'prj2',
    name: 'Spécifications Validées',
    description: 'Architecture et spécifications approuvées',
    dueDate: getDate(-20),
    completedDate: getDate(-21),
    status: 'completed',
    deliverables: ['Document architecture', 'Specs API', 'Wireframes app'],
    payment: 17000
  },
  {
    id: 'ms6',
    projectId: 'prj2',
    name: 'API Backend Complète',
    description: 'Toutes les API développées et testées',
    dueDate: getDate(15),
    status: 'pending',
    deliverables: ['API REST', 'Documentation Swagger', 'Tests unitaires'],
    payment: 25500
  },
  {
    id: 'ms7',
    projectId: 'prj2',
    name: 'App iOS Beta',
    description: 'Version beta sur TestFlight',
    dueDate: getDate(50),
    status: 'pending',
    deliverables: ['App iOS', 'Release notes'],
    payment: 21250
  },
  {
    id: 'ms8',
    projectId: 'prj2',
    name: 'Lancement Apps Stores',
    description: 'Publication sur App Store et Play Store',
    dueDate: getDate(90),
    status: 'pending',
    deliverables: ['App iOS publiée', 'App Android publiée', 'Support 60j'],
    payment: 21250
  },
  // Milestones for PRJ-003
  {
    id: 'ms9',
    projectId: 'prj3',
    name: 'Rapport Intermédiaire',
    description: 'Résultats préliminaires des scans',
    dueDate: getDate(-5),
    completedDate: getDate(-6),
    status: 'completed',
    deliverables: ['Rapport vulnérabilités', 'Priorités'],
    payment: 10000
  },
  {
    id: 'ms10',
    projectId: 'prj3',
    name: 'Rapport Final',
    description: 'Rapport complet avec recommandations',
    dueDate: getDate(15),
    status: 'pending',
    deliverables: ['Rapport détaillé', 'Plan de remédiation', 'Présentation'],
    payment: 15000
  }
];

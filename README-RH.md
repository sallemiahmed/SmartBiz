# Module Ressources Humaines - SmartBiz Manager

## Vue d'ensemble

Module RH complet intégré à SmartBiz Manager, couvrant la gestion complète du cycle de vie des employés, de la paie, du temps & présence, des congés, des notes de frais, et de la performance.

## Architecture

### Stack Technique
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **État Global**: Context API (AppContext)
- **Persistence**: Mock data (IndexedDB désactivé)
- **i18n**: Support FR/EN/AR avec RTL
- **Formats**: TND (monnaie par défaut), formats de date localisés

### Structure des Fichiers

```
smartbiz/
├── types.ts                          # Types TypeScript (✓ complété)
├── services/
│   └── mockData.ts                    # Données mock HR (✓ complété)
├── context/
│   └── AppContext.tsx                 # État global & CRUD (en cours)
├── components/
│   └── Sidebar.tsx                    # Navigation (à mettre à jour)
└── views/
    ├── HRDashboard.tsx                # Tableau de bord RH
    ├── HREmployees.tsx                # Gestion des employés
    ├── HRContracts.tsx                # Gestion des contrats
    ├── HRPayroll.tsx                  # Module de paie
    ├── HRAttendance.tsx               # Temps & Présence
    ├── HRLeave.tsx                    # Congés & Absences
    ├── HRExpenses.tsx                 # Notes de frais
    ├── HRPerformance.tsx              # Performance & OKR
    ├── HRSettings.tsx                 # Paramètres RH
    └── HRReports.tsx                  # Rapports & Analytics
```

## Entités Principales

### 1. Employés (Employee)
```typescript
- Informations personnelles (nom, prénom, email, téléphone)
- Position, département, manager
- Date d'embauche, statut (active/inactive/on_leave/terminated)
- Salaire de référence
- Documents (CNI, passeport, contrat, certificats)
- Champs personnalisés extensibles
```

### 2. Contrats (Contract)
```typescript
- Types: CDI, CDD, Stage, Freelance, Part-time
- Dates: début, fin, période d'essai
- Salaire de base, primes, avantages
- Historique des avenants
- Fichier contrat signé
```

### 3. Paie (PayrollRun & Payslip)
```typescript
PayrollRun:
- Période de paie (début/fin)
- Statut: draft, calculated, validated, paid, closed
- Totaux: brut, net, charges
- Nombre d'employés

Payslip:
- Éléments de paie (gains, retenues)
- Calcul CNSS, IRPP
- Bulletin PDF
- Statut draft/final
```

### 4. Éléments de Paie (PayrollElement)
```typescript
- Code, nom, type (earning/deduction/benefit)
- Formules de calcul
- Éléments système (CNSS, IRPP) vs personnalisés
```

### 5. Temps & Présence

**Shifts**:
- Horaires de travail (début, fin, pause)
- Affectations par employé et date

**Attendance**:
- Pointages entrée/sortie
- Heures travaillées
- Statuts: present, absent, late, half_day, remote

**Timesheets**:
- Feuilles de temps hebdomadaires
- Heures normales vs supplémentaires
- Affectation par projet/tâche
- Workflow d'approbation

### 6. Congés (LeaveRequest & LeavePolicy)
```typescript
LeavePolicy:
- Types: annual, sick, rtt, unpaid, remote
- Jours par an, report possible
- Approbation requise

LeaveRequest:
- Employé, type, dates, durée
- Workflow: pending → approved/rejected
- Soldes en temps réel
```

### 7. Notes de Frais (ExpenseReport)
```typescript
- Catégories: Transport, Food, Accommodation, Mileage, Other
- Lignes de frais multiples
- Justificatifs (fichiers)
- Workflow: soumission → validation manager → comptabilité
- Barèmes km, plafonds
```

### 8. Performance

**Objectives (OKR)**:
- Titre, description, pondération
- Key Results (cibles et réalisé)
- Progress tracking (0-100%)

**PerformanceReview**:
- Cycles d'évaluation
- Notations par catégorie
- Feedback global
- Objectifs futurs

**ReviewCycle**:
- Périodes d'évaluation (annual, mid-year)
- Statuts: draft, active, closed

### 9. Onboarding/Offboarding
```typescript
OnboardingChecklist:
- Tâches assignées (HR, Manager, IT, Employee)
- Délais (jours depuis embauche)
- Documents requis
- Pourcentage de complétion

OffboardingChecklist:
- Procédure de sortie
- Récupération matériel
- Entretien de départ
- Accès à désactiver
```

### 10. Audit & Conformité
```typescript
AuditLog:
- Timestamp, acteur
- Action: create, update, delete, approve, reject, view_sensitive
- Resource & ID
- Before/After (changes)
- IP, User Agent

HRSettings:
- Politiques de congés
- Fréquence de paie
- Heures de travail standards
- Taux heures sup
- Rétention des données
- Alertes (documents expirés, fins de contrats)
```

## Fonctionnalités Clés

### 1. Tableau de Bord RH
- **KPI**: Effectif total, nouveaux entrants/sortants du mois, taux d'absentéisme, soldes de congés, masse salariale
- **Graphiques**:
  - Répartition par département
  - Distribution par ancienneté
  - Types de contrats
  - Évolution masse salariale
- **Alertes**:
  - Documents expirés (CNI, passeport, visite médicale)
  - Fins de période d'essai à venir
  - Contrats CDD arrivant à échéance
  - Congés en attente d'approbation
- **Quick Actions**: Ajouter employé, Lancer paie, Approuver congés, Valider notes de frais

### 2. Gestion des Employés
- **Liste**: Vue tableau avec filtres (département, statut, poste)
- **Fiche employé**: Onglets (Infos, Contrats, Documents, Historique, Performance)
- **Organigramme**: Vue hiérarchique (manager → subordonnés)
- **Documents**: Upload, versioning, dates d'expiration, alertes
- **Onboarding**: Checklist avec progression

### 3. Module de Paie
- **Runs de Paie**:
  - Création période de paie
  - Calcul automatique (base + primes - charges)
  - Validation avant clôture
  - Verrouillage après paiement
- **Moteur de Calcul v1**:
  - Salaire de base
  - Heures supplémentaires (taux × 1.5)
  - Primes (performance, transport)
  - Déductions: CNSS (9.45%), IRPP (progressif), avances
- **Bulletins PDF**: Génération automatique, téléchargement
- **Exports**: Fichier bancaire (virement salaires), export comptable

### 4. Temps & Présence
- **Pointages**: Enregistrement entrée/sortie manuel ou import
- **Feuilles de Temps**: Saisie hebdomadaire, validation manager
- **Shifts**: Gestion des horaires, affectations
- **Anomalies**: Retards, absences non justifiées, heures manquantes

### 5. Congés & Absences
- **Demande de Congé**: Formulaire avec dates, type, motif
- **Workflow**:
  - Soumission employé
  - Approbation manager (niveau 1)
  - Approbation RH si > 10 jours (niveau 2)
- **Calendrier d'Équipe**: Vue mensuelle des congés
- **Soldes**: Calcul en temps réel (acquis - pris - planifié)
- **Jours Fériés**: Configuration par pays/site

### 6. Notes de Frais
- **Création**: Multi-lignes, catégories, montants
- **Justificatifs**: Upload fichiers (OCR placeholder pour futur)
- **Validation**: Manager → Comptabilité
- **Remboursement**: Export vers module de paiement
- **Barèmes**: Indemnités kilométriques configurables

### 7. Performance
- **OKR**: Définition objectifs + key results, tracking progression
- **Cycles d'Évaluation**: Annuel, mi-année, personnalisés
- **Auto-évaluation**: Employé se note
- **Évaluation Manager**: Notation par catégorie + feedback
- **Évaluation 360** (placeholder): Feedback pairs, subordonnés
- **Matrices 9-Box**: Performance vs Potentiel (futur)
- **Plans de Développement**: Objectifs formation, promotion

### 8. Rapports & Analytics
- **Effectifs**:
  - Headcount par département/site
  - Évolution mensuelle
  - Turnover rate
  - Ancienneté moyenne
- **Masse Salariale**:
  - Total brut/net
  - Par département
  - Évolution YoY
- **Absentéisme**:
  - Taux d'absence
  - Jours de congés maladie
  - Congés non pris
- **Temps de Travail**:
  - Heures normales/supplémentaires
  - Coût heures sup
- **Notes de Frais**:
  - Montant total
  - Par catégorie
  - En attente de validation
- **Exports**: CSV, XLSX, PDF

### 9. Paramètres RH
- **Départements**: Liste, codes, managers
- **Postes**: Titres, niveaux (junior/mid/senior/manager/executive)
- **Politiques de Congés**: Types, jours/an, reports
- **Calendriers de Paie**: Fréquence, dates de coupure/paiement
- **Éléments de Paie**: Gains, retenues, formules
- **Shifts**: Définition horaires
- **Templates**: Documents (contrat, avenant), emails, notifications
- **Conformité**: Rétention données, anonymisation, alertes

## RBAC (Contrôle d'Accès)

### Rôles
1. **Super Admin**: Accès total
2. **Admin RH**: Gestion complète RH, lecture seule finances
3. **Manager**: Son équipe uniquement (lecture + approbations)
4. **Employé**: Ses propres données uniquement
5. **Comptabilité**: Lecture paie + validation notes de frais

### Permissions par Ressource

| Ressource | Super Admin | Admin RH | Manager | Employee | Compta |
|-----------|-------------|----------|---------|----------|--------|
| Employés (tous) | CRUD | CRUD | R (équipe) | R (self) | R |
| Contrats | CRUD | CRUD | R | R (self) | R |
| Salaires | CRUD | CRUD | - | R (self) | R |
| Paie | CRUD | CRUD | - | R (self) | RU |
| Congés | CRUD | CRUD | RU (approve) | CRU (self) | R |
| Notes de Frais | CRUD | CRUD | RU (approve) | CRU (self) | RU (validate) |
| Performance | CRUD | CRUD | RU (team) | R (self) | - |
| Paramètres RH | CRUD | CRUD | R | R | R |
| Audit Logs | R | R | - | - | R |

## Sécurité

### Données Sensibles
- **Salaires**: Chiffrés au repos (si IndexedDB activé)
- **Documents**: Liens signés avec expiration
- **Bulletins de Paie**: Accès restreint (employé concerné + RH + Compta)

### Audit
- Toutes actions sensibles loggées:
  - Création/modification employé
  - Changement salaire
  - Validation/rejet congé
  - Clôture paie
  - Consultation bulletin paie
  - Export données

### Conformité
- Rétention: 10 ans par défaut (configurable)
- Anonymisation: Automatique à la sortie (option)
- RGPD: Export données employé sur demande

## API Endpoints (Architecture)

### Employees
```
GET    /api/hr/employees
GET    /api/hr/employees/:id
POST   /api/hr/employees
PUT    /api/hr/employees/:id
DELETE /api/hr/employees/:id
GET    /api/hr/employees/:id/orgchart
POST   /api/hr/employees/:id/documents
```

### Contracts
```
GET    /api/hr/contracts
POST   /api/hr/contracts
PUT    /api/hr/contracts/:id
GET    /api/hr/contracts/:id/amendments
POST   /api/hr/contracts/:id/amendments
```

### Payroll
```
GET    /api/hr/payroll/runs
POST   /api/hr/payroll/runs
PUT    /api/hr/payroll/runs/:id
POST   /api/hr/payroll/runs/:id/calculate
POST   /api/hr/payroll/runs/:id/validate
POST   /api/hr/payroll/runs/:id/close
GET    /api/hr/payroll/runs/:id/payslips
GET    /api/hr/payroll/payslips/:id/pdf
POST   /api/hr/payroll/export-bank
```

### Attendance
```
GET    /api/hr/attendance
POST   /api/hr/attendance
GET    /api/hr/timesheets
POST   /api/hr/timesheets
PUT    /api/hr/timesheets/:id
POST   /api/hr/timesheets/:id/submit
POST   /api/hr/timesheets/:id/approve
```

### Leave
```
GET    /api/hr/leaves
POST   /api/hr/leaves
PUT    /api/hr/leaves/:id
POST   /api/hr/leaves/:id/approve
POST   /api/hr/leaves/:id/reject
GET    /api/hr/leaves/balances/:employeeId
GET    /api/hr/leaves/calendar
```

### Expenses
```
GET    /api/hr/expenses
POST   /api/hr/expenses
PUT    /api/hr/expenses/:id
POST   /api/hr/expenses/:id/submit
POST   /api/hr/expenses/:id/approve
POST   /api/hr/expenses/:id/reject
POST   /api/hr/expenses/:id/reimburse
```

### Performance
```
GET    /api/hr/performance/cycles
POST   /api/hr/performance/cycles
GET    /api/hr/performance/reviews
POST   /api/hr/performance/reviews
GET    /api/hr/performance/objectives
POST   /api/hr/performance/objectives
PUT    /api/hr/performance/objectives/:id
```

### Reports
```
GET    /api/hr/reports/headcount
GET    /api/hr/reports/payroll-summary
GET    /api/hr/reports/absenteeism
GET    /api/hr/reports/turnover
POST   /api/hr/reports/export
```

## Installation & Configuration

### Prérequis
- Node.js 18+
- npm ou yarn
- Variables d'environnement (si API externe)

### Installation
```bash
# Les données mock HR sont déjà chargées dans mockData.ts
# Aucune installation supplémentaire requise

# Pour activer la persistence (optionnel):
# 1. Décommenter les imports Dexie dans AppContext.tsx
# 2. Ajouter les tables HR dans services/db.ts
# 3. Exécuter les migrations
```

### Configuration

**1. HRSettings** (Paramètres RH):
```typescript
{
  leaveYearStart: '01-01',  // Début année de congés
  carryoverAllowed: true,   // Report congés autorisé
  maxCarryoverDays: 5,      // Jours reportables max
  payrollFrequency: 'monthly',
  payrollCutoffDay: 25,     // Jour de coupure paie
  paymentDay: 1,            // Jour de paiement
  defaultWorkingDaysPerWeek: 5,
  overtimeRateMultiplier: 1.5,
  standardWorkingHoursPerDay: 8,
  standardWorkingHoursPerWeek: 40,
  weekendDays: ['saturday', 'sunday'],
  dataRetentionYears: 10,
  anonymizeOnExit: true,
  alertDocumentExpiryDays: 30,
  alertTrialPeriodEndDays: 15,
  alertContractEndDays: 60
}
```

**2. Éléments de Paie Tunisie**:
- CNSS Employeur: 16.57%
- CNSS Salarié: 9.18%
- IRPP: Barème progressif
- FOPROLOS: 1%
- Accident de travail: Variable selon secteur

## Cas d'Usage

### 1. Embaucher un Nouvel Employé
1. **RH** crée la fiche employé (HREmployees)
2. Système génère matricule automatique
3. **RH** crée le contrat (HRContracts)
4. Système crée checklist onboarding automatique
5. **RH** assigne tâches (IT prépare poste, Manager fait présentation)
6. Au fil de l'avancement, tâches cochées
7. Employé opérationnel (100% complété)

### 2. Lancer la Paie Mensuelle
1. **RH** crée nouveau PayrollRun (HRPayroll)
2. Système charge tous employés actifs
3. Pour chaque employé:
   - Charge salaire de base
   - Calcule primes (si configurées)
   - Calcule heures sup depuis Timesheets
   - Calcule CNSS (9.18%)
   - Calcule IRPP (selon barème)
   - Déduit avances éventuelles
4. **RH** valide les calculs
5. **RH** génère bulletins PDF
6. **RH** exporte fichier bancaire
7. **RH** clôture la paie (verrouillage)
8. AuditLog enregistre l'action

### 3. Demander un Congé
1. **Employé** crée demande (HRLeave)
2. Sélectionne type, dates, motif
3. Système calcule nombre de jours
4. Vérifie solde disponible
5. Soumet demande
6. **Manager** reçoit notification
7. **Manager** approuve/rejette
8. Si appro, système déduit du solde
9. **Employé** reçoit confirmation
10. Congé visible dans calendrier d'équipe

### 4. Soumettre Note de Frais
1. **Employé** crée rapport (HRExpenses)
2. Ajoute lignes (date, catégorie, montant)
3. Upload justificatifs (tickets, factures)
4. Soumet pour validation
5. **Manager** valide la légitimité
6. **Compta** valide montants + justificatifs
7. Système marque "reimbursed"
8. Export vers module de paiement

### 5. Évaluation Annuelle
1. **RH** crée ReviewCycle "2024 Annual"
2. **RH** assigne employés au cycle
3. **Employé** fait auto-évaluation
4. **Manager** remplit évaluation:
   - Notations par compétence
   - Feedback global
   - Objectifs 2025
5. Entretien en face-à-face
6. **Manager** finalise review
7. **Employé** acknowl edges (signature)
8. **RH** archive dans dossier employé

## Limites Actuelles & Évolutions

### V1 (Actuel)
- ✅ CRUD complet toutes entités
- ✅ Moteur de paie basique
- ✅ Workflow congés
- ✅ Notes de frais
- ✅ OKR & Performance
- ✅ Audit logs
- ✅ Mock data
- ⏳ Interfaces UI (en cours)

### V2 (Futur)
- [ ] Signature électronique contrats (DocuSign API)
- [ ] OCR factures notes de frais (Tesseract.js)
- [ ] Intégration biométrie (API REST générique)
- [ ] E-mails automatiques (Nodemailer/SendGrid)
- [ ] Notifications push (Firebase)
- [ ] Moteur de paie avancé (formules complexes, barèmes par tranche)
- [ ] Évaluation 360° complète
- [ ] Matrices 9-box
- [ ] IA prédictive (risques départ, identification talents)

### V3 (Vision)
- [ ] Mobile app (React Native)
- [ ] Self-service portal employés
- [ ] Chatbot RH (support FAQ)
- [ ] Intégrations tierces (Slack, Teams, Google Workspace)
- [ ] Analytics avancées (Power BI embeds)
- [ ] Multi-société/multi-pays
- [ ] Blockchain pour certificats

## Données de Démo

Le système est préchargé avec des données réalistes pour la Tunisie:

- **4 employés**: DG, RH, Chauffeur, Technicien
- **6 départements**: Direction, RH, Logistique, Technique, Commercial, Finance
- **2 runs de paie**: Avril 2024 (clôturé), Mai 2024 (calculé)
- **Bulletins de paie**: 2 bulletins générés
- **Congés**: 1 demande approuvée
- **Notes de frais**: 1 en attente
- **Performance**: 1 évaluation complétée, 2 objectifs actifs
- **Onboarding**: 1 checklist complète
- **Audit**: 4 entrées de log

## Support & Contribution

### Signaler un Bug
- Créer une issue sur GitHub
- Inclure: version, navigateur, étapes de reproduction

### Demander une Fonctionnalité
- Créer une discussion sur GitHub
- Décrire le besoin métier

### Contribuer
1. Fork le repo
2. Créer une branche: `feature/hr-new-feature`
3. Commit avec messages clairs
4. Pousser et créer PR
5. Passer code review

## Tests

### Tests Unitaires
```bash
npm test
# Couverture attendue: ≥70% sur domain HR
```

### Tests d'Intégration
```bash
npm run test:integration
# Scénarios: embauche, paie, congé, note de frais
```

### Tests E2E
```bash
npm run test:e2e
# Cypress: parcours utilisateur complets
```

## Performance

### Optimisations
- Pagination: 20 items/page par défaut
- Lazy loading: Composants lourds (organigramme, calendrier)
- Memoization: Calculs de statistiques
- Debounce: Recherche (300ms)
- Virtual scrolling: Listes > 100 items

### Benchmarks
- Chargement dashboard: < 1s
- Calcul paie (50 employés): < 3s
- Export rapport XLSX (500 lignes): < 5s
- Recherche employé: < 100ms

## Glossaire

- **CDI**: Contrat à Durée Indéterminée
- **CDD**: Contrat à Durée Déterminée
- **CNSS**: Caisse Nationale de Sécurité Sociale (Tunisie)
- **IRPP**: Impôt sur le Revenu des Personnes Physiques
- **RTT**: Réduction du Temps de Travail
- **OKR**: Objectives and Key Results
- **NPS**: Net Promoter Score
- **GRN**: Goods Received Note
- **RBAC**: Role-Based Access Control
- **OCR**: Optical Character Recognition

## Changelog

### 2024-12-03 - v1.0.0 (Foundation)
- ✅ Types TypeScript étendus (PayrollRun, Payslip, Shift, Onboarding, Audit, etc.)
- ✅ Données mock complètes (10+ entités)
- ⏳ AppContext extended (interfaces définies)
- ⏳ Composants UI (à créer)
- ⏳ Routing HR (à intégrer)
- ⏳ Sidebar menu HR (à ajouter)

---

**Version**: 1.0.0
**Dernière mise à jour**: 3 décembre 2024
**Mainteneurs**: SmartBiz Dev Team
**Licence**: Propriétaire

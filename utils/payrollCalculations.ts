import { Employee, Payslip, OvertimeDetails, TaxBracket } from '../types';

/**
 * Constantes de la réglementation tunisienne
 */
export const PAYROLL_CONSTANTS = {
  // Cotisations sociales
  CNSS_EMPLOYEE_RATE: 0.0918, // 9.18%
  CNSS_EMPLOYER_RATE: 0.1657, // 16.57%
  CSS_RATE: 0.01, // 1%
  TFP_RATE: 0.01, // 1% Taxe Formation Professionnelle
  FOPROLOS_RATE: 0.02, // 2% FOPROLOS

  // Abattements fiscaux
  PROFESSIONAL_EXPENSE_RATE: 0.10, // 10%
  CHILD_ALLOWANCE_ANNUAL: 300, // 300 DT par enfant par an
  CHILD_ALLOWANCE_MONTHLY: 25, // 25 DT par enfant par mois

  // Heures supplémentaires
  OVERTIME_DAY_RATE: 1.25, // HS diurnes
  OVERTIME_NIGHT_RATE: 1.5, // HS nocturnes
  OVERTIME_HOLIDAY_RATE: 2.0, // Dimanche/jours fériés

  // Heures de travail standard
  STANDARD_HOURS_PER_DAY: 8,
  STANDARD_HOURS_PER_WEEK: 40,
  STANDARD_WORKING_DAYS_PER_MONTH: 22,
};

/**
 * Barème IRPP tunisien (revenus annuels)
 */
export const IRPP_BRACKETS = [
  { min: 0, max: 5000, rate: 0 }, // 0%
  { min: 5000, max: 20000, rate: 0.26 }, // 26%
  { min: 20000, max: 30000, rate: 0.28 }, // 28%
  { min: 30000, max: 50000, rate: 0.32 }, // 32%
  { min: 50000, max: Infinity, rate: 0.35 }, // 35%
];

/**
 * Calcule le taux horaire à partir du salaire mensuel
 */
export function calculateHourlyRate(monthlySalary: number): number {
  const monthlyHours = PAYROLL_CONSTANTS.STANDARD_HOURS_PER_DAY * PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS_PER_MONTH;
  return monthlySalary / monthlyHours;
}

/**
 * Calcule les heures supplémentaires et leur rémunération
 */
export function calculateOvertime(
  baseSalary: number,
  dayOvertimeHours: number = 0,
  nightOvertimeHours: number = 0,
  holidayOvertimeHours: number = 0
): OvertimeDetails {
  const hourlyRate = calculateHourlyRate(baseSalary);

  const dayOvertimePay = dayOvertimeHours * hourlyRate * PAYROLL_CONSTANTS.OVERTIME_DAY_RATE;
  const nightOvertimePay = nightOvertimeHours * hourlyRate * PAYROLL_CONSTANTS.OVERTIME_NIGHT_RATE;
  const holidayOvertimePay = holidayOvertimeHours * hourlyRate * PAYROLL_CONSTANTS.OVERTIME_HOLIDAY_RATE;
  const totalOvertimePay = dayOvertimePay + nightOvertimePay + holidayOvertimePay;

  return {
    regularHours: PAYROLL_CONSTANTS.STANDARD_HOURS_PER_DAY * PAYROLL_CONSTANTS.STANDARD_WORKING_DAYS_PER_MONTH,
    dayOvertimeHours,
    nightOvertimeHours,
    holidayOvertimeHours,
    hourlyRate,
    dayOvertimePay,
    nightOvertimePay,
    holidayOvertimePay,
    totalOvertimePay,
  };
}

/**
 * Calcule la CNSS employé (9.18%)
 */
export function calculateCNSSEmployee(grossSalary: number): number {
  return grossSalary * PAYROLL_CONSTANTS.CNSS_EMPLOYEE_RATE;
}

/**
 * Calcule la CNSS employeur (16.57%)
 */
export function calculateCNSSEmployer(grossSalary: number): number {
  return grossSalary * PAYROLL_CONSTANTS.CNSS_EMPLOYER_RATE;
}

/**
 * Calcule la CSS (1%)
 */
export function calculateCSS(grossSalary: number): number {
  return grossSalary * PAYROLL_CONSTANTS.CSS_RATE;
}

/**
 * Calcule l'abattement pour frais professionnels (10%)
 */
export function calculateProfessionalExpenseAllowance(grossSalary: number, cnssEmployee: number): number {
  return (grossSalary - cnssEmployee) * PAYROLL_CONSTANTS.PROFESSIONAL_EXPENSE_RATE;
}

/**
 * Calcule l'abattement pour enfants à charge
 */
export function calculateChildrenAllowance(numberOfChildren: number = 0): number {
  return numberOfChildren * PAYROLL_CONSTANTS.CHILD_ALLOWANCE_MONTHLY;
}

/**
 * Calcule l'IRPP par tranches
 */
export function calculateIRPP(
  grossSalary: number,
  cnssEmployee: number,
  professionalExpenseAllowance: number,
  childrenAllowance: number,
  spouseAllowance: number = 0
): { irppTotal: number; irppBrackets: TaxBracket[] } {
  // Base imposable annuelle
  const taxableBase = grossSalary - cnssEmployee - professionalExpenseAllowance - childrenAllowance - spouseAllowance;
  const annualTaxableBase = taxableBase * 12; // Convertir en annuel

  let remainingAmount = annualTaxableBase;
  let totalTax = 0;
  const brackets: TaxBracket[] = [];

  for (const bracket of IRPP_BRACKETS) {
    if (remainingAmount <= 0) break;

    const bracketSize = bracket.max - bracket.min;
    const amountInBracket = Math.min(remainingAmount, bracketSize);
    const taxForBracket = amountInBracket * bracket.rate;

    if (amountInBracket > 0) {
      brackets.push({
        bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '+' : bracket.max.toLocaleString()} DT`,
        amount: amountInBracket,
        rate: bracket.rate * 100,
        tax: taxForBracket,
      });
      totalTax += taxForBracket;
    }

    remainingAmount -= amountInBracket;
  }

  // Convertir l'IRPP annuel en mensuel
  const monthlyIRPP = totalTax / 12;

  return {
    irppTotal: monthlyIRPP,
    irppBrackets: brackets,
  };
}

/**
 * Calcule la TFP (Taxe Formation Professionnelle) - 1%
 */
export function calculateTFP(grossSalary: number): number {
  return grossSalary * PAYROLL_CONSTANTS.TFP_RATE;
}

/**
 * Calcule le FOPROLOS - 2%
 */
export function calculateFOPROLOS(grossSalary: number): number {
  return grossSalary * PAYROLL_CONSTANTS.FOPROLOS_RATE;
}

/**
 * Calcule une fiche de paie complète
 */
export function calculatePayslip(
  employee: Employee,
  runId: string,
  periodStart: string,
  periodEnd: string,
  baseSalary: number,
  workDays: number,
  workedDays: number,
  bonuses: number = 0,
  overtimeData?: { day?: number; night?: number; holiday?: number },
  advances: number = 0,
  otherDeductions: number = 0
): Partial<Payslip> {
  // 1. Calcul des heures supplémentaires
  const overtimeDetails = overtimeData
    ? calculateOvertime(baseSalary, overtimeData.day, overtimeData.night, overtimeData.holiday)
    : undefined;

  // 2. Calcul du salaire brut
  const grossSalary = baseSalary + bonuses + (overtimeDetails?.totalOvertimePay || 0);

  // 3. CNSS employé (9.18%)
  const cnssEmployee = calculateCNSSEmployee(grossSalary);

  // 4. Abattements
  const professionalExpenseAllowance = calculateProfessionalExpenseAllowance(grossSalary, cnssEmployee);
  const childrenAllowance = calculateChildrenAllowance(employee.numberOfChildren);
  const spouseAllowance = employee.maritalStatus === 'married' ? 150 : 0; // Exemple: 150 DT pour conjoint non salarié
  const totalAllowances = professionalExpenseAllowance + childrenAllowance + spouseAllowance;

  // 5. Base imposable
  const taxableBase = grossSalary - cnssEmployee - totalAllowances;

  // 6. IRPP
  const { irppTotal, irppBrackets } = calculateIRPP(
    grossSalary,
    cnssEmployee,
    professionalExpenseAllowance,
    childrenAllowance,
    spouseAllowance
  );

  // 7. CSS (1%)
  const css = calculateCSS(grossSalary);

  // 8. Earnings (composantes du salaire brut)
  const earnings: Payslip['earnings'] = [
    { elementId: 'base', name: 'Salaire de Base', amount: baseSalary, taxable: true },
  ];

  if (bonuses > 0) {
    earnings.push({ elementId: 'bonus', name: 'Primes', amount: bonuses, taxable: true });
  }

  if (overtimeDetails && overtimeDetails.totalOvertimePay > 0) {
    earnings.push({
      elementId: 'overtime',
      name: 'Heures Supplémentaires',
      amount: overtimeDetails.totalOvertimePay,
      taxable: true,
    });
  }

  // 9. Deductions
  const deductions: Payslip['deductions'] = [
    { elementId: 'cnss', name: 'CNSS (9,18%)', amount: cnssEmployee, type: 'social' },
    { elementId: 'irpp', name: 'IRPP', amount: irppTotal, type: 'tax' },
    { elementId: 'css', name: 'CSS (1%)', amount: css, type: 'tax' },
  ];

  if (advances > 0) {
    deductions.push({ elementId: 'advance', name: 'Avance sur Salaire', amount: advances, type: 'other' });
  }

  if (otherDeductions > 0) {
    deductions.push({ elementId: 'other', name: 'Autres Retenues', amount: otherDeductions, type: 'other' });
  }

  // 10. Totaux
  const totalDeductions = cnssEmployee + irppTotal + css + advances + otherDeductions;
  const netSalaryBeforeAdvances = grossSalary - cnssEmployee - irppTotal - css;
  const netSalary = grossSalary - totalDeductions;

  // 11. Cotisations patronales
  const cnssEmployer = calculateCNSSEmployer(grossSalary);
  const tfp = calculateTFP(grossSalary);
  const foprolos = calculateFOPROLOS(grossSalary);
  const totalEmployerContributions = cnssEmployer + tfp + foprolos;
  const totalEmployerCost = grossSalary + totalEmployerContributions;

  return {
    runId,
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    employeeMatricule: employee.matricule,
    periodStart,
    periodEnd,

    // Informations famille
    numberOfChildren: employee.numberOfChildren,
    maritalStatus: employee.maritalStatus,

    // Salaire et heures
    baseSalary,
    workDays,
    workedDays,
    absenceDays: workDays - workedDays,

    // Heures supplémentaires
    overtimeDetails,

    // Composantes du salaire
    earnings,
    grossSalary,

    // Cotisations sociales
    cnssEmployee,
    cnssEmployeeRate: PAYROLL_CONSTANTS.CNSS_EMPLOYEE_RATE,

    // Base imposable
    professionalExpenseAllowance,
    childrenAllowance,
    spouseAllowance,
    totalAllowances,
    taxableBase,

    // IRPP
    irppBrackets,
    irppTotal,

    // CSS
    css,
    cssRate: PAYROLL_CONSTANTS.CSS_RATE,

    // Autres retenues
    deductions,

    // Totaux
    totalDeductions,
    netSalaryBeforeAdvances,
    advances,
    otherDeductions,
    netSalary,

    // Cotisations patronales
    cnssEmployer,
    cnssEmployerRate: PAYROLL_CONSTANTS.CNSS_EMPLOYER_RATE,
    tfp,
    tfpRate: PAYROLL_CONSTANTS.TFP_RATE,
    foprolos,
    foprolosRate: PAYROLL_CONSTANTS.FOPROLOS_RATE,
    totalEmployerContributions,

    // Coût total
    totalEmployerCost,

    status: 'draft',
    generatedDate: new Date().toISOString(),
  };
}

/**
 * Formate un montant en dinars tunisiens
 */
export function formatTND(amount: number): string {
  return `${amount.toFixed(3)} DT`;
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

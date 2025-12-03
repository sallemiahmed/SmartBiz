import React from 'react';
import { Payslip } from '../types';
import { formatTND, formatPercentage } from '../utils/payrollCalculations';
import { FileText, User, Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface PayslipDocumentProps {
  payslip: Payslip;
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;
}

export default function PayslipDocument({
  payslip,
  companyName = 'SmartBiz SARL',
  companyAddress = 'Tunis, Tunisie',
  companyTaxId = '1234567/A/M/000',
}: PayslipDocumentProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none">
      {/* En-tête */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-sm text-gray-600">{companyAddress}</p>
            <p className="text-sm text-gray-600">Matricule Fiscal: {companyTaxId}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={24} />
              BULLETIN DE PAIE
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Période: {new Date(payslip.periodStart).toLocaleDateString('fr-FR')} - {new Date(payslip.periodEnd).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {payslip.status === 'final' ? 'Document Final' : 'Brouillon'}
            </p>
          </div>
        </div>
      </div>

      {/* Informations Employé */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} />
            Informations Employé
          </h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Nom:</span> {payslip.employeeName}</p>
            <p><span className="font-medium">Matricule:</span> {payslip.employeeMatricule}</p>
            <p><span className="font-medium">Situation familiale:</span> {payslip.maritalStatus ?
              ({ single: 'Célibataire', married: 'Marié(e)', divorced: 'Divorcé(e)', widowed: 'Veuf/Veuve' }[payslip.maritalStatus]) :
              'N/A'
            }</p>
            <p><span className="font-medium">Enfants à charge:</span> {payslip.numberOfChildren || 0}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            Temps de Travail
          </h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Jours ouvrables:</span> {payslip.workDays} jours</p>
            <p><span className="font-medium">Jours travaillés:</span> {payslip.workedDays} jours</p>
            <p><span className="font-medium">Jours d'absence:</span> {payslip.absenceDays || 0} jours</p>
            <p><span className="font-medium">Salaire de base:</span> {formatTND(payslip.baseSalary)}</p>
          </div>
        </div>
      </div>

      {/* Heures supplémentaires (si présentes) */}
      {payslip.overtimeDetails && (
        <div className="mb-6 border border-blue-200 bg-blue-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Heures Supplémentaires</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Taux horaire</p>
              <p className="font-semibold">{payslip.overtimeDetails.hourlyRate.toFixed(3)} DT/h</p>
            </div>
            {payslip.overtimeDetails.dayOvertimeHours > 0 && (
              <div>
                <p className="text-gray-600">HS Diurnes (1.25x)</p>
                <p className="font-semibold">{payslip.overtimeDetails.dayOvertimeHours}h = {formatTND(payslip.overtimeDetails.dayOvertimePay)}</p>
              </div>
            )}
            {payslip.overtimeDetails.nightOvertimeHours > 0 && (
              <div>
                <p className="text-gray-600">HS Nocturnes (1.5x)</p>
                <p className="font-semibold">{payslip.overtimeDetails.nightOvertimeHours}h = {formatTND(payslip.overtimeDetails.nightOvertimePay)}</p>
              </div>
            )}
            {payslip.overtimeDetails.holidayOvertimeHours > 0 && (
              <div>
                <p className="text-gray-600">HS Jours fériés (2x)</p>
                <p className="font-semibold">{payslip.overtimeDetails.holidayOvertimeHours}h = {formatTND(payslip.overtimeDetails.holidayOvertimePay)}</p>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-blue-300">
            <p className="text-sm font-semibold">Total HS: {formatTND(payslip.overtimeDetails.totalOvertimePay)}</p>
          </div>
        </div>
      )}

      {/* Composantes du Salaire Brut */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-green-50 p-2 rounded">
          <TrendingUp size={16} className="text-green-600" />
          💰 Gains et Rémunérations
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Libellé</th>
              <th className="text-right p-2">Base/Taux</th>
              <th className="text-right p-2">Montant</th>
              <th className="text-center p-2">Imposable</th>
            </tr>
          </thead>
          <tbody>
            {payslip.earnings.map((earning, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-2">{earning.name}</td>
                <td className="text-right p-2">-</td>
                <td className="text-right p-2 font-medium">{formatTND(earning.amount)}</td>
                <td className="text-center p-2">{earning.taxable ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-green-50 font-bold">
            <tr>
              <td className="p-2" colSpan={2}>SALAIRE BRUT</td>
              <td className="text-right p-2">{formatTND(payslip.grossSalary)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cotisations et Retenues */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-red-50 p-2 rounded">
          <TrendingDown size={16} className="text-red-600" />
          📉 Cotisations Sociales et Fiscales
        </h3>

        {/* CNSS */}
        <div className="mb-4 border-l-4 border-blue-500 pl-3">
          <p className="text-sm font-semibold text-gray-700">1. Cotisation CNSS Employé</p>
          <div className="text-sm text-gray-600 mt-1">
            <p>Salaire brut × {formatPercentage(payslip.cnssEmployeeRate)}</p>
            <p className="font-medium text-gray-900">{formatTND(payslip.grossSalary)} × {formatPercentage(payslip.cnssEmployeeRate)} = {formatTND(payslip.cnssEmployee)}</p>
          </div>
        </div>

        {/* Base Imposable IRPP */}
        <div className="mb-4 border-l-4 border-yellow-500 pl-3">
          <p className="text-sm font-semibold text-gray-700">2. Base Imposable IRPP</p>
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <p>Salaire brut: <span className="font-medium">{formatTND(payslip.grossSalary)}</span></p>
            <p>− CNSS: <span className="font-medium">{formatTND(payslip.cnssEmployee)}</span></p>
            <p>− Abattement frais professionnels (10%): <span className="font-medium">{formatTND(payslip.professionalExpenseAllowance)}</span></p>
            <p>− Abattement enfants ({payslip.numberOfChildren} × 25 DT/mois): <span className="font-medium">{formatTND(payslip.childrenAllowance)}</span></p>
            {payslip.spouseAllowance && payslip.spouseAllowance > 0 && (
              <p>− Abattement conjoint: <span className="font-medium">{formatTND(payslip.spouseAllowance)}</span></p>
            )}
            <p className="pt-1 border-t border-gray-300 font-medium text-gray-900">
              Base imposable mensuelle = {formatTND(payslip.taxableBase)}
            </p>
            <p className="font-medium text-gray-900">
              Base imposable annuelle = {formatTND(payslip.taxableBase * 12)}
            </p>
          </div>
        </div>

        {/* IRPP par tranches */}
        <div className="mb-4 border-l-4 border-purple-500 pl-3">
          <p className="text-sm font-semibold text-gray-700">3. Calcul IRPP par Tranches (Annuel)</p>
          {payslip.irppBrackets && payslip.irppBrackets.length > 0 ? (
            <table className="w-full text-xs mt-2">
              <thead className="bg-purple-50">
                <tr>
                  <th className="text-left p-1">Tranche</th>
                  <th className="text-right p-1">Montant</th>
                  <th className="text-right p-1">Taux</th>
                  <th className="text-right p-1">Impôt</th>
                </tr>
              </thead>
              <tbody>
                {payslip.irppBrackets.map((bracket, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-1">{bracket.bracket}</td>
                    <td className="text-right p-1">{formatTND(bracket.amount)}</td>
                    <td className="text-right p-1">{bracket.rate}%</td>
                    <td className="text-right p-1 font-medium">{formatTND(bracket.tax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-purple-50 font-semibold">
                <tr>
                  <td className="p-1" colSpan={3}>IRPP Mensuel</td>
                  <td className="text-right p-1">{formatTND(payslip.irppTotal)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-sm text-gray-600 mt-1">Non imposable</p>
          )}
        </div>

        {/* CSS */}
        <div className="mb-4 border-l-4 border-orange-500 pl-3">
          <p className="text-sm font-semibold text-gray-700">4. Contribution Sociale Solidaire (CSS)</p>
          <div className="text-sm text-gray-600 mt-1">
            <p>Salaire brut × {formatPercentage(payslip.cssRate)}</p>
            <p className="font-medium text-gray-900">{formatTND(payslip.grossSalary)} × {formatPercentage(payslip.cssRate)} = {formatTND(payslip.css)}</p>
          </div>
        </div>

        {/* Total Retenues */}
        <table className="w-full text-sm mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Retenues</th>
              <th className="text-right p-2">Montant</th>
            </tr>
          </thead>
          <tbody>
            {payslip.deductions.map((deduction, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-2">{deduction.name}</td>
                <td className="text-right p-2 font-medium">{formatTND(deduction.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-red-50 font-bold">
            <tr>
              <td className="p-2">TOTAL RETENUES</td>
              <td className="text-right p-2">{formatTND(payslip.totalDeductions)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Salaire Net */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-bold">
          <div className="flex items-center gap-2">
            <DollarSign size={24} className="text-blue-600" />
            <span>SALAIRE NET À PAYER</span>
          </div>
          <div className="text-2xl text-blue-600">{formatTND(payslip.netSalary)}</div>
        </div>
        {payslip.advances && payslip.advances > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            <p>Net avant avances: {formatTND(payslip.netSalaryBeforeAdvances)}</p>
            <p>Avances sur salaire: -{formatTND(payslip.advances)}</p>
          </div>
        )}
      </div>

      {/* Cotisations Patronales (Informatif) */}
      <div className="border-t-2 border-gray-300 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-100 p-2 rounded">
          🏢 Charges Patronales (à titre indicatif)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1">CNSS Employeur ({formatPercentage(payslip.cnssEmployerRate || 0.1657)})</td>
                  <td className="text-right font-medium">{formatTND(payslip.cnssEmployer || 0)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1">TFP - Formation Professionnelle ({formatPercentage(payslip.tfpRate || 0.01)})</td>
                  <td className="text-right font-medium">{formatTND(payslip.tfp || 0)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1">FOPROLOS ({formatPercentage(payslip.foprolosRate || 0.02)})</td>
                  <td className="text-right font-medium">{formatTND(payslip.foprolos || 0)}</td>
                </tr>
                <tr className="font-bold bg-gray-50">
                  <td className="py-1">Total Cotisations Patronales</td>
                  <td className="text-right">{formatTND(payslip.totalEmployerContributions || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col justify-end">
            <div className="bg-gray-50 p-3 rounded border border-gray-300">
              <p className="text-xs text-gray-600 mb-1">Coût Total Employeur</p>
              <p className="text-xl font-bold text-gray-900">{formatTND(payslip.totalEmployerCost || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                = Salaire Brut + Cotisations Patronales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
        <div className="flex justify-between">
          <div>
            <p>Document généré le {new Date(payslip.generatedDate).toLocaleString('fr-FR')}</p>
            <p className="mt-1">Ce bulletin de paie est conforme à la législation tunisienne en vigueur.</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Cachet et Signature</p>
            <div className="mt-4 h-16 border-b border-gray-400 w-32 ml-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

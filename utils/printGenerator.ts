
import { Invoice, AppSettings } from '../types';

export const printInvoice = (invoice: Invoice, settings: AppSettings) => {
  const isRTL = settings.language === 'ar';
  const currencyFormatter = new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : 'en-US', {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: 2
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'estimate': return 'ESTIMATE / QUOTE';
      case 'order': return 'SALES ORDER';
      case 'delivery': return 'DELIVERY NOTE';
      case 'invoice': return 'INVOICE';
      case 'issue': return 'ISSUE NOTE';
      case 'return': return 'RETURN NOTE';
      case 'credit': return 'CREDIT NOTE';
      default: return type.toUpperCase();
    }
  };

  const isCredit = invoice.type === 'credit';

  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>${getTypeLabel(invoice.type)} - ${invoice.number}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; font-size: 14px; line-height: 1.5; }
        .header-container { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .company-info h1 { margin: 0 0 5px; font-size: 24px; color: #2c3e50; }
        .company-info p { margin: 2px 0; color: #7f8c8d; }
        .invoice-info { text-align: ${isRTL ? 'left' : 'right'}; }
        .invoice-info h2 { margin: 0 0 10px; font-size: 20px; color: ${isCredit ? '#c0392b' : '#2c3e50'}; text-transform: uppercase; }
        .invoice-meta table { margin-left: auto; }
        .invoice-meta td { padding: 2px 10px; }
        .invoice-meta td:first-child { font-weight: bold; color: #7f8c8d; }
        
        .client-container { margin-bottom: 40px; }
        .bill-to { font-weight: bold; text-transform: uppercase; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; }
        .client-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f8f9fa; padding: 12px; text-align: ${isRTL ? 'right' : 'left'}; border-bottom: 2px solid #eee; font-weight: 600; color: #2c3e50; }
        .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .totals-container { display: flex; justify-content: flex-end; }
        .totals-table { min-width: 300px; border-collapse: collapse; }
        .totals-table td { padding: 8px 0; }
        .totals-table .label { font-weight: bold; color: #7f8c8d; padding-right: 20px; text-align: ${isRTL ? 'left' : 'right'}; }
        .totals-table .value { text-align: ${isRTL ? 'left' : 'right'}; font-weight: 600; }
        .totals-table .grand-total { font-size: 18px; border-top: 2px solid #eee; padding-top: 10px; color: ${isCredit ? '#c0392b' : '#2c3e50'}; }
        
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #95a5a6; font-size: 12px; }
        .notes-section { margin-top: 30px; font-size: 12px; color: #555; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .notes-section h4 { margin: 0 0 5px; font-size: 12px; color: #7f8c8d; text-transform: uppercase; }
        .notes-grid { display: flex; gap: 40px; }
        .note-column { flex: 1; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="company-info">
          <h1>${settings.companyName}</h1>
          <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
          <p>${settings.companyPhone} | ${settings.companyEmail}</p>
          ${settings.companyVatId ? `<p><strong>VAT ID:</strong> ${settings.companyVatId}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h2>${getTypeLabel(invoice.type)}</h2>
          <table class="invoice-meta" dir="${isRTL ? 'rtl' : 'ltr'}">
            <tr>
              <td>Ref #:</td>
              <td>${invoice.number}</td>
            </tr>
            ${invoice.linkedDocumentId ? `<tr><td>Original Inv:</td><td>${invoice.linkedDocumentId}</td></tr>` : ''}
            <tr>
              <td>Date:</td>
              <td>${invoice.date}</td>
            </tr>
            ${invoice.dueDate ? `<tr><td>Due Date:</td><td>${invoice.dueDate}</td></tr>` : ''}
          </table>
        </div>
      </div>

      <div class="client-container">
        <div class="bill-to">${isCredit ? 'Credit To:' : 'Bill To:'}</div>
        <div class="client-name">${invoice.clientName}</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50%">Description</th>
            <th class="text-center">Quantity</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${currencyFormatter.format(item.price)}</td>
              <td class="text-right">${currencyFormatter.format(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-container">
        <table class="totals-table">
          <tr>
            <td class="label">Subtotal</td>
            <td class="value">${currencyFormatter.format(invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</td>
          </tr>
          <!-- Simple Tax calculation logic for display -->
          <tr class="grand-total">
            <td class="label">Total ${isCredit ? '(Credit)' : ''}</td>
            <td class="value">${currencyFormatter.format(invoice.amount)}</td>
          </tr>
        </table>
      </div>

      <!-- Payment & Notes Section -->
      ${(invoice.paymentTerms || invoice.paymentMethod || invoice.notes) ? `
      <div class="notes-section">
        <div class="notes-grid">
          ${invoice.paymentTerms || invoice.paymentMethod ? `
          <div class="note-column">
            <h4>Payment Information</h4>
            ${invoice.paymentTerms ? `<p><strong>Terms:</strong> ${invoice.paymentTerms}</p>` : ''}
            ${invoice.paymentMethod ? `<p><strong>Method:</strong> ${invoice.paymentMethod}</p>` : ''}
          </div>` : ''}
          
          ${invoice.notes ? `
          <div class="note-column">
            <h4>Notes / Conditions</h4>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
          </div>` : ''}
        </div>
      </div>` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>${settings.companyName} &bull; ${settings.companyEmail}</p>
      </div>
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }
};

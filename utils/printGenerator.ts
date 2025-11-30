
import { Invoice, AppSettings, Purchase, ServiceJob } from '../types';

export const printInvoice = (document: Invoice | Purchase, settings: AppSettings) => {
  const isRTL = settings.language === 'ar';
  
  // Use Document Currency if available, otherwise default settings
  const docCurrency = document.currency || settings.currency;
  
  const currencyFormatter = new Intl.NumberFormat(settings.language === 'ar' ? 'ar-TN' : (settings.language === 'fr' ? 'fr-TN' : 'en-US'), {
    style: 'currency',
    currency: docCurrency,
    minimumFractionDigits: docCurrency === 'TND' ? 3 : 2
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      // Sales Types
      case 'estimate': return 'ESTIMATE / QUOTE';
      case 'order': return 'SALES ORDER';
      case 'delivery': return 'DELIVERY NOTE';
      case 'invoice': return 'INVOICE'; // Can be Sales or Purchase Invoice based on context, but label is same
      case 'issue': return 'ISSUE NOTE';
      case 'return': return 'RETURN NOTE';
      case 'credit': return 'CREDIT NOTE';
      // Purchase Specifics
      case 'rfq': return 'REQUEST FOR QUOTATION';
      case 'pr': return 'INTERNAL PURCHASE REQUEST';
      case 'grn': return 'GOODS RECEIVED NOTE';
      default: return type.toUpperCase();
    }
  };

  // Determine if it is a Purchase or Sales document based on field existence
  const isPurchase = 'supplierName' in document;
  const entityName = isPurchase ? (document as Purchase).supplierName : (document as Invoice).clientName;
  const isCredit = document.type === 'credit';
  const isRFQ = document.type === 'rfq';
  const isPR = document.type === 'pr';

  const logoHtml = settings.companyLogo 
    ? `<img src="${settings.companyLogo}" style="max-width: 150px; max-height: 80px; margin-bottom: 10px; display: block;" alt="Company Logo" />` 
    : '';

  // Calculate totals for display
  const taxRate = document.taxRate || 0;
  
  // Use stored subtotal or calculate it from items
  const itemsSubtotal = document.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = (document as Invoice).subtotal !== undefined ? (document as Invoice).subtotal! : itemsSubtotal;
  
  // Sales specific fields
  const discountAmount = (document as Invoice).discount || 0;
  const discountValue = (document as Invoice).discountValue || 0;
  const discountType = (document as Invoice).discountType || 'amount';
  const fiscalStamp = (document as Invoice).fiscalStamp || 0;
  
  // Purchase specific fields
  const additionalCosts = (document as Purchase).additionalCosts || 0;

  // Calculate Tax Amount based on Subtotal
  const taxAmount = subtotal * (taxRate / 100);

  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>${getTypeLabel(document.type)} - ${document.number}</title>
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
          ${logoHtml}
          <h1>${settings.companyName}</h1>
          <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
          <p>${settings.companyPhone} | ${settings.companyEmail}</p>
          ${settings.companyVatId ? `<p><strong>VAT ID:</strong> ${settings.companyVatId}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h2>${getTypeLabel(document.type)}</h2>
          <table class="invoice-meta" dir="${isRTL ? 'rtl' : 'ltr'}">
            <tr>
              <td>Ref #:</td>
              <td>${document.number}</td>
            </tr>
            ${(document as Invoice).linkedDocumentId ? `<tr><td>Original Ref:</td><td>${(document as Invoice).linkedDocumentId}</td></tr>` : ''}
            <tr>
              <td>Date:</td>
              <td>${document.date}</td>
            </tr>
            ${(document as Invoice).dueDate ? `<tr><td>Due Date:</td><td>${(document as Invoice).dueDate}</td></tr>` : ''}
            ${document.currency ? `<tr><td>Currency:</td><td>${document.currency}</td></tr>` : ''}
          </table>
        </div>
      </div>

      ${isPR ? `
      <div class="client-container">
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="width: 50%">
                    <div class="bill-to">REQUESTER:</div>
                    <div class="client-name">${(document as Purchase).requesterName}</div>
                </td>
                <td style="width: 50%">
                    <div class="bill-to">DEPARTMENT:</div>
                    <div class="client-name">${(document as Purchase).department}</div>
                </td>
            </tr>
        </table>
      </div>
      ` : `
      <div class="client-container">
        <div class="bill-to">${isPurchase ? 'To Supplier:' : (isCredit ? 'Credit To:' : 'Bill To:')}</div>
        <div class="client-name">${entityName}</div>
      </div>
      `}

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40%">Description</th>
            <th class="text-center">Quantity</th>
            ${!isRFQ && !isPR ? `
            <th class="text-right">Price</th>
            <th class="text-center" style="width: 15%">VAT %</th>
            <th class="text-right">Total</th>
            ` : ''}
          </tr>
        </thead>
        <tbody>
          ${document.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              ${!isRFQ && !isPR ? `
              <td class="text-right">${currencyFormatter.format(item.price)}</td>
              <td class="text-center">${taxRate}%</td>
              <td class="text-right">${currencyFormatter.format(item.price * item.quantity)}</td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${!isRFQ && !isPR ? `
      <div class="totals-container">
        <table class="totals-table">
          <tr>
            <td class="label">Subtotal (Excl. Tax)</td>
            <td class="value">${currencyFormatter.format(subtotal)}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr>
            <td class="label" style="color: #c0392b;">
              Discount ${discountType === 'percent' ? `(${discountValue}%)` : ''}
            </td>
            <td class="value" style="color: #c0392b;">-${currencyFormatter.format(discountAmount)}</td>
          </tr>` : ''}
          ${additionalCosts > 0 ? `
          <tr>
            <td class="label">Additional Costs</td>
            <td class="value">${currencyFormatter.format(additionalCosts)}</td>
          </tr>` : ''}
          <tr>
            <td class="label">VAT (${taxRate}%)</td>
            <td class="value">${currencyFormatter.format(taxAmount)}</td>
          </tr>
          ${fiscalStamp > 0 ? `
          <tr>
            <td class="label">Fiscal Stamp</td>
            <td class="value">${currencyFormatter.format(fiscalStamp)}</td>
          </tr>` : ''}
          <tr class="grand-total">
            <td class="label">Total ${isCredit ? '(Credit)' : ''}</td>
            <td class="value">${currencyFormatter.format(document.amount)}</td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- Payment & Notes Section -->
      ${(document.paymentTerms || document.paymentMethod || document.notes) ? `
      <div class="notes-section">
        <div class="notes-grid">
          ${(document.paymentTerms || document.paymentMethod) && !isRFQ && !isPR ? `
          <div class="note-column">
            <h4>Payment Information</h4>
            ${document.paymentTerms ? `<p><strong>Terms:</strong> ${document.paymentTerms}</p>` : ''}
            ${document.paymentMethod ? `<p><strong>Method:</strong> ${document.paymentMethod}</p>` : ''}
          </div>` : ''}
          
          ${document.notes ? `
          <div class="note-column">
            <h4>Notes / Conditions</h4>
            <p>${document.notes.replace(/\n/g, '<br>')}</p>
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

export const printJobCard = (job: ServiceJob, settings: AppSettings) => {
  const isRTL = settings.language === 'ar';
  
  const logoHtml = settings.companyLogo 
    ? `<img src="${settings.companyLogo}" style="max-width: 150px; max-height: 80px; margin-bottom: 10px; display: block;" alt="Company Logo" />` 
    : '';

  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>Job Card - ${job.ticketNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .company-details h1 { margin: 0; font-size: 20px; }
        .company-details div { font-size: 12px; color: #555; }
        .job-meta { text-align: ${isRTL ? 'left' : 'right'}; }
        .job-meta h2 { margin: 0; font-size: 24px; color: #444; text-transform: uppercase; }
        .ticket-num { font-size: 16px; font-weight: bold; font-family: monospace; border: 1px solid #333; padding: 5px 10px; display: inline-block; margin-top: 5px; }
        
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; margin-bottom: 8px; font-size: 11px; color: #666; }
        
        .grid { display: flex; gap: 20px; }
        .col { flex: 1; }
        
        .field { margin-bottom: 5px; }
        .label { font-weight: bold; width: 100px; display: inline-block; color: #555; }
        
        .problem-box { border: 1px solid #ddd; background: #f9f9f9; padding: 10px; min-height: 60px; white-space: pre-wrap; }
        .tech-notes { border: 1px dashed #999; padding: 10px; min-height: 100px; margin-top: 5px; }
        
        .checklist { margin-top: 10px; }
        .check-item { display: inline-block; width: 48%; margin-bottom: 5px; }
        .check-box { display: inline-block; width: 12px; height: 12px; border: 1px solid #333; margin-right: 5px; vertical-align: middle; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 20px; border-top: 1px solid #ccc; font-size: 10px; text-align: center; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; font-size: 11px; }
        
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-details">
          ${logoHtml}
          <h1>${settings.companyName}</h1>
          <div>${settings.companyPhone}</div>
          <div>${settings.companyEmail}</div>
        </div>
        <div class="job-meta">
          <h2>JOB CARD</h2>
          <div class="ticket-num">${job.ticketNumber}</div>
          <div style="margin-top:5px;">Date: ${job.date}</div>
          <div>Priority: <strong>${job.priority.toUpperCase()}</strong></div>
        </div>
      </div>

      <div class="grid section">
        <div class="col">
          <div class="section-title">Customer Details</div>
          <div class="field"><span class="label">Name:</span> ${job.clientName}</div>
          <div class="field"><span class="label">Client ID:</span> ${job.clientId}</div>
        </div>
        <div class="col">
          <div class="section-title">Device Details</div>
          <div class="field"><span class="label">Device:</span> ${job.deviceInfo}</div>
          <div class="field"><span class="label">Technician:</span> ${job.technicianName || 'Unassigned'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Reported Problem</div>
        <div class="problem-box">${job.problemDescription}</div>
      </div>

      <div class="section">
        <div class="section-title">Work Checklist (Internal Use)</div>
        <div class="checklist">
          <div class="check-item"><span class="check-box"></span> Power On Test</div>
          <div class="check-item"><span class="check-box"></span> Physical Damage Check</div>
          <div class="check-item"><span class="check-box"></span> Data Backup</div>
          <div class="check-item"><span class="check-box"></span> Component Clean</div>
          <div class="check-item"><span class="check-box"></span> OS Update</div>
          <div class="check-item"><span class="check-box"></span> Final QA Pass</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Technician Notes / Diagnosis / Resolution</div>
        <div class="tech-notes">
          ${job.resolutionNotes || ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Services & Parts (Used)</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid #ccc; text-align: left;">
              <th style="padding: 5px;">Type</th>
              <th style="padding: 5px;">Item / Service</th>
              <th style="padding: 5px; width: 50px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${job.services.length === 0 && job.usedParts.length === 0 ? '<tr><td colspan="3" style="padding:10px; font-style:italic; color:#888;">No items added yet.</td></tr>' : ''}
            ${job.services.map(s => `<tr><td style="padding: 5px; width: 80px; color:#555;">Service</td><td style="padding: 5px;">${s.name}</td><td style="padding: 5px;">1</td></tr>`).join('')}
            ${job.usedParts.map(p => `<tr><td style="padding: 5px; width: 80px; color:#555;">Part</td><td style="padding: 5px;">${p.name}</td><td style="padding: 5px;">${p.quantity}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="signatures">
        <div class="sig-box">Customer Signature</div>
        <div class="sig-box">Technician Signature</div>
      </div>

      <div class="footer">
        <p>Terms: The company is not responsible for data loss. Please ensure data is backed up before repair. Devices not claimed within 30 days of completion notification may be disposed of.</p>
        <p>${settings.companyName} &bull; ${settings.companyAddress}</p>
      </div>
      <script>window.onload = function() { window.print(); }</script>
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

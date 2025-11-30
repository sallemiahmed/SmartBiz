
import { Invoice, Purchase, AppSettings, ServiceJob } from '../types';

export const printInvoice = (document: Invoice | Purchase, settings: AppSettings) => {
  const isRTL = settings.language === 'ar';
  
  // Calculate Totals
  const subtotal = document.subtotal || document.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = document.taxRate || 0;
  
  // Sales specific fields
  const discountAmount = (document as Invoice).discount || 0;
  const discountValue = (document as Invoice).discountValue || 0;
  const discountType = (document as Invoice).discountType || 'amount';
  // Fiscal Stamp logic: Check both Invoice and Purchase types as we now support it in Purchase
  const fiscalStamp = (document as Invoice).fiscalStamp || (document as Purchase).fiscalStamp || 0;
  
  // Purchase specific fields
  const additionalCosts = (document as Purchase).additionalCosts || 0;

  // Calculate Tax Amount based on Subtotal
  // Note: Usually tax is on (Subtotal - Discount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);

  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>${document.number}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; direction: ${isRTL ? 'rtl' : 'ltr'}; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 10px; }
        .company-info h1 { margin: 0 0 5px; font-size: 20px; color: #2c3e50; }
        .company-info p { margin: 0; font-size: 12px; color: #666; }
        .doc-title { text-align: ${isRTL ? 'left' : 'right'}; }
        .doc-title h2 { margin: 0; font-size: 24px; color: #2c3e50; text-transform: uppercase; }
        .doc-title p { margin: 5px 0 0; font-size: 14px; color: #666; }
        .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .address-box { flex: 1; }
        .address-box h3 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #999; }
        .address-box p { margin: 0; font-size: 14px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: ${isRTL ? 'right' : 'left'}; padding: 12px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .totals { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
        .total-row.final { font-weight: bold; font-size: 16px; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #eee; color: #666; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          ${settings.companyLogo ? `<img src="${settings.companyLogo}" class="logo" />` : ''}
          <h1>${settings.companyName}</h1>
          <p>${settings.companyAddress}</p>
          <p>${settings.companyPhone} | ${settings.companyEmail}</p>
          ${settings.companyVatId ? `<p>VAT ID: ${settings.companyVatId}</p>` : ''}
        </div>
        <div class="doc-title">
          <h2>${document.type.toUpperCase()}</h2>
          <p>#${document.number}</p>
          <p>Date: ${document.date}</p>
          ${(document as Invoice).dueDate ? `<p>Due: ${(document as Invoice).dueDate}</p>` : ''}
          <div class="badge">${document.status.toUpperCase()}</div>
        </div>
      </div>

      <div class="addresses">
        <div class="address-box">
          <h3>Billed To:</h3>
          <p><strong>${(document as Invoice).clientName || (document as Purchase).supplierName}</strong></p>
          <!-- Additional client/supplier details would go here if available -->
        </div>
        <div class="address-box" style="text-align: ${isRTL ? 'left' : 'right'};">
          ${(document as Purchase).requesterName ? `<h3>Requester:</h3><p>${(document as Purchase).requesterName}</p><p>${(document as Purchase).department || ''}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="width: 80px; text-align: center;">Qty</th>
            <th style="width: 100px; text-align: right;">Price</th>
            <th style="width: 100px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${document.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${item.price.toFixed(3)}</td>
              <td style="text-align: right;">${(item.price * item.quantity).toFixed(3)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(3)}</span>
        </div>
        ${discountAmount > 0 ? `
        <div class="total-row" style="color: red;">
          <span>Discount ${discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
          <span>-${discountAmount.toFixed(3)}</span>
        </div>` : ''}
        ${additionalCosts > 0 ? `
        <div class="total-row">
          <span>Additional Costs</span>
          <span>${additionalCosts.toFixed(3)}</span>
        </div>` : ''}
        <div class="total-row">
          <span>Tax (${taxRate}%)</span>
          <span>${taxAmount.toFixed(3)}</span>
        </div>
        ${fiscalStamp > 0 ? `
        <div class="total-row">
          <span>Fiscal Stamp</span>
          <span>${fiscalStamp.toFixed(3)}</span>
        </div>` : ''}
        <div class="total-row final">
          <span>Total (${document.currency || settings.currency})</span>
          <span>${document.amount.toFixed(3)}</span>
        </div>
      </div>

      <div class="footer">
        <p>${document.notes || 'Thank you for your business!'}</p>
        <p>Generated by SmartBiz Manager</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

export const printJobCard = (job: ServiceJob, settings: AppSettings) => {
    // Basic Job Card Print Logic
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Card ${job.ticketNumber}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; display: flex; justify-content: space-between; }
          .section { margin-bottom: 20px; }
          h1 { margin: 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .box { border: 1px solid #ccc; padding: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>JOB CARD</h1>
            <h3>${settings.companyName}</h3>
          </div>
          <div style="text-align: right;">
            <h2>#${job.ticketNumber}</h2>
            <p>Date: ${job.date}</p>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <strong>Client Details:</strong><br>
            ${job.clientName}<br>
            <!-- Add address if available from context lookup -->
          </div>
          <div class="box">
            <strong>Device Info:</strong><br>
            ${job.deviceInfo}<br>
            <strong>Technician:</strong> ${job.technicianName || 'Unassigned'}<br>
            <strong>Priority:</strong> ${job.priority.toUpperCase()}
          </div>
        </div>

        <div class="section">
          <strong>Problem Description:</strong>
          <p>${job.problemDescription || 'N/A'}</p>
        </div>

        <div class="section">
          <strong>Resolution Notes:</strong>
          <p>${job.resolutionNotes || '____________________________________________________'}</p>
        </div>

        <div class="section">
          <strong>Services & Parts:</strong>
          <table>
            <thead><tr><th>Item</th><th>Type</th><th>Qty</th></tr></thead>
            <tbody>
              ${job.services.map(s => `<tr><td>${s.name}</td><td>Service</td><td>1</td></tr>`).join('')}
              ${job.usedParts.map(p => `<tr><td>${p.name}</td><td>Part</td><td>${p.quantity}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section" style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div>Technician Signature: __________________</div>
          <div>Client Signature: __________________</div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
};

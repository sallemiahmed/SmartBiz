
import { Invoice, Purchase, AppSettings, ServiceJob, Client, InventorySession } from '../types';

export const printInvoice = (document: Invoice | Purchase, settings: AppSettings, entity?: Client | any) => {
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

  // Entity Details (Client or Supplier)
  const entityName = (document as Invoice).clientName || (document as Purchase).supplierName;
  const entityAddress = entity?.address || entity?.region || '';
  const entityPhone = entity?.phone || '';
  const entityTaxId = entity?.taxId || '';

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
          <p><strong>${entityName}</strong></p>
          ${entityAddress ? `<p>${entityAddress}</p>` : ''}
          ${entityPhone ? `<p>Phone: ${entityPhone}</p>` : ''}
          ${entityTaxId ? `<p>Matricule Fiscale: ${entityTaxId}</p>` : ''}
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
  const isRTL = settings.language === 'ar';
  
  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>Job Card ${job.ticketNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; direction: ${isRTL ? 'rtl' : 'ltr'}; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 10px; }
        .company-info h1 { margin: 0 0 5px; font-size: 20px; color: #2c3e50; }
        .doc-title { text-align: ${isRTL ? 'left' : 'right'}; }
        .doc-title h2 { margin: 0; font-size: 24px; color: #2c3e50; text-transform: uppercase; }
        .section { margin-bottom: 20px; }
        .section h3 { background: #f3f4f6; padding: 5px 10px; font-size: 14px; text-transform: uppercase; border-left: 4px solid #4f46e5; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item label { display: block; font-size: 12px; color: #666; font-weight: bold; }
        .info-item span { display: block; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; padding: 8px; background: #eee; font-size: 12px; }
        td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          ${settings.companyLogo ? `<img src="${settings.companyLogo}" class="logo" />` : ''}
          <h1>${settings.companyName}</h1>
          <p>${settings.companyAddress} | ${settings.companyPhone}</p>
        </div>
        <div class="doc-title">
          <h2>Job Card</h2>
          <p>#${job.ticketNumber}</p>
          <p>Date: ${job.date}</p>
        </div>
      </div>

      <div class="section">
        <h3>Client & Device Information</h3>
        <div class="info-grid">
          <div class="info-item"><label>Client Name</label><span>${job.clientName}</span></div>
          <div class="info-item"><label>Device Info</label><span>${job.deviceInfo}</span></div>
          <div class="info-item"><label>Priority</label><span>${job.priority.toUpperCase()}</span></div>
          <div class="info-item"><label>Technician</label><span>${job.technicianName || 'Unassigned'}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>Reported Issue</h3>
        <p>${job.problemDescription}</p>
      </div>

      <div class="section">
        <h3>Services & Parts</h3>
        <table>
          <thead><tr><th>Description</th><th>Type</th><th style="text-align:right">Price</th></tr></thead>
          <tbody>
            ${job.services.map(s => `<tr><td>${s.name}</td><td>Service</td><td style="text-align:right">${s.price.toFixed(2)}</td></tr>`).join('')}
            ${job.usedParts.map(p => `<tr><td>${p.name} (x${p.quantity})</td><td>Part</td><td style="text-align:right">${(p.price * p.quantity).toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Resolution Notes</h3>
        <p>${job.resolutionNotes || 'No resolution notes yet.'}</p>
      </div>

      <div class="footer">
        <p>Signature (Client) __________________________</p>
        <p>Signature (Technician) __________________________</p>
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

export const printInventoryAudit = (session: InventorySession, settings: AppSettings) => {
  const isRTL = settings.language === 'ar';
  const totalVariance = session.items.reduce((acc, item) => acc + item.variance, 0);
  const varianceValue = session.items.reduce((acc, item) => acc + (item.variance * item.cost), 0);

  const html = `
    <!DOCTYPE html>
    <html lang="${settings.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <title>Inventory Audit ${session.reference}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; direction: ${isRTL ? 'rtl' : 'ltr'}; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 10px; }
        .company-info h1 { margin: 0 0 5px; font-size: 20px; color: #2c3e50; }
        .doc-title h2 { margin: 0; font-size: 24px; color: #2c3e50; text-transform: uppercase; }
        .info-table { width: 100%; margin-bottom: 30px; }
        .info-table td { padding: 5px 0; }
        .label { font-weight: bold; color: #666; width: 120px; display: inline-block; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.items th { text-align: left; padding: 10px; background: #f3f4f6; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; }
        table.items td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .positive { color: green; }
        .negative { color: red; }
        .summary { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; display: flex; justify-content: flex-end; }
        .summary-box { background: #f9fafb; padding: 15px; border-radius: 8px; width: 250px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
           ${settings.companyLogo ? `<img src="${settings.companyLogo}" class="logo" />` : ''}
           <h1>${settings.companyName}</h1>
        </div>
        <div class="doc-title">
          <h2>Inventory Audit</h2>
          <p>#${session.reference}</p>
        </div>
      </div>

      <div class="info-table">
         <div><span class="label">Date:</span> ${session.date}</div>
         <div><span class="label">Warehouse:</span> ${session.warehouseName}</div>
         <div><span class="label">Category:</span> ${session.categoryFilter || 'All'}</div>
         <div><span class="label">Status:</span> ${session.status.toUpperCase()}</div>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th class="text-right">System Qty</th>
            <th class="text-center">Counted</th>
            <th class="text-right">Variance</th>
          </tr>
        </thead>
        <tbody>
          ${session.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.sku}</td>
              <td class="text-right">${item.systemQty}</td>
              <td class="text-center"><strong>${item.physicalQty}</strong></td>
              <td class="text-right ${item.variance !== 0 ? (item.variance > 0 ? 'positive' : 'negative') : ''}">
                ${item.variance > 0 ? '+' : ''}${item.variance}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-box">
           <div class="summary-row">
             <span>Total Items:</span>
             <strong>${session.items.length}</strong>
           </div>
           <div class="summary-row">
             <span>Net Quantity Variance:</span>
             <strong class="${totalVariance !== 0 ? (totalVariance > 0 ? 'positive' : 'negative') : ''}">${totalVariance > 0 ? '+' : ''}${totalVariance}</strong>
           </div>
           <div class="summary-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
             <span>Value Impact:</span>
             <strong>${varianceValue.toFixed(2)} ${settings.currency}</strong>
           </div>
        </div>
      </div>

      <div class="footer">
        <p>Authorized Signature: __________________________</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
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

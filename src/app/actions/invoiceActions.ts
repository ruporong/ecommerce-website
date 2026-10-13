"use server";

import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

export async function getInvoiceHtml(orderId: string) {
  try {
    await connectToDatabase();
    
    const order = await Order.findById(orderId).lean();
    if (!order) return { success: false, error: 'Order not found' };

    const settings = await Setting.find({
      key: { $in: ['store_name', 'store_phone', 'store_email', 'store_address', 'logo_url'] }
    }).lean();

    const storeInfo = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as any);

    const storeName = storeInfo.store_name || 'My E-commerce Store';
    const storeAddress = storeInfo.store_address || 'Dhaka, Bangladesh';
    const storePhone = storeInfo.store_phone || '+880 1700 000000';
    const storeEmail = storeInfo.store_email || 'support@store.com';
    const logoUrl = storeInfo.logo_url;

    // Build modern invoice HTML
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.order_id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; padding: 0; 
          color: #1f2937; 
          font-size: 14px;
          line-height: 1.5;
        }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
        .brand-section { display: flex; flex-direction: column; }
        .logo { max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 10px; }
        .store-name { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 5px 0; letter-spacing: -0.5px; }
        .store-details { color: #6b7280; font-size: 13px; line-height: 1.6; }
        
        .invoice-title-section { text-align: right; }
        .invoice-title { font-size: 36px; font-weight: 800; color: #111827; margin: 0 0 5px 0; letter-spacing: -1px; text-transform: uppercase; }
        .invoice-id { font-size: 16px; color: #6b7280; font-weight: 500; margin: 0; }
        
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .info-col { width: 48%; }
        .info-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .customer-name { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 5px 0; }
        .customer-details { color: #4b5563; font-size: 13px; line-height: 1.6; margin: 0; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .meta-key { color: #6b7280; }
        .meta-val { font-weight: 600; color: #111827; }
        
        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        td { padding: 16px; border-bottom: 1px solid #f3f4f6; color: #111827; }
        td.text-center { text-align: center; }
        td.text-right { text-align: right; font-weight: 600; }
        
        .product-name { font-weight: 600; margin: 0 0 4px 0; }
        .product-meta { font-size: 12px; color: #6b7280; margin: 0; }
        
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
        .totals-box { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
        .total-row.border-b { border-bottom: 1px solid #f3f4f6; }
        .total-label { color: #6b7280; }
        .total-val { font-weight: 600; color: #111827; }
        .total-row.grand-total { padding: 16px 0; border-top: 2px solid #111827; font-size: 18px; margin-top: 5px; }
        .total-row.grand-total .total-label { color: #111827; font-weight: 800; }
        .total-row.grand-total .total-val { font-weight: 800; }
        
        .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; }
        .footer p { margin: 0 0 4px 0; }
        .footer-bold { font-weight: 600; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <div class="header">
          <div class="brand-section">
            ${logoUrl ? `<img src="${logoUrl}" alt="${storeName}" class="logo" />` : `<h1 class="store-name">${storeName}</h1>`}
            <div class="store-details">
              ${storeAddress}<br>
              Phone: ${storePhone}<br>
              Email: ${storeEmail}
            </div>
          </div>
          <div class="invoice-title-section">
            <h1 class="invoice-title">Invoice</h1>
            <p class="invoice-id">#${order.order_id}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <div class="info-label">Billed To</div>
            <h3 class="customer-name">${order.customer_name}</h3>
            <p class="customer-details">
              ${order.customer_address}<br><br>
              <strong>Phone:</strong> ${order.customer_phone}
            </p>
          </div>
          <div class="info-col">
            <div class="info-label">Invoice Details</div>
            <div class="meta-row"><span class="meta-key">Date:</span> <span class="meta-val">${new Date(order.createdAt).toLocaleDateString('en-GB')}</span></div>
            <div class="meta-row"><span class="meta-key">Payment Method:</span> <span class="meta-val" style="text-transform: uppercase;">${order.payment_method}</span></div>
            <div class="meta-row"><span class="meta-key">Delivery:</span> <span class="meta-val" style="text-transform: capitalize;">${order.courier_provider || 'Standard'}</span></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p class="product-name">${order.product_name}</p>
                ${order.product_details ? `<p class="product-meta">${order.product_details}</p>` : ''}
              </td>
              <td class="text-center">1</td>
              <td class="text-right">৳${order.total_price.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-box">
            <div class="total-row border-b">
              <span class="total-label">Subtotal</span>
              <span class="total-val">৳${order.total_price.toLocaleString()}</span>
            </div>
            <div class="total-row border-b">
              <span class="total-label">Shipping</span>
              <span class="total-val">৳0</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total</span>
              <span class="total-val">৳${order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p class="footer-bold">Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact us.</p>
        </div>

      </div>
    </body>
    </html>
    `;

    return { success: true, html };
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return { success: false, error: 'Failed to generate invoice' };
  }
}

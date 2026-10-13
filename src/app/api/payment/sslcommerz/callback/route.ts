import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') || hostUrl.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostUrl}`;

    
    if (!orderId) {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=missing_order_id`);
    }

    await connectToDatabase();
    
    // SECURITY: Fetch order and check idempotency
    const order = await Order.findOne({ order_id: orderId });
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=invalid_order`);
    }
    if (order.payment_status === 'Paid') {
      return NextResponse.redirect(`${baseUrl}/checkout?status=success&orderId=${orderId}`);
    }

    
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
        data[key] = value.toString();
    });

    if (status === 'success' && data.status === 'VALID') {
        let store_id = '';
        let store_passwd = '';
        let is_live = false;
        
        try {
          const settings = await Setting.find({ key: { $in: ['sslcommerz_store_id', 'sslcommerz_store_password', 'sslcommerz_sandbox_mode'] } });
          settings.forEach(s => {
            if (s.key === 'sslcommerz_store_id') store_id = s.value;
            if (s.key === 'sslcommerz_store_password') store_passwd = s.value;
            if (s.key === 'sslcommerz_sandbox_mode') is_live = s.value !== 'true';
          });
        } catch (e) {
          console.log('Failed to fetch SSLCommerz settings');
        }

        if (!store_id) store_id = "testbox";
        if (!store_passwd) store_passwd = "qwerty";

        // Validate IPN Order
        const val_id = data.val_id;
        if (val_id) {
          const validateEndpoint = is_live 
            ? `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`
            : `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;
          
          const validateResponse = await fetch(validateEndpoint);
          const validationResult = await validateResponse.json();

          if (validationResult.status === 'VALID' || validationResult.status === 'VALIDATED') {
             // SECURITY: Amount verification
             if ((isNaN(parseFloat(validationResult.amount)) || parseFloat(validationResult.amount) <= 0 || Math.abs(parseFloat(validationResult.amount) - order.total_price) > 0.01)) {
                 await Order.findOneAndUpdate({ order_id: orderId }, { payment_status: 'Failed', note: 'Fraud attempt: Amount mismatch' });
                 return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=amount_mismatch`);
             }

             await Order.findOneAndUpdate(
                { order_id: orderId },
                { payment_status: 'Paid', status: 'processing', payment_details: { gateway: 'SSLCommerz', ...data, validationResult } }
             );
             return NextResponse.redirect(`${baseUrl}/checkout?status=success&orderId=${orderId}`);
          }
        }
        
        return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=validation_failed`);
    }

    if (status === 'cancel') {
        return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=payment_cancelled`);
    }

    return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=payment_failed`);

  } catch (error) {
    console.error('SSLCommerz callback error:', error);
    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') || hostUrl.includes('127.0.0.1') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${hostUrl}/checkout?status=fail&reason=server_error`);
  }
}

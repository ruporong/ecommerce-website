import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    
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

    // Default Sandbox Credentials if empty
    if (!store_id) store_id = "testbox";
    if (!store_passwd) store_passwd = "qwerty";

    const order = await Order.findOne({ order_id: orderId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostUrl}`;

    const data = new URLSearchParams({
        store_id: store_id,
        store_passwd: store_passwd,
        total_amount: order.total_price.toString(),
        currency: 'BDT',
        tran_id: orderId,
        success_url: `${baseUrl}/api/payment/sslcommerz/callback?status=success&orderId=${orderId}`,
        fail_url: `${baseUrl}/api/payment/sslcommerz/callback?status=fail&orderId=${orderId}`,
        cancel_url: `${baseUrl}/api/payment/sslcommerz/callback?status=cancel&orderId=${orderId}`,
        ipn_url: `${baseUrl}/api/payment/sslcommerz/callback?status=ipn&orderId=${orderId}`,
        shipping_method: 'Courier',
        product_name: 'E-commerce Items',
        product_category: 'Retail',
        product_profile: 'general',
        cus_name: order.customer_name || 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: order.customer_address || 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: order.customer_phone || '01711111111',
        cus_fax: '01711111111',
        ship_name: order.customer_name || 'Customer Name',
        ship_add1: order.customer_address || 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
    });
    
    const endpoint = is_live 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' 
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data.toString()
    });

    const result = await response.json();

    if (result.status === 'SUCCESS' && result.GatewayPageURL) {
      return NextResponse.redirect(result.GatewayPageURL);
    } else {
      console.error("SSLCommerz Init Error:", result);
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=gateway_init_failed`);
    }

  } catch (error) {
    console.error('SSLCommerz create error:', error);
    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${hostUrl}/checkout?status=fail&reason=server_error`);
  }
}

import { NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Order from '@/models/Order';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.redirect(new URL('/checkout?status=fail&reason=missing_order_id', request.url));
    }

    await connectToDatabase();
    
    const order = await Order.findOne({ order_id: orderId });
    if (!order) {
      return NextResponse.redirect(new URL('/checkout?status=fail&reason=invalid_order', request.url));
    }

    const settings = await Setting.find({ key: { $in: ['bkash_app_key', 'bkash_app_secret', 'bkash_username', 'bkash_password', 'bkash_sandbox_mode'] } }).lean();
    
    const getVal = (k: string) => settings.find((s: any) => s.key === k)?.value;
    
    const appKey = getVal('bkash_app_key');
    const appSecret = getVal('bkash_app_secret');
    const username = getVal('bkash_username');
    const password = getVal('bkash_password');
    const isSandbox = getVal('bkash_sandbox_mode') === 'true';

    if (!appKey || !appSecret || !username || !password) {
      return NextResponse.redirect(new URL('/checkout?status=fail&reason=bkash_not_configured', request.url));
    }

    const baseUrl = isSandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized' : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized';
    
    // 1. Grant Token
    const tokenRes = await fetchWithTimeout(`${baseUrl}/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': username,
        'password': password
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret
      })
    });
    
    const tokenText = await tokenRes.text();
    console.log("bKash Token RAW Response:", tokenText);
    const tokenData = JSON.parse(tokenText.replace(/[\u0000-\u001F]+/g, ' '));
    
    if (!tokenData.id_token) {
      console.error("bKash Token Error:", tokenData);
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=bkash_token_error&orderId=${orderId}`, request.url));
    }
    
    const idToken = tokenData.id_token;

    // 2. Create Payment
    // Make sure we pass the absolute callback URL
    let callbackUrl = new URL('/api/payment/bkash/callback', request.url).toString();
    // bKash WAF rejects 0.0.0.0 in the callbackURL payload
    if (callbackUrl.includes('0.0.0.0')) {
      callbackUrl = callbackUrl.replace('0.0.0.0', 'localhost');
    }
    
    const createRes = await fetchWithTimeout(`${baseUrl}/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': idToken,
        'X-APP-Key': appKey
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: order.customer_phone || '01000000000',
        callbackURL: callbackUrl,
        amount: order.total_price.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: order.order_id
      })
    });
    
    const createText = await createRes.text();
    console.log("bKash Create RAW Response:", createText);
    const createData = JSON.parse(createText.replace(/[\u0000-\u001F]+/g, ' '));
    
    if (createData.statusCode !== '0000' || !createData.bkashURL) {
      console.error("bKash Create Payment Error:", createData);
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=bkash_create_error&orderId=${orderId}`, request.url));
    }
    
    // Save paymentID to order temporarily
    await Order.updateOne({ order_id: orderId }, { transaction_id: createData.paymentID });
    
    // Redirect user to bkashURL
    return NextResponse.redirect(createData.bkashURL);

  } catch (error) {
    console.error("bKash create exception:", error);
    return NextResponse.redirect(new URL('/checkout?status=fail&reason=server_error', request.url));
  }
}

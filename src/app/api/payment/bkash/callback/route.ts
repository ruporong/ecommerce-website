import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Order from '@/models/Order';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');
    
    if (!paymentID) {
      return NextResponse.redirect(new URL('/checkout?status=fail&reason=missing_payment_id', request.url));
    }
    
    await connectToDatabase();
    
    // Find the order matching this paymentID
    const order = await Order.findOne({ transaction_id: paymentID });
    
    
    if (!order) {
      return NextResponse.redirect(new URL('/checkout?status=fail&reason=invalid_payment_id', request.url));
    }
    if (order.payment_status === 'Paid') {
      return NextResponse.redirect(new URL(`/checkout?status=success&orderId=${order.order_id}`, request.url));
    }
    
    if (status === 'cancel' || status === 'failure') {
      await Order.updateOne({ _id: order._id }, { payment_status: 'Failed' });
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=user_cancelled&orderId=${order.order_id}`, request.url));
    }
    
    if (status !== 'success') {
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=unknown_status&orderId=${order.order_id}`, request.url));
    }

    // Execute Payment
    const settings = await Setting.find({ key: { $in: ['bkash_app_key', 'bkash_app_secret', 'bkash_username', 'bkash_password', 'bkash_sandbox_mode'] } }).lean();
    const getVal = (k: string) => settings.find((s: any) => s.key === k)?.value;
    
    const appKey = getVal('bkash_app_key');
    const appSecret = getVal('bkash_app_secret');
    const username = getVal('bkash_username');
    const password = getVal('bkash_password');
    const isSandbox = getVal('bkash_sandbox_mode') === 'true';
    
    const baseUrl = isSandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized' : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized';
    
    // 1. Grant Token again
    const tokenRes = await fetch(`${baseUrl}/checkout/token/grant`, {
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
    const tokenData = JSON.parse(tokenText.replace(/[\u0000-\u001F]+/g, ' '));
    const idToken = tokenData.id_token;

    // 2. Execute Payment
    const executeRes = await fetch(`${baseUrl}/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': idToken,
        'X-APP-Key': appKey
      },
      body: JSON.stringify({
        paymentID: paymentID
      })
    });
    
    const executeText = await executeRes.text();
    const executeData = JSON.parse(executeText.replace(/[\u0000-\u001F]+/g, ' '));
    
    // SECURITY: Amount verification
    if ((isNaN(parseFloat(executeData.amount)) || parseFloat(executeData.amount) <= 0 || Math.abs(parseFloat(executeData.amount) - order.total_price) > 0.01)) {
      await Order.updateOne({ _id: order._id }, { payment_status: 'Failed', note: 'Fraud attempt: Amount mismatch' });
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=amount_mismatch&orderId=${order.order_id}`, request.url));
    }

    if (executeData.statusCode && executeData.statusCode !== '0000') {
      await Order.updateOne({ _id: order._id }, { payment_status: 'Failed' });
      return NextResponse.redirect(new URL(`/checkout?status=fail&reason=execute_error&message=${executeData.statusMessage}&orderId=${order.order_id}`, request.url));
    }
    
    // Payment Successful!
    await Order.updateOne({ _id: order._id }, { 
      payment_status: 'Paid',
      transaction_id: executeData.trxID || paymentID 
    });
    
    return NextResponse.redirect(new URL(`/checkout?status=success&orderId=${order.order_id}`, request.url));

  } catch (error) {
    console.error("bKash callback exception:", error);
    return NextResponse.redirect(new URL('/checkout?status=fail&reason=server_error', request.url));
  }
}

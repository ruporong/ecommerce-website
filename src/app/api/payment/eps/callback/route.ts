import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import crypto from 'crypto';
import Setting from '@/models/Setting';

function generateHash(key: string, data: string) {
  const hmac = crypto.createHmac('sha512', Buffer.from(key, 'utf8'));
  hmac.update(Buffer.from(data, 'utf8'));
  return hmac.digest('base64');
}

export async function GET(request: Request) {
  return handleCallback(request);
}

export async function POST(request: Request) {
  return handleCallback(request);
}

async function handleCallback(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const merchantTransactionId = searchParams.get('trxId');

    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') || hostUrl.includes('127.0.0.1') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostUrl}`;

    if (!orderId || !merchantTransactionId) {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=invalid_callback`);
    }

    if (status !== 'success') {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=${status}`);
    }

    
    await connectToDatabase();
    
    // SECURITY: Idempotency check and Order lookup
    const order = await Order.findOne({ order_id: orderId });
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=invalid_order`);
    }
    if (order.payment_status === 'Paid') {
      return NextResponse.redirect(`${baseUrl}/checkout?status=success&orderId=${orderId}`);
    }

    let username = '';

    let password = '';
    let hashKey = '';
    let isSandbox = true;
    
    try {
      const settings = await Setting.find({ key: { $in: ['eps_username', 'eps_password', 'eps_hash_key', 'eps_sandbox_mode'] } });
      settings.forEach(s => {
        if (s.key === 'eps_username') username = s.value;
        if (s.key === 'eps_password') password = s.value;
        if (s.key === 'eps_hash_key') hashKey = s.value;
        if (s.key === 'eps_sandbox_mode') isSandbox = s.value === 'true';
      });
    } catch (e) {}
    
    if (!username) username = "xyz.eps@gmail.com";
    if (!password) password = "Emon258@";
    if (!hashKey) hashKey = "SFNLQHJlY2lwZXdhbGEjYTc3Zi1mOTQ5NWZhY2M2ZTZuZXQ=";

    // 1. Get Token
    const tokenHash = generateHash(hashKey, username);
    const tokenRes = await fetch(`${isSandbox ? 'https://sandboxpgapi.eps.com.bd/v1' : 'https://pgapi.eps.com.bd/v1'}/Auth/GetToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': tokenHash
      },
      body: JSON.stringify({ userName: username, password: password })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=validation_auth_failed`);
    }

    // 2. Verify Transaction
    const verifyHash = generateHash(hashKey, merchantTransactionId);
    const verifyRes = await fetch(`${isSandbox ? 'https://sandboxpgapi.eps.com.bd/v1' : 'https://pgapi.eps.com.bd/v1'}/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-hash': verifyHash
      }
    });

    const verifyData = await verifyRes.json();

    if (verifyData && verifyData.Status === 'Success') {
      // SECURITY: Amount verification
      if ((isNaN(parseFloat(verifyData.TotalAmount)) || parseFloat(verifyData.TotalAmount) <= 0 || Math.abs(parseFloat(verifyData.TotalAmount) - order.total_price) > 0.01)) {
        await Order.updateOne({ order_id: orderId }, { payment_status: 'Failed', note: 'Fraud attempt: Amount mismatch' });
        return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=amount_mismatch`);
      }

      // Payment Successful
      await Order.updateOne(
        { order_id: orderId },
        { 
          $set: { 
            payment_status: 'Paid',
            status: 'processing',
            transaction_id: verifyData.TransactionId || merchantTransactionId,
            payment_method: `EPS (${verifyData.FinancialEntity || 'Card/Mobile'})`
          } 
        }
      );
      return NextResponse.redirect(`${baseUrl}/checkout?status=success&orderId=${orderId}`);
    } else {
      // Payment Failed
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=payment_not_verified`);
    }

  } catch (error) {
    console.error('EPS callback error:', error);
    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') || hostUrl.includes('127.0.0.1') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${hostUrl}/checkout?status=fail&reason=server_error`);
  }
}

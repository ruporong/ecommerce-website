import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

function generateHash(key: string, data: string) {
  const hmac = crypto.createHmac('sha512', Buffer.from(key, 'utf8'));
  hmac.update(Buffer.from(data, 'utf8'));
  return hmac.digest('base64');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    let username = '';
    let password = '';
    let hashKey = '';
    let storeId = '';
    let merchantId = '';
    let isSandbox = true;
    
    
    try {
      const settings = await Setting.find({ key: { $in: ['eps_username', 'eps_password', 'eps_hash_key', 'eps_store_id', 'eps_sandbox_mode', 'eps_merchant_id'] } });
      settings.forEach(s => {
        if (s.key === 'eps_username') username = s.value;
        if (s.key === 'eps_password') password = s.value;
        if (s.key === 'eps_hash_key') hashKey = s.value;
        if (s.key === 'eps_sandbox_mode') isSandbox = s.value === 'true';
        if (s.key === 'eps_store_id') storeId = s.value;
        if (s.key === 'eps_merchant_id') merchantId = s.value;
      });
      console.log("DB Loaded EPS Settings:", settings);
    } catch (e) {
      console.log('Failed to fetch EPS settings');
    }

    
    // Fallbacks to Sandbox demo credentials if DB is empty
    if (!username) username = "Epsdemo@gmail.com";
    if (!password) password = "Epsdemo258@";
    if (!hashKey) hashKey = "FHZxyzeps56789gfhg678ygu876o=";
    if (!storeId) storeId = "d44c705f-9c3a-41de-98b1-1674631637da";
    if (!merchantId) merchantId = "29c86c70-0ac6-45cb-ba04-9fcb0aaed12a";

    

    if (merchantId) merchantId = merchantId.replace(/O/g, '0');
    if (storeId) storeId = storeId.replace(/O/g, '0');
    
    // Overriding DB for Sandbox

    

    const order = await Order.findOne({ order_id: orderId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostUrl}`;
    
    const epsBaseUrl = isSandbox ? 'https://sandboxpgapi.eps.com.bd/v1' : 'https://pgapi.eps.com.bd/v1';

    // 1. Get Token
    
    console.log("=== EPS INIT DEBUG ===");
    console.log("isSandbox:", isSandbox);
    console.log("epsBaseUrl:", epsBaseUrl);
    console.log("username:", username);
    console.log("storeId:", storeId);
    console.log("=======================");

    const tokenHash = generateHash(hashKey, username);

    
    const tokenRes = await fetch(`${epsBaseUrl}/Auth/GetToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': tokenHash
      },
      body: JSON.stringify({ userName: username, password: password })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenData.token) {
      console.error("EPS Token Error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=gateway_error`);
    }
    
    const token = tokenData.token;
    
    // 2. Initialize EPS
    const merchantTransactionId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const initHash = generateHash(hashKey, merchantTransactionId);
    
    const initPayload = {
      storeId: storeId,
      merchantId: merchantId,
      CustomerOrderId: orderId.replace(/\D/g, "") || Date.now().toString(),
      merchantTransactionId: merchantTransactionId,
      transactionTypeId: 10,
      financialEntityId: 0,
      transitionStatusId: 0,
      totalAmount: order.total_price,
      ipAddress: "127.0.0.1",
      version: "1",
      successUrl: `${baseUrl}/api/payment/eps/callback?status=success&orderId=${orderId}&trxId=${merchantTransactionId}`,
      failUrl: `${baseUrl}/api/payment/eps/callback?status=fail&orderId=${orderId}&trxId=${merchantTransactionId}`,
      cancelUrl: `${baseUrl}/api/payment/eps/callback?status=cancel&orderId=${orderId}&trxId=${merchantTransactionId}`,
      customerName: order.customer_name || "Customer",
      customerEmail: "customer@example.com",
      CustomerAddress: order.customer_address || "Dhaka",
      CustomerAddress2: "",
      CustomerCity: "Dhaka",
      CustomerState: "Dhaka",
      CustomerPostcode: "1200",
      CustomerCountry: "BD",
      CustomerPhone: order.customer_phone || "01700000000",
      ShipmentName: order.customer_name || "Customer",
      ShipmentAddress: order.customer_address || "Dhaka",
      ShipmentAddress2: "",
      ShipmentCity: "Dhaka",
      ShipmentState: "Dhaka",
      ShipmentPostcode: "1200",
      ShipmentCountry: "BD",
      ValueA: orderId,
      ValueB: "",
      ValueC: "",
      ValueD: "",
      ShippingMethod: "NO",
      NoOfItem: "1",
      ProductName: "E-commerce Order",
      ProductProfile: "general",
      ProductCategory: "Retail",
      ProductList: [
        {
          ProductName: "Order Items",
          NoOfItem: "1",
          ProductProfile: "general",
          ProductCategory: "Retail",
          ProductPrice: order.total_price.toString()
        }
      ]
    };

    const initRes = await fetch(`${epsBaseUrl}/EPSEngine/InitializeEPS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-hash': initHash
      },
      body: JSON.stringify(initPayload)
    });

    const initData = await initRes.json();
    if (initData && initData.RedirectURL) {
      return NextResponse.redirect(initData.RedirectURL);
    } else {
      console.error("EPS Init Error:", initData);
      return NextResponse.redirect(`${baseUrl}/checkout?status=fail&reason=gateway_init_failed`);
    }

  } catch (error) {
    console.error('EPS create error:', error);
    const hostUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = hostUrl.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${hostUrl}/checkout?status=fail&reason=server_error`);
  }
}

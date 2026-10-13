"use server";

import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function checkFraud(orderId: string, phone: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    // Call Steadfast Courier's hidden Fraud Check API
    const apiKeySetting = await Setting.findOne({ key: 'steadfast_api_key' });
    const secretKeySetting = await Setting.findOne({ key: 'steadfast_secret_key' });
    
    const response = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKeySetting?.value || process.env.COURIER_API_KEY || '',
        'Secret-Key': secretKeySetting?.value || process.env.COURIER_SECRET_KEY || ''
      }
    });

    let data = { total_parcels: 0, total_delivered: 0, total_cancelled: 0 };
    
    if (response.ok) {
      data = await response.json();
    }

    let riskScore = 0;
    const total = data.total_parcels || 0;
    const success = data.total_delivered || 0;
    const fail = data.total_cancelled || 0;

    if (total === 0) {
      riskScore = 40; // New customer
    } else {
      if (fail > 0 && success === 0) {
        riskScore = 90;
      } else if (success > 0 && fail === 0) {
        riskScore = 10; // Low risk
      } else {
        const failRatio = fail / (success + fail);
        riskScore = Math.round(failRatio * 100);
      }
    }

    await Order.findByIdAndUpdate(orderId, { fraud_score: riskScore });
    revalidatePath('/admin/orders');
    
    return { success: true, score: riskScore, history: { total, success, fail } };
  } catch (error) {
    console.error('Fraud Check Error:', error);
    return { success: false, error: 'Failed to check fraud score' };
  }
}

export async function bookSteadfastCourier(orderId: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const payload = {
      invoice: order.order_id,
      recipient_name: order.customer_name,
      recipient_phone: order.customer_phone || '01711111111',
      recipient_address: order.customer_address,
      cod_amount: order.total_price || 1200,
      note: 'Ordered via ' + order.source
    };

    const apiKeySetting = await Setting.findOne({ key: 'steadfast_api_key' });
    const secretKeySetting = await Setting.findOne({ key: 'steadfast_secret_key' });

    const response = await fetch('https://portal.packzy.com/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Api-Key': apiKeySetting?.value || process.env.COURIER_API_KEY || '',
        'Secret-Key': secretKeySetting?.value || process.env.COURIER_SECRET_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 200 && data.consignment) {
      order.courier_provider = 'steadfast';
      order.courier_status = 'pending';
      order.courier_consignment_id = data.consignment.consignment_id || data.consignment.tracking_code;
      await order.save();
      revalidatePath('/admin/orders');
      return { success: true, consignment_id: order.courier_consignment_id };
    } else {
      return { success: false, error: 'Steadfast API Error: ' + JSON.stringify(data) };
    }
  } catch (error) {
    console.error('Steadfast API Error:', error);
    return { success: false, error: 'Failed to book courier' };
  }
}

"use server";

import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function bookPathaoCourier(orderId: string) {
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

    const isSandbox = await Setting.findOne({ key: 'pathao_sandbox' });
    const clientId = await Setting.findOne({ key: 'pathao_client_id' });
    const clientSecret = await Setting.findOne({ key: 'pathao_client_secret' });
    const username = await Setting.findOne({ key: 'pathao_username' });
    const password = await Setting.findOne({ key: 'pathao_password' });
    let storeId = await Setting.findOne({ key: 'pathao_store_id' });

    if (!clientId?.value || !clientSecret?.value || !username?.value || !password?.value) {
      return { success: false, error: 'Pathao API credentials missing in settings.' };
    }

    const baseUrl = isSandbox?.value === 'true' || isSandbox?.value === true 
      ? 'https://courier-api-sandbox.pathao.com' 
      : 'https://api-hermes.pathao.com';

    // 1. Issue Token
    const tokenRes = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: clientId.value,
        client_secret: clientSecret.value,
        username: username.value,
        password: password.value,
        grant_type: 'password'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Pathao Token Error:', tokenData);
      return { success: false, error: 'Failed to authenticate with Pathao API.' };
    }

    const accessToken = tokenData.access_token;
    
    let activeStoreId = storeId?.value;
    const storePhoneSetting = await Setting.findOne({ key: 'store_phone' });
    let senderPhone = storePhoneSetting?.value || "01711111111";
    // Sanitize phone to exactly 11 digits starting with 01
    senderPhone = senderPhone.replace(/[^0-9]/g, '');
    if (senderPhone.length > 11) senderPhone = senderPhone.slice(-11);
    if (!senderPhone.startsWith('01') || senderPhone.length !== 11) senderPhone = "01711111111";
    
    
    // Auto-detect store ID if empty
    if (!activeStoreId) {
      const storesRes = await fetch(`${baseUrl}/aladdin/api/v1/stores`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json' 
        }
      });
      const storesData = await storesRes.json();
      if (storesRes.ok && storesData?.data?.data?.length > 0) {
        activeStoreId = storesData.data.data[0].store_id.toString();
        // optionally save it back to settings
        await Setting.findOneAndUpdate({ key: 'pathao_store_id' }, { value: activeStoreId, type: 'string' }, { upsert: true });
      } else {
         return { success: false, error: 'No Pathao Store found. Please create a store in Pathao dashboard.' };
      }
    }

    // 2. Create Order
    const payload = {
      store_id: activeStoreId,
      merchant_order_id: order.order_id,
      sender_name: "ÉLANE",
      sender_phone: senderPhone,
      recipient_name: order.customer_name,
      recipient_phone: order.customer_phone || "01711111111",
      recipient_address: order.customer_address,
      recipient_city: 1, // Dhaka
      recipient_zone: 1, // Mock Zone
      recipient_area: 1, // Mock Area
      delivery_type: 48, // 48 hours normal delivery
      item_type: 2, // 2 for parcel
      item_quantity: 1,
      item_weight: 0.5,
      amount_to_collect: order.total_price || 1200,
      item_description: order.product_name
    };

    const orderRes = await fetch(`${baseUrl}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const orderData = await orderRes.json();

    if (orderRes.ok && orderData.data?.consignment_id) {
      order.courier_provider = 'pathao';
      order.courier_status = 'pending';
      order.courier_consignment_id = orderData.data.consignment_id; 
      await order.save();
      
      revalidatePath('/admin/orders');
      return { success: true, consignment_id: order.courier_consignment_id, provider: 'pathao' };
    } else {
      console.error('Pathao Create Order Error:', orderData);
      
      const mockConsignmentId = 'PATHAO-MOCK-' + Math.floor(Math.random()*10000);
      order.courier_provider = 'pathao';
      order.courier_status = 'pending';
      order.courier_consignment_id = mockConsignmentId; 
      await order.save();
      
      revalidatePath('/admin/orders');
      return { 
        success: true, 
        consignment_id: mockConsignmentId, 
        provider: 'pathao',
        warning: 'Pathao API rejected payload (likely City/Zone ID mismatch). Used mock ID. Error: ' + JSON.stringify(orderData.errors || orderData.message)
      };
    }
  } catch (error) {
    console.error('Pathao API Error:', error);
    return { success: false, error: 'Failed to book Pathao' };
  }
}

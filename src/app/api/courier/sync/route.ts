import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Find orders that are pending/shipped with a courier_consignment_id
    const orders = await Order.find({
      courier_consignment_id: { $ne: null, $regex: /^(?!.*MOCK).*$/ },
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    let updatedCount = 0;

    for (const order of orders) {
      if (order.courier_provider === 'steadfast') {
        const apiKey = await Setting.findOne({ key: 'steadfast_api_key' });
        const secretKey = await Setting.findOne({ key: 'steadfast_secret_key' });
        
        if (apiKey?.value && secretKey?.value) {
          const res = await fetch(`https://portal.packzy.com/api/v1/status_by_cid/${order.courier_consignment_id}`, {
            headers: { 'Api-Key': apiKey.value, 'Secret-Key': secretKey.value }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.delivery_status) {
              order.courier_status = data.delivery_status;
              if (data.delivery_status === 'delivered') order.status = 'Delivered';
              if (data.delivery_status === 'cancelled') order.status = 'Cancelled';
              await order.save();
              updatedCount++;
            }
          }
        }
      } else if (order.courier_provider === 'pathao') {
        // Pathao API status check requires token
        const isSandbox = await Setting.findOne({ key: 'pathao_sandbox' });
        let baseUrl = ""
baseUrl = isSandbox?.value === 'true' || isSandbox?.value === true 
          ? 'https://courier-api-sandbox.pathao.com' 
          : baseUrl + '';
        const clientId = await Setting.findOne({ key: 'pathao_client_id' });
        const clientSecret = await Setting.findOne({ key: 'pathao_client_secret' });
        const username = await Setting.findOne({ key: 'pathao_username' });
        const password = await Setting.findOne({ key: 'pathao_password' });
        
        if (clientId?.value && clientSecret?.value && username?.value && password?.value) {
          const tokenRes = await fetch(baseUrl + '/aladdin/api/v1/issue-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: clientId.value, client_secret: clientSecret.value, username: username.value, password: password.value, grant_type: 'password' })
          });
          const tokenData = await tokenRes.json();
          if (tokenRes.ok && tokenData.access_token) {
            const statusRes = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${order.courier_consignment_id}`, {
              headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
            });
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.data?.order_status) {
                const pathaoStatus = statusData.data.order_status.toLowerCase();
                order.courier_status = pathaoStatus;
                if (pathaoStatus === 'delivered') order.status = 'Delivered';
                if (pathaoStatus === 'return_success') order.status = 'Cancelled';
                await order.save();
                updatedCount++;
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error('Courier sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

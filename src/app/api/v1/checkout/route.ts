import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { customer_name, customer_phone, customer_address, payment_method, items } = body;
    
    if (!customer_name || !customer_phone || !customer_address || !items || !items.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let calculatedTotal = 0;
    const productNames = [];
    const orderId = 'API-' + Math.floor(Math.random() * 1000000);

    // Verify stock and price
    for (const item of items) {
      const dbProduct = await Product.findById(item.product_id).lean();
      if (!dbProduct) throw new Error(`Product not found: ${item.product_id}`);
      if (dbProduct.stock < item.quantity) throw new Error(`Insufficient stock for ${dbProduct.name}`);
      
      const price = dbProduct.discount_price || dbProduct.price;
      calculatedTotal += (price * item.quantity);
      productNames.push(`${item.quantity}x ${dbProduct.name}`);
      
      // Update stock
      await Product.updateOne({ _id: dbProduct._id }, { $inc: { stock: -item.quantity } });
      
      // Record stock history
      await StockHistory.create([{
        product_id: dbProduct._id,
        type: 'out',
        source: 'order',
        quantity: item.quantity,
        previous_stock: dbProduct.stock,
        new_stock: dbProduct.stock - item.quantity,
        order_id: orderId,
        created_by: 'system_api',
        reason: 'Mobile App Order Placed'
      }]);
    }

    const newOrder = await Order.create([{
      order_id: orderId,
      customer_name,
      customer_phone,
      customer_address,
      product_name: productNames.join(', '),
      total_price: calculatedTotal,
      payment_method: payment_method || 'COD',
      source: 'mobile_app',
      status: 'pending'
    }]);

    // Send push notification to admins silently
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.create({
        title: 'New API Order Received! 📱',
        message: `Mobile order ${orderId} for ${customer_name} placed. Total: ৳${calculatedTotal}`,
        type: 'order',
        link: '/admin/orders'
      });
    } catch(e) {}

    return NextResponse.json({ success: true, order_id: orderId, message: 'Order placed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

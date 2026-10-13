import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let id = searchParams.get('id');
  if (id) {
    id = id.trim().replace(/^#/, '');
    if (/^\d+$/.test(id)) {
      id = `ORD-${id}`;
    }
  }

  if (!id) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    
    // Find by exact order_id string
    const order = await Order.findOne({ order_id: id }).lean();
    
    if (!order) {
      // Sometimes users might just type the trailing hex of the _id, but we use ORD- format.
      // We will only support the official order_id for tracking to keep it simple and secure.
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        status: order.status,
        courier_status: order.courier_status,
        courier_consignment_id: order.courier_consignment_id,
        createdAt: order.createdAt,
        customer_name: order.customer_name,
        total_price: order.total_price
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StockRequest from '@/models/StockRequest';

export async function POST(req: Request) {
  try {
    const { productId, token } = await req.json();
    if (!token || !productId) return NextResponse.json({ success: false });

    await connectToDatabase();
    
    // Upsert to prevent duplicate requests from same user for same product
    await StockRequest.findOneAndUpdate(
      { product_id: productId, fcm_token: token },
      { created_at: new Date() },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to request notification' }, { status: 500 });
  }
}

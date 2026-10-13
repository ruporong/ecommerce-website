import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';

export async function POST(req: Request) {
  try {
    const { token, session_id, items } = await req.json();
    if (!session_id) return NextResponse.json({ success: false, reason: 'no_session' });

    await connectToDatabase();
    
    if (!items || items.length === 0) {
      await AbandonedCart.deleteOne({ session_id });
      return NextResponse.json({ success: true, action: 'cleared' });
    }

    await AbandonedCart.findOneAndUpdate(
      { session_id },
      { fcm_token: token || null, items, last_updated: new Date(), notified: false },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, action: 'synced' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}

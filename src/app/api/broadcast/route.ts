import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import Subscriber from '@/models/Subscriber';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(req: Request) {
  try {

    const session = await getServerSession(await getAuthOptions());
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, body } = await req.json();
    if (!title || !body) return NextResponse.json({ error: 'Title and body required' }, { status: 400 });

    await connectToDatabase();
    const app = await getFirebaseAdmin();
    if (!app) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const subscribers = await Subscriber.find({});
    if (subscribers.length === 0) return NextResponse.json({ success: true, count: 0 });

    const tokens = subscribers.map(sub => sub.token);
    
    // Batch in 500s
    let successCount = 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const res = await getMessaging(app).sendEachForMulticast({
        tokens: batch,
        notification: { title, body }
      });
      successCount += res.successCount;
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

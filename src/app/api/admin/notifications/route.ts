import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Get URL params for pagination if needed
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    const unreadCount = await Notification.countDocuments({ isRead: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, markAll } = await req.json();
    await connectToDatabase();

    if (markAll) {
      await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    } else if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      return NextResponse.json({ error: 'ID or markAll required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

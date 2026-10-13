import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Campaign from '@/models/Campaign';

export async function POST(req: Request) {
  try {
    const { utm_source, utm_medium, utm_campaign } = await req.json();
    if (!utm_source) return NextResponse.json({ success: false });

    await connectToDatabase();
    
    const query: any = { utm_source };
    if (utm_medium) query.utm_medium = utm_medium;
    if (utm_campaign) query.utm_campaign = utm_campaign;

    await Campaign.updateOne(query, { $inc: { clicks: 1 } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const data = await req.json();
    await connectToDatabase();
    const template = new EmailTemplate(data);
    await template.save();
    return NextResponse.json({ success: true, template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

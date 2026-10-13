import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const data = await req.json();
    await connectToDatabase();
  const { id } = await context.params;
    const template = await EmailTemplate.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ success: true, template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await connectToDatabase();
  const { id } = await context.params;
  await EmailTemplate.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

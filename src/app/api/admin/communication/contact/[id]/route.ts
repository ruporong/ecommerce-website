import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await connectToDatabase();
  const { id } = await context.params;
  await ContactMessage.findByIdAndUpdate(id, { status: 'read' });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await connectToDatabase();
  const { id } = await context.params;
  await ContactMessage.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

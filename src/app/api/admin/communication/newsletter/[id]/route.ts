import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await connectToDatabase();
  const { id } = await context.params;
  await Subscriber.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

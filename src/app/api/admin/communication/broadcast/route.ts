import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import User from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { target, specificEmail, subject, bodyHtml } = await req.json();
    await connectToDatabase();
    
    let toEmails: string[] = [];

    if (target === 'specific') {
      toEmails = [specificEmail];
    } else if (target === 'subscribers') {
      const subs = await Subscriber.find({}, 'email').lean();
      toEmails = subs.map(s => s.email);
    } else if (target === 'users') {
      const users = await User.find({}, 'email').lean();
      toEmails = users.map(u => u.email).filter(Boolean);
    }

    if (toEmails.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients found.' }, { status: 400 });
    }

    // Since many providers limit TO fields or we want privacy, BCC is better. 
    // But nodemailer sendMail can just take an array of bcc.
    // For simplicity, we send them individually or BCC. Let's send in batches of 50 via BCC to avoid spam filters catching a huge TO list.
    
    await sendEmail(toEmails, subject, bodyHtml);

    return NextResponse.json({ success: true, count: toEmails.length });
  } catch (err: any) {
    console.error('Broadcast Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

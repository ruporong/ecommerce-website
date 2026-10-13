import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitRes = await rateLimit(`register_${ip}`, 5, 5 * 60 * 1000, 'fail-closed'); // 5 requests per 5 minutes
    if (!rateLimitRes.success) {
      return NextResponse.json({ message: 'Too many registration attempts. Please try again later.' }, { 
        status: 429,
        headers: { 'Retry-After': Math.ceil((rateLimitRes.reset - Date.now()) / 1000).toString() }
      });
    }
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const count = await User.countDocuments();
    const role = count === 0 ? 'admin' : 'customer'; // Make the very first user the admin

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    return NextResponse.json({ success: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

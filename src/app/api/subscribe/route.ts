import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import Setting from '@/models/Setting';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(req: Request) {
  try {
    const { token, role } = await req.json();
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    await connectToDatabase();
    
    const existing = await Subscriber.findOne({ token });
    if (existing) {
      if (role && existing.role !== role) {
        existing.role = role;
        await existing.save();
      }
    } else {
      await Subscriber.create({ token, role: role || 'customer' });
      
      // Check if welcome notification is enabled
      const welcomeSetting = await Setting.findOne({ key: 'notify_welcome' });
      if (welcomeSetting && welcomeSetting.value === 'true') {
        const app = await getFirebaseAdmin();
        if (app) {
          const titleSetting = await Setting.findOne({ key: 'msg_welcome_title' });
          const bodySetting = await Setting.findOne({ key: 'msg_welcome_body' });
          const storeNameSetting = await Setting.findOne({ key: 'store_name' });
          const storeName = storeNameSetting?.value || 'Ruporong';
          
          await getMessaging(app).send({
            token,
            notification: {
              title: titleSetting?.value || `Welcome to ${storeName}! 🎉`,
              body: bodySetting?.value || 'Thank you for subscribing. Use code WELCOME10 for 10% off your first order!',
            },
          }).catch(console.error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

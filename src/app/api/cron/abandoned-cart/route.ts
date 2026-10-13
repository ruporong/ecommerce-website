import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import Setting from '@/models/Setting';

export async function GET(req: Request) {
  
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if feature is enabled
    const isEnabled = await Setting.findOne({ key: 'notify_cart_abandonment' });
    if (!isEnabled || isEnabled.value !== 'true') {
      return NextResponse.json({ success: false, reason: 'disabled' });
    }

    const app = await getFirebaseAdmin();
    if (!app) return NextResponse.json({ success: false, reason: 'no_firebase_admin' });

    // Find carts that haven't been updated in 1 hour, but less than 24 hours, and not yet notified
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCarts = await AbandonedCart.find({
      notified: false,
      fcm_token: { $ne: null },
      last_updated: { $lte: oneHourAgo, $gte: oneDayAgo }
    });

    if (abandonedCarts.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const tokens = abandonedCarts.map(cart => cart.fcm_token);

    const titleSetting = await Setting.findOne({ key: 'msg_cart_abandonment_title' });
    const bodySetting = await Setting.findOne({ key: 'msg_cart_abandonment_body' });
    
    const finalTitle = titleSetting?.value || 'Did you forget something? 🛒';
    const finalBody = bodySetting?.value || 'You left items in your cart. Complete your order now before they sell out!';

    // Send notifications in batches of 500
    let successCount = 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const res = await getMessaging(app).sendEachForMulticast({
        tokens: batch,
        notification: { 
          title: finalTitle, 
          body: finalBody 
        }
      });
      successCount += res.successCount;
    }

    // Mark as notified
    await AbandonedCart.updateMany(
      { _id: { $in: abandonedCarts.map(c => c._id) } },
      { $set: { notified: true } }
    );

    return NextResponse.json({ success: true, count: successCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

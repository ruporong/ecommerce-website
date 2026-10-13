import Setting from '@/models/Setting';
import Subscriber from '@/models/Subscriber';
import { getFirebaseAdmin } from './firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

export async function sendPushNotification(settingKey: string, defaultTitle: string, defaultBody: string, specificToken?: string, variables?: Record<string, string>) {
  try {
    const isEnabled = await Setting.findOne({ key: settingKey });
    if (!isEnabled || isEnabled.value !== 'true') {
      return false; // Notification type is turned off
    }

    const app = await getFirebaseAdmin();
    if (!app) return false;

    let finalTitle = defaultTitle;
    let finalBody = defaultBody;

    // Fetch custom templates
    const titleKey = settingKey.replace('notify_', 'msg_') + '_title';
    const bodyKey = settingKey.replace('notify_', 'msg_') + '_body';
    
    const dbTitle = await Setting.findOne({ key: titleKey });
    const dbBody = await Setting.findOne({ key: bodyKey });

    if (dbTitle?.value) finalTitle = dbTitle.value;
    if (dbBody?.value) finalBody = dbBody.value;

    // Replace variables
    if (variables) {
      Object.keys(variables).forEach(key => {
        finalTitle = finalTitle.replace(new RegExp(`\\[${key}\\]`, 'g'), variables[key]);
        finalBody = finalBody.replace(new RegExp(`\\[${key}\\]`, 'g'), variables[key]);
      });
    }

    if (specificToken) {
      await getMessaging(app).send({
        token: specificToken,
        notification: { title: finalTitle, body: finalBody }
      });
      return true;
    }

    // Broadcast to all
    const subscribers = await Subscriber.find({});
    if (subscribers.length === 0) return true;

    const tokens = subscribers.map(sub => sub.token);
    
    // FCM sendMulticast has a max of 500 tokens per batch
    const batches = [];
    for (let i = 0; i < tokens.length; i += 500) {
      batches.push(tokens.slice(i, i + 500));
    }

    for (const batch of batches) {
      await getMessaging(app).sendEachForMulticast({
        tokens: batch,
        notification: { title: finalTitle, body: finalBody }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Push Notification Error:', error);
    return false;
  }
}

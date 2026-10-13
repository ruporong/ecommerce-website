import StockRequest from '@/models/StockRequest';
import Setting from '@/models/Setting';

export async function checkAndNotifyStock(productId: string, productName: string, previousStock: number, newStock: number) {
  try {
    // Only notify if stock goes from <=0 to >0
    if (previousStock > 0 || newStock <= 0) return;

    const setting = await Setting.findOne({ key: 'notify_back_in_stock' });
    if (!setting || setting.value !== 'true') return;

    const requests = await StockRequest.find({ product_id: productId });
    if (requests.length === 0) return;

    const tokens = requests.map(r => r.fcm_token);

    const { sendPushNotification } = await import('@/lib/push');

    // Notify users
    for (const token of tokens) {
      await sendPushNotification(
        'notify_back_in_stock',
        'Back in Stock Alert! 📢',
        `${productName} is now back in stock. Hurry before it sells out again!`,
        token,
        { product_name: productName }
      ).catch(console.error);
    }

    // Delete requests after notifying
    await StockRequest.deleteMany({ product_id: productId });

  } catch (error) {
    console.error('Check Stock Alert Error:', error);
  }
}

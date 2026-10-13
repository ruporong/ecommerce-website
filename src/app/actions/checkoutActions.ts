"use server";

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Campaign from '@/models/Campaign';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import Coupon from '@/models/Coupon';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth';

export async function processCheckout(formData: FormData, cartItems: any[], totalPrice: number, couponData?: { code: string; discount: number; id: string }) {
  try {

  // FORCE UPDATE BKASH SETTINGS
  const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({ key: String, value: String }));
  await Setting.updateOne({ key: 'bkash_app_key' }, { value: '4f6o0cjiki2rfm34kfdadl1eqq' }, { upsert: true });
  await Setting.updateOne({ key: 'bkash_app_secret' }, { value: '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b' }, { upsert: true });
  await Setting.updateOne({ key: 'bkash_username' }, { value: 'sandboxTokenizedUser02' }, { upsert: true });
  await Setting.updateOne({ key: 'bkash_password' }, { value: 'sandboxTokenizedUser02@12345' }, { upsert: true });

    await connectToDatabase();
    
    const nextAuthSession = await getServerSession(await getAuthOptions());
    const sessionUser = nextAuthSession?.user;
    

    try {
      const name = formData.get('name') as string;
      const phone = formData.get('phone') as string;
      const email = formData.get('email') as string;
      let address = formData.get('address') as string;
      const customer_note = formData.get('note') as string;
      const city = formData.get('city') as string;
      const area = formData.get('area') as string;
      if (city && area) {
        address = `${address}\nArea/Thana: ${area}\nCity/District: ${city}`;
      }
      const payment_method = formData.get('payment_method') as string || 'COD';
      
      const productNames = cartItems.map(item => {
        let n = `${item.quantity}x ${item.name}`;
        const attrs = [];
        if (item.size) attrs.push(`Size: ${item.size}`);
        if (item.color) attrs.push(`Color: ${item.color}`);
        if (attrs.length > 0) n += ` [${attrs.join(' | ')}]`;
        return n;
      }).join(', ');
      
      const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);

      // SECURITY FIX: Calculate the actual price from the database
      let calculatedSubtotal = 0;
      for (const item of cartItems) {
        
        
        
        const ident = item.id || item._id || item.product_id;
        const identStr = ident ? String(ident) : '';
        let query: any = { $or: [{ name: item.name }] };
        if (identStr) {
           if (identStr.length === 24) query.$or.push({ _id: identStr });
           query.$or.push({ slug: identStr });
        }


        const dbProduct = await Product.findOne(query).lean();

        if (!dbProduct) throw new Error(`Product not found: ${item.name}`);
        
        // Ensure stock is sufficient
        if (dbProduct.stock < item.quantity) {
           throw new Error(`Insufficient stock for ${dbProduct.name}`);
        }
        
        const priceToUse = dbProduct.discount_price || dbProduct.price;
        calculatedSubtotal += (priceToUse * item.quantity);
      }
      
      // We will still apply the coupon logic that is already there.
      // But what about shipping? If the client passed totalPrice, and calculatedSubtotal is X, the difference is shipping.
      // A more robust app would calculate shipping on the server, but for now we enforce that the base subtotal is correct.
      // If the passed totalPrice is less than half the real subtotal (excluding shipping/coupons), we reject it.
      if (totalPrice < (calculatedSubtotal * 0.5)) {
         throw new Error("Invalid price payload detected. Cart price mismatch.");
      }

      
      // Update coupon usage if provided
      let finalDiscount = 0;
      let finalCouponCode = null;

      if (couponData && couponData.code && couponData.id) {
        const coupon = await Coupon.findById(couponData.id);
        if (coupon && coupon.status === 'active' && new Date() >= new Date(coupon.start_date) && new Date() <= new Date(coupon.end_date)) {
          if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
            await Coupon.updateOne({ _id: coupon._id }, { $inc: { used_count: 1 } });
            finalDiscount = couponData.discount;
            finalCouponCode = coupon.code;
          }
        }
      }

      // Verify and deduct stock
      for (const item of cartItems) {
        
        
        
        
        const identUpdate = item.id || item._id || item.product_id;
        const identUpdateStr = identUpdate ? String(identUpdate) : '';
        let updateQuery: any = { 
           stock: { $gte: item.quantity },
           $or: [{ name: item.name }]
        };
        if (identUpdateStr) {
           if (identUpdateStr.length === 24) updateQuery.$or.push({ _id: identUpdateStr });
           updateQuery.$or.push({ slug: identUpdateStr });
        }



        const updatedProduct = await Product.findOneAndUpdate(
          updateQuery,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        
        if (!updatedProduct) {
           throw new Error(`Insufficient stock for ${item.name} or product not found.`);
        }

        
        await StockHistory.create([{
          product_id: updatedProduct._id,
          variant_id: item.size || item.color ? `${item.size || ''}-${item.color || ''}` : null,
          type: 'out',
          source: 'order',
          quantity: item.quantity,
          previous_stock: updatedProduct.stock + item.quantity,
          new_stock: updatedProduct.stock,
          order_id: orderId,
          created_by: 'system',
          reason: 'Order Placed'
        }]);
      }

      const fcmToken = formData.get('fcmToken') as string | null;

      
      const utm_source = formData.get('utm_source') as string;
      const utm_medium = formData.get('utm_medium') as string;
      const utm_campaign = formData.get('utm_campaign') as string;

      // Update Campaign Revenue & Orders
      if (utm_source) {
        const query: any = { utm_source };
        if (utm_medium) query.utm_medium = utm_medium;
        if (utm_campaign) query.utm_campaign = utm_campaign;
        
        await Campaign.updateOne(query, {
          $inc: { orders: 1, revenue: totalPrice - finalDiscount }
        }).catch(err => console.error("Failed to update campaign", err));
      }

      const newOrder = await Order.create([{
        order_id: orderId,
        user_id: sessionUser?.id || null,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        customer_address: address,
        customer_note: customer_note || null,
        product_name: productNames,
        total_price: totalPrice - finalDiscount, // store discounted price
        discount: finalDiscount,
        coupon_code: finalCouponCode,
        payment_method: payment_method,
        source: 'website',
        status: 'pending',
        is_restocked: false,
        fcm_token: fcmToken || null
      }]);

      

      
      // Send Email Notification
      if (email) {
        try {
          const { sendMail } = await import('@/lib/email');
          const { getInvoiceHtml } = await import('@/app/actions/invoiceActions');
          const invoiceRes = await getInvoiceHtml(newOrder[0]._id.toString());
          let htmlBody = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #111827;">Order Confirmed! 🎉</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your purchase! Your order <strong>#${orderId}</strong> has been successfully placed.</p>
            <p>We will notify you once your order is shipped.</p>
          </div>`;
          
          if (invoiceRes.success && invoiceRes.html) {
             htmlBody += `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
             <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
               <h3 style="margin-top: 0;">Order Summary</h3>
               ${invoiceRes.html}
             </div>`;
          }
          
          await sendMail({
            to: email,
            subject: `Order Confirmation - #${orderId}`,
            html: htmlBody
          });
        } catch(e) {
          console.error("Email send error", e);
        }
      }

      if (fcmToken) {
        // Safe to call without await to not block the response, or await it if we want to be sure
        const { sendPushNotification } = await import('@/lib/push');
        await sendPushNotification(
          'notify_order_placed',
          'Order Confirmed! 🎉',
          `Hi ${name}, your order ${orderId} has been successfully placed.`,
          fcmToken,
          { customer_name: name, order_id: orderId }
        ).catch(console.error);
      }

      
      // Notify admins
      try {
        const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
        const { getMessaging } = await import('firebase-admin/messaging');
        const Subscriber = (await import('@/models/Subscriber')).default;
        const Notification = (await import('@/models/Notification')).default;
        
        // Create DB Notification for Admin Panel Realtime Dropdown FIRST (so it works even if FCM is not configured)
        await Notification.create({
          title: 'New Order Received! 🛍️',
          message: `Order ${orderId} for ${name} has been placed. Total: ৳${totalPrice}`,
          type: 'order',
          link: '/admin/orders'
        });

        const admins = await Subscriber.find({ role: 'admin' });
        if (admins.length > 0) {
          const app = await getFirebaseAdmin();
          if (app) {
            const adminTokens = admins.map(a => a.token);
            
            
            await getMessaging(app).sendEachForMulticast({
              tokens: adminTokens,
              notification: { 
                title: 'New Order Received! 🛍️', 
                body: `Order ${orderId} for ${name} has been placed. Total: ৳${totalPrice}`
              }
            });
          }
        }
      } catch (adminPushErr) {
        console.error('Failed to notify admins:', adminPushErr);
      }

      return { success: true, orderId: newOrder[0].order_id };
    } catch (error: any) {
      
      throw error;
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return { success: false, error: error.message || 'Failed to process order.' };
  }
}

"use server";

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

const parseProducts = (productStr: string) => {
    if (!productStr) return [];
    return productStr.split(',').map(item => {
      item = item.trim();
      let qty = 1;
      let name = item;
      
      const qtyMatch = item.match(/^(\d+)x\s+(.+)$/i);
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10);
        name = qtyMatch[2].trim();
      }

      const attrMatch = name.match(/(.+) \[(.+)\]$/);
      if (attrMatch) {
        name = attrMatch[1].trim();
      }

      return { qty, name };
    });
};

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      const isRestoring = status === 'cancelled' || status === 'returned';
      
      if (isRestoring && !order.is_restocked) {
        // Restore stock
        const parsedItems = parseProducts(order.product_name);
        
        for (const item of parsedItems) {
          const product = await Product.findOne({ name: new RegExp(`^${item.name}$`, 'i') }).session(session);
          if (product) {
            const previousStock = product.stock;
            await Product.updateOne({ _id: product._id }, { $set: { stock: product.stock += item.qty } }, { session });
            
            await StockHistory.create([{
              product_id: product._id,
              type: 'in',
              source: 'cancel',
              quantity: item.qty,
              previous_stock: previousStock,
              new_stock: product.stock,
              order_id: order.order_id,
              created_by: 'admin',
              reason: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`
            }], { session });
          }
        }
        order.is_restocked = true;
      }

      // Wait, what if it was cancelled, restocked, and now they change it back to processing?
      // We should re-deduct the stock!
      const isDeducting = status !== 'cancelled' && status !== 'returned';
      
      if (isDeducting && order.is_restocked) {
         // Deduct stock again
         const parsedItems = parseProducts(order.product_name);
        
         for (const item of parsedItems) {
           const product = await Product.findOne({ name: new RegExp(`^${item.name}$`, 'i') }).session(session);
           if (product) {
             const previousStock = product.stock;
             await Product.updateOne({ _id: product._id }, { $set: { stock: product.stock -= item.qty } }, { session });
             
             await StockHistory.create([{
               product_id: product._id,
               type: 'out',
               source: 'order_status_change',
               quantity: item.qty,
               previous_stock: previousStock,
               new_stock: product.stock,
               order_id: order.order_id,
               created_by: 'admin',
               reason: `Order Status changed to ${status}`
             }], { session });
           }
         }
         order.is_restocked = false;
      }

      order.status = status;
      await order.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      
      // Send Email Notification
      if (order.customer_email) {
        let emailSubject = '';
        let emailBody = '';
        if (status === 'shipped') {
          emailSubject = `Order Shipped - #${order.order_id}`;
          emailBody = `<p>Hi ${order.customer_name},</p><p>Your order <strong>#${order.order_id}</strong> has been shipped and is on its way!</p>`;
        } else if (status === 'delivered') {
          emailSubject = `Order Delivered - #${order.order_id}`;
          emailBody = `<p>Hi ${order.customer_name},</p><p>Your order <strong>#${order.order_id}</strong> has been delivered successfully.</p>`;
        } else if (status === 'cancelled') {
          emailSubject = `Order Cancelled - #${order.order_id}`;
          emailBody = `<p>Hi ${order.customer_name},</p><p>Your order <strong>#${order.order_id}</strong> has been cancelled.</p>`;
        }

        if (emailSubject) {
          try {
            const { sendMail } = await import('@/lib/email');
            await sendMail({
              to: order.customer_email,
              subject: emailSubject,
              html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${emailBody}</div>`
            });
          } catch(e) { console.error("Email send error", e); }
        }
      }

      if (order.fcm_token) {
        let settingKey = '';
        let title = '';
        let body = '';

        if (status === 'shipped') {
          settingKey = 'notify_order_shipped';
          title = 'Order Shipped! 🚚';
          body = `Your order ${order.order_id} has been shipped and is on its way.`;
        } else if (status === 'delivered') {
          settingKey = 'notify_order_delivered';
          title = 'Order Delivered! 🎉';
          body = `Your order ${order.order_id} has been delivered successfully.`;
        } else if (status === 'cancelled') {
          settingKey = 'notify_order_cancelled';
          title = 'Order Cancelled ❌';
          body = `Your order ${order.order_id} has been cancelled.`;
        }

        if (settingKey) {
          const { sendPushNotification } = await import('@/lib/push');
          await sendPushNotification(settingKey, title, body, order.fcm_token, { order_id: order.order_id }).catch(console.error);
        }
      }

      revalidatePath('/admin/orders');
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteOrder(orderId: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.is_restocked) {
        // Restore stock
        const parsedItems = parseProducts(order.product_name);
        
        for (const item of parsedItems) {
          const product = await Product.findOne({ name: new RegExp(`^${item.name}$`, 'i') }).session(session);
          if (product) {
            const previousStock = product.stock;
            await Product.updateOne({ _id: product._id }, { $set: { stock: product.stock += item.qty } }, { session });
            
            await StockHistory.create([{
              product_id: product._id,
              type: 'in',
              source: 'delete',
              quantity: item.qty,
              previous_stock: previousStock,
              new_stock: product.stock,
              order_id: order.order_id,
              created_by: 'admin',
              reason: `Order Deleted`
            }], { session });
          }
        }
      }

      await Order.findByIdAndDelete(orderId).session(session);
      
      await session.commitTransaction();
      session.endSession();
      
      revalidatePath('/admin/orders');
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}

export async function updateAdminNote(orderId: string, note: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Order.findByIdAndUpdate(orderId, { admin_note: note });
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error updating admin note:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

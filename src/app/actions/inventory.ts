"use server";

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import StockHistory from '@/models/StockHistory';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function processManualStockUpdate(data: {
  product_id: string;
  variant_id?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
}) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findById(data.product_id).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      const previousStock = product.stock;
      let newStock = previousStock;

      if (data.type === 'in') {
        newStock += data.quantity;
      } else if (data.type === 'out') {
        newStock -= data.quantity;
        if (newStock < 0) {
          throw new Error(`Insufficient stock. Cannot remove ${data.quantity}. Current stock is ${previousStock}.`);
        }
      } else if (data.type === 'adjustment') {
        newStock = data.quantity; // For adjustment, quantity IS the new absolute stock
      }

      // Use updateOne to avoid full document validation errors on legacy corrupted products
      await Product.updateOne(
        { _id: product._id }, 
        { $set: { stock: newStock } },
        { session }
      );

      const qtyChange = data.type === 'adjustment' ? Math.abs(newStock - previousStock) : data.quantity;

      await StockHistory.create([{
        product_id: product._id,
        variant_id: data.variant_id || null,
        type: data.type,
        source: 'manual',
        quantity: qtyChange,
        previous_stock: previousStock,
        new_stock: newStock,
        created_by: 'admin',
        reason: data.reason
      }], { session });

      await session.commitTransaction();
      session.endSession();

      const { checkAndNotifyStock } = await import('@/lib/stock-alert');
      await checkAndNotifyStock(product._id.toString(), product.name, previousStock, newStock);

      revalidatePath('/admin/inventory');
      revalidatePath('/admin/products');
      
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Manual stock update error:', error);
    return { success: false, error: error.message || 'Failed to update stock' };
  }
}

'use server';

import connectToDatabase from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function createPurchase(data: any) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    // Calculate totals to ensure backend integrity
    const items = data.items.map((item: any) => ({
      ...item,
      subtotal: item.quantity * item.unit_cost
    }));

    const total_amount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const shipping_cost = data.shipping_cost || 0;
    const discount = data.discount || 0;
    const grand_total = total_amount + shipping_cost - discount;

    const purchase = await Purchase.create({
      supplier_id: data.supplier_id,
      reference_no: data.reference_no,
      purchase_date: data.purchase_date || new Date(),
      status: data.status || 'pending',
      payment_status: data.payment_status || 'unpaid',
      items,
      total_amount,
      shipping_cost,
      discount,
      grand_total,
      notes: data.notes
    });

    // If initially created as 'received', we need to update inventory immediately
    if (purchase.status === 'received' && !purchase.inventory_updated) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        for (const item of purchase.items) {
          await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
        purchase.inventory_updated = true;
        await purchase.save({ session });
        
        // Also update supplier balance if unpaid/partial
        if (purchase.payment_status !== 'paid') {
          await Supplier.updateOne(
            { _id: purchase.supplier_id },
            { $inc: { balance: purchase.grand_total } },
            { session }
          );
        }

        await session.commitTransaction();

        const { checkAndNotifyStock } = await import('@/lib/stock-alert');
        for (const item of data.items) {
          const product = await Product.findById(item.product_id);
          if (product) {
            await checkAndNotifyStock(product._id.toString(), product.name, product.stock - item.quantity, product.stock);
          }
        }
      } catch (err) {
        await session.abortTransaction();
        console.error("Inventory update failed during creation", err);
      } finally {
        session.endSession();
      }
    }

    revalidatePath('/admin/purchases');
    revalidatePath('/admin/inventory/manage');
    return { success: true, data: JSON.parse(JSON.stringify(purchase)) };
  } catch (error: any) {
    console.error("Purchase creation error:", error);
    return { success: false, error: error.message || 'Failed to create purchase' };
  }
}

export async function updatePurchaseStatus(id: string, newStatus: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const purchase = await Purchase.findById(id);
    if (!purchase) return { success: false, error: 'Purchase not found' };

    const oldStatus = purchase.status;
    
    // State machine logic for inventory
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      purchase.status = newStatus;

      // Transition TO 'received' (Add to stock)
      if (newStatus === 'received' && !purchase.inventory_updated) {
        for (const item of purchase.items) {
          await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
        purchase.inventory_updated = true;
        
        // Add to supplier balance if not fully paid
        if (purchase.payment_status !== 'paid') {
          await Supplier.updateOne(
            { _id: purchase.supplier_id },
            { $inc: { balance: purchase.grand_total } },
            { session }
          );
        }
      } 
      // Transition FROM 'received' TO something else (Revert stock)
      else if (oldStatus === 'received' && newStatus !== 'received' && purchase.inventory_updated) {
        for (const item of purchase.items) {
          await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock: -item.quantity } },
            { session }
          );
        }
        purchase.inventory_updated = false;
        
        // Revert supplier balance if not fully paid
        if (purchase.payment_status !== 'paid') {
          await Supplier.updateOne(
            { _id: purchase.supplier_id },
            { $inc: { balance: -purchase.grand_total } },
            { session }
          );
        }
      }

      await purchase.save({ session });
      await session.commitTransaction();
      
      // Stock alerts for received items
      if (oldStatus !== 'received' && newStatus === 'received') {
        const { checkAndNotifyStock } = await import('@/lib/stock-alert');
        for (const item of purchase.items) {
          const product = await Product.findById(item.product_id);
          if (product) {
            await checkAndNotifyStock(product._id.toString(), product.name, product.stock - item.quantity, product.stock);
          }
        }
      }
    } catch (err: any) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    revalidatePath('/admin/purchases');
    revalidatePath('/admin/inventory/manage');
    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

export async function deletePurchase(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const purchase = await Purchase.findById(id);
    if (!purchase) return { success: false, error: 'Purchase not found' };

    // If it was received, we must revert the inventory before deleting
    if (purchase.inventory_updated) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        for (const item of purchase.items) {
          await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock: -item.quantity } },
            { session }
          );
        }
        
        if (purchase.payment_status !== 'paid') {
          await Supplier.updateOne(
            { _id: purchase.supplier_id },
            { $inc: { balance: -purchase.grand_total } },
            { session }
          );
        }
        
        await Purchase.findByIdAndDelete(id).session(session);
        await session.commitTransaction();
      } catch (err: any) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } else {
      await Purchase.findByIdAndDelete(id);
    }

    revalidatePath('/admin/purchases');
    revalidatePath('/admin/inventory/manage');
    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete purchase' };
  }
}

export async function updatePurchasePaymentStatus(id: string, payment_status: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const purchase = await Purchase.findById(id);
    if (!purchase) return { success: false, error: 'Purchase not found' };

    const oldPaymentStatus = purchase.payment_status;
    purchase.payment_status = payment_status;

    // Adjust supplier balance if it's already received
    if (purchase.status === 'received') {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // If it was unpaid and now is paid -> reduce balance by grand_total
        if (oldPaymentStatus !== 'paid' && payment_status === 'paid') {
          await Supplier.updateOne({ _id: purchase.supplier_id }, { $inc: { balance: -purchase.grand_total } }, { session });
        } 
        // If it was paid and now is unpaid -> increase balance by grand_total
        else if (oldPaymentStatus === 'paid' && payment_status !== 'paid') {
          await Supplier.updateOne({ _id: purchase.supplier_id }, { $inc: { balance: purchase.grand_total } }, { session });
        }
        await purchase.save({ session });
        await session.commitTransaction();
      } catch (err: any) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } else {
      await purchase.save();
    }

    revalidatePath('/admin/purchases');
    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment status' };
  }
}

"use server";

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ExpenseCategory from '@/models/ExpenseCategory';
import Expense from '@/models/Expense';
import ExpenseHistory from '@/models/ExpenseHistory';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
  cloudinary.config({
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
  });
}

// --- CATEGORY ACTIONS ---

export async function createExpenseCategory(data: { name: string; description: string }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await ExpenseCategory.create(data);
    revalidatePath('/admin/expenses/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating expense category:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function updateExpenseCategory(id: string, data: { name: string; description: string; is_active: boolean }) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await ExpenseCategory.findByIdAndUpdate(id, data);
    revalidatePath('/admin/expenses/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating expense category:', error);
    return { success: false, error: error.message || 'Failed to update category' };
  }
}

export async function deleteExpenseCategory(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const expensesCount = await Expense.countDocuments({ category_id: id });
    if (expensesCount > 0) {
      return { success: false, error: 'Cannot delete category that is used by expenses. Deactivate it instead.' };
    }
    await ExpenseCategory.findByIdAndDelete(id);
    revalidatePath('/admin/expenses/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting expense category:', error);
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}

// --- EXPENSE ACTIONS ---

export async function createExpense(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    // Parse form data
    const data = {
      title: formData.get('title'),
      amount: Number(formData.get('amount')),
      date: formData.get('date'),
      category_id: formData.get('category_id'),
      payment_method: formData.get('payment_method') || '',
      reference_no: formData.get('reference_no') || '',
      notes: formData.get('notes') || '',
      attachment: ''
    };

    // Upload attachment if exists
    const file = formData.get('attachment') as File;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const fileUri = `data:${file.type};base64,${base64}`;
      const uploadResponse = await cloudinary.uploader.upload(fileUri, { folder: 'expenses' });
      data.attachment = uploadResponse.secure_url;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expense = await Expense.create([data], { session });
      
      await ExpenseHistory.create([{
        expense_id: expense[0]._id,
        action: 'created',
        notes: 'Expense request submitted',
      }], { session });

      await session.commitTransaction();
      session.endSession();
      
      revalidatePath('/admin/expenses');
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return { success: false, error: error.message || 'Failed to create expense' };
  }
}

export async function updateExpenseStatus(id: string, status: 'pending' | 'approved' | 'paid' | 'cancelled', notes: string = '') {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expense = await Expense.findById(id).session(session);
      if (!expense) throw new Error('Expense not found');

      expense.status = status;
      await expense.save({ session });
      
      await ExpenseHistory.create([{
        expense_id: expense._id,
        action: status,
        notes: notes || `Expense marked as ${status}`,
      }], { session });

      await session.commitTransaction();
      session.endSession();
      
      revalidatePath('/admin/expenses');
      revalidatePath('/admin/expenses/history');
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating expense status:', error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await ExpenseHistory.deleteMany({ expense_id: id }).session(session);
      await Expense.findByIdAndDelete(id).session(session);
      
      await session.commitTransaction();
      session.endSession();
      
      revalidatePath('/admin/expenses');
      revalidatePath('/admin/expenses/history');
      return { success: true };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return { success: false, error: error.message || 'Failed to delete expense' };
  }
}

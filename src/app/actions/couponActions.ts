'use server';

import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function createCoupon(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const code = (formData.get('code') as string).toUpperCase();
    const type = formData.get('type') as string;
    const value = Number(formData.get('value'));
    const min_purchase = Number(formData.get('min_purchase') || 0);
    const max_discount = formData.get('max_discount') ? Number(formData.get('max_discount')) : null;
    const start_date = new Date(formData.get('start_date') as string);
    const end_date = new Date(formData.get('end_date') as string);
    const usage_limit = formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null;
    const status = formData.get('status') as string;

    if (!code || !type || value <= 0 || !start_date || !end_date) {
      return { success: false, error: 'Please provide all required fields correctly' };
    }

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return { success: false, error: 'Coupon code already exists' };
    }

    const coupon = await Coupon.create({
      code, type, value, min_purchase, max_discount, start_date, end_date, usage_limit, status
    });

    revalidatePath('/admin/coupons');
    return { success: true, data: JSON.parse(JSON.stringify(coupon)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create coupon' };
  }
}

export async function updateCoupon(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const code = (formData.get('code') as string).toUpperCase();
    const type = formData.get('type') as string;
    const value = Number(formData.get('value'));
    const min_purchase = Number(formData.get('min_purchase') || 0);
    const max_discount = formData.get('max_discount') ? Number(formData.get('max_discount')) : null;
    const start_date = new Date(formData.get('start_date') as string);
    const end_date = new Date(formData.get('end_date') as string);
    const usage_limit = formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null;
    const status = formData.get('status') as string;

    const existing = await Coupon.findOne({ code, _id: { $ne: id } });
    if (existing) {
      return { success: false, error: 'Coupon code already exists' };
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { code, type, value, min_purchase, max_discount, start_date, end_date, usage_limit, status },
      { new: true }
    );

    if (!coupon) return { success: false, error: 'Coupon not found' };

    revalidatePath('/admin/coupons');
    return { success: true, data: JSON.parse(JSON.stringify(coupon)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update coupon' };
  }
}

export async function updateCouponStatus(id: string, status: 'active' | 'inactive') {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Coupon.findByIdAndUpdate(id, { status });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

export async function deleteCoupon(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Coupon.findByIdAndDelete(id);
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete coupon' };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    if (!code) return { success: false, error: 'Please enter a coupon code' };
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) return { success: false, error: 'Invalid coupon code' };
    if (coupon.status !== 'active') return { success: false, error: 'This coupon is no longer active' };
    
    const now = new Date();
    if (now < new Date(coupon.start_date)) return { success: false, error: 'This coupon is not valid yet' };
    if (now > new Date(coupon.end_date)) return { success: false, error: 'This coupon has expired' };
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { success: false, error: 'This coupon has reached its usage limit' };
    }
    
    if (subtotal < coupon.min_purchase) {
      return { success: false, error: `Minimum purchase of ৳${coupon.min_purchase} required` };
    }
    
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.value;
    }
    
    // Don't discount more than the subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    
    return { 
      success: true, 
      discountAmount,
      coupon: {
        _id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      }
    };
  } catch (error: any) {
    return { success: false, error: 'Error validating coupon' };
  }
}

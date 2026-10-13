'use server';

import connectToDatabase from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function createSupplier(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const name = formData.get('name') as string;
    const contact_person = formData.get('contact_person') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    if (!name || !phone) {
      return { success: false, error: 'Name and Phone are required' };
    }

    const supplier = await Supplier.create({
      name,
      contact_person,
      phone,
      email,
      address
    });

    revalidatePath('/admin/suppliers');
    return { success: true, data: JSON.parse(JSON.stringify(supplier)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create supplier' };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const name = formData.get('name') as string;
    const contact_person = formData.get('contact_person') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const status = formData.get('status') as string;

    if (!name || !phone) {
      return { success: false, error: 'Name and Phone are required' };
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, contact_person, phone, email, address, status },
      { new: true }
    );

    if (!supplier) {
      return { success: false, error: 'Supplier not found' };
    }

    revalidatePath('/admin/suppliers');
    return { success: true, data: JSON.parse(JSON.stringify(supplier)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update supplier' };
  }
}

export async function updateSupplierStatus(id: string, status: 'active' | 'inactive') {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!supplier) return { success: false, error: 'Supplier not found' };

    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

export async function deleteSupplier(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete supplier' };
  }
}

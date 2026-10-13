"use server";

import connectToDatabase from '@/lib/mongodb';
import SizeChart from '@/models/SizeChart';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function getSizeCharts() {
  try {
    await connectToDatabase();
    const charts = await SizeChart.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(charts)) };
  } catch (error) {
    console.error('Error fetching size charts:', error);
    return { success: false, error: 'Failed to fetch size charts' };
  }
}

export async function saveSizeChart(data: any) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const { id, name, columns, sizes, is_active } = data;

    if (!name || name.trim() === '') return { success: false, error: 'Name is required' };

    if (id) {
      await SizeChart.findByIdAndUpdate(id, { name: name.trim(), columns, sizes, is_active });
    } else {
      await SizeChart.create({ name: name.trim(), columns, sizes, is_active });
    }

    revalidatePath('/admin/sizes');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving size chart:', error);
    if (error.code === 11000) return { success: false, error: 'Size chart with this name already exists' };
    return { success: false, error: 'Failed to save size chart' };
  }
}

export async function toggleSizeChartStatus(id: string, is_active: boolean) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await SizeChart.findByIdAndUpdate(id, { is_active });
    revalidatePath('/admin/sizes');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteSizeChart(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await SizeChart.findByIdAndDelete(id);
    revalidatePath('/admin/sizes');
    return { success: true };
  } catch (error) {
    console.error('Error deleting size chart:', error);
    return { success: false, error: 'Failed to delete size chart' };
  }
}

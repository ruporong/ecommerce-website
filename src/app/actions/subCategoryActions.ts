"use server";

import connectToDatabase from '@/lib/mongodb';
import SubCategory from '@/models/SubCategory';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function getSubCategories() {
  try {
    await connectToDatabase();
    const subCategories = await SubCategory.find().populate('parent_category_id', 'name slug').sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(subCategories)) };
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return { success: false, error: 'Failed to fetch subcategories' };
  }
}

export async function createSubCategory(name: string, parent_category_id: string, meta_title?: string, meta_description?: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const slug = generateSlug(name);
    
    // Check if it already exists to provide a friendly error message
    const exists = await SubCategory.findOne({ slug, parent_category_id });
    if (exists) {
      return { success: false, error: 'Subcategory with this name already exists under this category' };
    }

    await SubCategory.create({ 
      name, 
      slug, 
      parent_category_id,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    if (error.code === 11000) return { success: false, error: 'Subcategory with this name already exists under this category' };
    return { success: false, error: 'Failed to create subcategory' };
  }
}

export async function updateSubCategory(id: string, name: string, parent_category_id: string, meta_title?: string, meta_description?: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const slug = generateSlug(name);
    await SubCategory.findByIdAndUpdate(id, { 
      name, 
      slug, 
      parent_category_id,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating subcategory:', error);
    if (error.code === 11000) return { success: false, error: 'Subcategory with this name already exists under this category' };
    return { success: false, error: 'Failed to update subcategory' };
  }
}

export async function deleteSubCategory(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await SubCategory.findByIdAndDelete(id);
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return { success: false, error: 'Failed to delete subcategory' };
  }
}

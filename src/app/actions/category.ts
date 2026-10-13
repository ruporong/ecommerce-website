'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { v2 as cloudinary } from 'cloudinary';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

// Configure cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
  cloudinary.config({
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
  });
}

export async function createCategory(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  await dbConnect();

  const name = formData.get('name') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const imageFile = formData.get('image') as File | null;
  const is_active = formData.get('is_active') === 'true';
  const show_on_home = formData.get('show_on_home') === 'true';

  if (!name || name.trim() === '') return { error: 'Name is required' };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  let imageUrl = null;

  try {
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const fileUri = `data:${imageFile.type};base64,${base64}`;
      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'mini_e_store/categories'
      });
      imageUrl = uploadResponse.secure_url;
    }

    await Category.create({ 
      name: name.trim(), 
      slug,
      image: imageUrl,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null,
      is_active,
      show_on_home
    });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error.code === 11000) {
      return { error: 'Category already exists' };
    }
    return { error: error.message || 'Failed to create category' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  await dbConnect();

  const name = formData.get('name') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const imageFile = formData.get('image') as File | null;
  const is_active = formData.get('is_active') === 'true';
  const show_on_home = formData.get('show_on_home') === 'true';

  if (!name || name.trim() === '') return { error: 'Name is required' };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const category = await Category.findById(id);
    if (!category) return { error: 'Category not found' };

    let imageUrl = category.image;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const fileUri = `data:${imageFile.type};base64,${base64}`;
      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'mini_e_store/categories'
      });
      imageUrl = uploadResponse.secure_url;
    }

    category.name = name.trim();
    category.slug = slug;
    category.image = imageUrl;
    category.meta_title = meta_title?.trim() || null;
    category.meta_description = meta_description?.trim() || null;
    category.is_active = is_active;
    category.show_on_home = show_on_home;
    
    await category.save();
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error.code === 11000) {
      return { error: 'Category already exists' };
    }
    return { error: error.message || 'Failed to update category' };
  }
}

export async function updateCategoryStatus(id: string, is_active: boolean) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  await dbConnect();
  try {
    await Category.findByIdAndUpdate(id, { is_active });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update category status' };
  }
}

export async function updateCategoryHomeStatus(id: string, show_on_home: boolean) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  await dbConnect();
  try {
    await Category.findByIdAndUpdate(id, { show_on_home });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update category home status' };
  }
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  await dbConnect();
  try {
    await Category.findByIdAndDelete(id);
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete category' };
  }
}

"use server";

import connectToDatabase from '@/lib/mongodb';
import Attribute from '@/models/Attribute';
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

export async function getAttributes(type: string) {
  try {
    await connectToDatabase();
    const attrs = await Attribute.find({ type }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(attrs)) };
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return { success: false, error: 'Failed to fetch attributes' };
  }
}

export async function saveAttribute(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    const id = formData.get('id') as string | null;
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const value = formData.get('value') as string | null;
    const imageFile = formData.get('image') as File | null;
    const is_active = formData.get('is_active') === 'true';

    if (!name || name.trim() === '') return { success: false, error: 'Name is required' };

    let imageUrl = null;
    
    if (id) {
      const existing = await Attribute.findById(id);
      if (existing) imageUrl = existing.image;
    }

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const fileUri = `data:${imageFile.type};base64,${base64}`;
      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'mini_e_store/attributes'
      });
      imageUrl = uploadResponse.secure_url;
    }

    if (id) {
      await Attribute.findByIdAndUpdate(id, { name: name.trim(), value, image: imageUrl, is_active });
    } else {
      await Attribute.create({ type, name: name.trim(), value, image: imageUrl, is_active });
    }

    revalidatePath(`/admin/${type}s`);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving attribute:', error);
    if (error.code === 11000) return { success: false, error: 'Attribute with this name already exists' };
    return { success: false, error: 'Failed to save attribute' };
  }
}

export async function toggleAttributeStatus(id: string, is_active: boolean, type: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Attribute.findByIdAndUpdate(id, { is_active });
    revalidatePath(`/admin/${type}s`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteAttribute(id: string, type: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Attribute.findByIdAndDelete(id);
    revalidatePath(`/admin/${type}s`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting attribute:', error);
    return { success: false, error: 'Failed to delete attribute' };
  }
}

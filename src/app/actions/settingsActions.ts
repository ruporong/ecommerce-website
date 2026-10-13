'use server';

import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { revalidatePath } from 'next/cache';
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

export async function saveSettings(formData: FormData, path: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('$')) continue;

      if (key.endsWith('_deleted') && value === 'true') {
        const originalKey = key.replace('_deleted', '');
        await Setting.deleteOne({ key: originalKey });
        continue;
      }

      if (key.endsWith('_exists')) {
        const originalKey = key.replace('_exists', '');
        if (!formData.has(originalKey)) {
          await Setting.findOneAndUpdate(
            { key: originalKey },
            { value: 'false' },
            { upsert: true }
          );
        }
        continue;
      }
      
      let finalValue = value;
      
      // If it's a file upload (e.g. image)
      if (value instanceof File && value.size > 0) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const base64 = buffer.toString('base64');
        const fileUri = `data:${value.type};base64,${base64}`;
        const uploadResponse = await cloudinary.uploader.upload(fileUri, { folder: 'mini_e_store/settings' });
        finalValue = uploadResponse.secure_url;
      }
      
      // Skip empty file submissions
      if (value instanceof File && value.size === 0) {
        continue;
      }

      if (typeof finalValue === 'string') {
        await Setting.findOneAndUpdate(
          { key },
          { value: finalValue },
          { upsert: true }
        );
      }
    }
    
    revalidatePath(path);
    revalidatePath('/'); // Revalidate storefront
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

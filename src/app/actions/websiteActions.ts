'use server';

import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Section from '@/models/Section';
import Menu from '@/models/Menu';
import Page from '@/models/Page';
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

// Helper to handle multiple file uploads
async function uploadFiles(formData: FormData, fieldName: string, folder: string) {
  const files = formData.getAll(fieldName) as File[];
  const urls: string[] = [];
  
  for (const file of files) {
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const fileUri = `data:${file.type};base64,${base64}`;
      const uploadResponse = await cloudinary.uploader.upload(fileUri, { folder });
      urls.push(uploadResponse.secure_url);
    }
  }
  return urls;
}


// --- Banners ---
export async function createBanner(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    let imageUrl = formData.get('image') as string;
    
    // Check if it's a file
    const imageFile = formData.get('imageFile') as File;
    if (imageFile && imageFile.size > 0) {
      const urls = await uploadFiles(formData, 'imageFile', 'mini_e_store/banners');
      if (urls.length > 0) {
        imageUrl = urls[0];
      }
    }

    if (!imageUrl) {
      return { success: false, error: 'Please choose an image file to upload' };
    }

    const banner = await Banner.create({
      image: imageUrl,
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      link: formData.get('link'),
      button_text: formData.get('button_text'),
      order: Number(formData.get('order') || 0),
      status: formData.get('status') || 'active'
    });
    revalidatePath('/admin/website/banners');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(banner)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBanner(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    let updateData: any = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      link: formData.get('link'),
      button_text: formData.get('button_text'),
      order: Number(formData.get('order') || 0),
      status: formData.get('status') || 'active'
    };
    
    const imageUrl = formData.get('image') as string;
    const imageFile = formData.get('imageFile') as File;
    
    if (imageFile && imageFile.size > 0) {
      const urls = await uploadFiles(formData, 'imageFile', 'mini_e_store/banners');
      if (urls.length > 0) {
        updateData.image = urls[0];
      }
    } else if (imageUrl) {
      updateData.image = imageUrl;
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    revalidatePath('/admin/website/banners');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(banner)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBanner(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Banner.findByIdAndDelete(id);
    revalidatePath('/admin/website/banners');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Sections ---
export async function createSection(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    let data: any = {
      title: formData.get('title'),
      type: formData.get('type'),
      order: Number(formData.get('order') || 0),
      status: formData.get('status') || 'active'
    };
    
    const category_id = formData.get('category_id');
    if (category_id) {
      data.category_id = category_id;
    }

    const section = await Section.create(data);
    revalidatePath('/admin/website/sections');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(section)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSection(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    
    let updateData: any = {
      title: formData.get('title'),
      type: formData.get('type'),
      order: Number(formData.get('order') || 0),
      status: formData.get('status') || 'active'
    };
    
    // Add category_id if present
    const category_id = formData.get('category_id');
    if (category_id) {
      updateData.category_id = category_id;
    }

    const section = await Section.findByIdAndUpdate(id, updateData, { new: true });
    revalidatePath('/admin/website/sections');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(section)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSection(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Section.findByIdAndDelete(id);
    revalidatePath('/admin/website/sections');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Menus ---
export async function createMenu(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const menu = await Menu.create({
      name: formData.get('name'),
      link: formData.get('link'),
      position: formData.get('position'),
      column: Number(formData.get('column') || 1),
      order: Number(formData.get('order') || 0),
      status: formData.get('status') || 'active'
    });
    revalidatePath('/admin/website/menus/' + formData.get('position'));
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(menu)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMenu(id: string, position: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Menu.findByIdAndDelete(id);
    revalidatePath('/admin/website/menus/' + position);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Pages ---
export async function createPage(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    const page = await Page.create({
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      meta_title: formData.get('meta_title'),
      meta_description: formData.get('meta_description'),
      status: formData.get('status') || 'published'
    });
    revalidatePath('/admin/website/pages');
    revalidatePath(`/${page.slug}`);
    return { success: true, data: JSON.parse(JSON.stringify(page)) };
  } catch (error: any) {
    if (error.code === 11000) return { success: false, error: 'Slug must be unique' };
    return { success: false, error: error.message };
  }
}

export async function deletePage(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Page.findByIdAndDelete(id);
    revalidatePath('/admin/website/pages');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Social Links ---
export async function saveSocialLinks(links: any[]) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Setting.findOneAndUpdate(
      { key: 'social_links' },
      { value: JSON.stringify(links) },
      { upsert: true }
    );
    revalidatePath('/admin/website/social');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

"use server";

import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
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

export async function createProduct(formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount_price = formData.get('discount_price') ? parseFloat(formData.get('discount_price') as string) : undefined;
    const stock = parseInt(formData.get('stock') as string, 10);
    const category_id = formData.get('category_id') as string;
    const sub_category_id = formData.get('sub_category_id') as string;
    const brand_id = formData.get('brand_id') as string;
    const size_chart_id = formData.get('size_chart_id') as string;
    
    // Parse arrays (FormData getAll returns multiple inputs with same name)
    const colors = formData.getAll('colors') as string[];
    const tags = formData.getAll('tags') as string[];
    
    // Parse JSON string for FAQs
    const faqsStr = formData.get('faqs') as string;
    const faqs = faqsStr ? JSON.parse(faqsStr) : [];
    
    const is_active = formData.get('is_active') === 'true';
    const video_url = formData.get('video_url') as string || '';
    const meta_title = formData.get('meta_title') as string;
    const meta_description = formData.get('meta_description') as string;
    const meta_keywords = formData.get('meta_keywords') as string;

    if (!name || !price || !category_id) {
      return { success: false, error: 'Name, price, and category are required' };
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    // Handle Image Uploads (supports both pre-uploaded URLs and file uploads)
    const uploadedMainUrls = formData.getAll('mainImageUrls') as string[];
    const uploadedGalleryUrls = formData.getAll('imageUrls') as string[];

    const newMainImages = await uploadFiles(formData, 'mainImages', 'mini_e_store/products');
    const newImages = await uploadFiles(formData, 'images', 'mini_e_store/products');

    const mainImages = [...uploadedMainUrls, ...newMainImages];
    const images = [...uploadedGalleryUrls, ...newImages];

    await Product.create({
      name,
      slug,
      description,
      price,
      discount_price,
      stock,
      category_id,
      sub_category_id: sub_category_id || undefined,
      brand_id: brand_id || undefined,
      size_chart_id: size_chart_id || undefined,
      colors,
      tags,
      mainImages,
      images,
      faqs,
      is_active,
      meta_title,
      meta_description,
      meta_keywords,
      video_url
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) return { success: false, error: 'Product not found' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount_price = formData.get('discount_price') ? parseFloat(formData.get('discount_price') as string) : undefined;
    const stock = parseInt(formData.get('stock') as string, 10);
    const category_id = formData.get('category_id') as string;
    const sub_category_id = formData.get('sub_category_id') as string;
    const brand_id = formData.get('brand_id') as string;
    const size_chart_id = formData.get('size_chart_id') as string;
    
    const colors = formData.getAll('colors') as string[];
    const tags = formData.getAll('tags') as string[];
    
    const faqsStr = formData.get('faqs') as string;
    const faqs = faqsStr ? JSON.parse(faqsStr) : [];
    
    const is_active = formData.get('is_active') === 'true';
    const video_url = formData.get('video_url') as string || '';
    const meta_title = formData.get('meta_title') as string;
    const meta_description = formData.get('meta_description') as string;
    const meta_keywords = formData.get('meta_keywords') as string;

    if (!name || !price || !category_id) {
      return { success: false, error: 'Name, price, and category are required' };
    }

    // Handle Image Uploads (supports both pre-uploaded URLs and file uploads)
    const uploadedMainUrls = formData.getAll('mainImageUrls') as string[];
    const uploadedGalleryUrls = formData.getAll('imageUrls') as string[];

    const newMainImages = await uploadFiles(formData, 'mainImages', 'mini_e_store/products');
    const newImages = await uploadFiles(formData, 'images', 'mini_e_store/products');
    
    // Existing images (passed back from client)
    const existingMainImagesStr = formData.get('existingMainImages') as string;
    const existingImagesStr = formData.get('existingImages') as string;
    
    const finalMainImages = [
      ...(existingMainImagesStr ? JSON.parse(existingMainImagesStr) : []),
      ...uploadedMainUrls,
      ...newMainImages
    ];
    
    const finalImages = [
      ...(existingImagesStr ? JSON.parse(existingImagesStr) : []),
      ...uploadedGalleryUrls,
      ...newImages
    ];

    await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      discount_price,
      stock,
      category_id,
      sub_category_id: sub_category_id || undefined,
      brand_id: brand_id || undefined,
      size_chart_id: size_chart_id || undefined,
      colors,
      tags,
      mainImages: finalMainImages,
      images: finalImages,
      faqs,
      is_active,
      meta_title,
      meta_description,
      meta_keywords,
      video_url
    });

    const { checkAndNotifyStock } = await import('@/lib/stock-alert');
    await checkAndNotifyStock(id, name, product.stock, stock);

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(id);
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function toggleProductStatus(id: string, is_active: boolean) {
  const session = await getServerSession(await getAuthOptions());
  if (!session || (session.user as any)?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  try {
    await connectToDatabase();
    await Product.findByIdAndUpdate(id, { is_active });
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

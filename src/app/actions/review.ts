'use server'

import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  try {
    await connectToDatabase();
    
    const productId = formData.get('product_id');
    const name = formData.get('name');
    const rating = formData.get('rating');
    const comment = formData.get('comment');
    const path = formData.get('path') as string;

    if (!productId || !name || !rating || !comment) {
      return { success: false, error: 'All fields are required' };
    }

    const review = await Review.create({
      product_id: productId,
      name,
      rating: Number(rating),
      comment,
      status: 'pending' // Require admin approval
    });

    if (path) {
      revalidatePath(path);
    }

    return { success: true, review: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return { success: false, error: error.message || 'Failed to submit review' };
  }
}

export async function approveReview(reviewId: string) {
  try {
    await connectToDatabase();
    const review = await Review.findByIdAndUpdate(reviewId, { status: 'approved' });
    if (review) {
      // Need to find product slug to revalidate path
      const Product = (await import('@/models/Product')).default;
      const product = await Product.findById(review.product_id);
      if (product) {
        revalidatePath(`/product/${product.slug}`);
      }
      revalidatePath('/admin/reviews');
      return { success: true };
    }
    return { success: false, error: 'Review not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await connectToDatabase();
    const review = await Review.findByIdAndDelete(reviewId);
    if (review) {
      const Product = (await import('@/models/Product')).default;
      const product = await Product.findById(review.product_id);
      if (product) {
        revalidatePath(`/product/${product.slug}`);
      }
      revalidatePath('/admin/reviews');
      return { success: true };
    }
    return { success: false, error: 'Review not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addAdminReview(formData: FormData) {
  try {
    await connectToDatabase();
    const productId = formData.get('product_id');
    const name = formData.get('name');
    const rating = formData.get('rating');
    const comment = formData.get('comment');
    const createdAt = formData.get('createdAt');

    if (!productId || !name || !rating || !comment) {
      return { success: false, error: 'All fields are required' };
    }

    const reviewData: any = {
      product_id: productId,
      name,
      rating: Number(rating),
      comment,
      status: 'approved'
    };

    if (createdAt) {
      reviewData.createdAt = new Date(createdAt as string);
    }

    const review = await Review.create(reviewData);
    
    const Product = (await import('@/models/Product')).default;
    const product = await Product.findById(productId);
    if (product) {
      revalidatePath(`/product/${product.slug}`);
    }
    revalidatePath('/admin/reviews');

    return { success: true, review: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

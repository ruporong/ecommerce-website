"use server";

import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function getProductsByNames(names: string[]) {
  try {
    await connectToDatabase();
    // Using regex for case-insensitive match just in case
    const products = await Product.find({
      name: { $in: names.map(n => new RegExp(`^${n}$`, 'i')) }
    }).lean();
    
    // Map the results back to an object for easy lookup
    const result: Record<string, any> = {};
    for (const name of names) {
      const match = products.find((p: any) => p.name.toLowerCase() === name.toLowerCase());
      if (match) {
        result[name] = {
          price: match.price,
          image: (match.mainImages && match.mainImages.length > 0) ? match.mainImages[0] : null,
          color: (match.colors && match.colors.length > 0) ? match.colors.join(', ') : null
        };
      }
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching products by names:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

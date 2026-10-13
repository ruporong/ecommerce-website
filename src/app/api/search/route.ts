import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryStr = (searchParams.get('q') || '').trim();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '8', 10), 1), 30);

    if (!queryStr) {
      return NextResponse.json({ success: true, products: [], total: 0 });
    }

    await connectToDatabase();

    // Escape regex special chars to prevent syntax errors
    const escaped = queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    // Find any matching active categories
    const matchingCategories = await Category.find({
      name: regex,
      is_active: true
    }).select('_id').lean();
    const categoryIds = matchingCategories.map((c: any) => c._id);

    const mongoQuery: any = {
      is_active: true,
      $or: [
        { name: regex },
        { slug: regex },
        { description: regex },
        ...(categoryIds.length > 0 ? [{ category_id: { $in: categoryIds } }] : [])
      ]
    };

    const [productsRaw, total] = await Promise.all([
      Product.find(mongoQuery)
        .populate('category_id', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Product.countDocuments(mongoQuery)
    ]);

    const products = productsRaw.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      discount_price: p.discount_price,
      stock: p.stock,
      mainImages: p.mainImages || [],
      images: p.images || [],
      image: p.mainImages?.[0] || p.images?.[0] || '',
      category: p.category_id?.name || 'Collection'
    }));

    return NextResponse.json({
      success: true,
      products,
      total
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search products', products: [], total: 0 },
      { status: 500 }
    );
  }
}

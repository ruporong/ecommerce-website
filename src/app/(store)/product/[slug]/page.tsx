import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Attribute from '@/models/Attribute';
import SizeChart from '@/models/SizeChart';
import Review from '@/models/Review';
import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  
  await connectToDatabase();
  
  Category; Attribute; SizeChart; Review; // Prevent tree-shaking
  
  const product = await Product.findOne({ slug, is_active: true })
    .populate('colors')
    .populate('category_id')
    .populate('size_chart_id')
    .lean();

  if (!product) {
    notFound();
  }

  // Convert MongoDB ObjectId to string to pass to Client Component
  
  // Normalize images
  product.allImages = [...(product.mainImages || []), ...(product.images || [])];
  
  // Normalize colors to objects with name/value
  product.colorsList = (product.colors || []).map((c: any) => ({ name: c.name, value: c.value, _id: c._id.toString() }));
  
  // Normalize sizes from size_chart
  product.sizesList = product.size_chart_id?.sizes?.map((s: any) => s.name) || [];
  
  // Normalize category
  product.categoryName = product.category_id?.name || 'Uncategorized';

  const productData = JSON.parse(JSON.stringify(product));


  // Fetch reviews
  const reviews = await Review.find({ product_id: product._id, status: 'approved' }).sort({ createdAt: -1 }).lean();
  productData.reviews = JSON.parse(JSON.stringify(reviews));
  
  // Calculate average rating
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, rev: any) => acc + (rev.rating || 5), 0);
    productData.averageRating = (sum / reviews.length).toFixed(1);
    productData.totalReviews = reviews.length;
  } else {
    productData.averageRating = "5.0"; // default if no reviews
    productData.totalReviews = 0;
  }

  // Fetch related products (same category, exclude current)
  const relatedDbProducts = await Product.find({ 
    category_id: product.category_id?._id, 
    _id: { $ne: product._id },
    is_active: true
  }).populate('category_id').limit(4).lean();
  
  // Normalize category for related products too
  for (let rp of relatedDbProducts) {
    rp.category = rp.category_id?.name || 'Uncategorized';
  }
  
  const relatedProducts = JSON.parse(JSON.stringify(relatedDbProducts));

  return <ProductDetailsClient product={productData} relatedProducts={relatedProducts} />;
}

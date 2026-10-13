import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import AdminReviewsClient from './AdminReviewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  await connectToDatabase();
  Product; // Prevent tree-shaking
  
  const reviews = await Review.find()
    .populate('product_id', 'name slug mainImages images')
    .sort({ createdAt: -1 })
    .lean();

  const products = await Product.find({ is_active: true })
    .select('name mainImages images')
    .sort({ createdAt: -1 })
    .lean();

  const reviewsData = JSON.parse(JSON.stringify(reviews));
  const productsData = JSON.parse(JSON.stringify(products));

  return (
    <div>
      <AdminReviewsClient initialReviews={reviewsData} products={productsData} />
    </div>
  );
}

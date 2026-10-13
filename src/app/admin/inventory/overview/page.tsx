export const dynamic = 'force-dynamic';

import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import InventoryOverviewClient from './InventoryOverviewClient';

export default async function InventoryOverviewPage() {
  await connectToDatabase();
  
  const products = await Product.find()
    .select('name slug stock mainImages is_active')
    .sort({ stock: 1 })
    .lean();
    
  const productsData = JSON.parse(JSON.stringify(products));

  return <InventoryOverviewClient initialProducts={productsData} />;
}

export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import InventoryFormClient from '@/components/admin/InventoryFormClient';

export default async function ManageStockPage({ searchParams }: { searchParams: Promise<{ id?: string, type?: string }> }) {
  await connectToDatabase();
  const resolvedSearchParams = await searchParams;
  const products = await Product.find().select('name stock mainImages').sort({ name: 1 }).lean();
  
  // Default type from url, fallback to 'in'
  let defaultType = 'in';
  if (resolvedSearchParams.type === 'out' || resolvedSearchParams.type === 'adjustment') {
      defaultType = resolvedSearchParams.type;
  }
  
  return <InventoryFormClient 
    products={JSON.parse(JSON.stringify(products))} 
    defaultProductId={resolvedSearchParams.id} 
    defaultType={defaultType as 'in'|'out'|'adjustment'} 
  />;
}

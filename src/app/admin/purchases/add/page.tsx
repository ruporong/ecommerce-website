export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';
import AddPurchaseClient from './AddPurchaseClient';

export default async function AddPurchasePage() {
  await connectToDatabase();
  
  const suppliers = await Supplier.find({ status: 'active' }).select('name').sort({ name: 1 }).lean();
  const products = await Product.find().select('name _id').sort({ name: 1 }).lean();
  
  return <AddPurchaseClient 
    suppliers={JSON.parse(JSON.stringify(suppliers))} 
    products={JSON.parse(JSON.stringify(products))} 
  />;
}

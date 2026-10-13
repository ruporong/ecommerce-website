export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Supplier from '@/models/Supplier';
import PurchasesClient from './PurchasesClient';

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  await connectToDatabase();
  const resolvedParams = await searchParams;
  
  const query: any = {};
  if (resolvedParams.status && resolvedParams.status !== 'all') {
    query.status = resolvedParams.status;
  }
  if (resolvedParams.q) {
    query.purchase_no = { $regex: resolvedParams.q, $options: 'i' };
  }
  
  const purchases = await Purchase.find(query)
    .populate({ path: 'supplier_id', select: 'name email phone', model: Supplier })
    .sort({ createdAt: -1 })
    .lean();
    
  return <PurchasesClient 
    initialData={JSON.parse(JSON.stringify(purchases))} 
    currentStatus={resolvedParams.status || 'all'} 
  />;
}

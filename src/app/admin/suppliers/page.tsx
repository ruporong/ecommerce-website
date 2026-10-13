export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import SuppliersClient from './SuppliersClient';

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connectToDatabase();
  const resolvedParams = await searchParams;
  
  const query: any = {};
  if (resolvedParams.q) {
    query.$or = [
      { name: { $regex: resolvedParams.q, $options: 'i' } },
      { phone: { $regex: resolvedParams.q, $options: 'i' } }
    ];
  }
  
  const suppliers = await Supplier.find(query).sort({ createdAt: -1 }).lean();
    
  return <SuppliersClient initialData={JSON.parse(JSON.stringify(suppliers))} />;
}

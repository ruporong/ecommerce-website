export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import EditSupplierClient from './EditSupplierClient';
import { notFound } from 'next/navigation';

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const resolvedParams = await params;
  
  const supplier = await Supplier.findById(resolvedParams.id).lean();
  if (!supplier) return notFound();
  
  return <EditSupplierClient supplier={JSON.parse(JSON.stringify(supplier))} />;
}

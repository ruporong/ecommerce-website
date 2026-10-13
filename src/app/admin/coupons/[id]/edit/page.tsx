export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import EditCouponClient from './EditCouponClient';
import { notFound } from 'next/navigation';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const resolvedParams = await params;
  
  const coupon = await Coupon.findById(resolvedParams.id).lean();
  
  if (!coupon) return notFound();
  
  return <EditCouponClient coupon={JSON.parse(JSON.stringify(coupon))} />;
}

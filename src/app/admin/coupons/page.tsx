export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import CouponsClient from './CouponsClient';

export default async function CouponsPage() {
  await connectToDatabase();
  
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    
  return <CouponsClient initialData={JSON.parse(JSON.stringify(coupons))} />;
}

export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import StockHistory from '@/models/StockHistory';
import Product from '@/models/Product';
import StockHistoryClient from './StockHistoryClient';

export default async function StockHistoryPage() {
  await connectToDatabase();
  
  const history = await StockHistory.find()
    .populate('product_id', 'name slug mainImages')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
    
  return <StockHistoryClient history={JSON.parse(JSON.stringify(history))} />;
}

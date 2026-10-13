import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import NewsletterClient from './NewsletterClient';

export default async function AdminNewsletterPage() {
  await connectToDatabase();
  const subscribers = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
  
  const serialized = subscribers.map(s => ({
    ...s,
    _id: s._id.toString(),
    subscribedAt: s.subscribedAt ? s.subscribedAt.toISOString() : new Date().toISOString()
  }));

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
          <p className="text-gray-500">Manage all users who subscribed via the footer newsletter.</p>
        </div>
      </div>
      <NewsletterClient subscribers={serialized} />
    </div>
  );
}

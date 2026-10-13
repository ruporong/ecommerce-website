import connectToDatabase from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import BroadcastClient from './BroadcastClient';

export default async function BroadcastPage() {
  await connectToDatabase();
  const templates = await EmailTemplate.find().sort({ createdAt: -1 }).lean();
  
  const serialized = templates.map(t => ({
    ...t,
    _id: t._id.toString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt?.toISOString()
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Broadcast Email</h1>
        <p className="text-gray-500">Send an email to all users, newsletter subscribers, or a specific email address.</p>
      </div>
      <BroadcastClient templates={serialized} />
    </div>
  );
}

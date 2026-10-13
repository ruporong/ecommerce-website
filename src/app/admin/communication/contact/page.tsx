import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import ContactClient from './ContactClient';

export default async function AdminContactPage() {
  await connectToDatabase();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
  
  // Serialize _id
  const serialized = messages.map(m => ({
    ...m,
    _id: m._id.toString(),
    createdAt: m.createdAt.toISOString()
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-500">View and manage messages sent from the storefront contact form.</p>
      </div>
      <ContactClient messages={serialized} />
    </div>
  );
}

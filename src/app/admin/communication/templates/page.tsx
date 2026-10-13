import connectToDatabase from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import TemplateClient from './TemplateClient';

export default async function AdminTemplatesPage() {
  await connectToDatabase();
  const templates = await EmailTemplate.find().sort({ createdAt: -1 }).lean();
  
  const serialized = templates.map(t => ({
    ...t,
    _id: t._id.toString(),
    createdAt: t.createdAt.toISOString()
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h1>
        <p className="text-gray-500">Create and manage reusable HTML templates for broadcast emails.</p>
      </div>
      <TemplateClient templates={serialized} />
    </div>
  );
}

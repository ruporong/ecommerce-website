export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import PushSettingsClient from './PushSettingsClient';
import BroadcastMessageClient from '@/components/admin/BroadcastMessageClient';

export default async function Page() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  
  // Convert array of settings to a key-value map
  const settingsMap = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return (
    <div className="w-full space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
        <p className="text-sm text-gray-500 mt-2">Configure Firebase credentials, automated templates, and send global broadcasts to all your customers.</p>
      </div>

      <PushSettingsClient initialData={settingsMap}>
        <BroadcastMessageClient />
      </PushSettingsClient>
    </div>
  );
}

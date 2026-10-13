import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import GenericSettingsClient from '@/components/admin/GenericSettingsClient';

export default async function MailSettingsPage() {
  await connectToDatabase();
  const settings = await Setting.find({
    key: { $in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email'] }
  }).lean();
  
  const settingsMap = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
  
  const fields: any[] = [
    { name: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'e.g. smtp.gmail.com' },
    { name: 'smtp_port', label: 'SMTP Port', type: 'text', placeholder: 'e.g. 465 or 587' },
    { name: 'smtp_user', label: 'SMTP Username', type: 'text', placeholder: 'e.g. hello@store.com' },
    { name: 'smtp_pass', label: 'SMTP Password', type: 'text', placeholder: 'e.g. App Password or Secret' },
    { name: 'smtp_from_email', label: 'From Email Address', type: 'email', placeholder: 'e.g. no-reply@store.com' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mail & SMTP Settings</h1>
        <p className="text-gray-500">Configure your email service provider to enable outbound emails like order confirmations and broadcasts.</p>
      </div>
      <GenericSettingsClient title="Mail Settings" groups={[{ title: "SMTP Configuration", fields }]} initialData={settingsMap} />
    </div>
  );
}

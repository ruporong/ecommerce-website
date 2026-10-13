export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import GenericSettingsClient from '@/components/admin/GenericSettingsClient';

export default async function Page() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  
  // Convert array of settings to a key-value map
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const groups = [
  {
    "title": "bKash Credentials",
    "columns": 2,
    "fields": [
      {
        "name": "bkash_app_key",
        "label": "App Key"
      },
      {
        "name": "bkash_app_secret",
        "label": "App Secret",
        "type": "password"
      },
      {
        "name": "bkash_username",
        "label": "Username"
      },
      {
        "name": "bkash_password",
        "label": "Password",
        "type": "password"
      },
      {
        "name": "bkash_sandbox_mode",
        "label": "Sandbox Mode",
        "type": "switch",
        "defaultValue": "true"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="bKash API integration"
      description="Configure automated bKash payment gateway."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

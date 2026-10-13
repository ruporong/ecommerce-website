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
    "title": "EPS Authentication Credentials",
    "fields": [
      {
        "name": "eps_username",
        "label": "EPS Username (Email)"
      },
      {
        "name": "eps_password",
        "label": "EPS Password",
        "type": "password"
      }
    ]
  },
  {
    "title": "EPS Merchant Configuration",
    "fields": [
      {
        "name": "eps_merchant_id",
        "label": "Merchant ID"
      },
      {
        "name": "eps_hash_key",
        "label": "Hash Key"
      },
      {
        "name": "eps_store_id",
        "label": "Store ID"
      },
      {
        "name": "eps_sandbox_mode",
        "label": "Sandbox Mode",
        "type": "switch",
        "defaultValue": "true"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="EPS API Integration"
      description="Configure EPS (Easy Payment System) automated payment gateway."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

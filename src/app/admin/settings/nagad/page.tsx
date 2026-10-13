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
      "title": "Nagad Credentials",
      "fields": [
        {
          "name": "nagad_merchant_id",
          "label": "Merchant ID"
        },
        {
          "name": "nagad_merchant_number",
          "label": "Merchant Number"
        },
        {
          "name": "nagad_public_key",
          "label": "Public Key",
          "type": "textarea"
        },
        {
          "name": "nagad_private_key",
          "label": "Private Key",
          "type": "textarea"
        },
        {
          "name": "nagad_sandbox_mode",
          "label": "Sandbox Mode",
          "type": "switch",
          "defaultValue": "true"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Nagad API Integration"
      description="Configure Nagad automated payment gateway."
      groups={groups}
      initialData={settingsMap}
    />
  );
}
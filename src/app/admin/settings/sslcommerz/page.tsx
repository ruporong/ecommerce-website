export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import GenericSettingsClient from '@/components/admin/GenericSettingsClient';

export default async function Page() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const groups = [
    {
      title: "SSLCommerz Configuration",
      fields: [
        {
          name: "sslcommerz_store_id",
          label: "Store ID"
        },
        {
          name: "sslcommerz_store_password",
          label: "Store Password",
          type: "password"
        },
        {
          name: "sslcommerz_sandbox_mode",
          label: "Sandbox Mode",
          type: "switch",
          defaultValue: "true"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="SSLCommerz Integration"
      description="Configure SSLCommerz payment gateway."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

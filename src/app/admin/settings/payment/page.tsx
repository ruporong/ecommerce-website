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
    "title": "Available Methods",
    "fields": [
      {
        "name": "payment_cod_enabled",
        "label": "Cash on Delivery",
        "type": "switch",
        "defaultValue": "true"
      },
      {
        "name": "payment_bkash_enabled",
        "label": "bKash Automated",
        "type": "switch",
        "defaultValue": "false"
      },
      {
        "name": "payment_eps_enabled",
        "label": "EPS (Easy Payment System)",
        "type": "switch",
        "defaultValue": "false"
      },
      {
        "name": "payment_sslcommerz_enabled",
        "label": "SSLCommerz",
        "type": "switch",
        "defaultValue": "false"
      },
      {
        "name": "payment_nagad_enabled",
        "label": "Nagad Automated",
        "type": "switch",
        "defaultValue": "false"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="Payment Methods"
      description="Enable or disable different payment options."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

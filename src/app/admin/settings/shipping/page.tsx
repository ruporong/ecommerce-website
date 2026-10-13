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
    "title": "Delivery Charges (BDT)",
    "fields": [
      {
        "name": "shipping_inside_dhaka",
        "label": "Inside Dhaka",
        "type": "number",
        "placeholder": "e.g. 60"
      },
      {
        "name": "shipping_outside_dhaka",
        "label": "Outside Dhaka",
        "type": "number",
        "placeholder": "e.g. 120"
      },
      {
        "name": "shipping_free_threshold",
        "label": "Free Shipping Threshold",
        "type": "number",
        "description": "Cart amount above which shipping is free."
      }
    ]
  },
  {
    "title": "Courier Services",
    "description": "Enable or disable specific courier integrations.",
    "fields": [
      {
        "name": "steadfast_active",
        "label": "Enable Steadfast Courier",
        "type": "switch",
        "defaultValue": "false"
      },
      {
        "name": "pathao_active",
        "label": "Enable Pathao Courier",
        "type": "switch",
        "defaultValue": "false"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="Shipping Configuration"
      description="Manage delivery charges and shipping rules."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

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
      "title": "Google Analytics 4",
      "columns": 1,
      "fields": [
        {
          "name": "ga4_measurement_id",
          "label": "Measurement ID",
          "placeholder": "e.g. G-XXXXXXX"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Google Analytics 4"
      description="Track user behavior and events using Google Analytics 4."
      groups={groups}
      initialData={settingsMap}
      cardLayout="stack"
    />
  );
}

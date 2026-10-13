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
      "title": "Microsoft Clarity",
      "columns": 1,
      "fields": [
        {
          "name": "clarity_project_id",
          "label": "Clarity Project ID",
          "placeholder": "e.g. 5x2y3z4w1q"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Microsoft Clarity"
      description="Analyze user behavior with heatmaps and session recordings."
      groups={groups}
      initialData={settingsMap}
      cardLayout="stack"
    />
  );
}

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
      "title": "Meta Pixel Integration",
      "columns": 1,
      "fields": [
        {
          "name": "meta_pixel_id",
          "label": "Meta Pixel ID",
          "placeholder": "e.g. 123456789012345"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Meta Pixel Integration"
      description="Configure Meta Pixel to track website visitors and page views."
      groups={groups}
      initialData={settingsMap}
      cardLayout="stack"
    />
  );
}

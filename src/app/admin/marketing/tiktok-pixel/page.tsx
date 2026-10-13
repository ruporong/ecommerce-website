export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import GenericSettingsClient from '@/components/admin/GenericSettingsClient';

export default async function Page() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  
  const settingsMap = settings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const groups = [
    {
      "title": "TikTok Pixel Integration",
      "columns": 1,
      "fields": [
        {
          "name": "tiktok_pixel_id",
          "label": "TikTok Pixel ID",
          "placeholder": "e.g. CE123456789012345678"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="TikTok Pixel Integration"
      description="Configure TikTok Pixel to track website visitors and optimize ad delivery."
      groups={groups}
      initialData={settingsMap}
      cardLayout="stack"
    />
  );
}

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
      "title": "Facebook Conversion API",
      "columns": 1,
      "fields": [
        {
          "name": "fb_capi_pixel_id",
          "label": "Pixel ID (Dataset ID)",
          "placeholder": "e.g. 123456789012345"
        },
        {
          "name": "fb_capi_token",
          "label": "Access Token",
          "type": "password",
          "placeholder": "EAAB..."
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Conversion API"
      description="Send server-side events directly to Facebook for more accurate tracking."
      groups={groups}
      initialData={settingsMap}
      cardLayout="stack"
    />
  );
}

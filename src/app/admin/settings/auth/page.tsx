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
      "title": "Google Authentication",
      "fields": [
        {
          "name": "google_auth_enabled",
          "label": "Enable Google Login",
          "type": "switch",
          "defaultValue": "false"
        },
        {
          "name": "google_client_id",
          "label": "Google Client ID"
        },
        {
          "name": "google_client_secret",
          "label": "Google Client Secret",
          "type": "textarea"
        }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Authentication Settings"
      description="Configure user login, signup and social authentication providers."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

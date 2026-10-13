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
    "title": "Steadfast Courier",
    "columns": 1,
    "fields": [
      {
        "name": "steadfast_api_key",
        "label": "API Key"
      },
      {
        "name": "steadfast_secret_key",
        "label": "Secret Key",
        "type": "password"
      }
    ]
  },
  {
    "title": "Pathao Courier",
    "columns": 1,
    "fields": [
      {
        "name": "pathao_sandbox",
        "label": "Enable Sandbox (Test Mode)",
        "type": "switch"
      },
      {
        "name": "pathao_client_id",
        "label": "Client ID"
      },
      {
        "name": "pathao_client_secret",
        "label": "Client Secret",
        "type": "password"
      },
      {
        "name": "pathao_username",
        "label": "Email/Username"
      },
      {
        "name": "pathao_password",
        "label": "Password",
        "type": "password"
      },
      {
        "name": "pathao_store_id",
        "label": "Store ID (Optional: leave blank to auto-detect)"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="Courier API Integrations"
      description="Connect and enable local shipping providers like Steadfast and Pathao."
      groups={groups}
      initialData={settingsMap}
      cardLayout="grid"
    />
  );
}

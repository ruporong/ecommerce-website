
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
    "title": "System Preferences",
    "fields": [
      {
        "name": "log_retention_days",
        "label": "Log Retention (Days)",
        "type": "number",
        "placeholder": "30"
      }
    ]
  }
] as any;

  return (
    <GenericSettingsClient 
      title="Activity Logs"
      description="View recent admin actions and system events."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

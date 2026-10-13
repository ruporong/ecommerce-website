export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import GenericSettingsClient from '@/components/admin/GenericSettingsClient';

export default async function Page() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  
  // Convert array of settings to a key-value map
  const settingsMap = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const groups = [
    {
      title: 'Store Details',
      fields: [
        { name: 'store_name', label: 'Store Name', placeholder: 'e.g. My Awesome Store' },
        { name: 'site_url', label: 'Website URL (Domain)', placeholder: 'https://www.ruporong.com', hint: 'Used for sitemap.xml, robots.txt, and SEO metadata.' },
        { name: 'store_email', label: 'Support Email', type: 'text', placeholder: 'e.g. support@store.com' },
        { name: 'store_phone', label: 'Support Phone', placeholder: 'e.g. +880 1700 000000' },
        { name: 'timezone', label: 'Timezone', type: 'select', options: [
            { label: 'Asia/Dhaka (GMT+6)', value: 'Asia/Dhaka' },
            { label: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata' },
            { label: 'Europe/London (GMT)', value: 'Europe/London' },
            { label: 'America/New_York (EST)', value: 'America/New_York' },
            { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
            { label: 'UTC', value: 'UTC' }
        ]},
        { name: 'store_address', label: 'Physical Address', type: 'textarea' },
        { name: 'map_latitude', label: 'Map Latitude', type: 'text', placeholder: 'e.g. 23.8103' },
        { name: 'map_longitude', label: 'Map Longitude', type: 'text', placeholder: 'e.g. 90.4125' }
      ]
    },
    {
      title: 'Theme Colors',
      description: 'Customize the primary and background colors of your storefront.',
      columns: 2,
      fields: [
        { name: 'primary_color', label: 'Primary Color (Charcoal)', type: 'color', defaultValue: '#1a1a1a', description: 'Used for buttons, footers, and main text.' },
        { name: 'background_color', label: 'Background Color (Warm White)', type: 'color', defaultValue: '#FAFAFA', description: 'Used for the main website background.' }
      ]
    },
    {
      title: 'Branding (Uploads)',
      columns: 3,
      fields: [
        { name: 'logo_url', label: 'Main Logo (Light Mode)', type: 'image', description: 'Used on light backgrounds.', hint: 'Recommended size: 200x80 px (Transparent PNG).' },
        { name: 'logo_dark_url', label: 'Main Logo (Dark Mode)', type: 'image', description: 'Used on dark backgrounds.', hint: 'Recommended size: 200x80 px (Transparent PNG).' },
        { name: 'favicon_url', label: 'Favicon', type: 'image', hint: 'Recommended size: 32x32 px (1:1 ratio). ICO or PNG.' }
      ]
    }
  ] as any;

  return (
    <GenericSettingsClient 
      title="Global Settings"
      description="Manage core store information and branding."
      groups={groups}
      initialData={settingsMap}
    />
  );
}

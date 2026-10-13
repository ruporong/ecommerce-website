import AdminShell from '@/components/admin/AdminShell';
import { ReactNode } from 'react';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  let storeName = 'Admin';
  try {
    await connectToDatabase();
    const storeSetting = await Setting.findOne({ key: 'store_name' }).lean();
    if (storeSetting?.value) storeName = storeSetting.value;
  } catch (error) {
    console.warn('Could not connect to database in Admin generateMetadata:', error);
  }
  return { title: `${storeName} Admin` };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let storeName = 'ÉLANE';
  let logoUrl = null;

  try {
    await connectToDatabase();
    const logoSetting = await Setting.findOne({ key: 'logo_url' }).lean();
    const nameSetting = await Setting.findOne({ key: 'store_name' }).lean();
    if (nameSetting?.value) storeName = nameSetting.value;
    if (logoSetting?.value) logoUrl = logoSetting.value;
  } catch (error) {
    console.warn('Could not connect to database in AdminLayout:', error);
  }

  return (
    <>
      <AdminShell logoUrl={logoUrl} storeName={storeName}>{children}</AdminShell>
    </>
  );
}

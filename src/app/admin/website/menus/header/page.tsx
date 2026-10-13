export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Menu from '@/models/Menu';
import MenusClient from '../MenusClient';

export default async function HeaderMenuPage() {
  await connectToDatabase();
  const menus = await Menu.find({ position: 'header' }).sort({ order: 1 }).lean();
  return <MenusClient initialData={JSON.parse(JSON.stringify(menus))} position="header" />;
}

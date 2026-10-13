export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Menu from '@/models/Menu';
import MenusClient from '../MenusClient';

export default async function FooterMenuPage() {
  await connectToDatabase();
  const menus = await Menu.find({ position: 'footer' }).sort({ column: 1, order: 1 }).lean();
  return <MenusClient initialData={JSON.parse(JSON.stringify(menus))} position="footer" />;
}

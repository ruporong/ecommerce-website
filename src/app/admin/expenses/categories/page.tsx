export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import ExpenseCategory from '@/models/ExpenseCategory';
import CategoryClient from './CategoryClient';

export default async function ExpenseCategoriesPage() {
  await connectToDatabase();
  const categories = await ExpenseCategory.find().sort({ createdAt: -1 }).lean();
  return <CategoryClient initialData={JSON.parse(JSON.stringify(categories))} />;
}

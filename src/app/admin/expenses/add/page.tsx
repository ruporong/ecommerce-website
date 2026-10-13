export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import ExpenseCategory from '@/models/ExpenseCategory';
import AddExpenseClient from './AddExpenseClient';

export default async function AddExpensePage() {
  await connectToDatabase();
  const categories = await ExpenseCategory.find({ is_active: true }).sort({ name: 1 }).lean();
  return <AddExpenseClient categories={JSON.parse(JSON.stringify(categories))} />;
}

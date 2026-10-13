export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ExpenseCategory from '@/models/ExpenseCategory';
import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connectToDatabase();
  const resolvedParams = await searchParams;
  
  const query: any = {};
  if (resolvedParams.status && resolvedParams.status !== 'all') {
    query.status = resolvedParams.status;
  }
  
  const expenses = await Expense.find(query)
    .populate({ path: 'category_id', select: 'name', model: ExpenseCategory })
    .sort({ createdAt: -1 })
    .lean();
    
  return <ExpensesClient key={resolvedParams.status || 'all'} initialData={JSON.parse(JSON.stringify(expenses))} currentStatus={resolvedParams.status || 'all'} />;
}

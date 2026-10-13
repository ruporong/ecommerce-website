import mongoose from 'mongoose';

const ExpenseHistorySchema = new mongoose.Schema(
  {
    expense_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
    action: { type: String, required: true }, // e.g., 'created', 'approved', 'paid', 'cancelled'
    notes: { type: String, default: '' },
    created_by: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.models.ExpenseHistory || mongoose.model('ExpenseHistory', ExpenseHistorySchema);

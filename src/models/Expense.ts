import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'paid', 'cancelled'], 
      default: 'pending' 
    },
    payment_method: { type: String, default: '' },
    reference_no: { type: String, default: '' },
    notes: { type: String, default: '' },
    created_by: { type: String, default: 'admin' },
    attachment: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

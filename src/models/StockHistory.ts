import mongoose from 'mongoose';

const StockHistorySchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id: { type: String, default: null }, // Optional variant identifier if applicable
    type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
    source: { type: String, required: true }, // e.g., 'order', 'cancel', 'manual', 'restock'
    quantity: { type: Number, required: true },
    previous_stock: { type: Number, required: true },
    new_stock: { type: Number, required: true },
    order_id: { type: String, default: null }, // Optional, only if source is order-related
    created_by: { type: String, default: 'system' }, // admin user id/name or 'system'
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.StockHistory || mongoose.model('StockHistory', StockHistorySchema);

import mongoose from 'mongoose';

const FlashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  discount_percentage: { type: Number, required: true },
  is_active: { type: Boolean, default: false },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.models.FlashSale || mongoose.model('FlashSale', FlashSaleSchema);

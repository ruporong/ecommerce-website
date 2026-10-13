import mongoose from 'mongoose';

const StockRequestSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  fcm_token: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.StockRequest || mongoose.model('StockRequest', StockRequestSchema);

import mongoose from 'mongoose';

const AbandonedCartSchema = new mongoose.Schema({
  session_id: { type: String, required: true },
  fcm_token: { type: String, required: false },
  items: { type: Array, default: [] },
  last_updated: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false }
});

export default mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', AbandonedCartSchema);

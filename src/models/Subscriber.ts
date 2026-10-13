import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  role: { type: String, default: 'customer' }, // 'admin' or 'customer'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);

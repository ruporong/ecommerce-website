import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['category', 'featured', 'new_arrivals', 'custom'], required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Section || mongoose.model('Section', SectionSchema);

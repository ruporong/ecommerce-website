import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  meta_title: { type: String, default: '' },
  meta_description: { type: String, default: '' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' }
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model('Page', PageSchema);

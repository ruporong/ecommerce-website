import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  type: { type: String, enum: ['home', 'auth'], default: 'home' },
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
  link: { type: String, default: null },
  button_text: { type: String, default: 'Shop Now' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

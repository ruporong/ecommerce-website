import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  position: { type: String, enum: ['header', 'footer'], required: true },
  column: { type: Number, default: 1 },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);

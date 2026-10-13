import mongoose, { Schema, Document } from 'mongoose';

export interface IAttribute extends Document {
  name: string;
  type: 'brand' | 'size' | 'color' | 'tag';
  value?: string; // For hex codes etc
  image?: string; // For brand logos
  is_active: boolean; // Active status
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['brand', 'size', 'color', 'tag'], required: true },
    value: { type: String }, // optional, e.g., for color hex code
    image: { type: String, default: null }, // optional, e.g., for brand logo
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to ensure name is unique within a specific attribute type
AttributeSchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);

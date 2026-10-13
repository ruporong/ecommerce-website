import mongoose, { Schema, Document } from 'mongoose';

export interface ISizeRow {
  name: string; // e.g., 'S', 'M', 'L'
  measurements: Record<string, string>; // e.g., { "Chest (round)": "99.1", "Length": "69.9" }
}

export interface ISizeChart extends Document {
  name: string; // e.g., 'T-Shirt', 'Panjabi'
  columns: string[]; // e.g., ['Chest (round)', 'Length', 'Sleeve']
  sizes: ISizeRow[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SizeRowSchema = new Schema({
  name: { type: String, required: true },
  measurements: { type: Map, of: String }
}, { _id: false });

const SizeChartSchema = new Schema<ISizeChart>(
  {
    name: { type: String, required: true, unique: true },
    columns: [{ type: String }],
    sizes: [SizeRowSchema],
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SizeChart || mongoose.model<ISizeChart>('SizeChart', SizeChartSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  cost_price?: number;
  discount_price?: number;
  stock: number;
  category_id: mongoose.Types.ObjectId;
  sub_category_id?: mongoose.Types.ObjectId;
  brand_id?: mongoose.Types.ObjectId;
  size_chart_id?: mongoose.Types.ObjectId;
  colors: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  mainImages: string[];
  images: string[];
  video_url?: string;
  is_active: boolean;
  faqs: { question: string; answer: string }[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    cost_price: { type: Number, default: 0 },
    discount_price: { type: Number },
    stock: { type: Number, default: 0 },
    
    // Relationships
    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    sub_category_id: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
    brand_id: { type: Schema.Types.ObjectId, ref: 'Attribute' },
    size_chart_id: { type: Schema.Types.ObjectId, ref: 'SizeChart' },
    colors: [{ type: Schema.Types.ObjectId, ref: 'Attribute' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Attribute' }],

    mainImages: { type: [String], default: [] },
    images: { type: [String], default: [] },
    video_url: { type: String },
    is_active: { type: Boolean, default: true },
    faqs: { type: [{ question: String, answer: String }], default: [] },
    
    // SEO
    meta_title: { type: String },
    meta_description: { type: String },
    meta_keywords: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

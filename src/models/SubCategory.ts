import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    meta_title: { type: String, default: null },
    meta_description: { type: String, default: null },
  },
  { timestamps: true }
);

// Ensure a subcategory slug is only unique within its parent category
SubCategorySchema.index({ slug: 1, parent_category_id: 1 }, { unique: true });

export default mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema);

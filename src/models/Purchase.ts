import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_cost: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
});

const PurchaseSchema = new mongoose.Schema(
  {
    purchase_no: { type: String, required: true, unique: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    reference_no: { type: String, default: '' },
    purchase_date: { type: Date, required: true, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'ordered', 'received', 'cancelled'], 
      default: 'pending' 
    },
    payment_status: { 
      type: String, 
      enum: ['unpaid', 'partial', 'paid'], 
      default: 'unpaid' 
    },
    items: [PurchaseItemSchema],
    total_amount: { type: Number, required: true, default: 0 },
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grand_total: { type: Number, required: true, default: 0 },
    notes: { type: String, default: '' },
    created_by: { type: String, default: 'admin' },
    // A flag to know if this purchase has already updated inventory to avoid double counting
    inventory_updated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto-generate purchase_no before saving if not present
PurchaseSchema.pre('validate', function() {
  if (!this.purchase_no) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.purchase_no = `PUR-${Date.now().toString().slice(-4)}${randomNum}`;
  }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

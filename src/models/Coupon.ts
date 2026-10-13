import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true,
      trim: true
    },
    type: { 
      type: String, 
      enum: ['percentage', 'fixed'], 
      required: true 
    },
    value: { 
      type: Number, 
      required: true,
      min: 0
    },
    min_purchase: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    max_discount: { 
      type: Number, 
      default: null // Only relevant for percentage type
    },
    start_date: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    end_date: { 
      type: Date, 
      required: true 
    },
    usage_limit: { 
      type: Number, 
      default: null // Null means unlimited
    },
    used_count: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

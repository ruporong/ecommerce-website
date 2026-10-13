import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    user_id: { type: String, default: null },
    customer_name: { type: String, required: true },
    customer_phone: { type: String },
    customer_email: { type: String, default: null },
    customer_address: { type: String, required: true },
    customer_note: { type: String, default: null },
    admin_note: { type: String, default: null },

    product_name: { type: String, required: true },
    product_details: { type: String },
    source: { type: String, default: 'web_chat' },
    status: { type: String, default: 'pending' },
    payment_method: { type: String, default: 'COD' },
    payment_status: { type: String, default: 'Pending' },
    transaction_id: { type: String, default: null },
    courier_provider: { type: String, default: null },
    courier_status: { type: String, default: null },
    courier_consignment_id: { type: String, default: null },
    fraud_score: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon_code: { type: String, default: null },
    is_restocked: { type: Boolean, default: false },
    fcm_token: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

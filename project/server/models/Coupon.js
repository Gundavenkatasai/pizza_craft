import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    min_order_value: { type: Number, default: 0 },
    usage_limit: { type: Number, default: 0 }, // 0 = unlimited
    used_count: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    pizza_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pizza',
      required: false,
      default: null
    },
    name: { type: String },
    image: { type: String }, // Store image snapshot at order time for resilience
    size: { type: String },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total_price: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order_number: { type: String, required: true, unique: true },
    total_amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'preparing', 'baking', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'refunded', 'rejected'], 
      default: 'pending' 
    },
    payment_status: { type: String, enum: ['pending', 'completed', 'paid', 'failed', 'refunded'], default: 'pending' },
    payment_method: { type: String },
    delivery_address: { type: Object },
    special_instructions: { type: String },
    estimated_delivery_time: { type: Date },
    items: { type: [OrderItemSchema], default: [] },
    timeline: [{
      status: { type: String },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

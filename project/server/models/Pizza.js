import mongoose from 'mongoose';

const PizzaSizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    diameter: { type: String },
    price_multiplier: { type: Number, default: 1 }
  },
  { _id: false }
);

const PizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    image: { type: String },
    base_price: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    discounted_price: { type: Number },
    images: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    preparation_time: { type: Number, default: 15 }, // in minutes
    calories: { type: Number },
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: -1 }, // -1 means unlimited
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    pizza_sizes: { type: [PizzaSizeSchema], default: [] }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Pizza || mongoose.model('Pizza', PizzaSchema);

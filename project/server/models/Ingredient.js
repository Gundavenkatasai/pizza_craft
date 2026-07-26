import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    unit: { type: String, enum: ['kg', 'g', 'L', 'ml', 'pieces', 'boxes'], required: true },
    current_stock: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 10 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);

import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Ensure name is unique per category
SubcategorySchema.index({ name: 1, category_id: 1 }, { unique: true });

export default mongoose.models.Subcategory || mongoose.model('Subcategory', SubcategorySchema);

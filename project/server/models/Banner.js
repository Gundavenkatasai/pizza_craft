import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: String, default: 'homepage_hero' },
    active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

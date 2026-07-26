import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'PizzaCraft' },
    info: { type: String },
    delivery_charges: { type: Number, default: 0 },
    tax_percentage: { type: Number, default: 0 },
    operating_hours: {
      monday: { open: String, close: String, is_closed: Boolean },
      tuesday: { open: String, close: String, is_closed: Boolean },
      wednesday: { open: String, close: String, is_closed: Boolean },
      thursday: { open: String, close: String, is_closed: Boolean },
      friday: { open: String, close: String, is_closed: Boolean },
      saturday: { open: String, close: String, is_closed: Boolean },
      sunday: { open: String, close: String, is_closed: Boolean }
    },
    contact_details: {
      phone: String,
      email: String,
      address: String
    },
    social_links: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './server/models/Order.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzacraft');
    const order = await Order.findOne().sort({ created_at: -1 });
    console.log('Last order total_amount:', order.total_amount);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
check();

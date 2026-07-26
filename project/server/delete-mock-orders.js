import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const result = await Order.deleteMany({ order_number: { $regex: /TEST|MOCK/i } });
    console.log(`Deleted ${result.deletedCount} mock orders`);
  } catch (err) {
    console.error('Failed to delete mock orders:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

run();

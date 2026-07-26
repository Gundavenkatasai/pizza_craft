import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find().sort({created_at: -1}).limit(2).lean();
  console.log(JSON.stringify(orders, null, 2));
  mongoose.connection.close();
}).catch(console.error);

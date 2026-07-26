import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find({}).sort({created_at: -1}).lean();
  console.log('Total Orders:', orders.length);
  orders.forEach(o => {
    console.log(`Order ${o._id}: user_id = ${o.user_id} (${typeof o.user_id}), created_at = ${o.created_at}`);
  });
  mongoose.connection.close();
}).catch(console.error);

import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find({}).lean();
  console.log('Sample order full:', JSON.stringify(orders[0], null, 2));
  mongoose.connection.close();
}).catch(console.error);

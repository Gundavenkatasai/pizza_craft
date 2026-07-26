import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find().lean();
  console.log('Total Orders:', orders.length);
  orders.forEach(o => {
    console.log('Order:', o._id, 'user_id:', o.user_id, typeof o.user_id);
    if (o.user_id && o.user_id.toString) {
      console.log('user_id string:', o.user_id.toString());
    }
  });
  mongoose.connection.close();
});

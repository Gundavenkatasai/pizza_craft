import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const userId = '6a5af8b1d664146b82137531';
    const mongoOrder = await Order.create({
      user_id: new mongoose.Types.ObjectId(userId),
      order_number: `ORD-${Date.now()}-MOCK`,
      total_amount: 15.99,
      status: 'pending',
      payment_status: 'completed',
      payment_method: 'razorpay',
      delivery_address: { street: '123 Customer St', city: 'Customer City', zipCode: '12345' },
      special_instructions: '',
      estimated_delivery_time: new Date(Date.now() + 45 * 60000),
      items: [
        {
          pizza_id: null,
          name: 'Margherita (Support Added)',
          size: 'Medium',
          quantity: 1,
          unit_price: 15.99,
          total_price: 15.99
        }
      ],
      timeline: [{ status: 'pending', timestamp: new Date(), note: 'Order manually placed for user by support' }]
    });

    console.log('Order created successfully for user:', mongoOrder._id);
  } catch (err) {
    console.error('Order creation failed:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

run();

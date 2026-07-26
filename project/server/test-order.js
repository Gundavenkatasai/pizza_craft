import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const orderNumber = `ORD-${Date.now()}-TEST`;
    const computedTotalAmount = 20.99;
    
    const pricedItems = [
      {
        pizza_id: null,
        name: 'Test Pizza',
        image: null,
        size: 'Medium',
        quantity: 1,
        unit_price: 20.99,
        total_price: 20.99
      }
    ];

    const mongoOrder = await Order.create({
      user_id: new mongoose.Types.ObjectId('6a5a2a9af67c11e5347eb542'), // Admin user
      order_number: orderNumber,
      total_amount: computedTotalAmount,
      status: 'pending',
      payment_status: 'completed',
      payment_method: 'razorpay',
      delivery_address: { street: '123 Main St', city: 'Test City', state: 'N/A', zipCode: '12345' },
      special_instructions: '',
      estimated_delivery_time: new Date(Date.now() + 45 * 60000),
      items: pricedItems,
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed by customer'
      }]
    });
    console.log('Order created successfully:', mongoOrder._id);
  } catch (err) {
    console.error('Order creation failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

run();

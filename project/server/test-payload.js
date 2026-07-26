import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const orderItems = [
      {
        id: `item-6a5a3d48f96183f33ad01a84-${Date.now()}`,
        pizza_id: '6a5a3d48f96183f33ad01a84',
        quantity: 1,
        price: 10.99,
        pizzas: {
          name: 'Margherita',
          image: '/api/placeholder/400/300'
        },
        pizza_sizes: {
          name: 'Medium'
        }
      }
    ];

    const normalizedItems = orderItems.map(it => {
      if (it.pizzas && it.pizza_sizes) {
        const unit = it.price || it.unit_price || 0;
        const qty = it.quantity || 1;
        return {
          pizza_id: it.pizza_id && mongoose.Types.ObjectId.isValid(it.pizza_id) ? new mongoose.Types.ObjectId(it.pizza_id) : null,
          name: it.pizzas.name,
          image: it.pizzas.image || it.image || null,
          size: it.pizza_sizes.name,
          quantity: qty,
          unit_price: unit,
          total_price: it.total || it.total_price || unit * qty
        };
      }
    });

    const pizzaIdsToFetch = normalizedItems.map(i => i.pizza_id).filter(Boolean);
    const uniquePizzaIds = [...new Set(pizzaIdsToFetch.map(id => id.toString()))];
    const Pizza = (await import('./models/Pizza.js')).default;
    const pizzas = await Pizza.find({ _id: { $in: uniquePizzaIds } }).lean();
    const pizzaMap = new Map(pizzas.map(p => [p._id.toString(), p]));

    const SIZE_EXTRA = { small: 75, medium: 85, large: 95, xl: 100 };
    const INGREDIENT_MODIFIER = 10;

    const pricedItems = normalizedItems.map(it => {
      if (it.pizza_id) {
        const pizzaDoc = pizzaMap.get(it.pizza_id.toString());
        if (pizzaDoc) {
          const sizeObj = (pizzaDoc.pizza_sizes || []).find(s => s.name.toLowerCase() === (it.size || '').toLowerCase());
          const multiplier = sizeObj?.price_multiplier || 1;
          const ingredientCount = (pizzaDoc.ingredients || []).length || 0;
          const sizeKey = (it.size || '').toLowerCase();
          const sizeExtra = SIZE_EXTRA[sizeKey] ?? SIZE_EXTRA['medium'];
          const computedUnit = pizzaDoc.base_price * multiplier + ingredientCount * INGREDIENT_MODIFIER + sizeExtra;
          const unit_price = Math.round(computedUnit * 100) / 100;
          const total_price = Math.round(unit_price * (it.quantity || 1) * 100) / 100;
          return { ...it, unit_price, total_price };
        }
      }
      const fallbackUnit = typeof it.unit_price === 'number' ? it.unit_price : Number(it.unit_price) || 0;
      const sizeKey = (it.size || '').toLowerCase();
      const sizeExtra = SIZE_EXTRA[sizeKey] ?? 0;
      const unit_price = Math.round((fallbackUnit + sizeExtra) * 100) / 100;
      const total_price = Math.round(unit_price * (it.quantity || 1) * 100) / 100;
      return { ...it, unit_price, total_price };
    });

    const computedTotalAmount = pricedItems.reduce((s, it) => s + (it.total_price || 0), 0);
    const orderData = { status: 'pending', estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString() };

    const mongoOrder = await Order.create({
      user_id: new mongoose.Types.ObjectId('6a5a2a9af67c11e5347eb542'),
      order_number: `ORD-${Date.now()}-TEST2`,
      total_amount: computedTotalAmount,
      status: orderData.status,
      payment_status: 'completed',
      payment_method: 'razorpay',
      delivery_address: { street: '123 Test', city: 'City', zipCode: '123' },
      special_instructions: '',
      estimated_delivery_time: new Date(orderData.estimatedDelivery),
      items: pricedItems,
      timeline: [{ status: orderData.status, timestamp: new Date(), note: 'Test' }]
    });

    console.log('Order created successfully:', mongoOrder._id);
  } catch (err) {
    console.error('Order creation failed:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

run();

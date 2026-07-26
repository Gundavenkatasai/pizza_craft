import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pizza from './models/Pizza.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const pizzas = await Pizza.find().lean();
  console.log(pizzas.map(p => ({ name: p.name, base_price: p.base_price })));
  mongoose.connection.close();
});

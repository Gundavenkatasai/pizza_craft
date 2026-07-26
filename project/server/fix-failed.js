import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema({
  name: String,
  image: String
});

const Pizza = mongoose.model('Pizza', pizzaSchema, 'pizzas');

async function fixFailedImages() {
  await mongoose.connect('mongodb://127.0.0.1:27017/pizzacraft');
  const items = await Pizza.find({ image: { $not: /^\/products\// } });
  
  for (const item of items) {
    console.log(`Fixing: ${item.name}`);
    item.image = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80';
    await item.save();
  }
  
  console.log(`Fixed ${items.length} missing local images to use a reliable Unsplash URL.`);
  await mongoose.disconnect();
  process.exit(0);
}

fixFailedImages();

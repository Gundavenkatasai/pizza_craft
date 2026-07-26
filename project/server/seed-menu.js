import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pizza from './models/Pizza.js';
import { connectMongo } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const defaultSizes = [
  { name: 'small', diameter: '10"', price_multiplier: 1 },
  { name: 'medium', diameter: '12"', price_multiplier: 1.3 },
  { name: 'large', diameter: '14"', price_multiplier: 1.6 },
  { name: 'xl', diameter: '16"', price_multiplier: 2 }
];

const generateMenu = () => {
  const items = [];
  
  // 30 Pizzas
  const pizzaNames = [
    'Margherita', 'Pepperoni', 'BBQ Chicken', 'Hawaiian', 'Meat Lovers',
    'Veggie Supreme', 'Mushroom & Truffle', 'Four Cheese', 'Spicy Diavola', 'Prosciutto & Arugula',
    'Mediterranean', 'Buffalo Chicken', 'Pesto Chicken', 'Spinach & Feta', 'Sausage & Peppers',
    'Chicken Bacon Ranch', 'Tandoori Paneer', 'Chicken Tikka', 'Margherita Extra', 'Capricciosa',
    'Quattro Stagioni', 'Napoletana', 'Ortolana', 'Boscaiola', 'Frutti di Mare',
    'Smoked Salmon', 'Gorgonzola & Fig', 'Garlic Shrimp', 'Mexican Fiesta', 'Pulled Pork'
  ];

  pizzaNames.forEach((name, i) => {
    items.push({
      name: `${name} Pizza`,
      description: `Delicious ${name} pizza crafted with premium ingredients and hand-tossed dough.`,
      image: `https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80`,
      base_price: Math.floor(Math.random() * (400 - 150) + 150),
      category: 'Pizzas',
      available: true,
      stock: -1,
      pizza_sizes: defaultSizes
    });
  });

  // 30 Sides
  const sideNames = [
    'Garlic Bread', 'Cheesy Garlic Bread', 'Mozzarella Sticks', 'Chicken Wings', 'Spicy Wings',
    'BBQ Wings', 'Onion Rings', 'French Fries', 'Peri Peri Fries', 'Cheese Fries',
    'Jalapeno Poppers', 'Potato Wedges', 'Chicken Nuggets', 'Garlic Knots', 'Bruschetta',
    'Caprese Salad', 'Caesar Salad', 'Greek Salad', 'Garden Salad', 'Chicken Strips',
    'Mac & Cheese Bites', 'Stuffed Mushrooms', 'Zucchini Sticks', 'Spinach Dip', 'Hummus & Pita',
    'Meatballs in Marinara', 'Calamari Rings', 'Garlic Parmesan Fries', 'Loaded Nachos', 'Cheese Balls'
  ];

  sideNames.forEach((name, i) => {
    items.push({
      name: name,
      description: `Crispy and tasty ${name} perfect as a side for your pizza.`,
      image: `https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80`,
      base_price: Math.floor(Math.random() * (200 - 80) + 80),
      category: 'Sides',
      available: true,
      stock: 100,
      pizza_sizes: []
    });
  });

  // 25 Beverages
  const bevNames = [
    'Cola', 'Diet Cola', 'Lemon Lime Soda', 'Orange Soda', 'Root Beer',
    'Ginger Ale', 'Iced Tea', 'Lemonade', 'Peach Iced Tea', 'Apple Juice',
    'Orange Juice', 'Mango Shake', 'Vanilla Milkshake', 'Chocolate Milkshake', 'Strawberry Milkshake',
    'Cold Coffee', 'Frappuccino', 'Sparkling Water', 'Mineral Water', 'Energy Drink',
    'Fresh Lime Soda', 'Blue Lagoon', 'Mojito (Virgin)', 'Pina Colada (Virgin)', 'Fruit Punch'
  ];

  bevNames.forEach((name, i) => {
    items.push({
      name: name,
      description: `Refreshing ${name} to quench your thirst.`,
      image: `https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800&q=80`,
      base_price: Math.floor(Math.random() * (150 - 40) + 40),
      category: 'Beverages',
      available: true,
      stock: 200,
      pizza_sizes: []
    });
  });

  // 20 Desserts
  const dessertNames = [
    'Chocolate Lava Cake', 'Tiramisu', 'Cheesecake', 'Brownie', 'Ice Cream Sundae',
    'Cannoli', 'Panna Cotta', 'Gelato', 'Apple Pie', 'Chocolate Chip Cookie',
    'Red Velvet Cake', 'Caramel Flan', 'Churros', 'Donuts', 'Macarons',
    'Fruit Tart', 'Lemon Pound Cake', 'Chocolate Mousse', 'Banana Split', 'Waffles with Syrup'
  ];

  dessertNames.forEach((name, i) => {
    items.push({
      name: name,
      description: `Sweet and delightful ${name} to finish your meal.`,
      image: `https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80`,
      base_price: Math.floor(Math.random() * (250 - 100) + 100),
      category: 'Desserts',
      available: true,
      stock: 50,
      pizza_sizes: []
    });
  });

  return items;
};

const runSeed = async () => {
  try {
    const connected = await connectMongo();
    if (!connected) {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }

    console.log('Clearing existing menu items...');
    await Pizza.deleteMany({});
    
    const items = generateMenu();
    console.log(`Inserting ${items.length} menu items...`);
    
    await Pizza.insertMany(items);
    
    console.log('Successfully seeded 100+ menu items!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu:', error);
    process.exit(1);
  }
};

runSeed();

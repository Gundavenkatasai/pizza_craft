import fs from 'fs';

const RENDER_API = 'https://pizza-craft-0aov.onrender.com/api/menu/dev/pizzas';

const defaultSizes = [
  { name: 'small', diameter: '10"', price_multiplier: 1 },
  { name: 'medium', diameter: '12"', price_multiplier: 1.3 },
  { name: 'large', diameter: '14"', price_multiplier: 1.6 },
  { name: 'xl', diameter: '16"', price_multiplier: 2 }
];

const pizzaImages = {
  'Margherita': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80',
  'Pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
  'BBQ Chicken': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'Hawaiian': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80',
  'Meat Lovers': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'Veggie Supreme': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
  'Mushroom & Truffle': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
  'Four Cheese': 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&q=80',
  'Spicy Diavola': 'https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=800&q=80',
  'Prosciutto & Arugula': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80',
  'Mediterranean': 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80',
  'Buffalo Chicken': 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80',
  'Pesto Chicken': 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800&q=80',
  'Spinach & Feta': 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=800&q=80',
  'Sausage & Peppers': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&q=80',
  'Chicken Bacon Ranch': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'Tandoori Paneer': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'Chicken Tikka': 'https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=800&q=80',
  'Margherita Extra': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80',
  'Capricciosa': 'https://images.unsplash.com/photo-1561350111-7daf4f2389f5?w=800&q=80',
  'Quattro Stagioni': 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800&q=80',
  'Napoletana': 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=800&q=80',
  'Ortolana': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
  'Boscaiola': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
  'Frutti di Mare': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'Smoked Salmon': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'Gorgonzola & Fig': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80',
  'Garlic Shrimp': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'Mexican Fiesta': 'https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=800&q=80',
  'Pulled Pork': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
};

const sideImages = {
  'Garlic Bread': 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=800&q=80',
  'Cheesy Garlic Bread': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&q=80',
  'Mozzarella Sticks': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800&q=80',
  'Chicken Wings': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80',
  'Spicy Wings': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
  'BBQ Wings': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
  'Onion Rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80',
  'French Fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80',
  'Peri Peri Fries': 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80',
  'Cheese Fries': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80',
  'Jalapeno Poppers': 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=800&q=80',
  'Potato Wedges': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80',
  'Chicken Nuggets': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
  'Garlic Knots': 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=800&q=80',
  'Bruschetta': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
  'Caprese Salad': 'https://images.unsplash.com/photo-1592417817098-8f3d69287c9d?w=800&q=80',
  'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80',
  'Greek Salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'Garden Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'Chicken Strips': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
  'Mac & Cheese Bites': 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80',
  'Stuffed Mushrooms': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'Zucchini Sticks': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'Spinach Dip': 'https://images.unsplash.com/photo-1576506295286-5cda482453a2?w=800&q=80',
  'Hummus & Pita': 'https://images.unsplash.com/photo-1541518763669-27fef04b14da?w=800&q=80',
  'Meatballs in Marinara': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
  'Calamari Rings': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  'Garlic Parmesan Fries': 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80',
  'Loaded Nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80',
  'Cheese Balls': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800&q=80'
};

const bevImages = {
  'Cola': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80',
  'Diet Cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
  'Lemon Lime Soda': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80',
  'Orange Soda': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=800&q=80',
  'Root Beer': 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800&q=80',
  'Ginger Ale': 'https://images.unsplash.com/photo-1603569283847-be29b8134cda?w=800&q=80',
  'Iced Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
  'Lemonade': 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=800&q=80',
  'Peach Iced Tea': 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80',
  'Apple Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
  'Orange Juice': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80',
  'Mango Shake': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80',
  'Vanilla Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
  'Chocolate Milkshake': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&q=80',
  'Strawberry Milkshake': 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=800&q=80',
  'Cold Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
  'Frappuccino': 'https://images.unsplash.com/photo-1592417817098-8f3d69287c9d?w=800&q=80',
  'Sparkling Water': 'https://images.unsplash.com/photo-1560023907-5f313d8750b7?w=800&q=80',
  'Mineral Water': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&q=80',
  'Energy Drink': 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80',
  'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
  'Blue Lagoon': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
  'Mojito (Virgin)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
  'Pina Colada (Virgin)': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80',
  'Fruit Punch': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'
};

const dessertImages = {
  'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
  'Cheesecake': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80',
  'Brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  'Ice Cream Sundae': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'Cannoli': 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800&q=80',
  'Panna Cotta': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'Gelato': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80',
  'Apple Pie': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&q=80',
  'Chocolate Chip Cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
  'Red Velvet Cake': 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=800&q=80',
  'Caramel Flan': 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800&q=80',
  'Churros': 'https://images.unsplash.com/photo-1624371414361-e670ef48eee9?w=800&q=80',
  'Donuts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'Macarons': 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800&q=80',
  'Fruit Tart': 'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=80',
  'Lemon Pound Cake': 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&q=80',
  'Chocolate Mousse': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&q=80',
  'Banana Split': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
  'Waffles with Syrup': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80'
};

const generateMenu = () => {
  const items = [];
  
  Object.keys(pizzaImages).forEach(name => {
    items.push({
      name: `${name} Pizza`,
      description: `Delicious ${name} pizza crafted with premium ingredients and hand-tossed dough.`,
      image: pizzaImages[name],
      base_price: Math.floor(Math.random() * (400 - 150) + 150),
      category: 'Pizzas',
      available: true,
      stock: -1,
      pizza_sizes: defaultSizes
    });
  });

  Object.keys(sideImages).forEach(name => {
    items.push({
      name: name,
      description: `Crispy and tasty ${name} perfect as a side for your pizza.`,
      image: sideImages[name],
      base_price: Math.floor(Math.random() * (200 - 80) + 80),
      category: 'Sides',
      available: true,
      stock: 100,
      pizza_sizes: []
    });
  });

  Object.keys(bevImages).forEach(name => {
    items.push({
      name: name,
      description: `Refreshing ${name} to quench your thirst.`,
      image: bevImages[name],
      base_price: Math.floor(Math.random() * (150 - 40) + 40),
      category: 'Beverages',
      available: true,
      stock: 200,
      pizza_sizes: []
    });
  });

  Object.keys(dessertImages).forEach(name => {
    items.push({
      name: name,
      description: `Sweet and delightful ${name} to finish your meal.`,
      image: dessertImages[name],
      base_price: Math.floor(Math.random() * (250 - 100) + 100),
      category: 'Desserts',
      available: true,
      stock: 50,
      pizza_sizes: []
    });
  });

  return items;
};

async function seedRemote() {
  const items = generateMenu();
  console.log(`Seeding ${items.length} items to live Render backend API...`);

  let count = 0;
  for (const item of items) {
    try {
      const res = await fetch(RENDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        count++;
        if (count % 20 === 0) console.log(`Posted ${count}/${items.length} items...`);
      }
    } catch (err) {
      console.error(`Failed to post ${item.name}: ${err.message}`);
    }
  }

  console.log(`Done! Successfully seeded ${count}/${items.length} items to live Render backend!`);
}

seedRemote();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import google from 'googlethis';
import Pizza from './models/Pizza.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function updateImages() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pizzacraft";
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Pizza.find({});
    console.log(`Found ${products.length} products to update`);

    const options = {
      page: 0, 
      safe: false, 
      additional_params: { hl: 'en' }
    };

    let count = 0;
    for (const product of products) {
      try {
        let searchQuery = product.name;
        const cat = (product.category || '').toLowerCase();
        
        if (['pizzas', 'vegetarian', 'meat', 'specialty', 'seafood'].includes(cat)) {
          searchQuery += ' pizza high quality food photography -stock';
        } else if (cat === 'desserts') {
          searchQuery += ' dessert food photography white background -stock';
        } else if (cat === 'beverages') {
          searchQuery += ' drink photography white background -stock';
        } else {
          searchQuery += ' food photography white background -stock';
        }

        const images = await google.image(searchQuery, options);
        if (images && images.length > 0) {
          // Take the first valid looking image URL
          let imageUrl = images[0].url;
          
          // Avoid certain problematic domains if possible
          for (let img of images) {
            if (img.url.includes('stock') || img.url.includes('alamy')) continue;
            imageUrl = img.url;
            break;
          }

          await Pizza.updateOne({ _id: product._id }, { $set: { image: imageUrl } });
          console.log(`Updated ${product.name} with image: ${imageUrl}`);
          count++;
        }
        
        // Wait 1 second between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        console.error(`Failed to fetch image for ${product.name}: ${err.message}`);
      }
    }

    console.log(`Successfully updated ${count} images.`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateImages();

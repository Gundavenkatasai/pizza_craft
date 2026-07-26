import mongoose from 'mongoose';
import google from 'googlethis';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory exists
const productsDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Mongoose Model matching exactly what we have
const pizzaSchema = new mongoose.Schema({
  name: String,
  description: String,
  base_price: Number,
  category: String,
  image: String,
  pizza_sizes: [{
    name: String,
    price_multiplier: Number
  }]
});

const Pizza = mongoose.model('Pizza', pizzaSchema, 'pizzas');

// Helper to download an image from a URL and save it
async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 5000, // 5 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  } catch (error) {
    return false; // Download failed (e.g. 403, 404, timeout)
  }
}

async function updateImages() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/pizzacraft');
    console.log('Connected to MongoDB');

    const items = await Pizza.find();
    console.log(`Found ${items.length} items to process.`);

    let successCount = 0;
    
    // We process sequentially so we don't get IP banned by Google
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let searchTerm = item.name;
      
      // Add context to search terms to get better food pictures
      if (item.category === 'Pizza') searchTerm += ' pizza food photography high resolution';
      else if (item.category === 'Sides') searchTerm += ' appetizer food photography high resolution';
      else if (item.category === 'Beverages') searchTerm += ' drink photography high resolution';
      else if (item.category === 'Desserts') searchTerm += ' dessert photography high resolution';

      console.log(`\n[${i+1}/${items.length}] Processing: ${item.name}`);

      try {
        const images = await google.image(searchTerm, { safe: false });
        let downloaded = false;

        // Try downloading images until one succeeds
        for (let j = 0; j < Math.min(images.length, 10); j++) { // Check up to 10 results
          const imgUrl = images[j].url;
          // Skip known problematic domains or non-jpg/png extensions
          if (imgUrl.includes('x.com') || imgUrl.includes('facebook') || imgUrl.endsWith('.svg')) continue;

          // Safe filename (e.g. "margherita-pizza.jpg")
          const safeName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const ext = imgUrl.toLowerCase().endsWith('.png') ? '.png' : '.jpg';
          const filename = `${safeName}${ext}`;
          const filepath = path.join(productsDir, filename);

          const success = await downloadImage(imgUrl, filepath);
          
          if (success) {
            console.log(`  -> Successfully downloaded: ${filename}`);
            
            // Update the DB to point to the local file
            item.image = `/products/${filename}`;
            await item.save();
            
            downloaded = true;
            successCount++;
            break; // Move to the next product
          } else {
            console.log(`  -> Failed to download from: ${imgUrl}, trying next...`);
          }
        }

        if (!downloaded) {
          console.log(`  -> Could not download ANY image for ${item.name}.`);
        }

      } catch (err) {
        console.error(`  -> Google search error for ${item.name}: ${err.message}`);
      }

      // Small delay to prevent rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`\nCompleted! Successfully downloaded and updated ${successCount}/${items.length} images.`);
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

updateImages();

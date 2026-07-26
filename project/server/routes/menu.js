import express from 'express';
import Pizza from '../models/Pizza.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all pizzas (public)
router.get('/pizzas', async (req, res) => {
  try {
    const { category, available, search } = req.query;
    
    let mongoQuery = {};
    const sort = { name: 1 };

    // Apply filters
    if (category && category !== 'all') {
      mongoQuery.category = category;
    }

    if (available !== undefined) {
      mongoQuery.available = available === 'true';
    }

    if (search) {
      mongoQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.query.admin === 'true') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Pizza.countDocuments(mongoQuery);
      const pizzas = await Pizza.find(mongoQuery).sort(sort).skip(skip).limit(limit).lean();
      
      return res.json({
        data: pizzas,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    const pizzas = await Pizza.find(mongoQuery).sort(sort).lean();
    res.json(pizzas);
  } catch (error) {
    console.error('Menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single pizza
router.get('/pizzas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await Pizza.findById(id).lean();
    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }

    res.json(pizza);
  } catch (error) {
    console.error('Get pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Dev Endpoints for Dashboard ---
router.post('/dev/pizzas', async (req, res) => {
  try {
    const { name, description, image, base_price, category, ingredients, available = true, stock, images } = req.body;
    if (!name || !description || !base_price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const defaultSizes = [
      { name: 'small', diameter: '10"', price_multiplier: 1 },
      { name: 'medium', diameter: '12"', price_multiplier: 1.3 },
      { name: 'large', diameter: '14"', price_multiplier: 1.6 },
      { name: 'xl', diameter: '16"', price_multiplier: 2 }
    ];
    const pizza = await Pizza.create({
      name, description, image: image || (images && images.length > 0 ? images[0] : ''),
      base_price, category, ingredients: ingredients || [], stock: stock || -1, available, pizza_sizes: defaultSizes
    });
    if (req.io) req.io.emit('menu-updated', { action: 'pizza-created', pizza });
    res.status(201).json(pizza);
  } catch (error) {
    console.error('Dev create pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/dev/pizzas/:id', async (req, res) => {
  try {
    const cleanUpdates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== null && value !== undefined)
    );
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, { $set: cleanUpdates }, { new: true }).lean();
    if (!pizza) return res.status(404).json({ error: 'Pizza not found' });
    if (req.io) req.io.emit('menu-updated', { action: 'pizza-updated', pizza });
    res.json(pizza);
  } catch (error) {
    console.error('Dev update pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/dev/pizzas/:id', async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id).lean();
    if (!pizza) return res.status(404).json({ error: 'Pizza not found' });
    if (req.io) req.io.emit('menu-updated', { action: 'pizza-deleted', pizzaId: req.params.id });
    res.json({ message: 'Pizza deleted successfully' });
  } catch (error) {
    console.error('Dev delete pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ------------------------------------

// Create pizza
router.post('/pizzas', authenticateToken, requireRole(['admin', 'super_admin', 'restaurant_admin', 'manager']), async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      basePrice, // Legacy frontend support
      base_price, // Admin frontend
      category,
      ingredients,
      available = true,
      subcategory,
      discounted_price,
      images,
      preparation_time,
      calories,
      sku,
      stock,
      featured,
      popular
    } = req.body;

    // Validation
    if (!name || !description || !basePrice || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const defaultSizes = [
      { name: 'small', diameter: '10"', price_multiplier: 1 },
      { name: 'medium', diameter: '12"', price_multiplier: 1.3 },
      { name: 'large', diameter: '14"', price_multiplier: 1.6 },
      { name: 'xl', diameter: '16"', price_multiplier: 2 }
    ];

    const pizza = await Pizza.create({
      name,
      description,
      image: image || (images && images.length > 0 ? images[0] : ''),
      base_price: basePrice || base_price,
      category,
      subcategory,
      discounted_price,
      images: images || (image ? [image] : []),
      ingredients: ingredients || [],
      preparation_time: preparation_time || 15,
      calories,
      sku,
      stock: stock || -1,
      featured: featured || false,
      popular: popular || false,
      available,
      rating: 0,
      review_count: 0,
      pizza_sizes: defaultSizes
    });

    // Emit to connected clients
    req.io.emit('menu-updated', { action: 'pizza-created', pizza });

    res.status(201).json(pizza);
  } catch (error) {
    console.error('Create pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pizza
router.put('/pizzas/:id', authenticateToken, requireRole(['admin', 'super_admin', 'restaurant_admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove null/undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
    );

    const pizza = await Pizza.findByIdAndUpdate(
      id,
      { $set: cleanUpdates },
      { new: true }
    ).lean();

    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }

    // Emit to connected clients
    req.io.emit('menu-updated', { action: 'pizza-updated', pizza });

    res.json(pizza);
  } catch (error) {
    console.error('Update pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pizza
router.delete('/pizzas/:id', authenticateToken, requireRole(['admin', 'super_admin', 'restaurant_admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await Pizza.findByIdAndDelete(id).lean();
    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }

    // Emit to connected clients
    req.io.emit('menu-updated', { action: 'pizza-deleted', pizzaId: id });

    res.json({ message: 'Pizza deleted successfully' });
  } catch (error) {
    console.error('Delete pizza error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Pizza.distinct('category', { category: { $ne: null } });
    const uniqueCategories = categories;
    res.json(uniqueCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
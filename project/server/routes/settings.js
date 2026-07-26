import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// GET restaurant settings (Public)
router.get('/', async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    if (!restaurant) {
      // Create a default instance if none exists
      restaurant = new Restaurant();
      await restaurant.save();
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update restaurant settings (Staff/Admin only)
router.put('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    if (!restaurant) {
      restaurant = new Restaurant(req.body);
      await restaurant.save();
      return res.json(restaurant);
    }
    
    // Update existing settings
    Object.assign(restaurant, req.body);
    await restaurant.save();
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

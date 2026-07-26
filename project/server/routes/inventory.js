import express from 'express';
import Ingredient from '../models/Ingredient.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// Get all ingredients
router.get('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ingredient
router.post('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ingredient
router.put('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ingredient
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
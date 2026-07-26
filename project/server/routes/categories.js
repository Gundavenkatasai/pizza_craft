import express from 'express';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ display_order: 1, created_at: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new category
router.post('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update category
router.put('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SUBCATEGORIES ---

// GET all subcategories
router.get('/subcategories/all', async (req, res) => {
  try {
    const subcategories = await Subcategory.find().sort({ display_order: 1, created_at: -1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET subcategories for a category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category_id: req.params.categoryId }).sort({ display_order: 1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new subcategory
router.post('/:categoryId/subcategories', authenticateToken, requireStaff, async (req, res) => {
  try {
    const subcategory = new Subcategory({ ...req.body, category_id: req.params.categoryId });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update subcategory
router.put('/subcategories/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE subcategory
router.delete('/subcategories/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

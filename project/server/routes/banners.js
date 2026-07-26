import express from 'express';
import Banner from '../models/Banner.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// GET all active banners (Public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ display_order: 1, created_at: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all banners for admin (Public for now, usually needs auth but requirement says public read)
router.get('/all', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ display_order: 1, created_at: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single banner
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new banner (Staff only)
router.post('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update banner (Staff only)
router.put('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE banner (Staff only)
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

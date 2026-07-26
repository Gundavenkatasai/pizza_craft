import express from 'express';
import Coupon from '../models/Coupon.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// GET all coupons (Staff only)
router.get('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ created_at: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single coupon (Staff only)
router.get('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new coupon (Staff only)
router.post('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update coupon (Staff only)
router.put('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE coupon (Staff only)
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validation route for public users checking a coupon code
router.get('/validate/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

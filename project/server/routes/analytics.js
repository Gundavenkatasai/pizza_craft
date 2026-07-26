import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET analytics dashboard (Admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    
    // Define time ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    
    // 1. Revenue Analytics
    // Completed orders only
    const matchCompleted = { 
      status: { $in: ['delivered', 'completed'] },
      payment_status: { $in: ['paid', 'completed'] }
    };
    
    const dailyRevenuePromise = Order.aggregate([
      { $match: { ...matchCompleted, created_at: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$total_amount' }, count: { $sum: 1 } } }
    ]);
    
    const weeklyRevenuePromise = Order.aggregate([
      { $match: { ...matchCompleted, created_at: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$total_amount' }, count: { $sum: 1 } } }
    ]);
    
    const monthlyRevenuePromise = Order.aggregate([
      { $match: { ...matchCompleted, created_at: { $gte: monthAgo } } },
      { $group: { _id: null, total: { $sum: '$total_amount' }, count: { $sum: 1 } } }
    ]);
    
    // 2. Top Products
    // Unwind items and group by pizza_id/name
    const topProductsPromise = Order.aggregate([
      { $match: matchCompleted },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: {
            pizza_id: '$items.pizza_id',
            name: '$items.name'
          }, 
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total_price' }
        } 
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
      { 
        $project: {
          _id: 0,
          pizza_id: '$_id.pizza_id',
          name: '$_id.name',
          quantitySold: 1,
          revenue: 1
        }
      }
    ]);
    
    const [daily, weekly, monthly, topProducts] = await Promise.all([
      dailyRevenuePromise,
      weeklyRevenuePromise,
      monthlyRevenuePromise,
      topProductsPromise
    ]);
    
    res.json({
      revenue: {
        daily: daily[0] || { total: 0, count: 0 },
        weekly: weekly[0] || { total: 0, count: 0 },
        monthly: monthly[0] || { total: 0, count: 0 }
      },
      topProducts
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

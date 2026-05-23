import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    })
  : null;

const getOrderItems = (body = {}) => body.items || body.cartItems || [];

const normalizeAddress = (body = {}) => {
  if (body.deliveryAddress && typeof body.deliveryAddress === 'object') {
    return body.deliveryAddress;
  }

  if (typeof body.deliveryAddress === 'string') {
    return { street: body.deliveryAddress };
  }

  if (body.customerInfo) {
    return {
      street: body.customerInfo.address || '',
      city: body.customerInfo.city || '',
      zipCode: body.customerInfo.postalCode || '',
      phone: body.customerInfo.phone || ''
    };
  }

  return {};
};

const normalizeItems = (items = []) => {
  return items.map((item) => {
    const quantity = item.quantity || 1;
    const unitPrice = item.price || item.unit_price || item.totalPrice / quantity || 0;
    const sizeName = item.size?.name || item.pizza_sizes?.name || item.size || '';
    const name = item.pizza?.name || item.pizzas?.name || item.name || 'Pizza';
    const image = item.pizza?.image || item.pizzas?.image || item.image || null;
    const pizzaId = item.pizza?.id || item.pizza_id || null;

    return {
      pizza_id: pizzaId && mongoose.Types.ObjectId.isValid(pizzaId) ? new mongoose.Types.ObjectId(pizzaId) : null,
      name,
      image,
      size: sizeName,
      quantity,
      unit_price: Number(unitPrice) || 0,
      total_price: Number(item.totalPrice || item.total_price || unitPrice * quantity || 0)
    };
  });
};

const createMongoOrder = async ({
  userId,
  items,
  totalAmount,
  paymentMethod,
  deliveryAddress,
  specialInstructions,
  paymentStatus = 'pending',
  status = 'pending'
}) => {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  return Order.create({
    user_id: userId || null,
    order_number: orderNumber,
    total_amount: totalAmount,
    status,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    delivery_address: deliveryAddress,
    special_instructions: specialInstructions || '',
    estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000),
    items
  });
};

router.get('/config', (_req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || '',
    currency: 'INR'
  });
});

router.post(['/createOrder', '/create-order'], authenticateToken, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Razorpay is not configured on the server' });
    }

    const amount = Number(req.body.amount);
    const currency = (req.body.currency || 'INR').toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || ''
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: 'Payment gateway is unreachable.' });
  }
});

router.post(['/verifyOrder', '/verify'], authenticateToken, async (req, res) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(503).json({ error: 'Razorpay secret is not configured on the server' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    res.json({
      success: true,
      orderId: razorpay_order_id,
      orderNumber: razorpay_order_id
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.post(['/placeOrderCOD', '/place-order-cod'], authenticateToken, async (req, res) => {
  try {
    const items = normalizeItems(getOrderItems(req.body));
    const deliveryAddress = normalizeAddress(req.body);
    const totalAmount = Number(req.body.totalAmount || req.body.total_amount);

    if (!items.length) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    const order = await createMongoOrder({
      userId: req.user?._id,
      items,
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : items.reduce((sum, item) => sum + (item.total_price || 0), 0),
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'confirmed',
      deliveryAddress,
      specialInstructions: req.body.specialInstructions
    });

    res.json({
      orderId: order._id.toString(),
      orderNumber: order.order_number,
      status: order.status
    });
  } catch (error) {
    console.error('COD order error:', error);
    res.status(500).json({ error: 'Failed to place COD order' });
  }
});

export default router;

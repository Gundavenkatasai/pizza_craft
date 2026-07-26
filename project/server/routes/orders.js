import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateToken, requireStaff } from '../middleware/auth.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/emailService.js';
import { emitNewOrder, emitOrderUpdate } from '../services/socketService.js';
import { recalculateOrderTotals } from '../services/orderService.js';

const router = express.Router();


// Create order (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      items, // Fix: Changed from cartItems to items to match frontend
      cartItems, // Keep both for backward compatibility
      deliveryAddress,
      specialInstructions,
      paymentMethod,
      totalAmount,
      customerEmail,
      customerInfo
    } = req.body;

    // Use items or cartItems (whichever is provided)
    const orderItems = items || cartItems;

    console.log('📝 Creating order:', { paymentMethod, totalAmount, itemCount: orderItems?.length });

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const userId = req.user?._id || req.user?.id; // Must be authenticated user

    // Create order data
    const orderData = {
      id: `temp-${Date.now()}`,
      orderNumber,
      userId,
      items: orderItems,
      deliveryAddress,
      specialInstructions,
      paymentMethod,
      totalAmount,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes
    };

    try {
      // Use centralized recalculation logic
      const { totalAmount: computedTotalAmount, pricedItems } = await recalculateOrderTotals(orderItems);

      if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
        // If client didn't supply a number, accept computed one
        // Otherwise, we will still prefer computedTotalAmount for persistence
      }
      const mongoOrder = await Order.create({
        user_id: userId,
        order_number: orderNumber,
        total_amount: computedTotalAmount,
        status: orderData.status,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        special_instructions: specialInstructions,
        estimated_delivery_time: new Date(orderData.estimatedDelivery),
        items: pricedItems,
        timeline: [{
          status: orderData.status,
          timestamp: new Date(),
          note: 'Order placed by customer'
        }]
      });
      orderData.id = mongoOrder._id.toString();

      // Emit real-time events
      try {
        // Fetch pizza details for proper image display
        const pizzaIds = pricedItems.map(it => it.pizza_id).filter(Boolean);
        const Pizza = (await import('../models/Pizza.js')).default;
        const pizzas = await Pizza.find({ _id: { $in: pizzaIds } }).select('_id name image').lean();
        const pizzaMap = new Map(pizzas.map(p => [p._id.toString(), p]));

        // Format order to match frontend structure
        const formattedOrder = {
          id: mongoOrder._id.toString(),
          user_id: userId,
          status: mongoOrder.status,
          total: mongoOrder.total_amount,
          created_at: mongoOrder.created_at,
          estimated_delivery: mongoOrder.estimated_delivery_time,
          delivery_address: mongoOrder.delivery_address || {},
          order_items: pricedItems.map(it => {
            const pizzaDetails = it.pizza_id ? pizzaMap.get(it.pizza_id.toString()) : null;
            return {
              quantity: it.quantity,
              pizzas: { 
                name: it.name, 
                image: it.image || pizzaDetails?.image || 'https://via.placeholder.com/400x300?text=Pizza'
              },
              pizza_sizes: { name: it.size }
            };
          }),
          users: {
            first_name: req.user?.first_name || customerInfo?.firstName || 'Guest',
            last_name: req.user?.last_name || customerInfo?.lastName || '',
            email: req.user?.email || customerEmail || customerInfo?.email || '',
            phone: req.user?.phone || customerInfo?.phone || ''
          }
        };

        const socketUser = {
          firstName: req.user?.first_name || customerInfo?.firstName || 'Guest',
          lastName: req.user?.last_name || customerInfo?.lastName || ''
        };

        const normalizedForSocket = {
          id: orderData.id,
          user_id: mongoOrder.user_id?.toString() || null,
          status: mongoOrder.status,
          estimated_delivery: orderData.estimatedDelivery
        };
        
        // Emit with formatted order structure
        emitNewOrder(req.io, formattedOrder, socketUser);
        emitOrderUpdate(req.io, normalizedForSocket);
      } catch (emitErr) {
        console.warn('⚠️ Socket emit failed (create):', emitErr.message);
      }
    } catch (dbError) {
      console.log('⚠️ Order persistence failed:', dbError.message);
      return res.status(500).json({ error: 'Failed to persist order' });
    }

    // Send confirmation email if customer email is provided
    try {
      if (customerEmail || customerInfo?.email) {
        const email = customerEmail || customerInfo.email;
        await sendOrderConfirmationEmail(email, orderData);
        console.log('📧 Confirmation email sent to:', email);
      }
    } catch (emailError) {
      console.error('📧 Email error (non-critical):', emailError.message);
      // Don't fail the order if email fails
    }

    console.log('🎉 Order created successfully:', orderNumber);

    res.json({
      success: true,
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      totalAmount: totalAmount,
      estimatedDelivery: orderData.estimatedDelivery
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  }
});

// Get all orders for admin
router.get('/admin', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .populate({ path: 'user_id', select: 'first_name last_name email phone' })
      .lean();

    const mapped = orders.map(o => ({
      id: o._id.toString(),
      user_id: o.user_id?._id?.toString() || null,
      status: o.status,
      total: o.total_amount,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      created_at: o.created_at,
      estimated_delivery: o.estimated_delivery_time,
      order_items: (o.items || []).map(it => ({
        quantity: it.quantity,
        pizzas: { name: it.name }
      })),
      delivery_address: o.delivery_address,
      special_instructions: o.special_instructions,
      users: o.user_id ? {
        first_name: o.user_id.first_name,
        last_name: o.user_id.last_name,
        email: o.user_id.email,
        phone: o.user_id.phone
      } : null
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20 } = req.query;

    console.log('📦 Fetching user orders for userId:', userId, 'status:', status, 'limit:', limit);

    const filter = { user_id: userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();
    console.log('📦 Found orders count for user:', orders?.length || 0);
    
    // Collect unique pizza IDs to fetch images
    const pizzaIds = orders.flatMap(o => (o.items || []).map(it => it.pizza_id).filter(Boolean));
    const uniquePizzaIds = [...new Set(pizzaIds)];
    
    // Fetch pizza details
    const Pizza = (await import('../models/Pizza.js')).default;
    const pizzas = await Pizza.find({ _id: { $in: uniquePizzaIds } }).select('_id name image').lean();
    const pizzaMap = new Map(pizzas.map(p => [p._id.toString(), p]));
    
    const mapped = orders.map(o => ({
      id: o._id.toString(),
      status: o.status,
      total: o.total_amount,
      created_at: o.created_at,
      estimated_delivery: o.estimated_delivery_time,
      delivery_address: o.delivery_address || {},
      order_items: (o.items || []).map(it => {
        const pizzaDetails = it.pizza_id ? pizzaMap.get(it.pizza_id.toString()) : null;
        return {
          quantity: it.quantity,
          pizzas: { 
            name: it.name, 
            image: it.image || pizzaDetails?.image || 'https://via.placeholder.com/400x300?text=Pizza'
          },
          pizza_sizes: { name: it.size }
        };
      })
    }));
    console.log('📦 Returning mapped user orders length:', mapped?.length || 0);
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/:orderId/status', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'baking', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'refunded', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { status },
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: `Status updated to ${status}`
          }
        }
      },
      { new: true }
    ).populate({ path: 'user_id', select: 'email first_name last_name' }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send status update email
    try {
      const email = order.user_id?.email;
      if (email) {
        await sendOrderStatusEmail(email, order);
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the request if email fails
    }

    // Emit real-time status update
    try {
      const normalizedForSocket = {
        id: order._id?.toString?.() || order.id,
        user_id: order.user_id?._id?.toString?.() || order.user_id,
        status: order.status,
        estimated_delivery: order.estimated_delivery_time || order.estimated_delivery
      };
      emitOrderUpdate(req.io, normalizedForSocket);
    } catch (emitErr) {
      console.warn('⚠️ Socket emit failed (status update):', emitErr.message);
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get single order by ID (for order details page)
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order (or is admin/staff)
    if (order.user_id?.toString() !== userId && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch pizza images for items
    const pizzaIds = (order.items || []).map(it => it.pizza_id).filter(Boolean);
    const uniquePizzaIds = [...new Set(pizzaIds)];
    const Pizza = (await import('../models/Pizza.js')).default;
    const pizzas = await Pizza.find({ _id: { $in: uniquePizzaIds } }).select('_id name image').lean();
    const pizzaMap = new Map(pizzas.map(p => [p._id.toString(), p]));

    const mapped = {
      id: order._id.toString(),
      status: order.status,
      total: order.total_amount,
      subtotal: order.total_amount * 0.85, // Rough estimate
      tax: order.total_amount * 0.1,
      delivery_fee: order.total_amount * 0.05,
      created_at: order.created_at,
      estimated_delivery: order.estimated_delivery_time,
      payment_method: order.payment_method || 'razorpay',
      payment_status: order.payment_status || 'completed',
      notes: order.special_instructions,
      delivery_address: order.delivery_address || {},
      order_items: (order.items || []).map(it => {
        const pizzaDetails = it.pizza_id ? pizzaMap.get(it.pizza_id.toString()) : null;
        return {
          id: it._id?.toString() || Math.random().toString(),
          quantity: it.quantity,
          price: it.total_price,
          pizzas: {
            name: it.name,
            image: it.image || pizzaDetails?.image || 'https://via.placeholder.com/400x300?text=Pizza'
          },
          pizza_sizes: { name: it.size }
        };
      })
    };

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

export default router;

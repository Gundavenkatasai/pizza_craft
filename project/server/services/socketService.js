export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join admin room
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    // Real-time order tracking
    socket.on('track-order', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Client tracking order: ${orderId}`);
    });

    // Stop tracking order
    socket.on('stop-tracking-order', (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`Client stopped tracking order: ${orderId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Admin-specific events
    socket.on('join-kitchen', () => {
      socket.join('kitchen');
      console.log('Kitchen staff joined');
    });

    socket.on('join-delivery', () => {
      socket.join('delivery');
      console.log('Delivery staff joined');
    });

    // Chat functionality (for customer support)
    socket.on('join-support-chat', (userId) => {
      socket.join(`support-${userId}`);
      console.log(`User ${userId} joined support chat`);
    });

    socket.on('send-message', (data) => {
      const { userId, message, isAdmin } = data;
      const chatRoom = `support-${userId}`;
      
      io.to(chatRoom).emit('new-message', {
        id: Date.now(),
        userId,
        message,
        isAdmin,
        timestamp: new Date()
      });
    });

    // Real-time inventory updates
    socket.on('subscribe-inventory', () => {
      socket.join('inventory-updates');
      console.log('Subscribed to inventory updates');
    });
  });

  return io;
};

// Helper functions to emit events
export const emitOrderUpdate = (io, order) => {
  io.emit('order-updated', order);
  io.to(`user-${order.user_id}`).emit('order-status-changed', {
    orderId: order.id,
    status: order.status,
    estimatedDelivery: order.estimated_delivery
  });
  io.to(`order-${order.id}`).emit('order-progress', order);
};

export const emitNewOrder = (io, order, user) => {
  io.to('admin-room').emit('new-order', { order, user });
  io.to('kitchen').emit('new-kitchen-order', order);
  // Emit to the user's personal room so they see the new order immediately
  if (order.user_id) {
    io.to(`user-${order.user_id}`).emit('new-order', order);
  }
};

export const emitInventoryAlert = (io, item) => {
  io.to('admin-room').emit('low-inventory-alert', item);
  io.to('inventory-updates').emit('inventory-low', item);
};
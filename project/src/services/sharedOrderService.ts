// Shared order management service for cross-website communication
export class SharedOrderService {
  private static instance: SharedOrderService;
  
  static getInstance(): SharedOrderService {
    if (!SharedOrderService.instance) {
      SharedOrderService.instance = new SharedOrderService();
    }
    return SharedOrderService.instance;
  }

  // Save order to all possible storage locations
  async saveOrder(order: any) {
    try {
      const existingOrders = this.getOrders();
      const updatedOrders = [order, ...existingOrders.filter((o: any) => o.id !== order.id)];
      
      // Save to multiple keys for compatibility
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('pizzacraft_orders', JSON.stringify(updatedOrders));
      
      // Also save with timestamp for sync detection
      localStorage.setItem('orders_timestamp', Date.now().toString());
      
      console.log('Order saved to shared storage:', order);
      
      // ALSO SAVE TO DATABASE API
      try {
        console.log('🔄 Saving order to database API...');
        const backendBase = (import.meta as any)?.env?.VITE_BACKEND_URL || (import.meta as any)?.env?.VITE_API_URL || 'https://pizza-craft-0aov.onrender.com';
        const backendUrl = `${backendBase.replace(/\/$/, '')}/api/orders`;
        const token = localStorage.getItem('token');
        const apiResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            items: order.order_items,
            deliveryAddress: order.delivery_address,
            specialInstructions: order.special_instructions,
            paymentMethod: order.payment_method || 'cod',
            totalAmount: order.total || order.total_amount,
            customerEmail: order.user_email,
            customerInfo: {
              email: order.user_email,
              fullName: order.customer_name || order.customer_full_name,
              phone: order.customer_phone
            }
          }),
        });

        if (apiResponse.ok) {
          const apiResult = await apiResponse.json();
          console.log('✅ Order saved to database successfully:', apiResult.orderNumber);
          // Update stored order with backend id if different
          if (apiResult.orderId) {
            const stored = this.getOrders();
            const updated = stored.map((o: any) => o.id === order.id ? { ...o, id: apiResult.orderId, order_number: apiResult.orderNumber, status: apiResult.status || o.status } : o);
            localStorage.setItem('orders', JSON.stringify(updated));
            localStorage.setItem('pizzacraft_orders', JSON.stringify(updated));
          }
        } else {
          console.warn('⚠️ Database API returned error:', apiResponse.status);
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to save to database API (using localStorage only):', apiError);
      }
      
      // Trigger various sync methods
      this.notifyAllSystems(updatedOrders);
      
      return order.id;
    } catch (error) {
      console.error('Error saving order:', error);
      return null;
    }
  }

  // Get orders from storage
  getOrders() {
    try {
      const orders = localStorage.getItem('orders') || localStorage.getItem('pizzacraft_orders');
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Update order status
  updateOrderStatus(orderId: string, status: string) {
    try {
      const orders = this.getOrders();
      const updatedOrders = orders.map((order: any) =>
        order.id === orderId ? { ...order, status } : order
      );
      
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('pizzacraft_orders', JSON.stringify(updatedOrders));
      localStorage.setItem('orders_timestamp', Date.now().toString());
      
      this.notifyAllSystems(updatedOrders);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Notify all systems of changes
  private notifyAllSystems(orders: any[]) {
    console.log('Main website: Notifying all systems of order changes:', orders.length);
    
    // Custom event
    window.dispatchEvent(new CustomEvent('ordersUpdated', {
      detail: orders
    }));

    // PostMessage for cross-frame communication
    window.postMessage({
      type: 'ORDERS_SYNC',
      orders: orders,
      timestamp: Date.now()
    }, '*');

    // Try to communicate with all windows/frames
    try {
      // Send to parent window
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'ORDERS_SYNC',
          orders: orders,
          timestamp: Date.now()
        }, '*');
      }

      // Send to opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'ORDERS_SYNC',
          orders: orders,
          timestamp: Date.now()
        }, '*');
      }
    } catch (error) {
      console.log('Cross-window communication error (this is normal):', error);
    }

    // Also trigger a manual storage event since they don't fire in same tab
    setTimeout(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'orders',
        newValue: JSON.stringify(orders),
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      }));
    }, 100);
  }

  // Listen for sync events
  startListening() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'ORDERS_SYNC') {
        console.log('Received orders sync:', event.data.orders);
        // Update local storage if timestamp is newer
        const currentTimestamp = parseInt(localStorage.getItem('orders_timestamp') || '0');
        if (event.data.timestamp > currentTimestamp) {
          localStorage.setItem('orders', JSON.stringify(event.data.orders));
          localStorage.setItem('pizzacraft_orders', JSON.stringify(event.data.orders));
          localStorage.setItem('orders_timestamp', event.data.timestamp.toString());
        }
      }
    });
  }
}

export const sharedOrderService = SharedOrderService.getInstance();

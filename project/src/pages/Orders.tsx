import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Eye, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useSocket from '../hooks/useSocket';
import { apiRequest } from '../utils/api';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  tracking_status?: string; // Added for compatibility with localStorage orders
  total: number;
  created_at: string;
  estimated_delivery: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  order_items: Array<{
    quantity: number;
    pizzas: {
      name: string;
      image: string;
    };
    pizza_sizes: {
      name: string;
    };
  }>;
}

const TRACKING_STEPS = [
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

function getTrackingStep(status: string) {
  // Normalize status for progress
  switch ((status || '').toLowerCase()) {
    case 'order received':
    case 'pending':
    case 'confirmed':
      return 0;
    case 'preparing':
      return 1;
    case 'out for delivery':
    case 'out-for-delivery':
      return 2;
    case 'delivered':
      return 3;
    default:
      return 0;
  }
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();
  const socket = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await apiRequest('/api/orders');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User orders fetched:', Array.isArray(data) ? data.length : 'non-array response', data);
        setOrders((Array.isArray(data) ? data : []) as Order[]);
      } else {
        console.warn('⚠️ Failed to fetch user orders, status:', response.status);
        setOrders([]);
      }
    } catch (error: unknown) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Stable socket handlers with useCallback
  const handleOrderStatusChange = useCallback((data: { orderId: string; status: string; estimatedDelivery: string }) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === data.orderId
          ? { ...order, status: data.status, estimated_delivery: data.estimatedDelivery }
          : order
      )
    );
    toast.success(`Order status updated to ${data.status.replace('-', ' ')}`);
  }, []);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  }, []);

  const handleNewOrder = useCallback((newOrder: Order) => {
    console.log('Received new-order event:', newOrder);
    setOrders(prevOrders => {
      // Check if order already exists to avoid duplicates
      const exists = prevOrders.some(order => order.id === newOrder.id);
      if (exists) {
        console.log('Order already exists, skipping duplicate');
        return prevOrders;
      }
      console.log('Adding new order to list');
      // Add new order at the beginning of the list
      return [newOrder, ...prevOrders];
    });
    toast.success('New order placed successfully!');
  }, []);

  // Initial fetch when user changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refetch when component mounts or becomes visible (handles navigation from checkout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refetching orders');
        fetchOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOrders]);

  // Join user room when socket connects
  useEffect(() => {
    if (socket && user) {
      console.log('Joining user room:', user.id);
      socket.emit('join-user-room', user.id);
    }
  }, [socket, user]);

  // Socket listeners - stable handlers prevent re-subscribing
  useEffect(() => {
    if (!socket || !user) return;

    console.log('Setting up socket listeners for orders');

    socket.on('order-status-changed', handleOrderStatusChange);
    socket.on('order-updated', handleOrderUpdate);
    socket.on('new-order', handleNewOrder);

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('order-status-changed', handleOrderStatusChange);
      socket.off('order-updated', handleOrderUpdate);
      socket.off('new-order', handleNewOrder);
    };
  }, [socket, user, handleOrderStatusChange, handleOrderUpdate, handleNewOrder]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      baking: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          {/* Filter buttons */}
          <div className="flex space-x-2">
            {['all', 'pending', 'preparing', 'out-for-delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter.replace('-', ' ')} orders`}
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet. Start with our delicious menu!"
                : `You don't have any ${filter.replace('-', ' ')} orders.`
              }
            </p>
            <Link
              to="/menu"
              className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders
              .filter(order => filter === 'all' || order.status === filter)
              .map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>



                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={() => console.log('Navigating to order details for ID:', order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Tracking Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      {TRACKING_STEPS.map((step, idx) => (
                        <span
                          key={step}
                          className={`text-xs font-medium ${getTrackingStep(order.tracking_status || order.status) >= idx ? 'text-primary-600' : 'text-gray-400'}`}
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute h-2 bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${((getTrackingStep(order.tracking_status || order.status)) / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {order.estimated_delivery
                          ? `Est. delivery: ${formatDate(order.estimated_delivery)}`
                          : 'Delivery time TBD'
                        }
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">
                        {order.delivery_address.city}, {order.delivery_address.state}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">
                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      {order.order_items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                          <img
                            src={item.pizzas.image}
                            alt={item.pizzas.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {item.pizzas.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity}x {item.pizza_sizes.name}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="text-sm text-gray-500 flex-shrink-0">
                          +{order.order_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
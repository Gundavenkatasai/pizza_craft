import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Package, CheckCircle } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { apiRequest } from '../utils/api';
import { formatCurrency } from '../utils/currency';
import { getStatusColor, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  pizzas: {
    name: string;
    image: string;
  };
  pizza_sizes: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  created_at: string;
  estimated_delivery: string;
  delivered_at?: string;
  payment_method: string;
  payment_status: string;
  notes?: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  order_items: OrderItem[];
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch real order only
      try {
        const response = await apiRequest(`/api/orders/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleOrderStatusChange = useCallback((data: { orderId: string; status: string; estimatedDelivery: string }) => {
    if (data.orderId === id) {
      setOrder(prev => prev ? {
        ...prev,
        status: data.status,
        estimated_delivery: data.estimatedDelivery
      } : null);
      toast.success(`Order status updated to ${data.status}`);
    }
  }, [id]);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    if (updatedOrder.id === id) {
      setOrder(updatedOrder);
    }
  }, [id]);

  useEffect(() => {
    console.log('OrderDetails component mounted with id:', id);
    fetchOrderDetails();
    
    // Listen for admin updates
    const handleAdminUpdate = (event: CustomEvent) => {
      const updatedOrder = event.detail;
      if (updatedOrder.id === id) {
        setOrder(updatedOrder);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'orders' && event.newValue) {
        const orders = JSON.parse(event.newValue);
        const updatedOrder = orders.find((order: any) => order.id === id);
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADMIN_ORDER_UPDATE' && event.data.orderId === id) {
        // Refresh order details when admin makes an update
        setTimeout(fetchOrderDetails, 100);
      }
    };

    // Add event listeners
    window.addEventListener('orderUpdated', handleAdminUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    
    // Setup real-time updates
    if (socket && id) {
      socket.emit('track-order', id);
      socket.on('order-status-changed', handleOrderStatusChange);
      socket.on('order-updated', handleOrderUpdate);
      
      return () => {
        socket.emit('stop-tracking-order', id);
        socket.off('order-status-changed');
        socket.off('order-updated');
        window.removeEventListener('orderUpdated', handleAdminUpdate as EventListener);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('message', handleMessage);
      };
    }

    return () => {
      window.removeEventListener('orderUpdated', handleAdminUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [id, socket, fetchOrderDetails, handleOrderStatusChange, handleOrderUpdate]);

  // Formatters are imported from utils/formatters.ts

  const getStatusSteps = () => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
      { key: 'preparing', label: 'Preparing', icon: Package },
      { key: 'baking', label: 'Baking', icon: Package },
      { key: 'ready', label: 'Ready', icon: CheckCircle },
      { key: 'out-for-delivery', label: 'Out for Delivery', icon: Package },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const statusIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      current: index === statusIndex
    }));
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">
                Order #{order.id.slice(-6)}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
              {order.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
              
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.current && order.estimated_delivery && (
                          <p className="text-sm text-gray-500">
                            Estimated: {formatDate(order.estimated_delivery)}
                          </p>
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`w-px h-8 ml-4 ${step.completed ? 'bg-primary-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <img
                      src={item.pizzas.image}
                      alt={item.pizzas.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.pizzas.name}</h3>
                      <p className="text-gray-500">Size: {item.pizza_sizes.name}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      {order.delivery_address.street}<br />
                      {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{order.delivery_address.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Estimated Delivery</p>
                    <p className="text-gray-600">
                      {order.estimated_delivery ? formatDate(order.estimated_delivery) : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium capitalize ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

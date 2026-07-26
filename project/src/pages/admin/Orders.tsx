import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI, ordersAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  estimated_delivery: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  order_items: Array<{
    quantity: number;
    pizzas: {
      name: string;
    };
  }>;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const socket = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
    
    // Setup real-time updates
    if (socket) {
      socket.emit('join-admin-room');
      socket.on('new-order', handleNewOrder);
      socket.on('order-updated', handleOrderUpdate);
      
      return () => {
        socket.off('new-order');
        socket.off('order-updated');
      };
    }
  }, [socket, statusFilter, searchTerm, fetchOrders]);

  const handleNewOrder = (data: { order: Order; user: { firstName: string; lastName: string } }) => {
    setOrders(prev => [data.order, ...prev]);
    toast.success(`New order from ${data.user.firstName} ${data.user.lastName}`);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'baking',
      baking: 'ready',
      ready: 'out-for-delivery',
      'out-for-delivery': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'baking', label: 'Baking' },
    { value: 'ready', label: 'Ready' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Order Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage all customer orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders by ID or customer email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Guest User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.users ? order.users.email : 'No email provided'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.order_items.slice(0, 2).map(item => item.pizzas.name).join(', ')}
                          {order.order_items.length > 2 && '...'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                          {order.status.replace('-', ' ')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.estimated_delivery ? formatDate(order.estimated_delivery) : 'TBD'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {getNextStatus(order.status) && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            disabled={updatingStatus === order.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={updatingStatus === order.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{selectedOrder.id.slice(-6)}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Customer Information</h4>
                    <p className="text-gray-600">
                      {selectedOrder.users ? `${selectedOrder.users.first_name} ${selectedOrder.users.last_name}` : 'Guest User'}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.users ? selectedOrder.users.email : 'No email provided'}
                    </p>
                    {selectedOrder.users?.phone && (
                      <p className="text-gray-600">{selectedOrder.users.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.pizzas.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Order Total</h4>
                    <p className="text-lg font-semibold text-primary-600">
                      {formatCurrency(selectedOrder.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
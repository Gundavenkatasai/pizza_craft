import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { Clock, MapPin, Package, CheckCircle, Truck, ChefHat, Search, Filter } from 'lucide-react';
import DebugPanel from '../components/DebugPanel';
import { getSocket } from '../lib/socket';
import { apiGet, apiPatch } from '../services/api';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      let list: any[] = [];
      try {
        const res: any = await apiGet('/api/orders/admin?limit=100');
        list = Array.isArray(res) ? res : res?.orders || res?.data || [];
      } catch (_e1) {
        try {
          const dev: any = await apiGet('/api/orders/dev/all?limit=100');
          list = dev?.orders || dev?.data || (Array.isArray(dev) ? dev : []);
        } catch (_e2) {
          try {
            const my: any = await apiGet('/api/orders?limit=100');
            list = Array.isArray(my) ? my : my?.orders || [];
          } catch (_e3) {}
        }
      }
      setOrders(list || []);
    } catch (err) {
      console.error('❌ Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    const onNewOrder = (payload: any) => {
      const order = payload?.order || payload;
      setOrders(prev => [order, ...prev.filter(o => (o._id || o.id) !== (order._id || order.id))]);
    };
    const onOrderUpdated = (order: any) => {
      setOrders(prev => prev.map(o => {
        const oid = o._id || o.id;
        const uid = order._id || order.id;
        if (oid === uid) {
          return { ...o, ...order, status: order.status };
        }
        return o;
      }));
    };
    
    const onStatusChanged = (data: any) => {
      setOrders(prev => prev.map(o => {
        const oid = (o._id || o.id)?.toString();
        const uid = data.orderId?.toString();
        if (oid === uid) {
          return { ...o, status: data.status, estimated_delivery: data.estimatedDelivery };
        }
        return o;
      }));
    };
    
    socket.on('new-order', onNewOrder);
    socket.on('order-updated', onOrderUpdated);
    socket.on('order-status-changed', onStatusChanged);

    return () => {
      socket.off('new-order', onNewOrder);
      socket.off('order-updated', onOrderUpdated);
      socket.off('order-status-changed', onStatusChanged);
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      try {
        await apiPatch(`/api/orders/${orderId}/status`, { status: newStatus });
      } catch (authErr) {
        // Fallback to dev endpoint if auth fails
        await apiPatch(`/api/orders/dev/${orderId}/status`, { status: newStatus });
      }
      setOrders(prev => prev.map(o => ((o._id || o.id) === orderId ? { ...o, status: newStatus } : o)));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'out-for-delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const searchString = searchTerm.toLowerCase();
    const orderId = (order._id || order.id || '').toString().toLowerCase();
    const customerName = (order.user?.first_name || '').toLowerCase();
    const matchesSearch = orderId.includes(searchString) || customerName.includes(searchString);
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <DebugPanel />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold pc-text tracking-tight">Order Management</h1>
          <p className="pc-text-muted mt-1">Monitor and update customer orders in real-time.</p>
        </div>
      </div>

      <div className="pc-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-elevated)]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pc-text-muted" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 pc-input focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {['all', 'pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium capitalize transition-all whitespace-nowrap ${
                  filter === status
                    ? 'pc-btn-primary'
                    : 'bg-transparent pc-text-secondary hover:bg-[var(--bg-hover)] border border-[var(--border)]'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[var(--bg)] min-h-[50vh]">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold pc-text mb-2">No orders found</h2>
              <p className="pc-text-muted">
                {filter === 'all' 
                  ? "No orders match your search criteria." 
                  : `No ${filter.replace('-', ' ')} orders found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <div key={(order._id || order.id)} className="pc-card p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Accent bar based on status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    order.status === 'delivered' ? 'bg-emerald-500' :
                    order.status === 'out-for-delivery' ? 'bg-indigo-500' :
                    order.status === 'preparing' ? 'bg-purple-500' :
                    order.status === 'confirmed' ? 'bg-blue-500' :
                    order.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="flex flex-col sm:flex-row justify-between mb-6 pl-3">
                    <div>
                      <h3 className="font-bold text-xl pc-text tracking-tight">
                        #{ (order._id || order.id || '').toString().slice(-6).toUpperCase() }
                      </h3>
                      <p className="pc-text-muted text-sm font-medium mt-1 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status.replace('-', ' ')}</span>
                      </span>
                      <p className="text-xs pc-text mt-2 font-medium bg-[var(--bg-elevated)] px-2 py-1 rounded-md">
                        {order.payment_method.toUpperCase()} • {order.payment_status}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6 pl-3">
                    <div className="pc-elevated rounded-xl p-4">
                      <h4 className="font-semibold pc-text mb-3 text-sm uppercase tracking-wider">Items</h4>
                      <div className="space-y-3">
                        {(order.items || order.order_items || []).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-start text-sm">
                            <div className="flex gap-3">
                              <span className="bg-[var(--bg-surface)] border border-[var(--border)] pc-text px-2 py-0.5 rounded-md font-semibold shadow-sm h-fit">
                                {item.quantity}x
                              </span>
                              <div>
                                <p className="font-medium pc-text">
                                  {item.name || item.pizzas?.name}
                                </p>
                                <p className="pc-text-muted text-xs mt-0.5">
                                  {item.size ? `Size: ${item.size}` : (item.pizza_sizes?.name ? `Size: ${item.pizza_sizes.name}` : '')}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold pc-text">
                              {formatCurrency((item.total_price || item.price || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center">
                        <span className="font-semibold pc-text-secondary">Total</span>
                        <span className="font-bold text-lg text-gradient">
                          {formatCurrency(order.total_amount || order.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-4 pl-3">
                    {/* Delivery Address */}
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 pc-text-muted mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium pc-text mb-0.5">{order.user?.first_name} {order.user?.last_name}</p>
                          <p className="pc-text-secondary">{order.delivery_address?.street || order.delivery_address?.addressLine1 || ''}</p>
                          <p className="pc-text-secondary">{order.delivery_address?.city}{order.delivery_address?.state ? `, ${order.delivery_address.state}` : ''} {order.delivery_address?.zipCode || ''}</p>
                          {order.delivery_address?.phone && (<p className="pc-text-secondary mt-1">📞 {order.delivery_address.phone}</p>)}
                        </div>
                      </div>
                      
                      {/* Special Instructions */}
                      {order.special_instructions && (
                        <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <h4 className="font-semibold text-amber-600 mb-1 text-xs uppercase tracking-wider">Note:</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-500 italic">"{order.special_instructions}"</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-col gap-2 justify-end shrink-0">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate((order._id || order.id), 'confirmed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate((order._id || order.id), 'preparing')}
                          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-sm font-medium shadow-lg shadow-purple-500/20"
                        >
                          Prepare
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate((order._id || order.id), 'out-for-delivery')}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20"
                        >
                          Dispatch
                        </button>
                      )}
                      {order.status === 'out-for-delivery' && (
                        <button
                          onClick={() => handleStatusUpdate((order._id || order.id), 'delivered')}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium shadow-lg shadow-emerald-500/20"
                        >
                          Deliver
                        </button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate((order._id || order.id), 'cancelled')}
                          className="px-4 py-2 pc-surface pc-text-secondary rounded-xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;

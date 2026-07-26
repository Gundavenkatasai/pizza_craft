import React, { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPatch } from '../services/api';
import { AnimatedCard } from '../components/AnimatedCard';
import { ShoppingBag, Search, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import { getSocket } from '../lib/socket';

const ALL_STATUSES = ['pending', 'confirmed', 'preparing', 'baking', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  preparing: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
  baking: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  ready: 'text-teal-300 bg-teal-400/10 border-teal-400/20',
  'out-for-delivery': 'text-purple-300 bg-purple-400/10 border-purple-400/20',
  delivered: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-300 bg-red-400/10 border-red-400/20',
};

export default function GlobalOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (statusFilter) params.set('status', statusFilter);
      const data: any[] = await apiGet(`/api/orders/admin?${params.toString()}`);
      setOrders(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { 
    fetchOrders(); 
    
    const socket = getSocket();
    
    const onNewOrder = (payload: any) => {
      const order = payload?.order || payload;
      setOrders(prev => [order, ...prev.filter(o => (o._id || o.id) !== (order._id || order.id))]);
    };
    
    const onOrderUpdated = (order: any) => {
      setOrders(prev => prev.map(o => {
        const oid = (o._id || o.id)?.toString();
        const uid = (order._id || order.id)?.toString();
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
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiPatch(`/api/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order updated to "${newStatus}"`, 'success');
      setOrders(prev => prev.map(o => (o._id || o.id)?.toString() === orderId ? { ...o, status: newStatus } : o));
    } catch (e: any) {
      showToast(e.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    const id = (o._id || o.id)?.toString() || '';
    const name = o.users ? `${o.users.first_name} ${o.users.last_name}`.toLowerCase() : '';
    const email = o.users?.email?.toLowerCase() || '';
    return id.includes(q) || name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          Global Orders <ShoppingBag className="w-8 h-8 text-primary" />
        </h1>
        <p className="text-gray-400 mt-2">View and manage all orders across the platform.</p>
      </motion.div>

      <AnimatedCard>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-gray-300 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:border-primary"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="ml-auto text-gray-500 text-sm">{filtered.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-500">No orders found.</td></tr>
              ) : filtered.map(o => {
                const id = (o._id || o.id)?.toString();
                return (
                  <tr key={id} className="hover:bg-zinc-900/30 transition-colors text-sm">
                    <td className="py-3 px-3 font-mono text-gray-400 text-xs">#{id?.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{o.users ? `${o.users.first_name} ${o.users.last_name}` : 'Guest'}</div>
                      <div className="text-gray-500 text-xs">{o.users?.email || ''}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs max-w-[160px] truncate">
                      {(o.order_items || []).map((it: any) => `${it.quantity}x ${it.pizzas?.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-3 text-white font-bold">₹{(o.total_amount || o.total || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-gray-400 capitalize">{o.payment_method || '—'}</span>
                      <div className={`text-xs mt-0.5 ${o.payment_status === 'completed' || o.payment_status === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {o.payment_status || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[o.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={o.status}
                        disabled={updatingId === id}
                        onChange={e => updateStatus(id!, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-gray-300 text-xs rounded-lg p-1.5 outline-none cursor-pointer hover:border-gray-500 transition-colors disabled:opacity-50"
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}

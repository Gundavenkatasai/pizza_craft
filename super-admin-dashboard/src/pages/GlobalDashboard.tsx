import React, { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { apiGet } from '../services/api';
import { AnimatedCard } from '../components/AnimatedCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  confirmed: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  preparing: 'bg-orange-400/20 text-orange-300 border-orange-400/30',
  baking: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  ready: 'bg-teal-400/20 text-teal-300 border-teal-400/30',
  'out-for-delivery': 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  delivered: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  cancelled: 'bg-red-400/20 text-red-300 border-red-400/30',
};

const GlobalDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);

  const [stats, setStats] = useState({
    globalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Fetch all orders via the real admin endpoint
        const orderList: any[] = await apiGet('/api/orders/admin?limit=500');
        if (!mounted) return;

        setOrders(orderList);
        calculateStats(orderList);

        // Fetch analytics from dedicated endpoint
        try {
          const analyticsRes: any = await apiGet('/api/analytics/dashboard');
          if (mounted) setAnalytics(analyticsRes);
        } catch (_) { /* analytics may fail silently */ }

        // Fetch user count
        try {
          const usersRes: any = await apiGet('/api/admin/users?limit=1');
          if (mounted) setUserCount(usersRes.total || 0);
        } catch (_) { }

      } catch (e) {
        console.error('Global dashboard load error:', e);
      }
    };

    loadData();

    const socket = getSocket();

    const handleNewOrder = (payload: any) => {
      const order = payload?.order || payload;
      setOrders(prev => {
        const id = (order._id || order.id)?.toString();
        const next = [order, ...prev.filter((p: any) => (p._id || p.id)?.toString() !== id)];
        calculateStats(next);
        return next;
      });
      addActivity(`🍕 New order placed — ₹${order.total_amount || order.total || 0}`);
    };

    const handleOrderUpdated = (order: any) => {
      const id = (order._id || order.id)?.toString();
      setOrders(prev => {
        const next = prev.map(o => (o._id || o.id)?.toString() === id ? { ...o, status: order.status } : o);
        calculateStats(next);
        return next;
      });
      addActivity(`📦 Order #${id?.slice(-6)} → ${order.status}`);
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-updated', handleOrderUpdated);
    socket.on('order-status-changed', handleOrderUpdated);

    return () => {
      mounted = false;
      socket.off('new-order', handleNewOrder);
      socket.off('order-updated', handleOrderUpdated);
      socket.off('order-status-changed', handleOrderUpdated);
    };
  }, []);

  const addActivity = (msg: string) => {
    setLiveActivity(prev => [{ id: Date.now().toString(), message: msg, time: new Date() }, ...prev].slice(0, 12));
  };

  const calculateStats = (allOrders: any[]) => {
    const delivered = allOrders.filter(o => o.status === 'delivered');
    const globalRevenue = delivered.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
    const pendingOrders = allOrders.filter(o => ['pending', 'confirmed', 'preparing', 'baking'].includes(o.status)).length;
    const uniqueUsers = new Set(allOrders.map(o => (o.user_id?._id || o.user_id)?.toString()).filter(Boolean)).size;

    setStats({ globalRevenue, totalOrders: allOrders.length, activeUsers: uniqueUsers, pendingOrders });

    // Build 7-day chart
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    setRevenueData(last7.map(date => {
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const dayRev = allOrders
        .filter(o => o.status === 'delivered')
        .filter(o => { const d = new Date(o.created_at); return d >= start && d <= end; })
        .reduce((s, o) => s + (o.total_amount || o.total || 0), 0);
      return { name: label, revenue: dayRev };
    }));
  };

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const kpis = [
    { label: 'Platform Revenue', value: `₹${stats.globalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/20 border-primary/30', sub: 'From delivered orders' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', sub: 'All time' },
    { label: 'Registered Users', value: (userCount || stats.activeUsers).toLocaleString(), icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/20 border-pink-500/30', sub: 'Platform wide' },
    { label: 'Active Orders', value: stats.pendingOrders.toLocaleString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', sub: 'In progress right now' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Global Pulse <Activity className="w-8 h-8 text-primary animate-pulse" />
          </h1>
          <p className="text-gray-400 mt-2">Real-time planetary view of all platform operations.</p>
        </div>
        {analytics && (
          <div className="hidden md:flex gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Revenue</p>
              <p className="text-xl font-bold text-white">₹{(analytics.revenue?.daily?.total || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
              <p className="text-xl font-bold text-white">₹{(analytics.revenue?.monthly?.total || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <AnimatedCard key={kpi.label} delay={i * 0.1}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">{kpi.label}</p>
                <h2 className="text-3xl font-bold text-white">{kpi.value}</h2>
                <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Live data</span>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <AnimatedCard delay={0.4} className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Revenue Trajectory</h3>
            <p className="text-sm text-gray-400">7-day delivered order revenue</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dx={-10} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Live Activity */}
        <AnimatedCard delay={0.5} className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Live Activity</h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <AnimatePresence>
              {liveActivity.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-500 text-sm">
                  Awaiting activity...
                </motion.div>
              ) : liveActivity.map(a => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, scale: 0.9, height: 0 }} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                  <div className="text-gray-300">{a.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{a.time.toLocaleTimeString()}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </AnimatedCard>
      </div>

      {/* Order Status Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={0.6}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Orders by Status</h3>
            <p className="text-sm text-gray-400">Current distribution across all orders</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <AnimatedCard delay={0.7}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Top Selling Pizzas</h3>
              <p className="text-sm text-gray-400">By units sold (delivered orders)</p>
            </div>
            <div className="space-y-3">
              {analytics.topProducts.slice(0, 6).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{p.name}</p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (p.quantitySold / (analytics.topProducts[0]?.quantitySold || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">{p.quantitySold} sold</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Recent Orders Table */}
        <AnimatedCard delay={0.8} className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            <p className="text-sm text-gray-400">Latest 10 orders across the platform</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {orders.slice(0, 10).map((o: any) => (
                  <tr key={o._id || o.id} className="text-sm hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-gray-400 text-xs">#{(o._id || o.id)?.toString().slice(-8).toUpperCase()}</td>
                    <td className="py-3 pr-4 text-white">{o.users ? `${o.users.first_name} ${o.users.last_name}` : 'Guest'}</td>
                    <td className="py-3 pr-4 text-white font-medium">₹{(o.total_amount || o.total || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[o.status] || 'bg-gray-400/10 text-gray-400 border-gray-400/20'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default GlobalDashboard;

import React, { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { apiGet } from '../services/api';
import { Order, DashboardStats } from '../types';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Users, 
  TrendingUp,
  Pizza,
  Truck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<{name: string, revenue: number}[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    let mounted = true;

    const updateOrders = (next: Order[]) => {
      if (!mounted) return;
      setOrders(next);
      calculateStats(next);
    };

    const loadInitial = async () => {
      try {
        try {
          const adminList: any[] = await apiGet('/api/orders/admin?limit=100');
          const normalized = (adminList || []).map((o: any) => ({
            id: (o._id || o.id)?.toString(),
            status: o.status,
            total: o.total_amount || o.total || 0,
            created_at: o.created_at,
            user_id: o.user_id?._id || o.user_id || ''
          }));
          updateOrders(normalized as any);
        } catch (_auth) {
          const dev: any = await apiGet('/api/orders/dev/all?limit=100');
          const list = dev?.orders || dev || [];
          const normalized = (list || []).map((o: any) => ({
            id: (o._id || o.id)?.toString(),
            status: o.status,
            total: o.total_amount || o.total || 0,
            created_at: o.created_at,
            user_id: o.user_id?._id || o.user_id || ''
          }));
          updateOrders(normalized as any);
        }
      } catch (e) {
        console.error('Dashboard load error:', (e as any)?.message || e);
        updateOrders([]);
      }
    };
    loadInitial();

    const socket = getSocket();
    const onNewOrder = (payload: any) => {
      const order = payload?.order || payload;
      const normalized: any = {
        id: (order._id || order.id)?.toString(),
        status: order.status,
        total: order.total_amount || order.total || 0,
        created_at: order.created_at,
        user_id: order.user_id?._id || order.user_id || ''
      };
      setOrders(prev => {
        const next = [normalized, ...prev.filter(p => p.id !== normalized.id)];
        calculateStats(next);
        return next;
      });
    };
    const onOrderUpdated = (order: any) => {
      setOrders(prev => {
        const id = (order._id || order.id)?.toString();
        const next = prev.map(o => o.id === id ? { ...o, status: order.status } : o);
        calculateStats(next);
        return next;
      });
    };
    const onStatusChanged = (data: any) => {
      setOrders(prev => {
        const id = data.orderId?.toString();
        const next = prev.map(o => o.id === id ? { ...o, status: data.status } : o);
        calculateStats(next);
        return next;
      });
    };
    socket.on('new-order', onNewOrder);
    socket.on('order-updated', onOrderUpdated);
    socket.on('order-status-changed', onStatusChanged);

    return () => {
      mounted = false;
      socket.off('new-order', onNewOrder);
      socket.off('order-updated', onOrderUpdated);
      socket.off('order-status-changed', onStatusChanged);
    };
  }, []);

  const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'out-for-delivery'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / completedOrders || 0 : 0;
    
    // Count unique customers
    const uniqueCustomers = new Set(orders.map(order => order.user_id)).size;

    setStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      totalCustomers: uniqueCustomers
    });

    // Calculate chart data for the last 7 days
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const newChartData = last7Days.map(date => {
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(date.setHours(0,0,0,0));
      const dayEnd = new Date(date.setHours(23,59,59,999));
      
      const dayRevenue = orders
        .filter(o => o.status === 'delivered')
        .filter(o => {
          const d = new Date(o.created_at);
          return d >= dayStart && d <= dayEnd;
        })
        .reduce((sum, o) => sum + o.total, 0);
        
      return { name: dateStr, revenue: dayRevenue };
    });

    setChartData(newChartData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold pc-text tracking-tight">Dashboard Overview</h1>
          <p className="pc-text-muted mt-1">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-bold pc-text mt-2">{stats.totalOrders}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Pending Orders</p>
              <p className="text-3xl font-bold pc-text mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-bold pc-text mt-2">{stats.completedOrders}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-bold pc-text mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Average Order</p>
              <p className="text-3xl font-bold pc-text mt-2">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="pc-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold pc-text-muted uppercase tracking-wider">Total Customers</p>
              <p className="text-3xl font-bold pc-text mt-2">{stats.totalCustomers}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="pc-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold pc-text">Revenue Overview</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-elevated)', color: 'var(--text)', boxShadow: 'var(--shadow)' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="pc-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold pc-text">Live Orders</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-600">Live</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="pc-text-muted">No active orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 pc-elevated rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold pc-text group-hover:text-orange-500 transition-colors">#{order.id.slice(-6)}</p>
                      <p className="font-semibold text-gradient">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs pc-text-muted font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </p>
                      <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

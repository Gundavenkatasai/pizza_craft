export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'super_admin';
  createdAt: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  estimated_delivery: string;
  delivered_at?: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  special_instructions?: string;
  order_items: OrderItem[];
}

export interface OrderItem {
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

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
}

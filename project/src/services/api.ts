import axios from 'axios';

const dynamicHost = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const fallbackUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'https://pizza-craft-0aov.onrender.com';
  return fallbackUrl.replace(/\/$/, '');
};

const API_BASE_URL = dynamicHost();

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('Making login request to:', `${API_BASE_URL}/api/auth/login`);
    return api.post('/auth/login', credentials);
  },
  
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    console.log('Making registration request to:', `${API_BASE_URL}/api/auth/register`);
    return api.post('/auth/register', userData);
  },
  
  getCurrentUser: () => api.get('/auth/me'),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Menu API
export const menuAPI = {
  getPizzas: (params?: {
    category?: string;
    available?: boolean;
    search?: string;
  }) => api.get('/menu/pizzas', { params }),
  
  getPizza: (id: string) => api.get(`/menu/pizzas/${id}`),
  
  createPizza: (pizzaData: { name: string; description: string; basePrice: number; category: string; image: string }) => api.post('/menu/pizzas', pizzaData),
  
  updatePizza: (id: string, updates: { name?: string; description?: string; basePrice?: number; category?: string; image?: string }) =>
    api.put(`/menu/pizzas/${id}`, updates),
  
  deletePizza: (id: string) => api.delete(`/menu/pizzas/${id}`),
  
  getCategories: () => api.get('/menu/categories'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData: {
    items: Array<{
      pizzaId: string;
      sizeId: string;
      quantity: number;
      customizations?: string[];
    }>;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethodId?: string;
    notes?: string;
  }) => api.post('/orders', orderData),
  
  getMyOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get('/orders/my-orders', { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  updateOrderStatus: (id: string, status: string, estimatedDelivery?: string) =>
    api.put(`/orders/${id}/status`, { status, estimatedDelivery }),
  
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get('/admin/orders', { params }),
  
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => api.get('/admin/users', { params }),
  
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  
  getAnalytics: (period?: string) =>
    api.get('/admin/analytics', { params: { period } }),
};

// Inventory API
export const inventoryAPI = {
  getItems: (params?: {
    type?: string;
    lowStock?: boolean;
  }) => api.get('/inventory', { params }),
  
  getItem: (id: string) => api.get(`/inventory/${id}`),
  
  createItem: (itemData: {
    name: string;
    type: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    pricePerUnit?: number;
    supplier?: string;
  }) => api.post('/inventory', itemData),
  
  updateItem: (id: string, updates: { name?: string; quantity?: number; unit?: string; supplier?: string }) =>
    api.put(`/inventory/${id}`, updates),
  
  deleteItem: (id: string) => api.delete(`/inventory/${id}`),
  
  bulkUpdate: (updates: Array<{ id: string; quantity: number }>) =>
    api.post('/inventory/bulk-update', { updates }),
  
  getTypes: () => api.get('/inventory/types'),
};

// Define types for cart items and customer information
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  [key: string]: unknown;
}

interface DeliveryAddress {
  address: string;
  city: string;
  postalCode: string;
  [key: string]: unknown;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  [key: string]: unknown;
}

// Payment API for Razorpay integration
export const paymentAPI = {
  createOrder: (amount: number, currency: string = 'INR') => 
    api.post('/payment/create-order', { amount, currency }),
  
  verifyPayment: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    cartItems: CartItem[];
    deliveryAddress: DeliveryAddress;
    specialInstructions?: string;
    customerInfo?: CustomerInfo;
  }) => api.post('/payment/verify', paymentData),
  
  createCodOrder: (orderData: {
    cartItems: CartItem[];
    deliveryAddress: DeliveryAddress;
    specialInstructions?: string;
    totalAmount: number;
    customerInfo?: CustomerInfo;
  }) => api.post('/payment/place-order-cod', orderData),
};

export default api;
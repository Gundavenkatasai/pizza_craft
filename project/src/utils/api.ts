// API Configuration for Pizza Delivery App
// Derive backend base URL. Prefer explicit env, else adapt to current host for LAN access.
const deriveBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const fallbackUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'https://pizza-craft-api.onrender.com';
  return fallbackUrl.replace(/\/$/, '');
};

export const API_CONFIG = {
  BASE_URL: deriveBaseUrl(),
  ENDPOINTS: {
    ORDERS: '/api/orders',
    AUTH: '/api/auth',
    MENU: '/api/menu',
    USERS: '/api/users',
    ADMIN: '/api/admin',
    PAYMENT: '/api/payment'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.BASE_URL || deriveBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log('Built API URL:', fullUrl);
  return fullUrl;
};

// API request helper with proper base URL
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  console.log(`Making API request to: ${url}`);
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status: ${response.status}`, { endpoint, options });
    }
    
    return response;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

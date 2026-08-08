import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { toast } from '../components/Toast';
import { apiPost } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// No mock credentials; uses real backend

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const savedUser = localStorage.getItem('adminUser');
        const token = localStorage.getItem('adminToken');
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiPost<{ token: string; user: any }>(`/api/auth/login`, { email, password });
      const u = res.user;
      console.log('✅ Login response:', { user: u, hasToken: !!res.token });
      
      if (!['super_admin', 'admin'].includes(u.role)) {
        throw new Error('Access denied. This portal is restricted to Admin & Super Admin accounts only.');
      }
      localStorage.setItem('adminToken', res.token);
      localStorage.setItem('adminUser', JSON.stringify(u));
      console.log('✅ Stored super admin token and user');
      setUser(u);
      toast.success(`Welcome back, ${u.first_name || 'Super Admin'}!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

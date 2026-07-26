import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { clearCartOnLogout } from './CartContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for existing session on app load
    const initializeAuth = async () => {
      if (!mounted) return;
      
      console.log('Initializing auth...');
      setLoading(true);
      
      try {
        const u = await authService.getCurrentUser();
        if (u && mounted) setUser(u);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: signedInUser } = await authService.login(email, password);
      const profile = await authService.getCurrentUser();
      if (profile) {
        setUser(profile);
        toast.success(`Welcome back, ${profile.firstName}!`);
        // Trigger cart reload for the newly logged-in user
        localStorage.setItem('__cart_reload__', Date.now().toString());
        localStorage.removeItem('__cart_reload__');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      await authService.signUp(userData);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear the cart BEFORE signing out so we still know the userId
      clearCartOnLogout();
      await authService.signOut();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      toast.error('Error logging out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

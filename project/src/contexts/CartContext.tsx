import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Pizza, PizzaSize, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (pizza: Pizza, size: PizzaSize, quantity: number, customizations?: string[]) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// ─── Per-user cart key ────────────────────────────────────────────────────────
// The cart is keyed by userId so different accounts never share a cart.
// Falls back to 'guest' when no user is logged in.
function getCartKey(userId?: string | null): string {
  return userId ? `cart_${userId}` : 'cart_guest';
}

// Read the current userId from the cached user object stored by authService
function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    // The user object from the backend has id or _id
    return u?.id || u?._id || null;
  } catch {
    return null;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart for the currently logged-in user (or guest)
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      const key = getCartKey(userId);
      const raw = localStorage.getItem(key);
      setItems(raw ? JSON.parse(raw) : []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save helper — always writes to the correct per-user key
  const saveCart = (newItems: CartItem[]) => {
    const userId = getCurrentUserId();
    const key = getCartKey(userId);
    localStorage.setItem(key, JSON.stringify(newItems));
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ── Listen for auth changes so cart reloads when user logs in/out ──────────
  // We use a storage event as a lightweight cross-tab / cross-context signal.
  // AuthContext will call clearCartOnLogout() (exported below) on logout.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // When authToken changes (login / logout) reload cart
      if (e.key === 'authToken' || e.key === 'token' || e.key === '__cart_reload__') {
        refreshCart();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCart]);

  const addItem = async (pizza: Pizza, size: PizzaSize, quantity: number, customizations?: string[]) => {
    try {
      const multiplier = size?.priceMultiplier || 1;
      const computedUnitPrice = pizza.basePrice * multiplier;
      const unitPrice = Math.round(computedUnitPrice * 100) / 100;
      const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

      const newItem: CartItem = {
        id: `${pizza.id}-${size?.id || 'std'}-${Date.now()}`,
        pizza,
        size,
        quantity,
        customizations: customizations || [],
        totalPrice,
      };

      const currentItems = [...items];
      const existingIndex = currentItems.findIndex(
        item =>
          item.pizza.id === pizza.id &&
          (item.size?.id || '') === (size?.id || '') &&
          JSON.stringify(item.customizations) === JSON.stringify(customizations || [])
      );

      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += quantity;
        currentItems[existingIndex].totalPrice = Math.round(unitPrice * currentItems[existingIndex].quantity * 100) / 100;
      } else {
        currentItems.push(newItem);
      }

      setItems(currentItems);
      saveCart(currentItems);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeItem = async (id: string) => {
    try {
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      saveCart(updated);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) { await removeItem(id); return; }
    try {
      const updated = items.map(item => {
        if (item.id !== id) return item;
        const multiplier = item.size?.priceMultiplier || 1;
        const unitPrice = Math.round((item.pizza.basePrice * multiplier) * 100) / 100;
        return { ...item, quantity, totalPrice: Math.round(unitPrice * quantity * 100) / 100 };
      });
      setItems(updated);
      saveCart(updated);
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      const userId = getCurrentUserId();
      const key = getCartKey(userId);
      localStorage.removeItem(key);
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, loading, refreshCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ── Called by AuthContext on logout — clears cart state immediately ───────────
export function clearCartOnLogout() {
  // Remove legacy shared cart key (old bug)
  localStorage.removeItem('guest_cart');
  // Fire a storage event so CartProvider picks it up and calls refreshCart()
  // (which will find no 'user' in localStorage and return an empty guest cart)
  localStorage.setItem('__cart_reload__', Date.now().toString());
  localStorage.removeItem('__cart_reload__');
}

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

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Using localStorage only due to database connection issues

  // Calculate totals
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart items from localStorage (temporarily bypassing database)
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      
      // Always use localStorage for now due to database connection issues
      console.log('Loading cart from localStorage');
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        console.log('Loaded cart items:', parsedCart);
        setItems(parsedCart);
      } else {
        console.log('No cart found in localStorage');
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart when component mounts
  useEffect(() => {
    console.log('Loading cart on mount');
    // Always load from localStorage for now due to database connection issues
    const localCart = localStorage.getItem('guest_cart');
    if (localCart) {
      try {
        const parsedCart = JSON.parse(localCart);
        console.log('Loaded cart from localStorage:', parsedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setItems([]);
      }
    } else {
      console.log('No cart found in localStorage');
      setItems([]);
    }
  }, []);

  const addItem = async (pizza: Pizza, size: PizzaSize, quantity: number, customizations?: string[]) => {
    try {
      console.log('Adding item to cart:', { pizza: pizza.name, size: size.name, quantity });
      const SIZE_EXTRA: Record<string, number> = {
        small: 75,
        medium: 85,
        large: 95,
        xl: 100
      };
      const INGREDIENT_MODIFIER = 10;

      const sizeKey = (size.name || '').toLowerCase();
      const sizeExtra = SIZE_EXTRA[sizeKey] ?? SIZE_EXTRA['medium'];
      const computedUnitPrice = pizza.basePrice * size.priceMultiplier + (pizza.ingredients?.length || 0) * INGREDIENT_MODIFIER + sizeExtra;
      const unitPrice = Math.round(computedUnitPrice * 100) / 100;
      const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

      console.log('Calculated prices:', { unitPrice, totalPrice });

      const newItem: CartItem = {
        id: `${pizza.id}-${size.id}-${Date.now()}`, // Generate unique ID
        pizza: pizza,
        size: size,
        quantity,
        customizations: customizations || [],
        totalPrice
      };

      console.log('New item created:', newItem);

      // For now, always use localStorage until database connection is fixed
      console.log('Saving to localStorage (database connection issue)');
      const currentItems = [...items];
      
      // Check if item already exists (same pizza, size, customizations)
      const existingItemIndex = currentItems.findIndex(item => 
        item.pizza.id === pizza.id && 
        item.size.id === size.id &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations || [])
      );

      if (existingItemIndex >= 0) {
        console.log('Updating existing item');
        // Update existing item quantity
        currentItems[existingItemIndex].quantity += quantity;
        currentItems[existingItemIndex].totalPrice = Math.round(unitPrice * currentItems[existingItemIndex].quantity * 100) / 100;
      } else {
        console.log('Adding new item');
        // Add new item
        currentItems.push(newItem);
      }

      setItems(currentItems);
      localStorage.setItem('guest_cart', JSON.stringify(currentItems));
      console.log('Item added to localStorage cart successfully');

      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeItem = async (id: string) => {
    try {
      // Always use localStorage for now due to database connection issues
      console.log('Removing item from cart:', id);
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      // Always use localStorage for now due to database connection issues
      console.log('Updating quantity for item:', id, 'to:', quantity);
      
      const SIZE_EXTRA: Record<string, number> = {
        small: 75,
        medium: 85,
        large: 95,
        xl: 100
      };
      const INGREDIENT_MODIFIER = 10;
      
      const updatedItems = items.map(item => {
        if (item.id === id) {
          // Calculate unit price with the same formula as addItem
          const sizeKey = (item.size.name || '').toLowerCase();
          const sizeExtra = SIZE_EXTRA[sizeKey] ?? SIZE_EXTRA['medium'];
          const computedUnitPrice = item.pizza.basePrice * item.size.priceMultiplier + (item.pizza.ingredients?.length || 0) * INGREDIENT_MODIFIER + sizeExtra;
          const unitPrice = Math.round(computedUnitPrice * 100) / 100;
          const newTotalPrice = Math.round(unitPrice * quantity * 100) / 100;
          
          console.log('Updated item price:', { unitPrice, quantity, newTotalPrice });
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      });
      setItems(updatedItems);
      localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      // Always use localStorage for now due to database connection issues
      console.log('Clearing cart');
      localStorage.removeItem('guest_cart');
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    loading,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

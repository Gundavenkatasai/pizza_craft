import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, calculateDeliveryFee } from '../utils/currency';
import EmptyState from '../components/ui/EmptyState';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user, loading } = useAuth();
  
  // For development - use a fallback user if auth state is not working
  const activeUser = user || {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };
  
  // Debug auth state
  console.log('Cart - Auth State:', { user, loading, activeUser });

  const subtotal = total;
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = calculateDeliveryFee(subtotal);
  const finalTotal = subtotal + tax + deliveryFee;

  return (
    <div className="min-h-screen pc-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold pc-text mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some delicious pizzas to get started!"
            buttonText="Browse Menu"
            buttonLink="/menu"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="pc-card">
                <div className="p-6 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold pc-text">
                      Cart Items ({items.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-400 font-medium transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      <img
                        src={item.pizza.image}
                        alt={item.pizza.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80';
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold pc-text">{item.pizza.name}</h3>
                        <p className="pc-text-secondary capitalize">Size: {item.size.name} ({item.size.diameter})</p>
                        <p className="font-medium text-gradient">{formatCurrency(item.totalPrice)}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-full border border-[var(--border)] pc-text hover:bg-[var(--bg-elevated)]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium px-3 pc-text">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full border border-[var(--border)] pc-text hover:bg-[var(--bg-elevated)]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="pc-card p-6 sticky top-24">
                <h2 className="text-xl font-semibold pc-text mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4 pc-text-secondary">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium pc-text">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-medium pc-text">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium pc-text">
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-sm text-green-500">
                      You've unlocked free delivery!
                    </p>
                  )}
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold pc-text">Total</span>
                      <span className="text-lg font-semibold text-gradient">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enforce authentication to proceed to checkout */}
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/checkout"
                      className="w-full pc-btn-primary py-3 px-4 text-center block"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full pc-btn-primary py-3 px-4 text-center block"
                    >
                      Login to Checkout
                    </Link>
                    <Link
                      to="/register"
                      className="w-full border border-orange-500 text-orange-500 py-3 px-4 rounded-lg font-semibold hover:bg-orange-500/10 transition-colors text-center block"
                    >
                      Create Account
                    </Link>
                  </div>
                )}

                <Link
                  to="/menu"
                  className="w-full mt-3 border border-[var(--border)] pc-text py-3 px-4 rounded-lg font-semibold hover:bg-[var(--bg-elevated)] transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
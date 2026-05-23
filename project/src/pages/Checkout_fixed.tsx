import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Clock, User } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { apiRequest } from '../utils/api';
import type { CartItem } from '../types';

// Define Razorpay interfaces
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
  open: () => void;
}

interface RazorpayStatic {
  new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayStatic;
  }
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  specialInstructions: string;
}

const getRazorpayKey = async () => {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();
  if (envKey) {
    return envKey;
  }

  const response = await apiRequest('/payment/config', { method: 'GET' });
  if (!response.ok) {
    return '';
  }

  const data = await response.json();
  return String(data?.keyId || '').trim();
};

const Checkout: React.FC = () => {
  const { items, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    specialInstructions: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // PRD Compliant: Create Razorpay order using /createOrder endpoint
  const createRazorpayOrder = async (amount: number) => {
    console.log('🚀 Creating Razorpay order for amount:', amount);
    
    const response = await apiRequest('/api/payment/createOrder', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // PRD Requirement: Specific error messages
      if (response.status === 500) {
        throw new Error(errorData.error || 'Payment gateway is unreachable.');
      } else if (response.status === 400) {
        throw new Error(errorData.error || 'Invalid payment request. Please check the amount.');
      } else {
        throw new Error('Order could not be placed. Please try again.');
      }
    }

    return response.json();
  };

  // PRD Compliant: Verify payment using /verifyOrder endpoint
  const verifyPayment = async (paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    console.log('🔍 Verifying payment:', paymentData);
    
    const response = await apiRequest('/api/payment/verifyOrder', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(errorData.error || 'Payment verification failed');
    }

    return response.json();
  };

  // PRD Compliant: Enhanced Razorpay payment flow
  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      console.log('🚀 Starting Razorpay payment process...');

      // Create order using PRD-compliant endpoint
      const orderData = await createRazorpayOrder(finalTotal);
      console.log('📝 Order data received:', orderData);

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded. Please refresh the page and try again.');
      }

      // PRD Requirement: Configure Razorpay options
      const key = await getRazorpayKey();
      if (!key) {
        throw new Error('Razorpay is not configured.');
      }

      const options = {
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PizzaCraft India',
        description: 'Pizza Order Payment',
        order_id: orderData.id,
        prefill: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#f97316'
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            console.log('✅ Payment successful, verifying...');
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            clearCart();
            navigate('/orders', {
              state: {
                message: '🎉 Payment successful! Your order has been confirmed.',
                orderId: verification.orderId,
                orderNumber: verification.orderNumber,
                paymentMethod: paymentMethod,
                totalAmount: finalTotal
              }
            });
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            alert(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please contact support.`);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('💳 Payment popup dismissed');
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('❌ Razorpay payment failed:', error);
      
      // PRD Requirement: Enhanced error messages
      if (error instanceof Error) {
        if (error.message.includes('Payment gateway is unreachable')) {
          alert('Payment gateway is unreachable. Please try another method or contact support.');
        } else if (error.message.includes('Razorpay script')) {
          alert('Payment failed to initialize. Please try another method or contact support.');
        } else if (error.message.includes('Order could not be placed')) {
          alert('Order could not be placed. Please try again later.');
        } else {
          alert(`Payment failed: ${error.message}. Please retry or select a different method.`);
        }
      } else {
        alert('Payment failed. Please retry or select a different method.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // PRD Compliant: COD flow (bypasses Razorpay)
  const handleCashOnDelivery = async () => {
    try {
      setIsProcessing(true);
      console.log('💰 Processing Cash on Delivery order...');

      // PRD Requirement: COD bypasses Razorpay and directly saves order
      const response = await apiRequest('/api/payment/placeOrderCOD', {
        method: 'POST',
        body: JSON.stringify({
          items: items, // Fix: Use 'items' instead of 'cartItems'
          deliveryAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.postalCode}`,
          specialInstructions: customerInfo.specialInstructions,
          paymentMethod: 'cod',
          totalAmount: finalTotal,
          customerEmail: customerInfo.email,
          customerInfo: customerInfo
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to place order' }));
        throw new Error(errorData.error || 'Failed to place order');
      }

      const orderData = await response.json();
      clearCart();
      
      // PRD Requirement: COD success message
      navigate('/orders', {
        state: {
          message: '🎉 Order placed successfully with Cash on Delivery. You will receive a confirmation shortly.',
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          paymentMethod: 'cod',
          totalAmount: finalTotal
        }
      });

    } catch (error) {
      console.error('❌ COD Order failed:', error);
      
      // PRD Requirement: Better COD error messages
      if (error instanceof Error) {
        if (error.message.includes('delivery address')) {
          alert('Please check your delivery address and try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          alert('Please check your internet connection and try again.');
        } else {
          alert(`COD order could not be placed: ${error.message}. Please try again later.`);
        }
      } else {
        alert('COD order could not be placed. Please try again later.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      alert('Please fill in all required fields.');
      return;
    }

    // PRD Requirement: Route to appropriate payment method
    if (paymentMethod === 'cod') {
      await handleCashOnDelivery();
    } else {
      await handleRazorpayPayment();
    }
  };

  const deliveryFee = 2.99;
  const tax = total * 0.08; // Fix: Use 'total' instead of 'totalPrice'
  const finalTotal = total + deliveryFee + tax; // Fix: Use 'total' instead of 'totalPrice'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="mr-2" size={20} />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Delivery Address
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={customerInfo.specialInstructions}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Method
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <label htmlFor="card" className="text-gray-700">💳 Card Payment (Debit/Credit)</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <label htmlFor="upi" className="text-gray-700">📱 UPI (PhonePe, GPay, Paytm)</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <label htmlFor="cod" className="text-gray-700">💰 Cash on Delivery</label>
                  </div>
                </div>
              </div>

              {/* PRD Requirement: Enhanced submit button with spinner */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  `Place Order - ${formatCurrency(finalTotal)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {/* Fix: Use 'items' instead of 'cartItems' */}
              {items.map((item: CartItem) => (
                <div key={`${item.pizza.id}-${item.size.id}`} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.pizza.name}</h3>
                    <p className="text-sm text-gray-500">{item.size.name} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="mr-2" size={16} />
                <span className="text-sm">Estimated delivery time</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">30-45 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

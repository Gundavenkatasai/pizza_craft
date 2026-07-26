import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Clock, User } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { sharedOrderService } from '../services/sharedOrderService';
import { apiRequest, deriveBaseUrl } from '../utils/api';
// All Razorpay types are imported from global declaration in types/react.d.ts

// All Razorpay interfaces are now defined in src/types/react.d.ts

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  specialInstructions: string;
}

// Move these calculations outside the component for better organization
import { calculateDeliveryFee } from '../utils/currency';
const resolveRazorpayKey = async () => {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();
  if (envKey) {
    return envKey;
  }

  try {
    const response = await apiRequest('/api/payment/config', { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      if (data?.keyId) {
        return String(data.keyId).trim();
      }
    }
  } catch (error) {
    console.warn('Unable to load Razorpay key from backend config:', error);
  }

  return '';
};

const Checkout: React.FC<{}> = (): JSX.Element => {
  const { items, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Calculate these values early so they're available throughout the component
  const deliveryFee = calculateDeliveryFee(total);
  const tax = total * 0.08;
  const finalTotal = total + deliveryFee + tax;

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

  const handleRazorpayPayment = async () => {
    if (!user) {
      alert('You must be logged in to place an order.');
      return;
    }

    try {
      setIsProcessing(true);

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => { void initializeDirectRazorpayCheckout(); };
        script.onerror = () => {
          throw new Error('Failed to load Razorpay SDK');
        };
        document.body.appendChild(script);
      } else {
        initializeDirectRazorpayCheckout();
      }
    } catch (error) {
      console.error('❌ Razorpay payment failed:', error);
      alert('Payment failed. Please retry or select a different method.');
      setIsProcessing(false);
    }
  };


  const initializeDirectRazorpayCheckout = async () => {
    try {
      // 1. Fetch Razorpay key
      const key = await resolveRazorpayKey();
      if (!key) {
        alert('Razorpay is not configured. Please set the API keys.');
        setIsProcessing(false);
        return;
      }

      // 2. Call backend to create Razorpay order
      const token = localStorage.getItem('token');
      const backendBase = deriveBaseUrl();
      const createOrderRes = await fetch(`${backendBase}/api/payment/createOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: finalTotal, currency: 'INR' })
      });

      if (!createOrderRes.ok) {
        const errorText = await createOrderRes.text();
        throw new Error(`Failed to create order on server: ${errorText}`);
      }

      const orderDataBackend = await createOrderRes.json();

      // 3. Configure Razorpay options
      const options = {
        key,
        amount: orderDataBackend.amount,
        currency: orderDataBackend.currency,
        order_id: orderDataBackend.id, // Secure order ID from backend
        name: 'Pizza Delivery App',
        description: 'Pizza Order Payment',
        handler: async function (response: any) {
          try {
            // 4. Verify payment on the backend
            const backendBase = deriveBaseUrl();
            const verifyRes = await fetch(`${backendBase}/api/payment/verifyOrder`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.text();
              throw new Error(`Payment verification failed: ${verifyErr}`);
            }

            console.log("Payment verified successfully with address:", customerInfo);
            
            // 5. Create Order Payload
            const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            const orderPayload = {
              id: mockOrderId,
              user_id: user?.id || 'mock-user',
              user_email: user?.email || customerInfo.email,
              status: 'confirmed',
              tracking_status: 'Order Received',
              total: finalTotal,
              subtotal: total,
              tax: tax,
              delivery_fee: deliveryFee,
              payment_method: 'razorpay',
              payment_status: 'paid',
              payment_id: response.razorpay_payment_id || 'mock-payment-id',
              delivery_address: {
                street: customerInfo.address,
                city: customerInfo.city,
                state: 'N/A',
                zipCode: customerInfo.postalCode,
                phone: customerInfo.phone || ''
              },
              special_instructions: customerInfo.specialInstructions || '',
              notes: customerInfo.specialInstructions || '',
              estimated_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              order_items: items.map(item => ({
                id: `item-${item.pizza.id}-${Date.now()}`,
                pizza_id: item.pizza.id,
                quantity: item.quantity,
                price: item.totalPrice / item.quantity,
                pizzas: {
                  name: item.pizza.name,
                  image: item.pizza.image || '/api/placeholder/400/300'
                },
                pizza_sizes: {
                  name: item.size.name
                }
              }))
            };
            
            // 6. Save order
            try {
              const orderId = await sharedOrderService.saveOrder(orderPayload);
              console.log('Order saved with ID:', orderId);
              
              clearCart();
              navigate('/orders', {
                state: {
                  message: '🎉 Payment successful! Your order has been confirmed.',
                  paymentMethod: 'razorpay',
                  totalAmount: finalTotal,
                  paymentId: response.razorpay_payment_id || 'mock-payment-id',
                },
              });
            } catch (orderSaveError) {
              console.error('Failed to save order:', orderSaveError);
              throw new Error('Payment succeeded but we failed to save the order to the database. Please contact support immediately with your payment ID.');
            }

          } catch (error) {
            console.error('Order processing error:', error);
            alert('Payment successful but failed to verify/process order. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          address: customerInfo.address
        },
        theme: {
          color: '#F37254'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // Only using Razorpay payment method now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      alert('Please fill in all required fields.');
      return;
    }

    // Always use Razorpay for payment
    try {
      await handleRazorpayPayment();
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('There was an error processing your payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // Remove the icon workaround and use icons directly:
  // <User ... />
  // <MapPin ... />
  // <Clock ... />
  // <CreditCard ... />

  // Rest of your component remains the same
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
                  <User size={20} />
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin size={20} />
                  Delivery Address
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.postalCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={customerInfo.specialInstructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="E.g., Ring the doorbell, leave at the door, etc."
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard size={20} />
                  Payment Method
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      defaultChecked={true}
                      readOnly
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span>Razorpay (Credit/Debit/UPI)</span>
                  </label>
                </div>
              </div>

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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.pizza.name}
                      {item.size && <span className="text-sm text-gray-500"> ({item.size.name})</span>}
                    </span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal, Delivery, Tax */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center text-gray-700">
                  <Clock size={20} />
                  <span>Estimated delivery time: 30-45 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

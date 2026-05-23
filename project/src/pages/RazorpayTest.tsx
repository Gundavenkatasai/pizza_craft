import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // adjust path if needed
import { toast } from 'react-hot-toast';
import { RazorpayResponse, RazorpayError } from '../types/react';

const RazorpayTest: React.FC = () => {
  const [amount, setAmount] = useState(500);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy user and items for demo
  const user = { email: 'test@example.com' };
  const selectedItems = [{ name: 'Pizza', qty: 1, price: amount }];
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || '';

  // Simplified script loading without timeout
  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log('Razorpay script already loaded');
        return resolve(true);
      }
      
      console.log('Loading Razorpay script from:', src);
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = "anonymous"; // Add CORS support
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      
      script.onerror = (e) => {
        console.error('Failed to load Razorpay script:', e);
        resolve(false);
      };
      
      document.head.appendChild(script); // Add to head instead of body
    });
  };

  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    
    // Check if Razorpay is available from the global script
    if (!window.Razorpay) {
      console.log('Razorpay not available, trying to load script');
      
      // Try to load script dynamically as fallback
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res || !window.Razorpay) {
        const errorMsg = 'Razorpay SDK failed to load. Are you online?';
        console.error(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
    }
    
    console.log('Razorpay is available for use');

    if (!razorpayKey) {
      const errorMsg = 'Razorpay is not configured. Set VITE_RAZORPAY_KEY_ID in the frontend environment.';
      console.error(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    // Configure Razorpay options
    const options = {
      key: razorpayKey,
      amount: amount * 100,
      currency: 'INR',
      name: 'Pizza Delivery App',
      description: 'Pizza Order',
      order_id: undefined, // Add this line to provide the optional parameter
      handler: async function (response: RazorpayResponse) {
        // Save order to Supabase
        const { error } = await supabase
          .from('orders')
          .insert([{
            user_email: user.email,
            payment_id: response.razorpay_payment_id,
            payment_method: 'Razorpay',
            status: 'Confirmed',
            items: selectedItems,
            total: amount,
            tracking_status: 'Order Received',
          }]);
        if (error) toast.error('Order save failed!');
        else toast.success('Payment Success and Order Saved!');
        setIsLoading(false);
      },
      prefill: {
        email: user.email,
      },
      theme: { color: '#F37254' }
    };

    // Initialize Razorpay
    const rzp = new window.Razorpay(options);
    
    // Handle payment failures
    rzp.on('payment.failed', function(response: RazorpayError) {
      console.error('Payment failed:', response.error);
      toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
      setIsLoading(false);
    });
    
    // Open Razorpay payment form
    rzp.open();
  };

  const handleCashOnDelivery = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('orders')
      .insert([{
        user_email: user.email,
        payment_method: 'Cash on Delivery',
        status: 'Pending',
        items: selectedItems,
        total: amount,
        tracking_status: 'Order Received',
      }]);
    if (error) toast.error('Order failed!');
    else toast.success('Order placed with COD!');
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Razorpay Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Razorpay Integration</h2>
        <p className="mb-4">Click the button below to test Razorpay payment:</p>
        
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (in ₹)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="1"
            />
            <span>= ₹{amount.toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          onClick={handleRazorpayPayment}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
          } text-white py-2 px-6 rounded-md font-semibold transition-colors flex items-center`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Pay with Razorpay'
          )}
        </button>

        <button 
          onClick={handleCashOnDelivery}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          } text-white py-2 px-6 rounded-md font-semibold transition-colors flex items-center mt-4`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Order Cash on Delivery'
          )}
        </button>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-6 text-sm">
        <h3 className="font-semibold mb-2">Test Card Details</h3>
        <ul className="space-y-1 list-disc pl-5">
          <li>Card Number: 4111 1111 1111 1111</li>
          <li>Expiry: Any future date</li>
          <li>CVV: Any 3 digits</li>
          <li>Name: Any name</li>
          <li>3D Secure Password: 1111</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Order Status</h2>
        
        {/* Replace with actual order data in real use case */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <p className="text-sm text-gray-500 mb-2">Order ID: #123456</p>
          <p className="text-sm text-gray-500 mb-2">Payment ID: pay_ABC123456789</p>
          <p className="text-sm text-gray-500 mb-2">Amount: ₹{amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-2">Status: Confirmed</p>
          <p className="text-sm text-gray-500 mb-2">Tracking: Order Received</p>
          <progress value={1} max={4} className="w-full h-2 rounded-md bg-gray-200" />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <p className="text-sm text-gray-500 mb-2">Order ID: #654321</p>
          <p className="text-sm text-gray-500 mb-2">Payment ID: pay_DEF987654321</p>
          <p className="text-sm text-gray-500 mb-2">Amount: ₹{amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-2">Status: Pending</p>
          <p className="text-sm text-gray-500 mb-2">Tracking: Order Received</p>
          <progress value={1} max={4} className="w-full h-2 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default RazorpayTest;

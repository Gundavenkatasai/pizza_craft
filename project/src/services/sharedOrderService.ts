// Shared order management service
import { deriveBaseUrl } from '../utils/api';

export class SharedOrderService {
  private static instance: SharedOrderService;
  
  static getInstance(): SharedOrderService {
    if (!SharedOrderService.instance) {
      SharedOrderService.instance = new SharedOrderService();
    }
    return SharedOrderService.instance;
  }

  // Save order directly to backend
  async saveOrder(order: any) {
    try {
      console.log('🔄 Saving order to database API...');
      const backendBase = deriveBaseUrl();
      const backendUrl = `${backendBase.replace(/\/$/, '')}/api/orders`;
      const token = localStorage.getItem('token');
      
      const apiResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items: order.order_items,
          deliveryAddress: order.delivery_address,
          specialInstructions: order.special_instructions,
          paymentMethod: order.payment_method || 'cod',
          totalAmount: order.total || order.total_amount,
          customerEmail: order.user_email,
          customerInfo: {
            email: order.user_email,
            fullName: order.customer_name || order.customer_full_name,
            phone: order.customer_phone
          }
        }),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Database API returned error ${apiResponse.status}: ${errorText}`);
      }
      
      const apiResult = await apiResponse.json();
      console.log('✅ Order saved to database successfully:', apiResult.orderNumber);
      return apiResult.orderId;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error; // Re-throw so Checkout.tsx knows it failed!
    }
  }
}

export const sharedOrderService = SharedOrderService.getInstance();

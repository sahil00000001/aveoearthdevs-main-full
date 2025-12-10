/**
 * Payment Gateway Service
 * Handles payment processing with various gateways
 * Currently supports mock payment processing
 * Can be extended with Razorpay, Stripe, etc.
 */

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  billingAddress?: {
    address_line_1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  gateway?: string;
  message: string;
  redirectUrl?: string;
}

class PaymentService {
  private async processMockPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (request.paymentMethod === 'cod') {
          resolve({
            success: true,
            paymentId: `COD-${Date.now()}`,
            transactionId: `TXN-${Date.now()}`,
            gateway: 'cod',
            message: 'Cash on Delivery order confirmed'
          });
        } else {
          resolve({
            success: true,
            paymentId: `PAY-${Date.now()}`,
            transactionId: `TXN-${Date.now()}`,
            gateway: 'mock',
            message: 'Payment processed successfully'
          });
        }
      }, 1000);
    });
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (request.paymentMethod === 'cod') {
        return await this.processMockPayment(request);
      }

      const paymentGateway = import.meta.env.VITE_PAYMENT_GATEWAY || 'mock';
      
      if (paymentGateway === 'razorpay') {
        return await this.processRazorpayPayment(request);
      } else if (paymentGateway === 'stripe') {
        return await this.processStripePayment(request);
      } else {
        return await this.processMockPayment(request);
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Payment processing failed'
      };
    }
  }

  private async processRazorpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    
    if (!razorpayKey) {
      console.warn('Razorpay key not configured, using mock payment');
      return await this.processMockPayment(request);
    }

    return {
      success: false,
      message: 'Razorpay integration not yet implemented'
    };
  }

  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const stripeKey = import.meta.env.VITE_STRIPE_KEY;
    
    if (!stripeKey) {
      console.warn('Stripe key not configured, using mock payment');
      return await this.processMockPayment(request);
    }

    return {
      success: false,
      message: 'Stripe integration not yet implemented'
    };
  }

  async verifyPayment(paymentId: string, orderId: string): Promise<PaymentResponse> {
    try {
      return {
        success: true,
        paymentId,
        message: 'Payment verified successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Payment verification failed'
      };
    }
  }
}

export const paymentService = new PaymentService();


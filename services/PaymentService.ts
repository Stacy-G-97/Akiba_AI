/**
 * PaymentService.ts
 * 
 * IntaSend payment integration for Akiba AI
 * Handles secure payment processing for premium features and subscriptions
 * 
 * SECURITY NOTE: All sensitive operations are handled server-side
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: 'KES';
  features: string[];
  duration: 'monthly' | 'yearly';
  popular?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'expired' | 'cancelled';
  expiryDate: string;
  features: string[];
}

/**
 * Available subscription plans for Akiba AI
 */
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 0,
    currency: 'KES',
    features: [
      'Basic inventory tracking',
      'Simple predictions',
      'Community sharing',
      'Up to 50 items'
    ],
    duration: 'monthly'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 2500,
    currency: 'KES',
    features: [
      'Advanced AI predictions',
      'Weather integration',
      'Unlimited items',
      'Analytics dashboard',
      'Priority support',
      'Export reports'
    ],
    duration: 'monthly',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 8500,
    currency: 'KES',
    features: [
      'Multi-location support',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'API access',
      'White-label options'
    ],
    duration: 'monthly'
  }
];

/**
 * BEGINNER EXPLANATION:
 * This service handles payments securely using IntaSend
 * It never stores sensitive payment information on the device
 */
export class PaymentService {
  
  /**
   * Initialize payment for a subscription plan
   * SECURITY: All sensitive operations happen on the server
   */
  static async initializePayment(planId: string, userEmail: string): Promise<PaymentResult> {
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid payment plan');
      }

      // SECURITY: Never expose API keys in client code
      // This would call your backend API endpoint
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          planId,
          userEmail,
          amount: plan.price,
          currency: plan.currency
        })
      });

      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }

      const result = await response.json();
      
      return {
        success: true,
        transactionId: result.transactionId,
        redirectUrl: result.checkoutUrl
      };
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Verify payment status
   * SECURITY: Verification happens on server to prevent tampering
   */
  static async verifyPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      
      if (result.status === 'completed') {
        // Update local subscription status
        await this.updateSubscriptionStatus(result.planId);
        
        return {
          success: true,
          transactionId: result.transactionId
        };
      }
      
      return {
        success: false,
        error: 'Payment not completed'
      };
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Get current user subscription
   * PERFORMANCE: Cached locally for quick access
   */
  static async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const cached = await AsyncStorage.getItem('user_subscription');
      if (cached) {
        const subscription = JSON.parse(cached);
        
        // Check if subscription is still valid
        if (new Date(subscription.expiryDate) > new Date()) {
          return subscription;
        } else {
          // Subscription expired, remove from cache
          await AsyncStorage.removeItem('user_subscription');
          return null;
        }
      }
      
      // Fetch from server if not cached
      const response = await fetch('/api/user/subscription', {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const subscription = await response.json();
        await AsyncStorage.setItem('user_subscription', JSON.stringify(subscription));
        return subscription;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Update subscription status locally
   * PERFORMANCE: Quick local updates with server sync
   */
  private static async updateSubscriptionStatus(planId: string): Promise<void> {
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) return;

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (plan.duration === 'yearly' ? 12 : 1));

      const subscription: UserSubscription = {
        planId,
        status: 'active',
        expiryDate: expiryDate.toISOString(),
        features: plan.features
      };

      await AsyncStorage.setItem('user_subscription', JSON.stringify(subscription));
      console.log('Subscription updated locally');
      
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }

  /**
   * Check if user has access to a feature
   * PERFORMANCE: Quick local check without network calls
   */
  static async hasFeatureAccess(feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      
      if (!subscription || subscription.status !== 'active') {
        // Check if it's a basic plan feature
        const basicPlan = PAYMENT_PLANS.find(p => p.id === 'basic');
        return basicPlan?.features.includes(feature) || false;
      }
      
      return subscription.features.includes(feature);
      
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false; // Fail securely - deny access on error
    }
  }

  /**
   * Get authentication token
   * SECURITY: Secure token retrieval with validation
   */
  private static async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Basic token validation
      if (token.length < 10) {
        throw new Error('Invalid token format');
      }
      
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Authentication required');
    }
  }

  /**
   * Cancel subscription
   * SECURITY: Server-side cancellation with local cache update
   */
  static async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch('/api/user/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (response.ok) {
        // Update local cache
        const subscription = await this.getUserSubscription();
        if (subscription) {
          subscription.status = 'cancelled';
          await AsyncStorage.setItem('user_subscription', JSON.stringify(subscription));
        }
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }
}
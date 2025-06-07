import { NeuralNexus } from '../core/NeuralNexus';
import { 
  NeuralNexusError,
  NeuralNexusEvent,
  PaymentMethod,
  PurchaseOptions,
  TransactionRecord
} from '../types';

/**
 * Payment success result
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  modelId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  paymentMethod: string;
  receiptUrl?: string;
}

/**
 * Coupon information
 */
export interface Coupon {
  code: string;
  discount: number;
  isPercentage: boolean;
  expiresAt?: Date;
  isValid: boolean;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
}

/**
 * Subscription plan information
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  modelCredits?: number;
  modelLimit?: number;
  apiCallLimit?: number;
}

/**
 * Price calculation result
 */
export interface PriceCalculationResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  couponApplied: boolean;
}

/**
 * Manages payments and transactions in the Neural Nexus platform
 */
export class Payments {
  private client: NeuralNexus;

  /**
   * Creates a new Payments instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Purchases a model
   * @param options Purchase options
   * @returns Payment result
   */
  async purchaseModel(options: PurchaseOptions): Promise<PaymentResult> {
    if (!options.modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_PURCHASE_DATA'
      );
    }

    if (!options.method) {
      throw new NeuralNexusError(
        'Payment method is required',
        'INVALID_PURCHASE_DATA'
      );
    }

    try {
      const response = await this.client.post<PaymentResult>(
        '/payments/purchase',
        options
      );

      if (!response.data) {
        throw new NeuralNexusError(
          'Invalid response from payment server',
          'PAYMENT_ERROR'
        );
      }

      const result = response.data;
      this.client.emit(NeuralNexusEvent.PURCHASE_COMPLETED, result);
      
      return result;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Payment failed',
        'PAYMENT_ERROR',
        error
      );
    }
  }

  /**
   * Validates a coupon code
   * @param code The coupon code
   * @returns Coupon information
   */
  async validateCoupon(code: string): Promise<Coupon> {
    if (!code) {
      throw new NeuralNexusError(
        'Coupon code is required',
        'INVALID_COUPON'
      );
    }

    try {
      const response = await this.client.get<Coupon>(`/payments/coupons/${code}`);
      
      if (!response.data) {
        throw new NeuralNexusError(
          'Invalid coupon code',
          'INVALID_COUPON'
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to validate coupon',
        'COUPON_VALIDATION_ERROR',
        error
      );
    }
  }

  /**
   * Gets all available subscription plans
   * @returns Array of subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.client.get<SubscriptionPlan[]>('/payments/subscription-plans');
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch subscription plans',
        'SUBSCRIPTION_ERROR',
        error
      );
    }
  }

  /**
   * Subscribe to a plan
   * @param planId The subscription plan ID
   * @param paymentMethod The payment method to use
   * @returns Payment result
   */
  async subscribeToPlan(planId: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    if (!planId) {
      throw new NeuralNexusError(
        'Plan ID is required',
        'INVALID_SUBSCRIPTION_DATA'
      );
    }

    if (!paymentMethod) {
      throw new NeuralNexusError(
        'Payment method is required',
        'INVALID_SUBSCRIPTION_DATA'
      );
    }

    try {
      const response = await this.client.post<PaymentResult>(
        '/payments/subscribe',
        { planId, paymentMethod }
      );

      if (!response.data) {
        throw new NeuralNexusError(
          'Invalid response from subscription server',
          'SUBSCRIPTION_ERROR'
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Subscription failed',
        'SUBSCRIPTION_ERROR',
        error
      );
    }
  }

  /**
   * Gets transaction history for the current user
   * @param limit Maximum number of transactions to return
   * @param offset Offset for pagination
   * @returns Array of transactions
   */
  async getTransactionHistory(limit: number = 20, offset: number = 0): Promise<TransactionRecord[]> {
    try {
      const response = await this.client.get<TransactionRecord[]>(
        '/payments/transactions',
        { limit, offset }
      );
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch transaction history',
        'TRANSACTION_ERROR',
        error
      );
    }
  }

  /**
   * Gets a single transaction by ID
   * @param transactionId The transaction ID
   * @returns Transaction record
   */
  async getTransaction(transactionId: string): Promise<TransactionRecord> {
    if (!transactionId) {
      throw new NeuralNexusError(
        'Transaction ID is required',
        'INVALID_TRANSACTION_ID'
      );
    }

    try {
      const response = await this.client.get<TransactionRecord>(`/payments/transactions/${transactionId}`);
      
      if (!response.data) {
        throw new NeuralNexusError(
          'Transaction not found',
          'TRANSACTION_NOT_FOUND'
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to fetch transaction with ID ${transactionId}`,
        'TRANSACTION_ERROR',
        error
      );
    }
  }

  /**
   * Calculates the price for a model purchase with optional coupon
   * @param modelId The model ID
   * @param couponCode Optional coupon code
   * @returns Calculated price information
   */
  async calculatePrice(modelId: string, couponCode?: string): Promise<PriceCalculationResult> {
    if (!modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    try {
      const response = await this.client.get<PriceCalculationResult>(
        '/payments/calculate-price',
        { modelId, couponCode }
      );
      
      if (!response.data) {
        throw new NeuralNexusError(
          'Failed to calculate price',
          'PRICE_CALCULATION_ERROR'
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to calculate price',
        'PRICE_CALCULATION_ERROR',
        error
      );
    }
  }
} 
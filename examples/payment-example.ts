// Neural Nexus SDK - Payment Operations Example

import { 
  NeuralNexus, 
  Payments,
  ModelManager
} from '../src';

// Set your API key
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Initialize the Neural Nexus client
const neuralNexus = new NeuralNexus({
  apiKey: API_KEY,
  environment: 'development' // Use 'production' for production environment
});

// Initialize managers
const payments = new Payments(neuralNexus);
const modelManager = new ModelManager(neuralNexus);

// Example: Get subscription plans
async function getSubscriptionPlansExample() {
  console.log('🔍 Getting subscription plans...');
  
  try {
    // Get available subscription plans
    const plans = await payments.getSubscriptionPlans();
    console.log('✅ Available subscription plans:', plans);
    
    return plans;
  } catch (error) {
    console.error('❌ Failed to get subscription plans:', error);
    return [];
  }
}

// Example: Subscribe to a plan
async function subscribeToPlanExample(planId: string) {
  console.log(`💳 Subscribing to plan ${planId}...`);
  
  try {
    // Subscribe using Stripe payment method
    const result = await payments.subscribeToPlan(planId, {
      type: 'stripe',
      details: {
        cardToken: 'test-card-token', // In a real app, this would be a Stripe token
      }
    });
    
    console.log('✅ Subscription successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Subscription failed:', error);
    return null;
  }
}

// Example: Purchase a model
async function purchaseModelExample(modelId: string) {
  console.log(`🛒 Purchasing model ${modelId}...`);
  
  try {
    // First calculate the price
    const priceInfo = await payments.calculatePrice(modelId);
    console.log('💰 Price information:', priceInfo);
    
    // Check if we want to use a coupon
    const shouldUseCoupon = priceInfo.originalPrice > 10;
    let couponCode: string | undefined = undefined;
    
    if (shouldUseCoupon) {
      couponCode = 'NEXUS20'; // Example coupon code
      console.log(`🏷️ Applying coupon: ${couponCode}`);
      
      // Validate the coupon
      try {
        const coupon = await payments.validateCoupon(couponCode);
        if (!coupon.isValid) {
          console.log('❌ Coupon is invalid or expired');
          couponCode = undefined;
        } else {
          console.log('✅ Coupon is valid:', coupon);
        }
      } catch (error) {
        console.log('❌ Failed to validate coupon');
        couponCode = undefined;
      }
    }
    
    // Purchase the model
    const purchaseResult = await payments.purchaseModel({
      modelId,
      method: {
        type: 'stripe',
        details: {
          cardToken: 'test-card-token', // In a real app, this would be a Stripe token
        }
      },
      couponCode
    });
    
    console.log('✅ Purchase successful:', purchaseResult);
    
    if (purchaseResult.receiptUrl) {
      console.log(`🧾 Receipt available at: ${purchaseResult.receiptUrl}`);
    }
    
    return purchaseResult;
  } catch (error) {
    console.error('❌ Purchase failed:', error);
    return null;
  }
}

// Example: Get transaction history
async function transactionHistoryExample() {
  console.log('📊 Getting transaction history...');
  
  try {
    // Get transaction history
    const transactions = await payments.getTransactionHistory(10);
    console.log('📜 Recent transactions:', transactions);
    
    // If we have any transactions, get details for the first one
    if (transactions.length > 0) {
      const transaction = await payments.getTransaction(transactions[0].id);
      console.log('🔍 Transaction details:', transaction);
    }
    
    return transactions;
  } catch (error) {
    console.error('❌ Failed to get transaction history:', error);
    return [];
  }
}

// Example: Find a model to purchase
async function findModelToPurchaseExample() {
  console.log('🔍 Finding a model to purchase...');
  
  try {
    // Search for paid models
    const models = await modelManager.searchModels({
      isPublic: true,
      sortBy: 'rating',
      sortDirection: 'desc',
      limit: 5
    });
    
    // Filter to only include models with a price
    const paidModels = models.filter(model => model.price && model.price > 0);
    
    if (paidModels.length > 0) {
      console.log('✅ Found models available for purchase:', paidModels);
      return paidModels[0].id;
    } else {
      console.log('ℹ️ No paid models found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to find models:', error);
    return null;
  }
}

// Run all payment examples
async function runPaymentExamples() {
  try {
    console.log('💸 Neural Nexus Payment Examples');
    console.log('---------------------------------');
    
    // Get subscription plans
    const plans = await getSubscriptionPlansExample();
    console.log('---------------------------------');
    
    // Subscribe to a plan if plans are available
    if (plans.length > 0) {
      await subscribeToPlanExample(plans[0].id);
      console.log('---------------------------------');
    }
    
    // Find a model to purchase
    const modelId = await findModelToPurchaseExample();
    console.log('---------------------------------');
    
    // Purchase a model if one was found
    if (modelId) {
      await purchaseModelExample(modelId);
      console.log('---------------------------------');
    }
    
    // Get transaction history
    await transactionHistoryExample();
    console.log('---------------------------------');
    
    console.log('✅ All payment examples completed!');
  } catch (error) {
    console.error('❌ Main error:', error);
  }
}

// Run the payment examples
runPaymentExamples().catch(console.error); 
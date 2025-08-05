import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

// Create payment intent using real backend API with retry logic
export const createPaymentIntent = async (amount, currency = 'eur', userId = null, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          userId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        amount: data.amount,
        currency: data.currency
      };
    } catch (error) {
      console.error(`Payment intent attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(error.message || 'Failed to create payment intent after multiple attempts');
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Process payment with Stripe Elements
export const processPayment = async (stripe, elements, clientSecret) => {
  if (!stripe || !elements) {
    throw new Error('Stripe not initialized');
  }

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/payment-success`,
    },
    redirect: 'if_required'
  });

  if (error) {
    throw new Error(error.message);
  }

  return paymentIntent;
};

// Get Stripe instance
export const getStripeInstance = getStripe;

// Validate payment amount
export const validatePaymentAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  
  if (numAmount < 5) {
    return { valid: false, error: 'Minimum top-up amount is €5' };
  }
  
  if (numAmount > 500) {
    return { valid: false, error: 'Maximum top-up amount is €500' };
  }
  
  return { valid: true };
};

// Format currency for display
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default {
  createPaymentIntent,
  processPayment,
  getStripeInstance,
  validatePaymentAmount,
  formatCurrency
};
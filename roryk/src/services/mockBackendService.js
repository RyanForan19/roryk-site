// Mock backend service to simulate payment intent creation
// In a real application, this would be actual API calls to your backend server

const MOCK_API_DELAY = 800; // Simulate network delay

// Simulate creating a payment intent on the backend
export const createPaymentIntentAPI = async (amount, currency = 'eur') => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  // Convert amount to cents (Stripe expects amounts in smallest currency unit)
  const amountInCents = Math.round(amount * 100);
  
  // Generate a mock client secret (in real app, this comes from Stripe API on backend)
  const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate potential API errors (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Payment service temporarily unavailable. Please try again.');
  }
  
  return {
    success: true,
    clientSecret,
    paymentIntentId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amountInCents,
    currency,
    status: 'requires_payment_method'
  };
};

// Simulate confirming payment on the backend
export const confirmPaymentAPI = async (paymentIntentId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  // Simulate payment confirmation scenarios
  const random = Math.random();
  
  if (random > 0.95) {
    // 5% chance of payment failure
    throw new Error('Your card was declined. Please try a different payment method.');
  } else if (random > 0.90) {
    // 5% chance of network error
    throw new Error('Network error. Please check your connection and try again.');
  } else if (random > 0.85) {
    // 5% chance of insufficient funds
    throw new Error('Insufficient funds. Please check your account balance.');
  }
  
  // 85% success rate
  return {
    success: true,
    paymentIntentId,
    status: 'succeeded',
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    paymentMethod: 'card_****4242',
    receiptUrl: `https://pay.stripe.com/receipts/${paymentIntentId}`
  };
};

// Simulate webhook handling (in real app, this would be handled by your backend)
export const handlePaymentWebhook = async (paymentIntentId, status) => {
  // Simulate webhook processing delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    processed: true,
    paymentIntentId,
    status
  };
};

export default {
  createPaymentIntentAPI,
  confirmPaymentAPI,
  handlePaymentWebhook
};
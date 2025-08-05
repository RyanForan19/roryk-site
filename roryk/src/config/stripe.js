// Stripe configuration - Production Ready
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RsX9JLUk3cyqdIK9mJlxc587kmb5DMTirSk305dGfmzW0G8DmEib7cBOlZYypJFsBVCzGs9qlybvykBFuoinenS00EWfKRijw',
  // SECURITY NOTE: Secret key should NEVER be in frontend code
  // It should only be used on your backend server
  // For production, create a backend API endpoint to handle payment intents
};

// Validate that publishable key is available
if (!STRIPE_CONFIG.publishableKey) {
  throw new Error('Stripe publishable key is required. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your environment variables.');
}

// Validate key format
if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
  throw new Error('Invalid Stripe publishable key format. Publishable keys should start with "pk_".');
}

// Stripe appearance customization
export const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#007bff',
    colorBackground: '#ffffff',
    colorText: '#495057',
    colorDanger: '#dc3545',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px'
  }
};

// Payment element options
export const PAYMENT_ELEMENT_OPTIONS = {
  layout: 'accordion',
  defaultValues: {
    billingDetails: {
      address: {
        country: 'IE'
      }
    }
  }
};
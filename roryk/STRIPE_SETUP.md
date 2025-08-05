# Stripe Payment Integration - Production Setup Guide

## 🚀 Production Deployment Checklist

### 1. Environment Variables Setup

**For Production:**
1. Copy `.env.example` to `.env.production`
2. Replace the test keys with your live Stripe keys:

```bash
# Production Environment Variables
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://your-api-domain.com
```

**For Development:**
```bash
# Development Environment Variables (.env)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51RsX9JLUk3cyqdIK9mJlxc587kmb5DMTirSk305dGfmzW0G8DmEib7cBOlZYypJFsBVCzGs9qlybvykBFuoinenS00EWfKRijw
REACT_APP_ENVIRONMENT=development
REACT_APP_API_BASE_URL=http://localhost:3001
```

### 2. Backend API Requirements

**CRITICAL:** You must create a backend API to handle payment intents securely. The current implementation uses a mock service for demonstration.

#### Required Backend Endpoints:

**POST /api/create-payment-intent**
```javascript
// Example Node.js/Express endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency = 'eur' } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.id // Add user context
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

**POST /api/confirm-payment**
```javascript
// Webhook endpoint to handle payment confirmations
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update user balance in your database
    updateUserBalance(paymentIntent.metadata.userId, paymentIntent.amount);
  }

  res.json({received: true});
});
```

### 3. Security Considerations

#### ✅ Current Security Features:
- ✅ Publishable key used on frontend (secure)
- ✅ Secret key removed from client-side code
- ✅ Environment variable configuration
- ✅ Input validation for payment amounts
- ✅ Stripe Elements for secure card input
- ✅ No sensitive payment data stored locally

#### 🔒 Additional Production Security:
1. **HTTPS Required:** Stripe requires HTTPS in production
2. **Webhook Signatures:** Verify webhook signatures from Stripe
3. **Rate Limiting:** Implement rate limiting on payment endpoints
4. **User Authentication:** Ensure users are authenticated before payments
5. **Amount Validation:** Validate payment amounts on backend
6. **Idempotency:** Use idempotency keys for payment requests

### 4. File Structure

```
src/
├── config/
│   └── stripe.js              # Stripe configuration with env vars
├── services/
│   ├── stripeService.js       # Frontend Stripe service
│   └── mockBackendService.js  # REMOVE in production
├── components/
│   └── Payment/
│       ├── TopUpBalance.js    # Main payment component
│       └── StripePaymentForm.js # Stripe Elements form
└── .env                       # Environment variables
```

### 5. Deployment Steps

1. **Remove Mock Services:**
   ```bash
   # Delete the mock backend service
   rm src/services/mockBackendService.js
   ```

2. **Update Stripe Service:**
   Replace mock API calls with real backend endpoints in `src/services/stripeService.js`

3. **Environment Setup:**
   ```bash
   # Set production environment variables
   export REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   export REACT_APP_ENVIRONMENT=production
   export REACT_APP_API_BASE_URL=https://your-api.com
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   Deploy the `build/` folder to your hosting service (Netlify, Vercel, AWS, etc.)

### 6. Testing

#### Test Cards (Development Only):
- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Insufficient Funds:** 4000 0000 0000 9995

#### Production Testing:
- Use small amounts (€0.50) for initial testing
- Test with real cards in Stripe's test mode first
- Verify webhook delivery and processing

### 7. Monitoring

1. **Stripe Dashboard:** Monitor payments, disputes, and failures
2. **Error Logging:** Implement proper error logging for payment failures
3. **Analytics:** Track conversion rates and payment success rates
4. **Alerts:** Set up alerts for failed payments or webhook failures

### 8. Compliance

- **PCI Compliance:** Using Stripe Elements ensures PCI compliance
- **GDPR:** Ensure proper data handling for EU customers
- **Terms of Service:** Update terms to include payment processing
- **Privacy Policy:** Include Stripe data processing information

## 🔧 Quick Start for New Keys

To replace the Stripe keys:

1. Update `.env`:
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_new_publishable_key
   ```

2. Restart the development server:
   ```bash
   npm start
   ```

The application will automatically use the new keys!

## 📞 Support

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **React Stripe.js:** https://github.com/stripe/react-stripe-js
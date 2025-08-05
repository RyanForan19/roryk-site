import { useState, useCallback } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { getStripeInstance, createPaymentIntent, validatePaymentAmount } from '../../services/stripeService';
import { STRIPE_APPEARANCE } from '../../config/stripe';
import StripePaymentForm from './StripePaymentForm';

export default function TopUpBalance() {
  const { user, updateUserBalance, refreshUserData } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentContainerHeight, setPaymentContainerHeight] = useState('auto');

  // Predefined top-up amounts
  const quickAmounts = [5, 10, 20, 50, 100];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setError('');
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    
    const topUpAmount = parseFloat(amount);
    const validation = validatePaymentAmount(topUpAmount);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create payment intent with user ID
      const paymentIntent = await createPaymentIntent(topUpAmount, 'eur', user.id);
      setClientSecret(paymentIntent.clientSecret);
      setShowPaymentForm(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    const topUpAmount = parseFloat(amount);
    
    // Payment successful, update user balance
    const newBalance = user.balance + topUpAmount;
    const result = updateUserBalance(
      user.id,
      newBalance,
      `Stripe top-up - €${topUpAmount.toFixed(2)} (${paymentResult.paymentMethod})`,
      'stripe'
    );

    if (result.success) {
      setSuccess(`Successfully added €${topUpAmount.toFixed(2)} to your account! Transaction ID: ${paymentResult.transactionId}`);
      setAmount('');
      setShowPaymentForm(false);
      setClientSecret('');
      
      // Refresh user data to sync across devices
      setTimeout(() => {
        refreshUserData();
      }, 1000);
    } else {
      setError(result.error || 'Failed to update balance');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setShowPaymentForm(false);
    setClientSecret('');
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setClientSecret('');
    setError('');
  };

  const handleHeightChange = useCallback((height) => {
    // Use dynamic height based on actual content
    setPaymentContainerHeight(height);
  }, []);

  const stripePromise = getStripeInstance();

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#f8f9fa',
      padding: '40px 20px',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '36px',
            color: '#495057',
            marginBottom: '15px'
          }}>
            Top Up Balance
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            marginBottom: '20px'
          }}>
            Add credits to your account to use our vehicle checking services
          </p>
          
          {/* Current Balance */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <div style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '10px'
            }}>
              Current Balance
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: user.balance >= 10 ? '#28a745' : '#dc3545'
            }}>
              €{user.balance.toFixed(2)}
            </div>
            {user.balance < 10 && (
              <div style={{
                fontSize: '14px',
                color: '#dc3545',
                marginTop: '5px'
              }}>
                Low balance - Consider topping up to continue using services
              </div>
            )}
          </div>
        </div>

        {!showPaymentForm ? (
          /* Amount Selection Form */
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#495057'
            }}>
              Select Amount
            </h3>

            {/* Quick Amount Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {quickAmounts.map(value => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  disabled={loading}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: amount === value.toString() ? '#007bff' : 'transparent',
                    color: amount === value.toString() ? 'white' : '#007bff',
                    border: '2px solid #007bff',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && amount !== value.toString()) {
                      e.target.style.backgroundColor = '#007bff';
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && amount !== value.toString()) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#007bff';
                    }
                  }}
                >
                  €{value}
                </button>
              ))}
            </div>

            <form onSubmit={handleTopUp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Custom Amount (€5 - €500)
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                  disabled={loading}
                />
              </div>

              {error && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '6px',
                  border: '1px solid #f5c6cb',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb',
                  marginBottom: '20px'
                }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) < 5}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: loading || !amount || parseFloat(amount) < 5 ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading || !amount || parseFloat(amount) < 5 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                {loading ? 'Preparing Payment...' : `Continue to Payment - €${amount || '0.00'}`}
              </button>
            </form>
          </div>
        ) : (
          /* Stripe Payment Form */
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '30px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            minHeight: paymentContainerHeight,
            transition: 'min-height 0.3s ease-in-out'
          }}>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#495057'
            }}>
              Complete Payment - €{amount}
            </h3>
            
            <div style={{
              width: '100%',
              maxWidth: '100%',
              position: 'relative'
            }}>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: STRIPE_APPEARANCE
                  }}
                >
                  <StripePaymentForm
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                    onHeightChange={handleHeightChange}
                  />
                </Elements>
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <div style={{ marginBottom: '10px' }}>Preparing payment...</div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            fontSize: '20px',
            marginBottom: '15px',
            color: '#495057'
          }}>
            Payment Information
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>💳 Secure Payment</div>
              <div>Powered by Stripe - Industry leading security</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⚡ Instant Credit</div>
              <div>Credits added immediately after payment</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔒 Data Protection</div>
              <div>Your payment details are never stored</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📧 Receipt</div>
              <div>Email confirmation sent automatically</div>
            </div>
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#1565c0'
          }}>
            <strong>Real Stripe Integration:</strong> This implementation uses actual Stripe Elements for secure payment processing. The payment form includes real card validation and processing through Stripe's secure infrastructure.
          </div>
        </div>
      </div>
    </div>
  );
}
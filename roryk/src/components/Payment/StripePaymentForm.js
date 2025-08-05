import React, { useState, useEffect, useRef } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { PAYMENT_ELEMENT_OPTIONS } from '../../config/stripe';

const StripePaymentForm = ({ amount, onSuccess, onError, onCancel, onHeightChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const paymentElementRef = useRef(null);
  const subContainerRef = useRef(null);

  // Function to check and update container height based on actual content
  const checkAndUpdateHeight = () => {
    if (subContainerRef.current && onHeightChange) {
      setTimeout(() => {
        const height = subContainerRef.current.scrollHeight;
        const computedHeight = Math.max(height + 100, 400); // Minimum 400px, add 100px padding
        onHeightChange(`${computedHeight}px`);
        
        // Also check again after a longer delay for Stripe elements to fully render
        setTimeout(() => {
          const newHeight = subContainerRef.current.scrollHeight;
          const finalHeight = Math.max(newHeight + 100, 400);
          onHeightChange(`${finalHeight}px`);
        }, 500);
      }, 200);
    }
  };

  // Wait for PaymentElement to be ready
  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (paymentElement) {
      paymentElement.on('ready', () => {
        setIsReady(true);
        checkAndUpdateHeight();
      });

      paymentElement.on('change', (event) => {
        if (event.error) {
          setErrorMessage(event.error.message);
        } else {
          setErrorMessage('');
        }
        checkAndUpdateHeight();
      });

      paymentElement.on('focus', () => {
        checkAndUpdateHeight();
      });

      paymentElement.on('click', () => {
        checkAndUpdateHeight();
      });

      paymentElement.on('blur', () => {
        checkAndUpdateHeight();
      });
    }
  }, [stripe, elements, onHeightChange]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!isReady) {
      setErrorMessage('Payment form is not ready yet. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
      } else if (paymentIntent) {
        // Payment succeeded
        onSuccess({
          paymentIntent,
          transactionId: paymentIntent.id,
          paymentMethod: 'card'
        });
      }
    } catch (error) {
      setErrorMessage(error.message);
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      position: 'relative'
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {/* All-in-One Sub-Container */}
        <div
          ref={subContainerRef}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '300px',
            height: 'auto',
            overflow: 'visible'
          }}>
          {!isReady && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6c757d',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              Loading payment form...
            </div>
          )}
          
          <div
            ref={paymentElementRef}
            style={{
              maxWidth: '100%',
              position: 'relative',
              marginBottom: '20px'
            }}>
            <PaymentElement
              options={PAYMENT_ELEMENT_OPTIONS}
            />
          </div>

          {errorMessage && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              border: '1px solid #f5c6cb',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {errorMessage}
            </div>
          )}

          {/* Buttons inside sub-container */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between'
          }}>
        <button
          type="button"
          onClick={() => {
            checkAndUpdateHeight();
            onCancel();
          }}
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing || !isReady}
          onClick={checkAndUpdateHeight}
          style={{
            flex: 2,
            padding: '12px',
            backgroundColor: isProcessing || !stripe || !isReady ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isProcessing || !stripe || !isReady ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {isProcessing ? 'Processing...' : `Pay €${amount}`}
        </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;
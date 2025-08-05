import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.');
      setIsValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/password/validate-token/${token}`
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setTokenInfo(data);
      } else {
        setError(data.error || 'Invalid or expired reset token');
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Network error. Please check your connection and try again.');
      setTokenValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/password/reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setFormData({ newPassword: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please log in with your new password.' 
            }
          });
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    let feedback = [];

    if (password.length >= 6) strength += 1;
    else feedback.push('at least 6 characters');

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push('lowercase letter');

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push('uppercase letter');

    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push('number');

    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push('special character');

    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ff4757', '#ff6b7a', '#ffa502', '#2ed573', '#20bf6b'];

    return {
      strength,
      text: strengthLevels[Math.min(strength, 4)],
      color: strengthColors[Math.min(strength, 4)],
      feedback: feedback.length > 0 ? `Add: ${feedback.join(', ')}` : 'Strong password!'
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (isValidating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="loading-spinner">
              <span className="spinner"></span>
            </div>
            <h2>Validating Reset Link...</h2>
            <p>Please wait while we verify your password reset token.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>❌ Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired.</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="auth-info">
            <h4>What can you do?</h4>
            <ul>
              <li>Request a new password reset link</li>
              <li>Make sure you're using the latest email</li>
              <li>Check that the link hasn't expired (valid for 1 hour)</li>
            </ul>
          </div>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-button">
              Request New Reset Link
            </Link>
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Reset Password</h2>
          <p>
            Create a new password for <strong>{tokenInfo?.email}</strong>
          </p>
          {tokenInfo?.expiresAt && (
            <p className="token-expiry">
              ⏰ Link expires: {new Date(tokenInfo.expiresAt).toLocaleString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <div className="strength-text">
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </span>
                  <small>{passwordStrength.feedback}</small>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <small className="password-mismatch">Passwords do not match</small>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {message}
              <br />
              <small>Redirecting to login page...</small>
            </div>
          )}

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || formData.newPassword !== formData.confirmPassword}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">
            ← Back to Login
          </Link>
        </div>

        <div className="auth-info">
          <div className="info-section">
            <h4>🔒 Security Tips</h4>
            <ul>
              <li>Use a unique password you haven't used before</li>
              <li>Include uppercase, lowercase, numbers, and symbols</li>
              <li>Avoid personal information like names or birthdays</li>
              <li>Consider using a password manager</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
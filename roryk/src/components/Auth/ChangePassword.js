import React, { useState } from 'react';
import './Auth.css';

const ChangePassword = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

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
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/password/change`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        if (onSuccess) {
          onSuccess(data.message);
        }
        if (onClose) {
          onClose();
        }
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
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

  return (
    <div className="change-password-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>🔐 Change Password</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-container">
              <input
                type={showPasswords ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your current password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-container">
              <input
                type={showPasswords ? 'text' : 'password'}
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
                onClick={() => setShowPasswords(!showPasswords)}
                disabled={isLoading}
              >
                {showPasswords ? '👁️' : '👁️‍🗨️'}
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
              type={showPasswords ? 'text' : 'password'}
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

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || formData.newPassword !== formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>

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

export default ChangePassword;
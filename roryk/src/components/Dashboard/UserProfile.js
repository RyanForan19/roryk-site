import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ChangePassword from '../Auth/ChangePassword';

export default function UserProfile() {
  const { user, getUserTransactions } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalCredits: 0,
    totalDebits: 0,
    creditAmount: 0,
    debitAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadUserData = useCallback(() => {
    setLoading(true);
    try {
      const userTransactions = getUserTransactions(user.id);
      setTransactions(userTransactions);

      // Calculate statistics
      const stats = userTransactions.reduce((acc, transaction) => {
        acc.totalTransactions++;
        if (transaction.type === 'credit') {
          acc.totalCredits++;
          acc.creditAmount += transaction.amount;
        } else {
          acc.totalDebits++;
          acc.debitAmount += transaction.amount;
        }
        return acc;
      }, {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        creditAmount: 0,
        debitAmount: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getUserTransactions]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMMM dd, yyyy \'at\' HH:mm');
  };

  const formatDateShort = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handlePasswordChangeSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
      }}>
        <h1>My Profile</h1>
        <div>
          <button
            onClick={() => setShowChangePassword(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔐 Change Password
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/transactions')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Transactions
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#155724'
        }}>
          <strong>✅ Success!</strong> {successMessage}
        </div>
      )}

      {/* Profile Information */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        marginBottom: '30px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0' }}>Account Information</h3>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                Username
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '16px'
              }}>
                {user.username}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                User ID
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {user.id}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                Role
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
                <span style={{ 
                  padding: '4px 12px',
                  backgroundColor: user.role === 'superadmin' ? '#dc3545' : '#007bff',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                Current Balance
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: user.balance >= 0 ? '#e8f5e8' : '#ffeaea',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: user.balance >= 0 ? '#28a745' : '#dc3545'
              }}>
                {formatCurrency(user.balance)}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                Account Created
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
                Last Login
              </label>
              <div style={{ 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
                {formatDate(user.lastLogin)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        marginBottom: '30px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0' }}>Account Statistics</h3>
        </div>
        
        <div style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading statistics...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
                  {stats.totalTransactions}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  Total Transactions
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                  {stats.totalCredits}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  Credits Received
                </div>
                <div style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold', marginTop: '5px' }}>
                  {formatCurrency(stats.creditAmount)}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#ffeaea',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
                  {stats.totalDebits}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  Debits Applied
                </div>
                <div style={{ fontSize: '14px', color: '#dc3545', fontWeight: 'bold', marginTop: '5px' }}>
                  {formatCurrency(stats.debitAmount)}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#856404' }}>
                  {formatCurrency(stats.creditAmount - stats.debitAmount)}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  Net Change
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  (Credits - Debits)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Recent Activity (Last 10 Transactions)
            <button 
              onClick={() => navigate('/transactions')}
              style={{
                fontSize: '14px',
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View All
            </button>
          </h3>
        </div>
        
        <div style={{ padding: '15px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading recent activity...</p>
          ) : transactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>No transactions yet.</p>
          ) : (
            <div>
              {transactions.slice(0, 10).map((transaction, index) => (
                <div 
                  key={transaction.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < Math.min(transactions.length, 10) - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatDateShort(transaction.timestamp)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: transaction.type === 'credit' ? '#28a745' : '#dc3545',
                      fontSize: '16px'
                    }}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      Balance: {formatCurrency(transaction.newBalance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
}
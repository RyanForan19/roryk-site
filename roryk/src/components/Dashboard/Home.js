import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function Home() {
  const { user, logout, getUserTransactions } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecentTransactions = useCallback(() => {
    setLoading(true);
    try {
      const transactions = getUserTransactions(user.id);
      // Get only the 5 most recent transactions
      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getUserTransactions]);

  useEffect(() => {
    if (user) {
      loadRecentTransactions();
    }
  }, [user, loadRecentTransactions]);

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? '#28a745' : '#dc3545';
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Please log in to access your account.</p>
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
        <div>
          <h1>Welcome, {user.username}!</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Role: <span style={{
              padding: '2px 8px',
              backgroundColor: user.role === 'superadmin' ? '#dc3545' : '#007bff',
              color: 'white',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {user.role}
            </span>
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Balance Card */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#495057' }}>Current Balance</h2>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: user.balance >= 0 ? '#28a745' : '#dc3545',
          margin: '10px 0'
        }}>
          {formatCurrency(user.balance)}
        </div>
        <p style={{ color: '#6c757d', margin: '0' }}>
          Account created: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <Link
          to="/transactions"
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          View All Transactions
        </Link>
        
        <Link
          to="/profile"
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          My Profile
        </Link>

        {user.role === "superadmin" && (
          <Link
            to="/admin"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '15px',
              backgroundColor: '#dc3545',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Recent Transactions */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Recent Transactions
            <Link
              to="/transactions"
              style={{
                fontSize: '14px',
                color: '#007bff',
                textDecoration: 'none'
              }}
            >
              View All →
            </Link>
          </h3>
        </div>

        <div style={{ padding: '15px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading transactions...</p>
          ) : recentTransactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>No transactions yet.</p>
          ) : (
            <div>
              {recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < recentTransactions.length - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatDate(transaction.timestamp)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: getTransactionColor(transaction.type),
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

      {/* Account Summary */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 15px 0' }}>Account Summary</h4>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <strong>Total Transactions:</strong> {recentTransactions.length > 0 ? getUserTransactions(user.id).length : 0}
          </div>
          <div>
            <strong>Last Login:</strong> {user.lastLogin ? formatDate(user.lastLogin) : 'First time'}
          </div>
          <div>
            <strong>Account Status:</strong> <span style={{ color: '#28a745' }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

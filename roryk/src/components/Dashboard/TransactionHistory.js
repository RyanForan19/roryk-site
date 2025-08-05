import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const { user, getUserTransactions, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState({
    type: 'all', // 'all', 'credit', 'debit'
    dateRange: 'all', // 'all', 'today', 'week', 'month'
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      let userTransactions;
      
      if (user.role === 'superadmin') {
        // Superadmin can see all transactions
        const users = getAllUsers();
        setAllUsers(users);
        
        // Get all transactions for all users
        userTransactions = users.reduce((allTrans, u) => {
          const userTrans = getUserTransactions(u.id);
          return [...allTrans, ...userTrans];
        }, []);
      } else {
        // Regular users see only their transactions
        userTransactions = getUserTransactions(user.id);
      }

      // Sort by timestamp (newest first)
      userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getAllUsers, getUserTransactions]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const getUsernameById = (userId) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? foundUser.username : 'Unknown User';
  };

  const getPerformedByUsername = (performedById) => {
    if (!performedById) return 'System';
    const foundUser = allUsers.find(u => u.id === performedById);
    return foundUser ? foundUser.username : 'Unknown Admin';
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    // Filter by date range
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (filter.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(t => new Date(t.timestamp) >= startDate);
    }

    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        getUsernameById(t.userId).toLowerCase().includes(searchLower) ||
        getPerformedByUsername(t.performedBy).toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? '#28a745' : '#dc3545';
  };

  const filteredTransactions = filterTransactions();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Please log in to view transaction history.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
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
        <h1>
          Transaction History
          {user.role !== 'superadmin' && ` - ${user.username}`}
        </h1>
        <div>
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
          {user.role === 'superadmin' && (
            <button 
              onClick={() => navigate('/admin')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Type:
          </label>
          <select
            value={filter.type}
            onChange={e => setFilter(prev => ({ ...prev, type: e.target.value }))}
            style={{
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="all">All</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Date Range:
          </label>
          <select
            value={filter.dateRange}
            onChange={e => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            style={{
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Search:
          </label>
          <input
            type="text"
            value={filter.searchTerm}
            onChange={e => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            placeholder="Search description, user, or admin..."
            style={{
              width: '100%',
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {filteredTransactions.length}
          </div>
          <div style={{ color: '#666' }}>Total Transactions</div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '4px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {filteredTransactions.filter(t => t.type === 'credit').length}
          </div>
          <div style={{ color: '#666' }}>Credits</div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#ffeaea',
          borderRadius: '4px',
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {filteredTransactions.filter(t => t.type === 'debit').length}
          </div>
          <div style={{ color: '#666' }}>Debits</div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa'
        }}>
          <p>No transactions found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            overflowX: 'auto',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Date & Time
                  </th>
                  {user.role === 'superadmin' && (
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      User
                    </th>
                  )}
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                    Amount
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                    Previous Balance
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                    New Balance
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Description
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(transaction.timestamp)}
                    </td>
                    {user.role === 'superadmin' && (
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        {getUsernameById(transaction.userId)}
                      </td>
                    )}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getTransactionColor(transaction.type)
                      }}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: getTransactionColor(transaction.type)
                    }}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatCurrency(transaction.previousBalance)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(transaction.newBalance)}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      <div style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={transaction.description}>
                        {transaction.description}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getPerformedByUsername(transaction.performedBy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function AdminPanel() {
  const { user, getAllUsers, updateUserBalance, deleteUser, logout, getPendingUsers, approveUser, rejectUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceForm, setBalanceForm] = useState({
    amount: "",
    description: ""
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "pending"

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      loadUsers();
      loadPendingUsers();
    }
  }, [user]);

  // Check if user is superadmin
  if (!user || user.role !== 'superadmin') {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Access Denied</h2>
        <p>Only superadmin can access this panel.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers.filter(u => u.status !== 'pending'));
  };

  const loadPendingUsers = () => {
    const pending = getPendingUsers();
    setPendingUsers(pending);
  };

  const handleApproveUser = async (userId, username) => {
    try {
      const result = approveUser(userId);
      if (result.success) {
        setSuccess(`User "${username}" approved successfully`);
        loadUsers();
        loadPendingUsers();
      } else {
        setError(result.error || "Failed to approve user");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Approve user error:', error);
    }
  };

  const handleRejectUser = async (userId, username) => {
    const reason = rejectionReason.trim() || "No reason provided";
    
    if (!window.confirm(`Are you sure you want to reject user "${username}"?\nReason: ${reason}`)) {
      return;
    }

    try {
      const result = rejectUser(userId, reason);
      if (result.success) {
        setSuccess(`User "${username}" rejected successfully`);
        setRejectionReason("");
        loadUsers();
        loadPendingUsers();
      } else {
        setError(result.error || "Failed to reject user");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Reject user error:', error);
    }
  };

  const handleBalanceUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    const amount = parseFloat(balanceForm.amount);
    if (isNaN(amount)) {
      setError("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    const newBalance = selectedUser.balance + amount;
    if (newBalance < 0) {
      setError("Balance cannot be negative");
      setIsLoading(false);
      return;
    }

    try {
      const result = updateUserBalance(
        selectedUser.id,
        newBalance,
        balanceForm.description || `Balance ${amount >= 0 ? 'credit' : 'debit'} by admin`,
        user.id
      );

      if (result.success) {
        setSuccess(`Balance updated successfully! New balance: €${newBalance.toFixed(2)}`);
        setBalanceForm({ amount: "", description: "" });
        loadUsers(); // Refresh user list
        
        // Update selected user
        const updatedUsers = getAllUsers();
        const updatedUser = updatedUsers.find(u => u.id === selectedUser.id);
        setSelectedUser(updatedUser);
      } else {
        setError(result.error || "Failed to update balance");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Balance update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const result = deleteUser(userId);
      if (result.success) {
        setSuccess(`User "${username}" deleted successfully`);
        loadUsers();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }
      } else {
        setError(result.error || "Failed to delete user");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error('Delete user error:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div style={{
      maxWidth: '1000px',
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
        <h1>Admin Panel</h1>
        <div>
          <Link
            to="/admin/create-user"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Create New User
          </Link>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Home
          </Link>
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
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "users" ? '#007bff' : 'transparent',
            color: activeTab === "users" ? 'white' : '#007bff',
            border: 'none',
            borderBottom: activeTab === "users" ? '2px solid #007bff' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "pending" ? '#ffc107' : 'transparent',
            color: activeTab === "pending" ? 'white' : '#ffc107',
            border: 'none',
            borderBottom: activeTab === "pending" ? '2px solid #ffc107' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            position: 'relative'
          }}
        >
          Pending Approvals ({pendingUsers.length})
          {pendingUsers.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "users" && (
        <div style={{ display: 'flex', gap: '20px' }}>
        {/* Users List */}
        <div style={{ flex: 1 }}>
          <h3>All Users ({users.length})</h3>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {users.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>No users found</p>
            ) : (
              users.map(u => (
                <div
                  key={u.id}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: selectedUser?.id === u.id ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedUser(u)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{u.username}</strong>
                      <span style={{
                        marginLeft: '10px',
                        padding: '2px 8px',
                        backgroundColor: u.role === 'superadmin' ? '#dc3545' : '#007bff',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                        €{u.balance.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Last login: {formatDate(u.lastLogin)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Details & Balance Management */}
        <div style={{ flex: 1 }}>
          {selectedUser ? (
            <div>
              <h3>Manage User: {selectedUser.username}</h3>
              
              {/* User Info */}
              <div style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Current Balance:</strong> €{selectedUser.balance.toFixed(2)}</p>
                <p><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Login:</strong> {formatDate(selectedUser.lastLogin)}</p>
              </div>

              {/* Balance Update Form */}
              <form onSubmit={handleBalanceUpdate} style={{ marginBottom: '20px' }}>
                <h4>Update Balance</h4>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceForm.amount}
                    onChange={e => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Amount (+ to add, - to subtract)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    disabled={isLoading}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={balanceForm.description}
                    onChange={e => setBalanceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !balanceForm.amount}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Updating...' : 'Update Balance'}
                </button>
              </form>

              {/* Delete User */}
              {selectedUser.role !== 'superadmin' && (
                <button
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.username)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete User
                </button>
              )}
            </div>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <p>Select a user from the list to manage their account</p>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === "pending" && (
        <div>
          <h3>Pending User Registrations ({pendingUsers.length})</h3>
          {pendingUsers.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <p>No pending registrations</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {pendingUsers.map(pendingUser => (
                <div
                  key={pendingUser.id}
                  style={{
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fff3cd'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'start'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                        {pendingUser.firstName} {pendingUser.lastName} ({pendingUser.username})
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px' }}>
                        <div><strong>Email:</strong> {pendingUser.email}</div>
                        <div><strong>Company:</strong> {pendingUser.company || 'N/A'}</div>
                        <div><strong>Phone:</strong> {pendingUser.phone || 'N/A'}</div>
                        <div><strong>Registered:</strong> {formatDate(pendingUser.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: '200px'
                    }}>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason (optional)"
                        style={{
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApproveUser(pendingUser.id, pendingUser.username)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(pendingUser.id, pendingUser.username)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

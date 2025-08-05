import { encryptData, decryptData, generateId, hashPassword } from './encryption';
import { v4 as uuidv4 } from 'uuid';

/**
 * Secure storage utility for user data and transactions
 */
class SecureStorage {
  constructor() {
    this.USERS_KEY = 'secure_users';
    this.TRANSACTIONS_KEY = 'secure_transactions';
    this.SESSION_KEY = 'secure_session';
    this.SYNC_KEY = 'data_sync_timestamp';
    
    // Listen for storage changes from other tabs/devices
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Handle storage changes from other tabs/devices
   */
  handleStorageChange(event) {
    if (event.key === this.USERS_KEY || event.key === this.TRANSACTIONS_KEY) {
      // Data changed in another tab/device, trigger a refresh
      window.dispatchEvent(new CustomEvent('dataSync', {
        detail: { key: event.key, newValue: event.newValue }
      }));
    }
  }

  /**
   * Update sync timestamp
   */
  updateSyncTimestamp() {
    localStorage.setItem(this.SYNC_KEY, Date.now().toString());
  }

  /**
   * Get all users from secure storage
   * @returns {Array} - Array of user objects
   */
  getUsers() {
    try {
      const encryptedData = localStorage.getItem(this.USERS_KEY);
      if (!encryptedData) return [];
      
      const users = decryptData(encryptedData);
      return users || [];
    } catch (error) {
      console.error('Error retrieving users:', error);
      return [];
    }
  }

  /**
   * Save users to secure storage
   * @param {Array} users - Array of user objects
   */
  saveUsers(users) {
    try {
      const encryptedData = encryptData(users);
      localStorage.setItem(this.USERS_KEY, encryptedData);
      this.updateSyncTimestamp();
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username to search for
   * @returns {Object|null} - User object or null if not found
   */
  getUserByUsername(username) {
    const users = this.getUsers();
    return users.find(user => user.username === username) || null;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID to search for
   * @returns {Object|null} - User object or null if not found
   */
  getUserById(userId) {
    const users = this.getUsers();
    return users.find(user => user.id === userId) || null;
  }

  /**
   * Get user by email
   * @param {string} email - Email to search for
   * @returns {Object|null} - User object or null if not found
   */
  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Object} - Created user object
   */
  createUser(userData) {
    const users = this.getUsers();
    
    const newUser = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email || null,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      company: userData.company || null,
      phone: userData.phone || null,
      role: userData.role || 'user',
      status: userData.status || 'approved', // 'pending', 'approved', 'rejected'
      balance: userData.balance || 0.00,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };

    users.push(newUser);
    this.saveUsers(users);
    
    return newUser;
  }

  /**
   * Update user data
   * @param {string} userId - User ID to update
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} - Updated user object or null if not found
   */
  updateUser(userId, updates) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);
    
    return users[userIndex];
  }

  /**
   * Delete a user
   * @param {string} userId - User ID to delete
   * @returns {boolean} - True if user was deleted
   */
  deleteUser(userId) {
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    this.saveUsers(filteredUsers);
    return true;
  }

  /**
   * Get all transactions from secure storage
   * @returns {Array} - Array of transaction objects
   */
  getTransactions() {
    try {
      const encryptedData = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (!encryptedData) return [];
      
      const transactions = decryptData(encryptedData);
      return transactions || [];
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      return [];
    }
  }

  /**
   * Save transactions to secure storage
   * @param {Array} transactions - Array of transaction objects
   */
  saveTransactions(transactions) {
    try {
      const encryptedData = encryptData(transactions);
      localStorage.setItem(this.TRANSACTIONS_KEY, encryptedData);
      this.updateSyncTimestamp();
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  /**
   * Add a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Object} - Created transaction object
   */
  addTransaction(transactionData) {
    const transactions = this.getTransactions();
    
    const newTransaction = {
      id: uuidv4(),
      userId: transactionData.userId,
      type: transactionData.type, // 'credit' or 'debit'
      amount: parseFloat(transactionData.amount),
      previousBalance: parseFloat(transactionData.previousBalance),
      newBalance: parseFloat(transactionData.newBalance),
      description: transactionData.description,
      performedBy: transactionData.performedBy,
      timestamp: new Date().toISOString(),
      // New fields for storing check results
      serviceType: transactionData.serviceType || null, // 'history', 'valuation', 'vin'
      checkData: transactionData.checkData || null, // Full API response data
      vehicleIdentifier: transactionData.vehicleIdentifier || null // Registration/VIN searched
    };

    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    
    return newTransaction;
  }

  /**
   * Get transactions for a specific user
   * @param {string} userId - User ID
   * @returns {Array} - Array of user's transactions
   */
  getUserTransactions(userId) {
    const transactions = this.getTransactions();
    return transactions.filter(transaction => transaction.userId === userId)
                     .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get check result data for a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Object|null} - Check data or null if not found
   */
  getCheckData(transactionId) {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    return transaction?.checkData || null;
  }

  /**
   * Get all service transactions for a user with full check data
   * @param {string} userId - User ID
   * @returns {Array} - Array of service transactions with check data
   */
  getUserServiceTransactions(userId) {
    const transactions = this.getTransactions();
    return transactions.filter(transaction =>
      transaction.userId === userId &&
      transaction.type === 'debit' &&
      transaction.serviceType
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Save session data
   * @param {Object} sessionData - Session data to save
   */
  saveSession(sessionData) {
    try {
      const encryptedData = encryptData(sessionData);
      localStorage.setItem(this.SESSION_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Get session data
   * @returns {Object|null} - Session data or null
   */
  getSession() {
    try {
      const encryptedData = localStorage.getItem(this.SESSION_KEY);
      if (!encryptedData) return null;
      
      return decryptData(encryptedData);
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Initialize default superadmin user if no users exist
   */
  initializeDefaultUsers() {
    const users = this.getUsers();
    if (users.length === 0) {
      // Create default superadmin
      const adminUser = this.createUser({
        username: 'admin',
        passwordHash: hashPassword('admin123'),
        role: 'superadmin',
        balance: 100.00
      });

      // Add some mock service transactions for testing
      this.addMockServiceTransactions(adminUser.id);
    }
  }

  /**
   * Add mock service transactions for testing the ChecksHistory component
   */
  addMockServiceTransactions(userId) {
    const mockTransactions = [
      {
        userId,
        type: 'debit',
        amount: 5.00,
        previousBalance: 100.00,
        newBalance: 95.00,
        description: 'Irish History Check - 12D12345',
        performedBy: 'system',
        serviceType: 'history',
        vehicleIdentifier: '12D12345',
        checkData: {
          registration: '12D12345',
          vin: 'WVWZZZ1JZ3W386752',
          make: 'Volkswagen',
          model: 'Golf',
          year: 2012,
          engine: '1.6 TDI',
          fuel: 'Diesel',
          color: 'Silver',
          history: {
            previousOwners: 2,
            accidents: 0,
            serviceHistory: 'Full service history',
            nctStatus: 'Pass',
            nctExpiry: '2024-08-15'
          },
          finance: {
            outstandingFinance: false
          }
        }
      },
      {
        userId,
        type: 'debit',
        amount: 3.00,
        previousBalance: 95.00,
        newBalance: 92.00,
        description: 'Vehicle Valuation - 13D67890',
        performedBy: 'system',
        serviceType: 'valuation',
        vehicleIdentifier: '13D67890',
        checkData: {
          vehicle: {
            make: 'Toyota',
            model: 'Corolla',
            year: 2013,
            registration: '13D67890'
          },
          factors: {
            condition: 'good',
            mileage: 125000,
            marketTrend: 'stable'
          },
          valuation: {
            trade: 6500,
            private: 8200,
            retail: 9800,
            lastUpdated: '2024-01-10'
          }
        }
      },
      {
        userId,
        type: 'debit',
        amount: 2.00,
        previousBalance: 92.00,
        newBalance: 90.00,
        description: 'VIN Check - WVWZZZ1JZ3W386752',
        performedBy: 'system',
        serviceType: 'vin',
        vehicleIdentifier: 'WVWZZZ1JZ3W386752',
        checkData: {
          vin: 'WVWZZZ1JZ3W386752',
          valid: true,
          country: 'Germany',
          manufacturer: 'Volkswagen',
          year: 2012,
          found: true,
          vehicle: {
            registration: '12D12345',
            make: 'Volkswagen',
            model: 'Golf',
            year: 2012,
            engine: '1.6 TDI',
            fuel: 'Diesel'
          }
        }
      },
      {
        userId,
        type: 'debit',
        amount: 2.00,
        previousBalance: 90.00,
        newBalance: 88.00,
        description: 'VIN Check - 1HGBH41JXMN109186',
        performedBy: 'system',
        serviceType: 'vin',
        vehicleIdentifier: '1HGBH41JXMN109186',
        checkData: {
          vin: '1HGBH41JXMN109186',
          valid: true,
          country: 'United States',
          manufacturer: 'Honda',
          year: 1991,
          found: false
        }
      }
    ];

    // Add each mock transaction with a slight delay in timestamps
    mockTransactions.forEach((transactionData, index) => {
      const transaction = {
        ...transactionData,
        id: uuidv4(),
        timestamp: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString() // Each transaction 1 day apart
      };
      
      const transactions = this.getTransactions();
      transactions.push(transaction);
      this.saveTransactions(transactions);
    });
  }
}

// Export singleton instance
export default new SecureStorage();
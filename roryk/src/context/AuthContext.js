import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { hashPassword, verifyPassword } from "../utils/encryption";
import secureStorage from "../utils/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(() => {
    try {
      if (user && user.id) {
        const freshUserData = secureStorage.getUserById(user.id);
        if (freshUserData) {
          setUser(freshUserData);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user]);

  // Initialize on component mount
  useEffect(() => {
    initializeAuth();
    
    // Listen for data sync events from other tabs/devices
    const handleDataSync = (event) => {
      if (event.detail.key === 'secure_users') {
        refreshUserData();
      }
    };
    
    window.addEventListener('dataSync', handleDataSync);
    
    return () => {
      window.removeEventListener('dataSync', handleDataSync);
    };
  }, [refreshUserData]);

  const initializeAuth = () => {
    try {
      // Initialize default users if none exist
      secureStorage.initializeDefaultUsers();
      
      // Check for existing session
      const session = secureStorage.getSession();
      if (session && session.userId) {
        const userData = secureStorage.getUserById(session.userId);
        if (userData) {
          setUser(userData);
        } else {
          secureStorage.clearSession();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const userData = secureStorage.getUserByUsername(username);
      
      if (!userData) {
        throw new Error('User not found');
      }

      // Check if user account is approved
      if (userData.status === 'pending') {
        throw new Error('Your account is pending admin approval');
      }

      if (userData.status === 'rejected') {
        throw new Error('Your account has been rejected');
      }

      if (!verifyPassword(password, userData.passwordHash)) {
        throw new Error('Invalid password');
      }

      // Update last login
      const updatedUser = secureStorage.updateUser(userData.id, {
        lastLogin: new Date().toISOString()
      });

      // Save session
      secureStorage.saveSession({
        userId: updatedUser.id,
        loginTime: new Date().toISOString()
      });

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password, role = 'user') => {
    try {
      // Check if user already exists
      const existingUser = secureStorage.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Create new user
      const newUser = secureStorage.createUser({
        username,
        passwordHash: hashPassword(password),
        role
      });

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    secureStorage.clearSession();
  };

  const updateUserBalance = (userId, newBalance, description, performedBy) => {
    try {
      const userData = secureStorage.getUserById(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      const previousBalance = userData.balance;
      const amount = newBalance - previousBalance;
      const type = amount >= 0 ? 'credit' : 'debit';

      // Update user balance
      const updatedUser = secureStorage.updateUser(userId, { balance: newBalance });

      // Add transaction record
      secureStorage.addTransaction({
        userId,
        type,
        amount: Math.abs(amount),
        previousBalance,
        newBalance,
        description,
        performedBy
      });

      // Update current user if it's the same user
      if (user && user.id === userId) {
        setUser(updatedUser);
      }

      // Force refresh user data to sync across devices
      refreshUserData();

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };


  const getAllUsers = () => {
    return secureStorage.getUsers();
  };

  const getUserTransactions = (userId) => {
    return secureStorage.getUserTransactions(userId);
  };

  const getUserServiceTransactions = (userId) => {
    return secureStorage.getUserServiceTransactions(userId);
  };

  const getCheckData = (transactionId) => {
    return secureStorage.getCheckData(transactionId);
  };

  const registerUser = async (userData) => {
    try {
      // Check if username or email already exists
      const existingUser = secureStorage.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const existingEmail = secureStorage.getUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Create new user with pending status
      const newUser = secureStorage.createUser({
        username: userData.username,
        email: userData.email,
        passwordHash: hashPassword(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company,
        phone: userData.phone,
        role: 'user',
        status: 'pending', // Requires admin approval
        balance: 0
      });

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const approveUser = (userId) => {
    try {
      const updatedUser = secureStorage.updateUser(userId, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user.id
      });
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const rejectUser = (userId, reason) => {
    try {
      const updatedUser = secureStorage.updateUser(userId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user.id,
        rejectionReason: reason
      });
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getPendingUsers = () => {
    return secureStorage.getUsers().filter(user => user.status === 'pending');
  };

  const chargeCredits = (userId, amount, description, serviceType = null, checkData = null, vehicleIdentifier = null) => {
    try {
      const userData = secureStorage.getUserById(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.balance < amount) {
        throw new Error('Insufficient credits');
      }

      const previousBalance = userData.balance;
      const newBalance = userData.balance - amount;

      // Update user balance
      const updatedUser = secureStorage.updateUser(userId, { balance: newBalance });

      // Add transaction record with check data
      secureStorage.addTransaction({
        userId,
        type: 'debit',
        amount: Math.abs(amount),
        previousBalance,
        newBalance,
        description,
        performedBy: 'system',
        serviceType,
        checkData,
        vehicleIdentifier
      });

      // Update current user if it's the same user
      if (user && user.id === userId) {
        setUser(updatedUser);
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteUser = (userId) => {
    try {
      const success = secureStorage.deleteUser(userId);
      if (!success) {
        throw new Error('User not found');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    registerUser,
    logout,
    updateUserBalance,
    chargeCredits,
    getAllUsers,
    getUserTransactions,
    getUserServiceTransactions,
    getCheckData,
    deleteUser,
    approveUser,
    rejectUser,
    getPendingUsers,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

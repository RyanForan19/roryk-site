const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({}).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users.map(user => user.toJSON())
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get pending users (admin only)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const pendingUsers = await User.find({ status: 'pending' }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: pendingUsers.map(user => user.toJSON())
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user balance
router.put('/:userId/balance', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newBalance, description, performedBy } = req.body;

    // Check if user has permission to update balance
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const previousBalance = user.balance;
    const amount = newBalance - previousBalance;
    const type = amount >= 0 ? 'credit' : 'debit';

    // Update user balance
    user.balance = newBalance;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type,
      amount: Math.abs(amount),
      previousBalance,
      newBalance,
      description: description || 'Balance update',
      performedBy: performedBy || req.user.username
    });

    await transaction.save();

    res.json({
      success: true,
      user: user.toJSON(),
      transaction: transaction.toJSON()
    });

  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Approve user (admin only)
router.put('/:userId/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.status = 'approved';
    user.approvedAt = new Date();
    user.approvedBy = req.user.userId;
    await user.save();

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reject user (admin only)
router.put('/:userId/reject', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { userId } = req.params;
    const { reason } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.status = 'rejected';
    user.rejectedAt = new Date();
    user.rejectedBy = req.user.userId;
    user.rejectionReason = reason || 'No reason provided';
    await user.save();

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete user (superadmin only)
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Superadmin privileges required.'
      });
    }

    const { userId } = req.params;
    
    // Don't allow deleting self
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Also delete user's transactions
    await Transaction.deleteMany({ userId });

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
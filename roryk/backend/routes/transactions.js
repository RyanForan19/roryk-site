const express = require('express');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get user's transactions
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own transactions, admins can view any
    if (req.user.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const transactions = await Transaction.find({ userId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's service transactions (with check data)
router.get('/user/:userId/services', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own transactions, admins can view any
    if (req.user.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const serviceTransactions = await Transaction.find({
      userId,
      type: 'debit',
      serviceType: { $ne: null }
    })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions: serviceTransactions
    });

  } catch (error) {
    console.error('Get service transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all transactions (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 50, type, serviceType } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (serviceType) query.serviceType = serviceType;

    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get transaction by ID
router.get('/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'username email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Users can only view their own transactions, admins can view any
    if (req.user.userId !== transaction.userId._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create transaction (for service charges, etc.)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      userId,
      type,
      amount,
      previousBalance,
      newBalance,
      description,
      serviceType,
      checkData,
      vehicleIdentifier,
      stripePaymentIntentId
    } = req.body;

    // Validate required fields
    if (!userId || !type || !amount || previousBalance === undefined || newBalance === undefined || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Users can only create transactions for themselves, admins can create for anyone
    if (req.user.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const transaction = new Transaction({
      userId,
      type,
      amount,
      previousBalance,
      newBalance,
      description,
      performedBy: req.user.username,
      serviceType: serviceType || null,
      checkData: checkData || null,
      vehicleIdentifier: vehicleIdentifier || null,
      stripePaymentIntentId: stripePaymentIntentId || null
    });

    await transaction.save();
    await transaction.populate('userId', 'username email');

    res.status(201).json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
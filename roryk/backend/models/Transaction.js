const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  previousBalance: {
    type: Number,
    required: true,
    min: 0
  },
  newBalance: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  performedBy: {
    type: String,
    required: true,
    maxlength: 100
  },
  serviceType: {
    type: String,
    enum: ['history', 'valuation', 'vin', null],
    default: null
  },
  checkData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  vehicleIdentifier: {
    type: String,
    default: null,
    maxlength: 100
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripePaymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', null],
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ stripePaymentIntentId: 1 });
transactionSchema.index({ serviceType: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic cleanup
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
});

// Compound index for efficient queries
passwordResetSchema.index({ token: 1, used: 1 });
passwordResetSchema.index({ userId: 1, createdAt: -1 });

// Static method to create a password reset token
passwordResetSchema.statics.createResetToken = function(userId, email, ipAddress, userAgent) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  return this.create({
    userId,
    email,
    token,
    ipAddress,
    userAgent
  });
};

// Static method to find and validate a reset token
passwordResetSchema.statics.findValidToken = function(token) {
  return this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
};

// Instance method to mark token as used
passwordResetSchema.methods.markAsUsed = function() {
  this.used = true;
  return this.save();
};

// Static method to cleanup expired tokens (optional, as TTL index handles this)
passwordResetSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true }
    ]
  });
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
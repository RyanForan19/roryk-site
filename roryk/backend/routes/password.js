const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate limiting for password reset requests
const resetRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many password reset requests. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset attempts
const resetAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 attempts per windowMs
  message: {
    error: 'Too many password reset attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password changes
const changePasswordLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each user to 5 password changes per windowMs
  message: {
    error: 'Too many password change attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/password/forgot
// @desc    Request password reset
// @access  Public
router.post('/forgot', resetRequestLimit, async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Check if user has too many recent reset requests
      const recentResets = await PasswordReset.countDocuments({
        userId: user._id,
        createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      });

      if (recentResets >= 3) {
        return res.status(429).json({
          error: 'Too many reset requests. Please wait before requesting another reset.'
        });
      }

      // Create password reset token
      const resetToken = await PasswordReset.createResetToken(
        user._id,
        normalizedEmail,
        req.ip,
        req.get('User-Agent')
      );

      // Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(
        normalizedEmail,
        resetToken.token,
        user.name
      );

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        // Don't expose email sending errors to client
      }

      console.log(`Password reset requested for: ${normalizedEmail}`);
    }

    // Always return success message
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: 'Server error occurred while processing password reset request'
    });
  }
});

// @route   POST /api/password/reset
// @desc    Reset password with token
// @access  Public
router.post('/reset', resetAttemptLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find valid reset token
    const resetRecord = await PasswordReset.findValidToken(token);

    if (!resetRecord) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }

    // Get user
    const user = resetRecord.userId;
    if (!user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Mark reset token as used
    await resetRecord.markAsUsed();

    // Send confirmation email
    const emailResult = await emailService.sendPasswordChangeConfirmation(
      user.email,
      user.name
    );

    if (!emailResult.success) {
      console.error('Failed to send password change confirmation:', emailResult.error);
    }

    console.log(`Password reset completed for user: ${user.email}`);

    res.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Server error occurred while resetting password'
    });
  }
});

// @route   POST /api/password/change
// @desc    Change password (authenticated users)
// @access  Private
router.post('/change', auth, changePasswordLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'New password must be different from current password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    await user.save();

    // Send confirmation email
    const emailResult = await emailService.sendPasswordChangeConfirmation(
      user.email,
      user.name
    );

    if (!emailResult.success) {
      console.error('Failed to send password change confirmation:', emailResult.error);
    }

    console.log(`Password changed for user: ${user.email}`);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Server error occurred while changing password'
    });
  }
});

// @route   GET /api/password/validate-token/:token
// @desc    Validate password reset token
// @access  Public
router.get('/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      });
    }

    // Find valid reset token
    const resetRecord = await PasswordReset.findValidToken(token);

    if (!resetRecord) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid or expired reset token'
      });
    }

    res.json({
      valid: true,
      email: resetRecord.email,
      expiresAt: resetRecord.expiresAt
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Server error occurred while validating token'
    });
  }
});

// @route   DELETE /api/password/cleanup
// @desc    Cleanup expired password reset tokens (admin only)
// @access  Private (Admin)
router.delete('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
    }

    const result = await PasswordReset.cleanupExpired();
    
    res.json({
      message: 'Cleanup completed',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Server error occurred during cleanup'
    });
  }
});

module.exports = router;
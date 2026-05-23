import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, firstName: req.body.firstName });
    
    const { firstName, lastName, email, password, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();

    console.log('Creating new user...');

    // Create user
    const userDoc = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      phone: phone || null,
      role: 'customer',
      email_verified: false,
      verification_token: verificationToken
    });
    const user = userDoc.toObject();

    console.log('User created successfully:', user.id);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Registration successful for:', email);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified
      }
    });

    void Promise.allSettled([
      sendVerificationEmail(email, verificationToken),
      sendWelcomeEmail(email, {
        firstName,
        lastName,
        email
      })
    ]).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('Post-registration email sending error:', result.reason);
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against current or legacy stored fields
    const storedPassword = user.password_hash || user.password;
    if (!storedPassword) {
      console.log('No stored password found for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, storedPassword);
    } catch {
      isValidPassword = password === storedPassword;
    }

    if (!isValidPassword && user.password) {
      isValidPassword = password === user.password;
    }

    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { $set: { last_login: new Date() } });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Find user with verification token
    const user = await User.findOne({ verification_token: token }).lean();
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Update user as verified
    await User.updateOne({ _id: user._id }, { $set: { email_verified: true, verification_token: null } });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists, a reset email has been sent' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Save reset token
    await User.updateOne({ _id: user._id }, { $set: { reset_token: resetToken, reset_expires: new Date(Date.now() + 3600000) } });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
    }

    res.json({ message: 'If an account exists, a reset email has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with valid reset token
    const user = await User.findOne({ reset_token: token, reset_expires: { $gt: new Date() } }).lean();
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await User.updateOne({ _id: user._id }, { $set: { password_hash: hashedPassword, reset_token: null, reset_expires: null } });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id?.toString?.() || req.user.id,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      emailVerified: req.user.email_verified
    }
  });
});

export default router;
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const recoveryCode = nanoid(8).toUpperCase();

    const user = await User.create({
      email,
      password,
      recoveryCode,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
      recoveryCode,
      message: 'Account created. Save your recovery code — it is shown only once.',
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, recoveryCode, newPassword } = req.body;

    if (!email || !recoveryCode || !newPassword) {
      return res.status(400).json({ error: 'Email, recovery code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    if (user.recoveryCode !== recoveryCode.toUpperCase()) {
      return res.status(401).json({ error: 'Invalid recovery code' });
    }

    user.password = newPassword;
    const newRecoveryCode = nanoid(8).toUpperCase();
    user.recoveryCode = newRecoveryCode;
    await user.save();

    res.json({
      message: 'Password reset successful. A new recovery code has been generated.',
      recoveryCode: newRecoveryCode,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user._id, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

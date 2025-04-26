import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pollution-tracker-secret-key';
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({
      name,
      email,
      password,
      role: 'user' 
    });
    await user.save();
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is disabled. Please contact administrator.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.lastLogin = Date.now();
    await user.save();
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
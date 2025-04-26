import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth, admin } from '../middleware/auth.js';
const router = express.Router();
router.get('/', auth, admin, async (req, res) => {
  try {
    const { role, isActive, limit = 100 } = req.query;
    const query = {};
    if (role) {
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(parseInt(limit));
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: password,
      role,
      isActive
    });
    const user = await newUser.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account' });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/:id/status', auth, admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (userToUpdate.role === 'admin' && isActive === false) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate the last admin account' });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const JWT_SECRET = process.env.JWT_SECRET || 'pollution-tracker-secret-key';
export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};
export const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required' });
  }
  next();
};
export const managerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Manager privileges required' });
  }
  next();
};
export default { auth, admin, managerOrAdmin };
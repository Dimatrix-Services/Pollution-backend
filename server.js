import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
dotenv.config();
import authRoutes from './routes/auth.js';
import pollutionRoutes from './routes/pollution.js';
import sensorRoutes from './routes/sensors.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js'
const app = express();
app.use(cors());
app.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pollution-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    createAdminUser();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
async function createAdminUser() {
  try {
    const User = mongoose.model('User');
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}
app.use('/api/auth', authRoutes);
app.use('/api/pollution', pollutionRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.get('/', (req, res) => {
  res.send('Pollution Tracker API is running');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;
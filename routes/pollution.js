import express from 'express';
import axios from 'axios';
import PollutionData from '../models/PollutionData.js';
import { auth, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/pollution
// @desc    Get all pollution data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { location, startDate, endDate, limit = 100 } = req.query;
    
    // Build query
    const query = {};
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    
    const pollutionData = await PollutionData.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(pollutionData);
  } catch (err) {
    console.error('Get pollution data error:', err);
    res.status(500).json({ message: 'Server error1' });
  }
});

// @route   GET /api/pollution/:id
// @desc    Get pollution data by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const pollutionData = await PollutionData.findById(req.params.id);
    
    if (!pollutionData) {
      return res.status(404).json({ message: 'Pollution data not found' });
    }
    
    res.json(pollutionData);
  } catch (err) {
    console.error('Get pollution data error:', err);
    res.status(500).json({ message: 'Server error1' });
  }
});

// @route   POST /api/pollution
// @desc    Create new pollution data record
// @access  Private (Manager or Admin)
router.post('/', auth, managerOrAdmin, async (req, res) => {
  try {
    const { location, aqi, pm25, pm10, o3, no2, so2, co, date } = req.body;
    
    const newPollutionData = new PollutionData({
      location,
      aqi,
      pm25,
      pm10,
      o3,
      no2,
      so2,
      co,
      date,
      recordedBy: req.user._id
    });
    
    const pollutionData = await newPollutionData.save();
    
    res.status(201).json(pollutionData);
  } catch (err) {
    console.error('Create pollution data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/pollution/:id
// @desc    Update pollution data
// @access  Private (Manager or Admin)
router.put('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const { location, aqi, pm25, pm10, o3, no2, so2, co, date } = req.body;
    
    const updateData = {
      location,
      aqi,
      pm25,
      pm10,
      o3,
      no2,
      so2,
      co,
      date
    };
    
    const pollutionData = await PollutionData.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!pollutionData) {
      return res.status(404).json({ message: 'Pollution data not found' });
    }
    
    res.json(pollutionData);
  } catch (err) {
    console.error('Update pollution data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/pollution/:id
// @desc    Delete pollution data
// @access  Private (Manager or Admin)
router.delete('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const pollutionData = await PollutionData.findByIdAndDelete(req.params.id);
    
    if (!pollutionData) {
      return res.status(404).json({ message: 'Pollution data not found' });
    }
    
    res.json({ message: 'Pollution data deleted' });
  } catch (err) {
    console.error('Delete pollution data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard/path', auth, async (req, res) => {
  try {
    
    const lon = -74.0060;
    const apiKey = process.env.OPENWEATHER_API_KEY || '12345'; // Replace with your key
    console.log(apiKey)
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
    
      res.json({
        current: response.data.list[0],
        forecast: [
          { date: 'Mon', aqi: 2, pm25: 8.5 },
          { date: 'Tue', aqi: 3, pm25: 12.3 },
          { date: 'Wed', aqi: 4, pm25: 18.7 },
          { date: 'Thu', aqi: 3, pm25: 14.2 },
          { date: 'Fri', aqi: 2, pm25: 9.8 },
          { date: 'Sat', aqi: 2, pm25: 7.6 },
          { date: 'Sun', aqi: 3, pm25: 11.5 }
        ],
        cityData: [
          { city: 'New York', aqi: 3 },
          { city: 'Los Angeles', aqi: 4 },
          { city: 'Chicago', aqi: 2 },
          { city: 'Houston', aqi: 3 },
          { city: 'Phoenix', aqi: 5 }
        ],
        sensorData: {
          total: 24,
          active: 22,
          maintenance: 2,
          offline: 0
        }
      });
    } catch (apiError) {
      res.json({
        current: {
          aqi: 3,
          components: {
            co: 350.47,
            no: 0.77,
            no2: 13.25,
            o3: 26.48,
            so2: 3.12,
            pm2_5: 12.35,
            pm10: 16.24,
            nh3: 1.05
          }
        },
        forecast: [
          { date: 'Mon', aqi: 2, pm25: 8.5 },
          { date: 'Tue', aqi: 3, pm25: 12.3 },
          { date: 'Wed', aqi: 4, pm25: 18.7 },
          { date: 'Thu', aqi: 3, pm25: 14.2 },
          { date: 'Fri', aqi: 2, pm25: 9.8 },
          { date: 'Sat', aqi: 2, pm25: 7.6 },
          { date: 'Sun', aqi: 3, pm25: 11.5 }
        ],
        cityData: [
          { city: 'New York', aqi: 3 },
          { city: 'Los Angeles', aqi: 4 },
          { city: 'Chicago', aqi: 2 },
          { city: 'Houston', aqi: 3 },
          { city: 'Phoenix', aqi: 5 }
        ],
        sensorData: {
          total: 24,
          active: 22,
          maintenance: 2,
          offline: 0
        }
      });
    }
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
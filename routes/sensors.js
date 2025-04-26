import express from 'express';
import Sensor from '../models/Sensor.js';
import { auth, managerOrAdmin } from '../middleware/auth.js';
const router = express.Router();
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, limit = 100 } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }
    const sensors = await Sensor.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit));
    res.json(sensors);
  } catch (err) {
    console.error('Get sensors error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (err) {
    console.error('Get sensor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/', auth, managerOrAdmin, async (req, res) => {
  try {
    const { name, location, coordinates, type, status, installationDate } = req.body;
    const existingSensor = await Sensor.findOne({ name });
    if (existingSensor) {
      return res.status(400).json({ message: 'Sensor with this name already exists' });
    }
    const newSensor = new Sensor({
      name,
      location,
      coordinates,
      type,
      status,
      installationDate,
      maintainedBy: req.user._id
    });
    const sensor = await newSensor.save();
    res.status(201).json(sensor);
  } catch (err) {
    console.error('Create sensor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const { name, location, coordinates, type, status, installationDate } = req.body;
    if (name) {
      const existingSensor = await Sensor.findOne({ name, _id: { $ne: req.params.id } });
      if (existingSensor) {
        return res.status(400).json({ message: 'Sensor with this name already exists' });
      }
    }
    const updateData = {
      name,
      location,
      coordinates,
      type,
      status,
      installationDate
    };
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (err) {
    console.error('Update sensor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json({ message: 'Sensor deleted' });
  } catch (err) {
    console.error('Delete sensor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/:id/status', auth, managerOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'maintenance', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (err) {
    console.error('Update sensor status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
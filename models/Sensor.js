import mongoose from 'mongoose';
const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'offline'],
    default: 'active'
  },
  lastReading: {
    type: Date,
    default: Date.now
  },
  installationDate: {
    type: String,
    required: true
  },
  maintainedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Sensor = mongoose.model('Sensor', sensorSchema);
export default Sensor;
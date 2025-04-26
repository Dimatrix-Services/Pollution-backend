import mongoose from 'mongoose';
const pollutionDataSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true
  },
  aqi: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  pm25: {
    type: Number,
    required: true,
    min: 0
  },
  pm10: {
    type: Number,
    required: true,
    min: 0
  },
  o3: {
    type: Number,
    required: true,
    min: 0
  },
  no2: {
    type: Number,
    required: true,
    min: 0
  },
  so2: {
    type: Number,
    required: true,
    min: 0
  },
  co: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String,
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const PollutionData = mongoose.model('PollutionData', pollutionDataSchema);
export default PollutionData;
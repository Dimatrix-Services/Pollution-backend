import mongoose from 'mongoose';
const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'sensor', 'custom'],
    required: true
  },
  parameters: {
    location: {
      type: String,
      default: 'all'
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['generating', 'ready', 'failed'],
    default: 'generating'
  },
  url: {
    type: String,
    default: null
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Report = mongoose.model('Report', reportSchema);
export default Report;
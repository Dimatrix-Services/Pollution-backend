import express from 'express';
import Report from '../models/Report.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, limit = 100 } = req.query;
    const query = {};
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (req.user.role !== 'admin' && report.generatedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(report);
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/', auth, async (req, res) => {
  try {
    const { title, type, parameters } = req.body;
    const newReport = new Report({
      title,
      type,
      parameters,
      generatedBy: req.user._id
    });
    const report = await newReport.save();
    setTimeout(async () => {
      try {
        await Report.findByIdAndUpdate(report._id, {
          status: 'ready',
          url: `/reports/${report._id}.pdf` 
        });
      } catch (err) {
        console.error('Report generation error:', err);
      }
    }, 5000);
    res.status(201).json(report);
  } catch (err) {
    console.error('Generate report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (req.user.role !== 'admin' && report.generatedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
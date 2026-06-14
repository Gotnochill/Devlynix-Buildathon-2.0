const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  type:        String,
  severity:    String,
  title:       String,
  description: String,
  location:    String,
  cveId:       String,
  score:       Number,
  source:      String,
}, { _id: false });

const scanSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true, index: true },
  status:      { type: String, default: 'queued' },
  target:      String,
  type:        String,
  findings:    [findingSchema],
  summary:     mongoose.Schema.Types.Mixed,
  error:       String,
  completedAt: String,
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);

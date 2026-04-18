const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String, default: 'unknown' },
  page: { type: String, default: '/' },
  method: { type: String, default: 'GET' },
  userAgent: { type: String, default: '' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  device: { type: String, default: 'Desktop' },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
  region: { type: String, default: 'Unknown' },
  isp: { type: String, default: 'Unknown' },
  referrer: { type: String, default: 'Direct' },
}, { timestamps: true });

visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ ip: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);

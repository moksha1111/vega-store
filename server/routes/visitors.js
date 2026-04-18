const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Visitor = require('../models/Visitor');

function parseUserAgent(ua) {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  let browser = 'Unknown';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  let os = 'Unknown';
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let device = 'Desktop';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
}

async function fetchGeoData(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === 'unknown') {
    return { country: 'Localhost', city: 'Localhost', region: 'Localhost', isp: 'Local' };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName,isp`);
    const data = await res.json();
    if (data.country) return { country: data.country, city: data.city, region: data.regionName, isp: data.isp };
  } catch {}
  return { country: 'Unknown', city: 'Unknown', region: 'Unknown', isp: 'Unknown' };
}

// POST /api/visitors/track — records a visit to the home page
router.post('/track', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgent);
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
    const geo = await fetchGeoData(ip);

    await Visitor.create({
      ip, page: '/', method: 'GET', userAgent, browser, os, device, referrer, ...geo,
    });
    res.status(201).json({ tracked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/visitors/stats — aggregated stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [total, uniqueIPs, todayCount, weekCount, monthCount, topBrowsers, topCountries, topPages, deviceBreakdown, hourlyToday] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.distinct('ip').then(ips => ips.length),
      Visitor.countDocuments({ createdAt: { $gte: todayStart } }),
      Visitor.countDocuments({ createdAt: { $gte: weekStart } }),
      Visitor.countDocuments({ createdAt: { $gte: monthStart } }),
      Visitor.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Visitor.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visitor.aggregate([
        { $match: { page: { $not: /^\/(api|assets)/ } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visitor.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Visitor.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    res.json({
      total,
      uniqueVisitors: uniqueIPs,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      topBrowsers: topBrowsers.map(b => ({ name: b._id, count: b.count })),
      topCountries: topCountries.map(c => ({ name: c._id, count: c.count })),
      topPages: topPages.map(p => ({ name: p._id, count: p.count })),
      devices: deviceBreakdown.map(d => ({ name: d._id, count: d.count })),
      hourlyToday: hourlyToday.map(h => ({ hour: h._id, count: h.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/visitors — paginated list of all visits
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.country) filter.country = req.query.country;
    if (req.query.browser) filter.browser = req.query.browser;
    if (req.query.device) filter.device = req.query.device;
    if (req.query.search) {
      filter.$or = [
        { ip: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } },
        { country: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [visitors, total] = await Promise.all([
      Visitor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-userAgent -__v'),
      Visitor.countDocuments(filter),
    ]);

    res.json({ visitors, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/visitors/:id — delete a single visit
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visit not found' });
    res.json({ message: 'Visit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/visitors — delete all visits
router.delete('/', protect, admin, async (req, res) => {
  try {
    const result = await Visitor.deleteMany({});
    res.json({ message: 'All visits deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

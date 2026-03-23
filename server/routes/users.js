const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
}));

// PUT /api/users/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.address) user.address = req.body.address;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
}));

// GET /api/users — admin only
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
}));

// PUT /api/users/:id/role — admin only
router.put('/:id/role', protect, admin, asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400); throw new Error('Cannot change your own role');
  }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.role = user.role === 'admin' ? 'user' : 'admin';
  const updated = await user.save();
  res.json({ _id: updated._id, role: updated.role });
}));

// DELETE /api/users/:id — admin only
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed' });
}));

module.exports = router;

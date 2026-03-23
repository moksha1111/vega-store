const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect, admin } = require('../middleware/auth');

// POST /api/orders
router.post('/', protect, asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, items, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
  if (!items || items.length === 0) { res.status(400); throw new Error('No items'); }
  const order = await Order.create({ user: req.user._id, items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice });
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(201).json(order);
}));

// GET /api/orders/myorders
router.get('/myorders', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}));

// GET /api/orders — admin
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
}));

// GET /api/orders/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  res.json(order);
}));

// PUT /api/orders/:id/pay
router.put('/:id/pay', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  await order.save();
  res.json(order);
}));

// PUT /api/orders/:id/status — admin
router.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.status = req.body.status;
  if (req.body.status === 'delivered') order.deliveredAt = Date.now();
  await order.save();
  res.json(order);
}));

module.exports = router;

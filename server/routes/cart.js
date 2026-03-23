const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/cart
router.get('/', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
  res.json(cart || { items: [] });
}));

// POST /api/cart — add item
router.post('/', protect, asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) {
    existing.qty = qty;
  } else {
    cart.items.push({ product: productId, name: product.name, image: product.images[0] || '', price: product.price, qty });
  }
  await cart.save();
  res.json(cart);
}));

// DELETE /api/cart/:productId — remove item
router.delete('/:productId', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.json(cart || { items: [] });
}));

// DELETE /api/cart — clear cart
router.delete('/', protect, asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
}));

module.exports = router;

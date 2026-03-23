const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// GET /api/products
router.get('/', asyncHandler(async (req, res) => {
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
  const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};
  const filter = { ...keyword, ...category, ...minPrice, ...maxPrice };
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter).limit(limit).skip(limit * (page - 1)).sort({ createdAt: -1 });
  res.json({ products, page, pages: Math.ceil(count / limit), total: count });
}));

// GET /api/products/featured
router.get('/featured', asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);
  res.json(products);
}));

// GET /api/products/categories
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
}));

// GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
}));

// POST /api/products — admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

// PUT /api/products/:id — admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
}));

// DELETE /api/products/:id — admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
}));

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (already) { res.status(400); throw new Error('Already reviewed'); }
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
}));

module.exports = router;

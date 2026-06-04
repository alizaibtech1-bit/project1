const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sort } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    let products = Product.find(query);
    if (sort === 'price') products = products.sort({ price: 1 });
    else if (sort === '-price') products = products.sort({ price: -1 });
    else if (sort === 'rating') products = products.sort({ rating: -1 });
    else products = products.sort({ createdAt: -1 });

    res.json(await products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, originalPrice, countInStock, isFeatured, ingredients, howToUse, skinType, rating, numReviews } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({
      name, slug, description, category, price, originalPrice, countInStock,
      isFeatured: isFeatured === 'true', ingredients, howToUse, skinType,
      rating: rating || 0, numReviews: numReviews || 0,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { name, description, category, price, originalPrice, countInStock, isFeatured, ingredients, howToUse, skinType, rating, numReviews } = req.body;
    if (name) { product.name = name; product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true';
    if (ingredients) product.ingredients = ingredients;
    if (howToUse) product.howToUse = howToUse;
    if (skinType) product.skinType = skinType;
    if (rating) product.rating = rating;
    if (numReviews) product.numReviews = numReviews;
    if (req.file) product.image = `/uploads/${req.file.filename}`;
    res.json(await product.save());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) res.json({ message: 'Product removed' });
    else res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

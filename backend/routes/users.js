const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) res.json({ message: 'User removed' });
    else res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = req.body.role || user.role;
      res.json(await user.save());
    } else res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(req.params.productId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

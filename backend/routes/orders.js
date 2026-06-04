const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, orderNotes } = req.body;
    const orderData = { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, orderNotes };
    if (req.user) orderData.user = req.user._id;
    const order = await Order.create(orderData);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      if (req.body.isPaid) { order.isPaid = true; order.paidAt = Date.now(); }
      if (req.body.isDelivered) { order.isDelivered = true; order.deliveredAt = Date.now(); }
      res.json(await order.save());
    } else res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalProducts = await require('../models/Product').countDocuments();
    const totalUsers = await require('../models/User').countDocuments({ role: 'user' });
    const recentOrders = await Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5);
    res.json({ totalOrders, totalRevenue: totalRevenue[0]?.total || 0, totalProducts, totalUsers, recentOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

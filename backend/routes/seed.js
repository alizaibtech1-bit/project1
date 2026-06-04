const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.send('Already seeded — ' + count + ' products exist');
    const products = [
      { name: 'Hydrating Facewash', description: 'Gentle daily cleanser', price: 7800, originalPrice: 9800, category: 'Facewash', countInStock: 50, rating: 4.5, numReviews: 124, image: '', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Aloe Vera, Glycerin, Green Tea', howToUse: 'Apply to damp skin, massage, rinse' },
      { name: 'Silk Sunblock SPF 50', description: 'Broad spectrum protection', price: 11800, category: 'Sunblock', countInStock: 40, rating: 4.8, numReviews: 89, image: '', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Zinc Oxide, Vitamin E', howToUse: 'Apply 15 mins before sun exposure' },
      { name: 'Vitamin C Bright Serum', description: 'Targeted brightening treatment', price: 19000, originalPrice: 23800, category: 'Serums', countInStock: 35, rating: 4.9, numReviews: 256, image: '', isFeatured: true, skinType: 'Dull Skin', ingredients: 'Vitamin C, Hyaluronic Acid', howToUse: 'Apply 3 drops to clean skin' },
      { name: 'Night Renewal Cream', description: 'Deep overnight hydration', price: 20200, category: 'Creams', countInStock: 30, rating: 4.7, numReviews: 198, image: '', isFeatured: true, skinType: 'Dry Skin', ingredients: 'Retinol, Shea Butter', howToUse: 'Apply before bed' },
      { name: 'Gentle Foaming Cleanser', description: 'Soft foam cleanser', price: 9000, category: 'Facewash', countInStock: 45, rating: 4.3, numReviews: 67, image: '', skinType: 'Sensitive Skin', ingredients: 'Chamomile, Oat Extract', howToUse: 'Use morning and night' },
      { name: 'Matte Sunblock SPF 30', description: 'Oil-free matte protection', price: 10600, category: 'Sunblock', countInStock: 38, rating: 4.6, numReviews: 112, image: '', skinType: 'Oily Skin', ingredients: 'Salicylic Acid, Zinc', howToUse: 'Apply as last step' },
      { name: 'Hyaluronic Acid Serum', description: 'Intense hydration booster', price: 16200, category: 'Serums', countInStock: 42, rating: 4.8, numReviews: 341, image: '', skinType: 'Dehydrated Skin', ingredients: 'Hyaluronic Acid, Ceramides', howToUse: 'Apply to damp skin' },
      { name: 'Rich Moisture Cream', description: 'Nourishing daily cream', price: 18500, originalPrice: 21800, category: 'Creams', countInStock: 28, rating: 4.4, numReviews: 156, image: '', skinType: 'Normal Skin', ingredients: 'Squalane, Peptides', howToUse: 'Apply after serum' }
    ];
    await Product.insertMany(products);
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@glow.com', password: hashed, role: 'admin' });
    await User.create({ name: 'User', email: 'user@glow.com', password: hashed, role: 'user' });
    res.send('Database seeded! 8 products, 2 users created.');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});
module.exports = router;

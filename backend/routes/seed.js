const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');


router.get('/', async (req, res) => {
  try {
       if (req.query.reset) {
      await Product.deleteMany({});
      await User.deleteMany({});
    }
    const count = await Product.countDocuments();
    if (count > 0) return res.send('Already seeded — ' + count + ' products exist');
        const products = [
      { name: 'Hydrating Facewash', slug: 'hydrating-facewash', description: 'Gentle daily cleanser', price: 7800, originalPrice: 9800, category: 'Facewash', countInStock: 50, rating: 4.5, numReviews: 124, image: '/uploads/facewash1.jpg', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Aloe Vera, Glycerin, Green Tea', howToUse: 'Apply to damp skin, massage, rinse' },
      { name: 'Silk Sunblock SPF 50', slug: 'silk-sunblock-spf-50', description: 'Broad spectrum protection', price: 11800, category: 'Sunblock', countInStock: 40, rating: 4.8, numReviews: 89, image: '/uploads/sunblock1.jpg', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Zinc Oxide, Vitamin E', howToUse: 'Apply 15 mins before sun exposure' },
      { name: 'Vitamin C Bright Serum', slug: 'vitamin-c-bright-serum', description: 'Targeted brightening treatment', price: 19000, originalPrice: 23800, category: 'Serums', countInStock: 35, rating: 4.9, numReviews: 256, image: '/uploads/serum1.jpg', isFeatured: true, skinType: 'Dull Skin', ingredients: 'Vitamin C, Hyaluronic Acid', howToUse: 'Apply 3 drops to clean skin' },
      { name: 'Night Renewal Cream', slug: 'night-renewal-cream', description: 'Deep overnight hydration', price: 20200, category: 'Creams', countInStock: 30, rating: 4.7, numReviews: 198, image: '/uploads/cream1.jpg', isFeatured: true, skinType: 'Dry Skin', ingredients: 'Retinol, Shea Butter', howToUse: 'Apply before bed' },
      { name: 'Gentle Foaming Cleanser', slug: 'gentle-foaming-cleanser', description: 'Soft foam cleanser', price: 9000, category: 'Facewash', countInStock: 45, rating: 4.3, numReviews: 67, image: '/uploads/facewash2.jpg', skinType: 'Sensitive Skin', ingredients: 'Chamomile, Oat Extract', howToUse: 'Use morning and night' },
      { name: 'Matte Sunblock SPF 30', slug: 'matte-sunblock-spf-30', description: 'Oil-free matte protection', price: 10600, category: 'Sunblock', countInStock: 38, rating: 4.6, numReviews: 112, image: '/uploads/sunblock2.jpg', skinType: 'Oily Skin', ingredients: 'Salicylic Acid, Zinc', howToUse: 'Apply as last step' },
      { name: 'Hyaluronic Acid Serum', slug: 'hyaluronic-acid-serum', description: 'Intense hydration booster', price: 16200, category: 'Serums', countInStock: 42, rating: 4.8, numReviews: 341, image: '/uploads/serum2.jpg', skinType: 'Dehydrated Skin', ingredients: 'Hyaluronic Acid, Ceramides', howToUse: 'Apply to damp skin' },
      { name: 'Rich Moisture Cream', slug: 'rich-moisture-cream', description: 'Nourishing daily cream', price: 18500, originalPrice: 21800, category: 'Creams', countInStock: 28, rating: 4.4, numReviews: 156, image: '/uploads/cream2.jpg', skinType: 'Normal Skin', ingredients: 'Squalane, Peptides', howToUse: 'Apply after serum' }
    ];
    await Product.insertMany(products);
    await User.create({ name: 'Admin', email: 'admin@glow.com', password: 'admin123', role: 'admin' });
await User.create({ name: 'User', email: 'user@glow.com', password: 'admin123', role: 'user' });
    res.send('Database seeded! 8 products, 2 users created.');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});
module.exports = router;

const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

router.get('/', async (req, res) => {
  try {
    if (req.query.reset === 'true') {
      await Product.deleteMany({});
      await User.deleteMany({});
      await Review.deleteMany({});
    }

    const count = await Product.countDocuments();
    if (count > 0) return res.send('Already seeded — ' + count + ' products exist');

    const products = await Product.insertMany([
      { name: 'Hydrating Facewash', slug: 'hydrating-facewash', description: 'Gentle daily cleanser that removes impurities while maintaining your skin\'s natural moisture barrier.', price: 7800, originalPrice: 9800, category: 'Facewash', countInStock: 50, rating: 4.5, numReviews: 0, image: '/uploads/facewash1.jpg', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Aloe Vera, Glycerin, Green Tea', howToUse: 'Apply to damp skin, massage, rinse' },
      { name: 'Silk Sunblock SPF 50', slug: 'silk-sunblock-spf-50', description: 'Weightless, broad-spectrum SPF 50 protection with a silky finish. No white cast.', price: 11800, category: 'Sunblock', countInStock: 40, rating: 4.8, numReviews: 0, image: '/uploads/sunblock1.jpg', isFeatured: true, skinType: 'All Skin Types', ingredients: 'Zinc Oxide, Vitamin E', howToUse: 'Apply 15 mins before sun exposure' },
      { name: 'Vitamin C Bright Serum', slug: 'vitamin-c-bright-serum', description: 'A potent Vitamin C serum that brightens, evens skin tone, and fights free radicals.', price: 19000, originalPrice: 23800, category: 'Serums', countInStock: 35, rating: 4.9, numReviews: 0, image: '/uploads/serum1.jpg', isFeatured: true, skinType: 'Dull Skin', ingredients: 'Vitamin C, Hyaluronic Acid', howToUse: 'Apply 3 drops to clean skin' },
      { name: 'Night Renewal Cream', slug: 'night-renewal-cream', description: 'Indulgent overnight cream with peptides and ceramides for visibly firmer, smoother skin.', price: 20200, category: 'Creams', countInStock: 30, rating: 4.7, numReviews: 0, image: '/uploads/cream1.jpg', isFeatured: true, skinType: 'Dry Skin', ingredients: 'Retinol, Shea Butter', howToUse: 'Apply before bed' },
      { name: 'Gentle Foaming Cleanser', slug: 'gentle-foaming-cleanser', description: 'Sulfate-free foaming cleanser that removes makeup without stripping.', price: 9000, category: 'Facewash', countInStock: 45, rating: 4.3, numReviews: 0, image: '/uploads/facewash2.jpg', skinType: 'Sensitive Skin', ingredients: 'Chamomile, Oat Extract', howToUse: 'Use morning and night' },
      { name: 'Matte Sunblock SPF 30', slug: 'matte-sunblock-spf-30', description: 'Oil-free mattifying sunblock for combination and oily skin.', price: 10600, category: 'Sunblock', countInStock: 38, rating: 4.6, numReviews: 0, image: '/uploads/sunblock2.jpg', skinType: 'Oily Skin', ingredients: 'Salicylic Acid, Zinc', howToUse: 'Apply as last step' },
      { name: 'Hyaluronic Acid Serum', slug: 'hyaluronic-acid-serum', description: 'Ultra-light hydration serum with triple-weight hyaluronic acid for deep hydration.', price: 16200, category: 'Serums', countInStock: 42, rating: 4.8, numReviews: 0, image: '/uploads/serum2.jpg', skinType: 'Dehydrated Skin', ingredients: 'Hyaluronic Acid, Ceramides', howToUse: 'Apply to damp skin' },
      { name: 'Rich Moisture Cream', slug: 'rich-moisture-cream', description: 'Deeply nourishing cream with shea butter and squalane for dry skin.', price: 18500, originalPrice: 21800, category: 'Creams', countInStock: 28, rating: 4.4, numReviews: 0, image: '/uploads/cream2.jpg', skinType: 'Normal Skin', ingredients: 'Squalane, Peptides', howToUse: 'Apply after serum' }
    ]);

    // Password will be auto-hashed by User model pre('save') hook
    await User.create({ name: 'Admin', email: 'admin@glow.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'User', email: 'user@glow.com', password: 'admin123', role: 'user' });

    const reviewData = [
      { productIdx: 0, name: 'Zara Ahmed', rating: 5, title: 'Holy grail facewash!', comment: 'I have been using this for a month and my skin has never looked better. The gentle formula cleans without stripping. Absolutely love it!' },
      { productIdx: 0, name: 'Fatima Khan', rating: 4, title: 'Great daily cleanser', comment: 'Very gentle on my sensitive skin. Does not cause any irritation. Would recommend to anyone with dry skin.' },
      { productIdx: 1, name: 'Ayesha Malik', rating: 5, title: 'Best sunscreen ever', comment: 'Finally a sunscreen that does not leave a white cast! It sits beautifully under makeup and keeps my skin protected all day.' },
      { productIdx: 1, name: 'Sana Tariq', rating: 4, title: 'Lightweight and effective', comment: 'Love the texture. It is very lightweight and absorbs quickly. Perfect for Lahore summers.' },
      { productIdx: 2, name: 'Maria Ali', rating: 5, title: 'Visible results in 2 weeks', comment: 'My dark spots have faded significantly after just two weeks of use. This serum is worth every penny. Glowing skin guaranteed!' },
      { productIdx: 2, name: 'Hira Shah', rating: 5, title: 'Skin is glowing!', comment: 'I have tried many vitamin C serums but this one is by far the best. It gives such a beautiful glow without any irritation.' },
      { productIdx: 3, name: 'Sobia Rehman', rating: 5, title: 'Luxurious night cream', comment: 'This cream feels so luxurious on the skin. I wake up with plump, hydrated skin every morning. The smell is divine too.' },
      { productIdx: 3, name: 'Nadia Akram', rating: 4, title: 'Rich but not greasy', comment: 'Very rich moisturizer that somehow does not feel greasy. Perfect for my dry skin in winter.' },
    ];

    await Review.insertMany(reviewData.map(r => ({
      product: products[r.productIdx]._id,
      name: r.name,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerified: true
    })));

    for (const p of products) {
      const productReviews = await Review.find({ product: p._id });
      if (productReviews.length > 0) {
        const avgRating = (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1);
        await Product.findByIdAndUpdate(p._id, { rating: parseFloat(avgRating), numReviews: productReviews.length });
      }
    }

    res.send('Database seeded! 8 products, 2 users, ' + reviewData.length + ' reviews created.');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

module.exports = router;

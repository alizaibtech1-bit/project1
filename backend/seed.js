const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const products = [
  { name: 'Hydrating Facewash', slug: 'hydrating-facewash', description: 'A gentle, nourishing facewash that removes impurities while maintaining your skin\'s natural moisture barrier. Enriched with botanical extracts.', category: 'Facewash', price: 28, originalPrice: 35, image: '/uploads/facewash1.jpg', rating: 4.5, numReviews: 124, countInStock: 50, isFeatured: true, ingredients: 'Aloe Vera, Green Tea, Chamomile, Glycerin', howToUse: 'Apply to damp skin, massage gently, and rinse with warm water. Use morning and evening.', skinType: 'All Skin Types' },
  { name: 'Silk Sunblock SPF 50', slug: 'silk-sunblock-spf-50', description: 'Weightless, broad-spectrum SPF 50 protection with a silky finish. No white cast, just invisible protection that wears beautifully under makeup.', category: 'Sunblock', price: 42, image: '/uploads/sunblock1.jpg', rating: 4.8, numReviews: 89, countInStock: 35, isFeatured: true, ingredients: 'Zinc Oxide, Vitamin E, Niacinamide, Hyaluronic Acid', howToUse: 'Apply liberally 15 minutes before sun exposure. Reapply every 2 hours.', skinType: 'All Skin Types' },
  { name: 'Vitamin C Bright Serum', slug: 'vitamin-c-bright-serum', description: 'A potent 20% Vitamin C serum that brightens, evens skin tone, and fights free radicals. Visible results in just 14 days.', category: 'Serums', price: 68, originalPrice: 85, image: '/uploads/serum1.jpg', rating: 4.9, numReviews: 256, countInStock: 40, isFeatured: true, ingredients: '20% L-Ascorbic Acid, Vitamin E, Ferulic Acid, Hyaluronic Acid', howToUse: 'Apply 3-4 drops to clean, dry skin. Follow with moisturizer. Use in the morning.', skinType: 'All Skin Types' },
  { name: 'Night Renewal Cream', slug: 'night-renewal-cream', description: 'An indulgent overnight cream that works while you sleep. Rich in peptides and ceramides for visibly firmer, smoother skin by morning.', category: 'Creams', price: 72, image: '/uploads/cream1.jpg', rating: 4.7, numReviews: 198, countInStock: 25, isFeatured: true, ingredients: 'Peptides, Ceramides, Squalane, Retinol', howToUse: 'Apply a pearl-sized amount to face and neck each evening. Gently press into skin.', skinType: 'Dry, Mature' },
  { name: 'Gentle Foaming Cleanser', slug: 'gentle-foaming-cleanser', description: 'A sulfate-free foaming cleanser that removes makeup and impurities without stripping. Perfect for sensitive skin.', category: 'Facewash', price: 32, image: '/uploads/facewash2.jpg', rating: 4.3, numReviews: 67, countInStock: 60, isFeatured: false, ingredients: 'Coconut-derived Surfactants, Aloe, Calendula', howToUse: 'Pump onto wet hands, lather, and massage onto face. Rinse thoroughly.', skinType: 'Sensitive' },
  { name: 'Matte Sunblock SPF 30', slug: 'matte-sunblock-spf-30', description: 'Oil-free mattifying sunblock for combination and oily skin. Controls shine while providing reliable daily protection.', category: 'Sunblock', price: 38, image: '/uploads/sunblock2.jpg', rating: 4.6, numReviews: 112, countInStock: 45, isFeatured: false, ingredients: 'Titanium Dioxide, Silica, Niacinamide', howToUse: 'Apply as the last step in your morning routine. Can be worn alone or under makeup.', skinType: 'Oily, Combination' },
  { name: 'Hyaluronic Acid Serum', slug: 'hyaluronic-acid-serum', description: 'Ultra-light hydration serum with triple-weight hyaluronic acid. Plumps, hydrates, and restores a youthful glow.', category: 'Serums', price: 58, image: '/uploads/serum2.jpg', rating: 4.8, numReviews: 341, countInStock: 55, isFeatured: false, ingredients: 'Sodium Hyaluronate, Hydrolyzed HA, Vitamin B5', howToUse: 'Apply to damp skin. Layer under moisturizer. Use morning and evening.', skinType: 'All Skin Types' },
  { name: 'Rich Moisture Cream', slug: 'rich-moisture-cream', description: 'A deeply nourishing cream with shea butter and squalane. Restores dry, dehydrated skin with lasting comfort.', category: 'Creams', price: 66, originalPrice: 78, image: '/uploads/cream2.jpg', rating: 4.4, numReviews: 156, countInStock: 30, isFeatured: false, ingredients: 'Shea Butter, Squalane, Ceramides, Oat Extract', howToUse: 'Warm a small amount between fingertips and press into skin. Use day and night.', skinType: 'Dry, Normal' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});

    const admin = await User.create({ name: 'Admin', email: 'admin@glow.com', password: 'admin123', role: 'admin' });
    const user = await User.create({ name: 'User', email: 'user@glow.com', password: 'user123', role: 'user' });
    console.log(`Created admin: admin@glow.com / admin123`);
    console.log(`Created user: user@glow.com / user123`);

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

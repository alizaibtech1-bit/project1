const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Facials', 'Facewash', 'Sunblock', 'Serums', 'Creams'] },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, default: '' },
  images: [String],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },
  isFeatured: { type: Boolean, default: false },
  ingredients: String,
  howToUse: String,
  skinType: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

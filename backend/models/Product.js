const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['men', 'women', 'electronics', 'home', 'books', 'sports', 'beauty', 'kids']
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  colors: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  shipping: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    deliveryTime: {
      type: String
    },
    returnPolicy: {
      type: Number  // Number of days for return policy
    }
  }
}, {
  timestamps: true
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtual fields are serialized when converted to JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
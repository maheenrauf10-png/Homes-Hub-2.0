const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['house', 'apartment', 'commercial', 'plot']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    enum: ['buy', 'rent']
  },
  beds: {
    type: Number,
    min: 0,
    default: 0
  },
  baths: {
    type: Number,
    min: 0,
    default: 0
  },
  area: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'inactive'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  neighborhood: {
    nearby: String,
    avgPrice: Number,
    safety: String
  }
}, {
  timestamps: true
});

// Index for search functionality
propertySchema.index({ title: 'text', location: 'text', description: 'text' });
propertySchema.index({ type: 1, purpose: 1, price: 1 });
propertySchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('Property', propertySchema);



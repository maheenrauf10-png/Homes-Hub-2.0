const express = require('express');
const Property = require('../models/Property');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all properties with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      purpose,
      type,
      location,
      minPrice,
      maxPrice,
      beds,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (purpose) filter.purpose = purpose;
    if (type) filter.type = type;
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (beds) filter.beds = { $gte: parseInt(beds) };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const properties = await Property.find(filter)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('postedBy', 'name email')
      .lean();

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single property by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('postedBy', 'name email phone')
      .lean();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment views
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new property (requires authentication)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      type,
      purpose,
      beds,
      baths,
      area,
      description,
      images,
      lat,
      lng,
      contactEmail,
      neighborhood
    } = req.body;

    // Validation
    if (!title || !location || !price || !type || !purpose) {
      return res.status(400).json({
        error: 'Title, location, price, type, and purpose are required'
      });
    }

    const property = new Property({
      title,
      location,
      price: parseFloat(price),
      type,
      purpose,
      beds: beds ? parseInt(beds) : 0,
      baths: baths ? parseInt(baths) : 0,
      area: area || '',
      description: description || '',
      images: Array.isArray(images) ? images : images ? [images] : [],
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      contactEmail: contactEmail || req.user.email,
      postedBy: req.user._id,
      neighborhood: neighborhood || {}
    });

    await property.save();
    await property.populate('postedBy', 'name email');

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update property (requires authentication - owner or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if user is owner or admin
    if (property.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        property[key] = updates[key];
      }
    });

    await property.save();
    await property.populate('postedBy', 'name email');

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete property (requires authentication - owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if user is owner or admin
    if (property.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's properties
router.get('/user/my-properties', authenticate, async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    res.json({ properties });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



const express = require('express');
const Contact = require('../models/Contact');
const Property = require('../models/Property');

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, propertyId } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required'
      });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      message,
      propertyId: propertyId || null
    });

    await contact.save();

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon!',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact property owner
router.post('/property/:propertyId', async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required'
      });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      message,
      propertyId: req.params.propertyId
    });

    await contact.save();

    res.status(201).json({
      message: 'Your message has been sent to the property owner. They will contact you soon!',
      contact: {
        id: contact._id,
        propertyTitle: property.title
      }
    });
  } catch (error) {
    console.error('Contact property owner error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
require('dotenv').config();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all inventory items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single inventory item by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new inventory item
router.post('/', authMiddleware, roleMiddleware(['admin']), upload.array('images'), async (req, res) => {
  const { name, quantity, location, description, price } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Upload media files to Cloudinary
    const mediaUrls = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
              }
              resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );

    const newItem = new Inventory({
      name,
      quantity,
      location,
      description,
      price,
      images: mediaUrls.filter(url => url.endsWith('.jpg') || url.endsWith('.png')),
    });
    
    const item = await newItem.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an inventory item
router.put('/:id', authMiddleware, roleMiddleware(['admin']), upload.single('images'), async (req, res) => {
  const { name, quantity, location, description, price } = req.body;

  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update fields
    item.name = name || item.name;
    item.quantity = quantity || item.quantity;
    item.location = location || item.location;
    item.description = description || item.description;
    item.price = price || item.price; // Update price

    // Handle image update
    if (req.file) {
      item.images = req.file.buffer; // Adjust based on how you store images
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an inventory item
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

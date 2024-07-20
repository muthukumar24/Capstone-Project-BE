const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Notify about stock levels
router.get('/stock-levels', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({ quantity: { $lt: 10 } });
    if (lowStockItems.length > 0) {
      res.json(lowStockItems);
    } else {
      const allItems = await Inventory.find();
      res.json(allItems);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

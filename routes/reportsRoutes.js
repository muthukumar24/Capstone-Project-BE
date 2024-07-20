const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get report data
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const products = await Inventory.find();
    const orders = await Order.find();

    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((total, product) => total + (product.quantity * product.price), 0);
    const outOfStockCount = products.filter(product => product.quantity === 0).length;
    const turnoverRates = calculateTurnoverRates(orders, products);

    res.json({
      totalProducts,
      totalInventoryValue,
      outOfStockCount,
      turnoverRates
    });
  } catch (err) {
    console.error('Error fetching report data:', err);
    res.status(500).json({ message: 'Failed to fetch report data', error: err.message });
  }
});

// Turnover rates calculation
function calculateTurnoverRates(orders, products) {
  const totalOrderQuantity = orders.reduce((total, order) => {
    return total + order.products.reduce((orderTotal, product) => orderTotal + product.quantity, 0);
  }, 0);
  
  const totalStockQuantity = products.reduce((total, product) => total + product.quantity, 0);
  
  if (totalStockQuantity === 0) return "0%";

  return ((totalOrderQuantity / totalStockQuantity) * 100).toFixed(2) + "%";
}

module.exports = router;

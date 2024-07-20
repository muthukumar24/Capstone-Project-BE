const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order'); // Adjust the path as necessary
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// Route to fetch orders based on user role
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await Order.find().populate('user', 'firstName lastName email');
      res.json(orders);
    } else if (req.user.role === 'user') {
      const userId = req.user.id; // Assuming authMiddleware adds the user object to the request
      const orders = await Order.find({ user: userId }).populate('user', 'firstName lastName email');
      res.json(orders);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// Get a single order by ID (accessible by user and admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
});

// Create a new order (accessible by user and admin)
router.post('/', authMiddleware, async (req, res) => {
  const { products, totalAmount, status } = req.body;

  if (!products || !totalAmount) {
    return res.status(400).json({ message: 'Products and total amount are required' });
  }

  try {
    const newOrder = new Order({ 
      products, 
      totalAmount, 
      status, 
      user: req.user.id 
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// Update an order (accessible by user only)
router.put('/:id', authMiddleware, roleMiddleware(['user']), async (req, res) => {
  const { products, status } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate products array structure and content
    if (!Array.isArray(products) || products.some(p => !p.item || !p.name || !p.quantity || !p.price)) {
      return res.status(400).json({ message: 'Invalid products format' });
    }

    // Update products and their quantities
    order.products = products.map(product => ({
      item: new mongoose.Types.ObjectId(product.item), // Convert to ObjectId using 'new'
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    }));

    // Update status if provided, otherwise keep existing status
    order.status = status || order.status;

    // Recalculate total amount based on updated products
    order.totalAmount = order.products.reduce((sum, product) => sum + (product.quantity * product.price), 0);

    // Save the updated order
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order:', err); // Log the error for debugging
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  // console.log(`Received request to update order ID ${id} to status ${orderStatus}`); // Add logging here

  try {
    const order = await Order.findById(id);
    if (!order) {
      // console.log(`Order ID ${id} not found`); // Add logging here
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();
    // console.log(`Order ID ${id} updated successfully to status ${orderStatus}`); // Add logging here
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error); // Add logging here
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete an order (accessible by admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['user']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne(); // Using deleteOne() to remove the document from MongoDB
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

module.exports = router;

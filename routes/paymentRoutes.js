const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/authMiddleware');

// Process payment
router.post('/', authMiddleware, async (req, res) => {
  const { token, amount, paymentMethod, products, status } = req.body;

  // console.log('User ID:', req.userId); // Debugging: Log the user ID
  // console.log('Order Details:', req.body); // Debugging: Log the order details

  try {
    if (paymentMethod === 'card') {
      // Process card payment with Stripe
      const charge = await stripe.charges.create({
        amount: amount * 100, // Amount in cents
        currency: 'usd',
        source: token,
        description: 'Order payment',
      });

      if (!charge) {
        throw new Error('Charge unsuccessful');
      }

      // Save the order
      const newOrder = new Order({
        products: products.map(product => ({
          item: product.item,
          name: product.name,
          price: product.price,
          quantity: product.quantity
        })),
        totalAmount: amount,
        user: req.userId,
        status: 'Paid', // Adjusted to 'Paid' for card payments
        paymentMethod: 'Card'
      });

      const order = await newOrder.save();

      // Update inventory quantities
      for (let product of products) {
        const inventoryItem = await Inventory.findById(product.item);
        if (inventoryItem) {
          inventoryItem.quantity -= product.quantity;
          await inventoryItem.save();
        }
      }

      res.status(201).json({ success: true, order });
    } else if (paymentMethod === 'cash') {
      // Handle cash on delivery
      const newOrder = new Order({
        products: products.map(product => ({
          item: product.item,
          name: product.name,
          price: product.price,
          quantity: product.quantity
        })),
        totalAmount: amount,
        user: req.userId,
        status: 'Cash on Delivery',
        paymentMethod: 'Cash on Delivery'
      });

      const order = await newOrder.save();

      // Update inventory quantities
      for (let product of products) {
        const inventoryItem = await Inventory.findById(product.item);
        if (inventoryItem) {
          inventoryItem.quantity -= product.quantity;
          await inventoryItem.save();
        }
      }

      res.status(201).json({ success: true, order });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

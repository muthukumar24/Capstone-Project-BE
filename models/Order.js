const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  products: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  supplier: { type: String },
  status: { type: String, enum: ['Cash on Delivery', 'Paid', 'Cancelled'], default: 'Cash on Delivery' },
  orderStatus: { type: String, enum: ['Placed', 'Shipped','Out for Delivery', 'Delivered', 'Cancelled'], default: 'Placed' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, enum: ['Card', 'Cash on Delivery'], required: true }, // Ensure enum for consistency
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;

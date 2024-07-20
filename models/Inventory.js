const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String, required: false },
  images: { type: [String], default: [] },
  price: { type: Number, required: true }, // New price field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Inventory = mongoose.model('Inventory', InventorySchema);
module.exports = Inventory;


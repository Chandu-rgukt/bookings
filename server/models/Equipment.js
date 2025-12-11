const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);

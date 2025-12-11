const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['multiplier','surcharge','fixed'], required: true },
  criteria: { type: Object, required: true },
  value: { type: Number, required: true },
  enabled: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', PricingRuleSchema);

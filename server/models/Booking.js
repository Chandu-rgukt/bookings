const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  equipments: [
    {
      equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
      quantity: { type: Number, default: 0 },
      price: { type: Number, default: 0 }
    }
  ],
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
  status: { type: String, enum: ['confirmed','cancelled','waitlist'], default: 'confirmed' },
  pricingBreakdown: {
    basePrice: Number,
    ruleAdjustments: [{ name: String, value: Number }],
    equipmentFee: Number,
    coachFee: Number,
    total: Number
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

BookingSchema.index({ court: 1, startTime: 1, endTime: 1 });
module.exports = mongoose.model('Booking', BookingSchema);

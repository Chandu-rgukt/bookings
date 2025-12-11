const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  availability: [
    {
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startHour: { type: Number, min: 0, max: 23 },
      endHour: { type: Number, min: 1, max: 24 }
    }
  ],
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coach', CoachSchema);

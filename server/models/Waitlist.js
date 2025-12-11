
const mongoose = require('mongoose');
const WaitlistSchema = new mongoose.Schema({
  slotDate: { type: String, required: true },
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
WaitlistSchema.index({ court:1, slotStart:1, createdAt:1 });
module.exports = mongoose.model('Waitlist', WaitlistSchema);

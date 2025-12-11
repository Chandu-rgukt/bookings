const Booking = require('../models/Booking');
const { notifyAndPromote } = require('./waitlistController');

async function listUserBookings(req,res){
  try{
    const userId = req.params.userId;
    const items = await Booking.find({ user: userId }).populate('court equipments.equipment coach').sort({ startTime: -1 }).lean();
    return res.json({ ok:true, bookings: items });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

async function cancelBooking(req,res){
  try{
    const id = req.params.id;
    const b = await Booking.findById(id);
    if (!b) return res.status(404).json({ ok:false, error:'booking-not-found' });
    b.status = 'cancelled';
    await b.save();
    const notify = await notifyAndPromote(b);
    return res.json({ ok:true, cancelled: b, notify });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

module.exports = { listUserBookings, cancelBooking };

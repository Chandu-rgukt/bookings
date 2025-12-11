const Waitlist = require('../models/Waitlist');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Court = require('../models/Court');
const Notification = require('../models/Notification');

async function joinWaitlist(req,res){
  try{
    const { slotDate, slotStart, slotEnd, courtId, userId } = req.body;
    const u = await User.findById(userId);
    if (!u) return res.status(400).json({ ok:false, error:'user-not-found' });
    const c = await Court.findById(courtId);
    if (!c) return res.status(400).json({ ok:false, error:'court-not-found' });
    const w = await Waitlist.create({ slotDate, slotStart, slotEnd, court: c._id, user: u._id });
    return res.json({ ok:true, waitlist: w });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

async function promoteNext(slotStart, slotEnd, courtId){
  const next = await Waitlist.findOne({ court: courtId, slotStart: slotStart }).sort({ createdAt: 1 });
  if (!next) return null;
  await Waitlist.deleteOne({ _id: next._id });
  return next;
}

async function notifyAndPromote(booking){
  try{
    const promoted = await promoteNext(booking.startTime, booking.endTime, booking.court);
    if (!promoted) return null;
    const user = await User.findById(promoted.user);
    if (!user) return null;
    const court = await Court.findById(booking.court);
    const message = `You were promoted from the waitlist for ${court.name} at ${new Date(booking.startTime).toLocaleString()}`;
    const note = await Notification.create({ user: user._id, type: 'waitlist_promoted', data: { bookingId: booking._id, message }, read: false });
    return { userEmail: user.email, userId: user._id, notification: note };
  }catch(e){
    return null;
  }
}

module.exports = { joinWaitlist, notifyAndPromote, promoteNext };

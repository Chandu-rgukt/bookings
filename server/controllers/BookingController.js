const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const User = require('../models/User');
const ReservationLock = require('../models/ReservationLock');
const { calculatePrice } = require('../utils/PricingEngine');

function overlaps(aStart,aEnd,bStart,bEnd){
  return aStart < bEnd && bStart < aEnd;
}

async function checkCourtAvailable(courtId,startTime,endTime,session){
  const conflict = await Booking.findOne({
    court: courtId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  }).session(session);
  return !conflict;
}

async function checkCoachAvailable(coachId,startTime,endTime,session){
  if (!coachId) return true;
  const conflict = await Booking.findOne({
    coach: coachId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  }).session(session);
  return !conflict;
}

async function checkEquipmentAvailable(equipments,startTime,endTime,session){
  if (!equipments || equipments.length===0) return true;
  for (const e of equipments){
    const eq = await Equipment.findById(e.equipment).session(session);
    if (!eq || !eq.enabled) return false;
    const overlapping = await Booking.aggregate([
      { $match: { status: 'confirmed', 'equipments.equipment': eq._id, $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
      ] } },
      { $unwind: '$equipments' },
      { $match: { 'equipments.equipment': eq._id } },
      { $group: { _id: null, total: { $sum: '$equipments.quantity' } } }
    ]).session(session);
    const used = overlapping.length ? overlapping[0].total : 0;
    if (used + e.quantity > eq.quantity) return false;
  }
  return true;
}

async function createBooking(req,res){
  const sess = await mongoose.startSession();
  try{
    const result = await sess.withTransaction(async ()=>{
      const { userId, courtId, startTime, endTime, equipments, coachId, reservationToken } = req.body;
      if (reservationToken) {
        const lock = await ReservationLock.findOne({ key: reservationToken }).session(sess);
        if (!lock) throw new Error('invalid-reservation-token');
        if (new Date(lock.expiresAt) < new Date()) throw new Error('reservation-token-expired');
        await ReservationLock.deleteOne({ _id: lock._id }).session(sess);
      } else {
        const existing = await ReservationLock.findOne({ key: { $regex: `^${courtId}_${new Date(startTime).toISOString().replace(/\./g,'\\.')}` } }).session(sess);
        if (existing) throw new Error('reservation-token-required');
      }
      const court = await Court.findById(courtId).session(sess);
      if (!court || !court.enabled) throw new Error('court-unavailable');
      const user = await User.findById(userId).session(sess);
      if (!user) throw new Error('user-not-found');
      const courtOk = await checkCourtAvailable(courtId,new Date(startTime),new Date(endTime),sess);
      if (!courtOk) throw new Error('court-taken');
      const coachOk = await checkCoachAvailable(coachId,new Date(startTime),new Date(endTime),sess);
      if (!coachOk) throw new Error('coach-taken');
      const equipOk = await checkEquipmentAvailable(equipments,new Date(startTime),new Date(endTime),sess);
      if (!equipOk) throw new Error('equipment-unavailable');
      const equipDocs = [];
      for (const e of equipments || []){
        const ed = await Equipment.findById(e.equipment).session(sess);
        equipDocs.push({ equipment: ed._id, quantity: e.quantity, price: ed.pricePerUnit });
      }
      const coachDoc = coachId ? await Coach.findById(coachId).session(sess) : null;
      const pricing = await calculatePrice({ court, startTime, endTime, equipments: equipDocs, coach: coachDoc });
      const booking = new Booking({
        user: user._id,
        court: court._id,
        startTime,
        endTime,
        equipments: equipDocs,
        coach: coachDoc ? coachDoc._id : null,
        pricingBreakdown: pricing,
        status: 'confirmed'
      });
      await booking.save({ session: sess });
      return booking;
    });
    sess.endSession();
    return res.status(201).json({ ok: true, booking: result });
  }catch(err){
    sess.endSession();
    return res.status(400).json({ ok: false, error: err.message });
  }
}

async function pricePreview(req,res){
  try{
    const { courtId, startTime, endTime, equipments, coachId } = req.body;
    const court = await Court.findById(courtId);
    if (!court) return res.status(400).json({ ok: false, error: 'court-not-found' });
    const equipDocs = [];
    for (const e of equipments || []){
      const ed = await Equipment.findById(e.equipment);
      equipDocs.push({ equipment: ed._id, quantity: e.quantity, pricePerUnit: ed.pricePerUnit });
    }
    const coachDoc = coachId ? await Coach.findById(coachId) : null;
    const pricing = await calculatePrice({ court, startTime, endTime, equipments: equipDocs, coach: coachDoc });
    return res.json({ ok: true, pricing });
  }catch(err){
    return res.status(400).json({ ok: false, error: err.message });
  }
}

module.exports = { createBooking, pricePreview };

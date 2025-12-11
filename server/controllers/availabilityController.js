const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const Booking = require('../models/Booking');

function range(start, end, step){
  const out = [];
  for (let t = start; t < end; t += step) out.push(t);
  return out;
}

function toDate(dateStr, hour, minute=0){
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(hour, minute, 0, 0);
  return d;
}

function slotOverlap(slotStart, slotEnd, bStart, bEnd){
  return slotStart < bEnd && bStart < slotEnd;
}

async function getAvailability(req,res){
  try{
    const date = req.query.date;
    if (!date) return res.status(400).json({ ok:false, error:'date-required' });
    const startHour = parseInt(req.query.startHour || '6', 10);
    const endHour = parseInt(req.query.endHour || '22', 10);
    const slotMinutes = parseInt(req.query.slotMinutes || '60', 10);
    const step = slotMinutes * 60 * 1000;
    const courts = await Court.find({ enabled: true }).lean();
    const equipments = await Equipment.find({ enabled: true }).lean();
    const coaches = await Coach.find({ enabled: true }).lean();
    const dayStart = toDate(date, 0);
    const dayEnd = toDate(date, 24);
    const bookings = await Booking.find({
      status: 'confirmed',
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart }
    }).lean();
    const slots = [];
    for (let h = startHour; h < endHour; h++){
      const slotStart = toDate(date, h);
      const slotEnd = new Date(slotStart.getTime() + step);
      const slot = { slotStart: slotStart.toISOString(), slotEnd: slotEnd.toISOString(), courts: [], equipments: [], coaches: [] };
      for (const c of courts){
        const taken = bookings.some(b => String(b.court) === String(c._id) && slotOverlap(slotStart, slotEnd, new Date(b.startTime), new Date(b.endTime)));
        slot.courts.push({ id: c._id, name: c.name, type: c.type, available: !taken, basePrice: c.basePrice });
      }
      for (const e of equipments){
        let used = 0;
        for (const b of bookings){
          const found = (b.equipments || []).find(x => String(x.equipment) === String(e._id));
          if (found && slotOverlap(slotStart, slotEnd, new Date(b.startTime), new Date(b.endTime))){
            used += found.quantity || 0;
          }
        }
        slot.equipments.push({ id: e._id, name: e.name, quantityTotal: e.quantity, quantityAvailable: Math.max(0, e.quantity - used), pricePerUnit: e.pricePerUnit });
      }
      for (const ch of coaches){
        const taken = bookings.some(b => String(b.coach) === String(ch._id) && slotOverlap(slotStart, slotEnd, new Date(b.startTime), new Date(b.endTime)));
        let hasAvailabilityWindow = false;
        const dayOfWeek = slotStart.getDay();
        for (const av of (ch.availability || [])){
          if (av.dayOfWeek === dayOfWeek && h >= av.startHour && (h + slotMinutes/60) <= av.endHour) { hasAvailabilityWindow = true; break; }
        }
        slot.coaches.push({ id: ch._id, name: ch.name, available: hasAvailabilityWindow && !taken, hourlyRate: ch.hourlyRate });
      }
      slots.push(slot);
    }
    return res.json({ ok: true, date, slots });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

module.exports = { getAvailability };

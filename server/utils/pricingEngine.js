const PricingRule = require('../models/PricingRule');

async function calculatePrice({ court, startTime, endTime, equipments = [], coach = null }) {
  const rules = await PricingRule.find({ enabled: true }).sort({ priority: -1 }).lean();
  let breakdown = { basePrice: Number(court.basePrice || 0), ruleAdjustments: [], equipmentFee: 0, coachFee: 0, total: 0 };
  let price = Number(court.basePrice || 0);
  const date = new Date(startTime);
  const hour = date.getHours();
  const day = date.getDay();

  for (const r of rules) {
    const c = r.criteria || {};
    let applies = false;
    if (c.type === 'peak' && c.startHour !== undefined && c.endHour !== undefined) {
      if (hour >= c.startHour && hour < c.endHour) applies = true;
    }
    if (c.type === 'weekend' && c.weekend === true) {
      if (day === 0 || day === 6) applies = true;
    }
    if (c.type === 'indoor' && c.indoor === true) {
      if (court.type === 'indoor') applies = true;
    }
    if (c.type === 'holiday' && c.date) {
      const ruleDate = new Date(c.date);
      if (ruleDate.toISOString().slice(0,10) === date.toISOString().slice(0,10)) applies = true;
    }
    if (applies) {
      if (r.type === 'multiplier') {
        const multiplier = Number(r.value || 1);
        const delta = price * (multiplier - 1);
        price = price * multiplier;
        breakdown.ruleAdjustments.push({ name: r.name, value: Number(delta) });
      } else if (r.type === 'surcharge') {
        const add = Number(r.value || 0);
        price += add;
        breakdown.ruleAdjustments.push({ name: r.name, value: add });
      } else if (r.type === 'fixed') {
        const fixed = Number(r.value || 0);
        breakdown.ruleAdjustments.push({ name: r.name, value: fixed - breakdown.basePrice });
        price = fixed;
      }
    }
  }

  let equipmentFee = 0;
  for (const e of equipments) {
    const unit = Number(e.pricePerUnit ?? e.price ?? 0);
    const qty = Number(e.quantity ?? 0);
    equipmentFee += unit * qty;
  }

  let coachFee = 0;
  if (coach) coachFee = Number(coach.hourlyRate ?? 0);

  const total = Math.max(0, Number(price || 0) + equipmentFee + coachFee);

  breakdown.basePrice = Number(court.basePrice || 0);
  breakdown.equipmentFee = equipmentFee;
  breakdown.coachFee = coachFee;
  breakdown.total = total;

  return breakdown;
}

module.exports = { calculatePrice };

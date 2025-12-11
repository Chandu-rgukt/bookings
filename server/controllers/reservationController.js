const ReservationLock = require('../models/ReservationLock');

async function createLock(req,res){
  try{
    const { key, ttlSeconds } = req.body;
    const ttl = ttlSeconds || 30;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const doc = new ReservationLock({ key, expiresAt });
    await doc.save();
    return res.json({ ok:true, locked: true, key });
  }catch(e){
    return res.status(409).json({ ok:false, error: 'locked' });
  }
}

async function issueToken(req,res){
  try{
    const { courtId, startTime, ttlSeconds } = req.body;
    if (!courtId || !startTime) return res.status(400).json({ ok:false, error:'courtId-and-startTime-required' });
    const random = Math.random().toString(36).slice(2,10);
    const key = `${courtId}_${new Date(startTime).toISOString()}_${random}`;
    const ttl = ttlSeconds || 30;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const doc = new ReservationLock({ key, expiresAt });
    await doc.save();
    return res.json({ ok:true, token: key, expiresAt });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

async function releaseLock(req,res){
  try{
    const { key } = req.body;
    await ReservationLock.deleteOne({ key });
    return res.json({ ok:true });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

module.exports = { createLock, issueToken, releaseLock };

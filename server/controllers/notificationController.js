const Notification = require('../models/Notification');

async function listNotifications(req,res){
  try{
    const userId = req.params.userId;
    const items = await Notification.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return res.json({ ok:true, notifications: items });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

async function markRead(req,res){
  try{
    const id = req.params.id;
    await Notification.findByIdAndUpdate(id, { read: true });
    return res.json({ ok:true });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

module.exports = { listNotifications, markRead };

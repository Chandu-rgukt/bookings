const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../controllers/authController');

async function getMe(req,res){
  try{
    const h = req.headers.authorization || req.headers.Authorization;
    if (!h) {
      const u = await User.findOne().lean();
      if (!u) return res.status(404).json({ ok:false, error:'no-user' });
      return res.json({ ok:true, userId: u._id, name: u.name, email: u.email, isAdmin: !!u.isAdmin });
    }
    const parts = h.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];
    const payload = jwt.verify(token, SECRET);
    const u = await User.findById(payload.userId).lean();
    if (!u) return res.status(404).json({ ok:false, error:'no-user' });
    return res.json({ ok:true, userId: u._id, name: u.name, email: u.email, isAdmin: !!u.isAdmin });
  }catch(e){
    return res.status(401).json({ ok:false, error:'invalid-token' });
  }
}

module.exports = { getMe };

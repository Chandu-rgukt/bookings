const jwt = require('jsonwebtoken');
const { SECRET } = require('../controllers/authController');

function verifyToken(req,res,next){
  const h = req.headers.authorization || req.headers.Authorization;
  if (!h) return res.status(401).json({ ok:false, error:'no-token' });
  const parts = h.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];
  try{
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  }catch(e){
    return res.status(401).json({ ok:false, error:'invalid-token' });
  }
}

function requireAdmin(req,res,next){
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ ok:false, error:'admin-required' });
  return next();
}

module.exports = { verifyToken, requireAdmin };

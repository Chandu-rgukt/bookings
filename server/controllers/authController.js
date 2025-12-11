const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev-secret";

async function register(req,res){
  try{
    const { name, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ ok:false, error:"missing" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ ok:false, error:"exists" });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const u = await User.create({ name, email, passwordHash: hash, isAdmin: false });
    return res.json({ ok:true, userId: u._id });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}

async function login(req,res){
  try{
    console.log("LOGIN-HANDLER: request body:", JSON.stringify(req.body));
    const { email, password } = req.body || {};
    if (!email || !password) {
      console.log("LOGIN-HANDLER: missing email or password");
      return res.status(401).json({ ok:false, error:"invalid" });
    }
    const user = await User.findOne({ email });
    console.log("LOGIN-HANDLER: user found:", !!user, user ? user._id.toString() : null);
    if (!user){
      console.log("LOGIN-HANDLER: returning invalid -> user not found");
      return res.status(401).json({ ok:false, error:"invalid" });
    }
    const stored = user.passwordHash || "";
    console.log("LOGIN-HANDLER: stored-hash:", stored);
    console.log("LOGIN-HANDLER: bcrypt.compareSync result:", bcrypt.compareSync(password, stored));
    const valid = bcrypt.compareSync(password, stored);
    console.log("LOGIN-HANDLER: final valid value:", valid);
    if (!valid){
      console.log("LOGIN-HANDLER: returning invalid -> password mismatch");
      return res.status(401).json({ ok:false, error:"invalid" });
    }
    const token = jwt.sign({ userId: user._id, isAdmin: !!user.isAdmin }, SECRET, { expiresIn: "12h" });
    console.log("LOGIN-HANDLER: issuing token for user", user._id.toString());
    return res.json({ ok:true, token, user: { userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  }catch(e){
    console.log("LOGIN-HANDLER ERROR:", e && e.stack ? e.stack : e);
    return res.status(500).json({ ok:false, error: e.message });
  }
}

module.exports = { register, login, SECRET };

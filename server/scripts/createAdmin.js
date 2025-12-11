// scripts/createAdmin.js - CORRECTED VERSION
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Load environment from project root
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function run(){
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking');
    console.log('Connected to MongoDB');
    
    // Try to require User model
    let User;
    try {
      User = require('../models/User');
      console.log('User model loaded from ../models/User');
    } catch (e) {
      console.log('Could not load User model, trying alternative path...');
      // Try from project root
      User = require('./models/User');
    }
    
    const email = 'admin@example.com';
    console.log('Looking for user:', email);
    
    const existing = await User.findOne({ email });
    console.log('Existing user found:', existing ? 'Yes' : 'No');
    
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('Hash created for password');
    
    if (existing){
      existing.passwordHash = hash;
      existing.isAdmin = true;
      existing.name = existing.name || 'Admin';
      await existing.save();
      console.log('✓ Updated admin:', existing._id.toString());
    } else {
      const u = await User.create({ 
        name: 'Admin', 
        email, 
        passwordHash: hash, 
        isAdmin: true 
      });
      console.log('✓ Created admin:', u._id.toString());
    }
    
    // Verify
    const verify = await User.findOne({ email });
    console.log('Verification - User exists:', verify ? 'Yes' : 'No');
    console.log('Verification - Is admin:', verify?.isAdmin);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
}

run();
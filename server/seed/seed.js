require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connect } = require('../config/db');
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');
const User = require('../models/User');

async function run(){
  await connect(process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking');
  await Court.deleteMany({});
  await Equipment.deleteMany({});
  await Coach.deleteMany({});
  await PricingRule.deleteMany({});
  await User.deleteMany({});
  await Court.insertMany([
    { name: 'Court 1', type: 'indoor', basePrice: 200 },
    { name: 'Court 2', type: 'indoor', basePrice: 200 },
    { name: 'Court 3', type: 'outdoor', basePrice: 150 },
    { name: 'Court 4', type: 'outdoor', basePrice: 150 }
  ]);
  await Equipment.insertMany([
    { name: 'Racket', quantity: 10, pricePerUnit: 50 },
    { name: 'Shoes', quantity: 8, pricePerUnit: 80 }
  ]);
  await Coach.insertMany([
    { name: 'Alice', hourlyRate: 300, availability: [{ dayOfWeek: 1, startHour: 16, endHour: 20 }, { dayOfWeek: 6, startHour: 9, endHour: 14 }] },
    { name: 'Bob', hourlyRate: 250, availability: [{ dayOfWeek: 2, startHour: 10, endHour: 18 }, { dayOfWeek: 5, startHour: 16, endHour: 21 }] },
    { name: 'Charlie', hourlyRate: 200, availability: [{ dayOfWeek: 0, startHour: 9, endHour: 13 }, { dayOfWeek: 4, startHour: 14, endHour: 20 }] }
  ]);
  await PricingRule.insertMany([
    { name: 'Peak Hours', type: 'multiplier', criteria: { type: 'peak', startHour: 18, endHour: 21 }, value: 1.5, priority: 10 },
    { name: 'Weekend Surcharge', type: 'surcharge', criteria: { type: 'weekend', weekend: true }, value: 50, priority: 5 },
    { name: 'Indoor Premium', type: 'surcharge', criteria: { type: 'indoor', indoor: true }, value: 30, priority: 3 }
  ]);
  const adminHash = await bcrypt.hash('Admin@123', 10);
  await User.create([
    { name: 'Test User', email: 'test@example.com' },
    { name: 'Admin', email: 'admin@example.com', passwordHash: adminHash, isAdmin: true }
  ]);
  process.exit(0);
}

run().catch(e=>{ process.exit(1) });

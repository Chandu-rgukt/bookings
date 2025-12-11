require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('../routes/index');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

// Connect to MongoDB (mongoose handles connection reuse for serverless)
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking';

// Only connect if not already connected (for serverless reuse)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  }).then(() => {
    console.log('✓ MongoDB connected');
  }).catch((e) => {
    console.error('✗ MongoDB connection failed:', e.message);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;


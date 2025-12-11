require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connect } = require('./config/db');
const routes = require('./routes/index');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);
const port = process.env.PORT || 4000;

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking';

connect(uri)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`✓ Server running on http://localhost:${port}`);
    });
    server.on('error', (err) => {
      console.error('✗ Server error:', err.message);
      process.exit(1);
    });
  })
  .catch((e)=>{ 
    console.error('✗ MongoDB connection failed:', e.message);
    process.exit(1); 
  });

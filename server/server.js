require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connect } = require('./config/db');
const routes = require('./routes/index');
const app = express();
app.use(cors());

// Set permissive CSP headers for API responses (override any restrictive defaults)
app.use((req, res, next) => {
  // Only set CSP for HTML responses, not API JSON responses
  if (req.path.startsWith('/api')) {
    // Don't set CSP for API routes
    return next();
  }
  // For static files or HTML, allow inline styles
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' data: https: http:; font-src 'self' data: https: http:; connect-src 'self' https: http: ws: wss:;");
  next();
});

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

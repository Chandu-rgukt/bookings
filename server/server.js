require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { connect } = require('./config/db');
const routes = require('./routes/index');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src * ws: wss:; frame-ancestors *;");
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../court-booking-frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const port = process.env.PORT || 4000;
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking';

connect(uri)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    server.on('error', (err) => {
      console.error('Server error:', err.message);
      process.exit(1);
    });
  })
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });

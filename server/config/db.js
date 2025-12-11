const mongoose = require('mongoose');

async function connect(uri) {
  const targetUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/courtbooking';
  const dbName = process.env.MONGO_DB || undefined;

  console.log('MONGODB CONNECT: Using URI:', targetUri);
  if (dbName) {
    console.log('MONGODB CONNECT: Using dbName option:', dbName);
  }

  await mongoose.connect(targetUri, dbName ? { dbName } : {});

  console.log('MONGODB CONNECTED: readyState=', mongoose.connection.readyState);
  console.log('MONGODB DB NAME:', mongoose.connection.db.databaseName);

  return mongoose.connection;
}

module.exports = { connect };

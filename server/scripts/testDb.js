require("dotenv").config();
const mongoose = require("mongoose");
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/courtbooking";
console.log("Testing Mongo URI:", uri);
(async ()=>{
  try{
    await mongoose.connect(uri);
    console.log("Mongoose connected OK, readyState=", mongoose.connection.readyState);
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log("Databases:", dbs.databases.map(d=>d.name));
    const users = await mongoose.connection.db.collection("users").find().limit(5).toArray();
    console.log("Sample users:", users);
    await mongoose.disconnect();
    process.exit(0);
  }catch(e){
    console.error("MONGO CONNECT ERROR:", e && e.message || e);
    process.exit(1);
  }
})();

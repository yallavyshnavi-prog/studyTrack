const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studytrack';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`\x1b[32m✔ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`\x1b[33m⚠ MongoDB Connection Notice: Could not connect to '${uri}'.\x1b[0m`);
    console.warn(`\x1b[36mℹ Tip: Set a valid MONGODB_URI in server/.env (e.g., MongoDB Atlas cluster URI). In-memory fallback will handle data persistence gracefully.\x1b[0m`);
    return false;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };

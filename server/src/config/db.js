const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ MongoDB Atlas connected');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed via app termination');
  process.exit(0);
});

module.exports = connectDB;

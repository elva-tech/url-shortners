const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./index');

const connectDB = async () => {
  if (!mongoUri) {
    console.error(
      'MongoDB Connection Failed: MONGO_URI is not set. Add it in Render Dashboard → Environment.'
    );
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: nodeEnv === 'production' ? 10 : 5,
    socketTimeoutMS: 45000,
  };

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, options);
    console.log('MongoDB Connected');

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    console.error(
      'Check: MONGO_URI is correct, Atlas cluster is running, and Network Access allows 0.0.0.0/0 (or Render IPs).'
    );
    process.exit(1);
  }
};

module.exports = connectDB;

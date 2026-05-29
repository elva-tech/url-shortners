const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./index');

const connectDB = async () => {
  if (!mongoUri) {
    console.error('MongoDB Connection Failed: MONGO_URI is not set');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: nodeEnv === 'production' ? 10 : 5,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log('MongoDB Connected');

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (error) {
    console.error('MongoDB Connection Failed');
    if (nodeEnv !== 'production') {
      console.error(error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB;

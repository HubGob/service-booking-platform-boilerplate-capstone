const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    const connectionString = uri || process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error('MONGODB_URI is not set');
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(connectionString, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};

module.exports = { connectDB, disconnectDB };

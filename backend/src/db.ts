import mongoose from 'mongoose';

export const connectDB = async (uri?: string): Promise<void> => {
  try {
    const connectionString = uri ?? process.env.MONGODB_URI ?? '';
    if (!connectionString) {
      throw new Error('MONGODB_URI is not set');
    }
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    await mongoose.connect(connectionString, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', (error as Error).message);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};
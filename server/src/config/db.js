/**
 * config/db.js — MongoDB Database Connection
 *
 * Connects to MongoDB Atlas using the URI from the .env file.
 * Uses Mongoose — an ODM (Object Document Mapper) library that lets us
 * define schemas and interact with MongoDB using JavaScript objects.
 *
 * If the connection fails, the process exits immediately (process.exit(1))
 * because the app cannot work without a database.
 *
 * It also listens for 'disconnected' and 'error' events to log warnings
 * in case the connection drops during runtime.
 */
import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Connection error: ${err.message}`);
});

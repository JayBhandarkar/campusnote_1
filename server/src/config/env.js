/**
 * config/env.js — Environment Variables Configuration
 *
 * Reads environment variables from the .env file using the 'dotenv' package.
 * All sensitive configuration (database URI, JWT secret, etc.) is stored
 * in .env (which is NOT committed to git) for security.
 *
 * This file exports a single 'env' object that all other files import.
 * This avoids scattering process.env.* calls throughout the codebase and
 * provides sensible fallback defaults for local development.
 *
 * Key values:
 *  - MONGODB_URI: Connection string for MongoDB Atlas
 *  - JWT_ACCESS_SECRET: Secret key used to sign/verify JSON Web Tokens
 *  - JWT_ACCESS_EXPIRES_IN: How long a login token stays valid (7 days)
 *  - MAX_FILE_SIZE_MB: Maximum allowed file upload size
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusnotes',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_jwt_secret_campusnotes_fallback_key',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@campusnotes.edu').toLowerCase().trim(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword@123',
};

/**
 * app.js — Express Application Configuration
 *
 * This file creates and configures the Express app (but does NOT start the server).
 * It sets up all middleware in the correct order:
 *  - Helmet: adds secure HTTP response headers to protect against common attacks
 *  - CORS: allows the React frontend (localhost:5173) to communicate with this API
 *  - Body parsers: lets us read JSON data sent from the client in req.body
 *  - Cookie parser: lets us read browser cookies (used for auth token)
 *  - Rate limiter: blocks brute-force attacks on login/register (max 50 requests / 15 min)
 *  - API routes: all /api/v1/* endpoints are registered here
 *  - notFound: returns 404 for any unknown endpoint
 *  - errorHandler: central error handler that formats all errors consistently
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by CORS origin restriction'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 login/register/reset requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes',
  },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Mount main API
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;

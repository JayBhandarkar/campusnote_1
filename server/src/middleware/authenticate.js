/**
 * middleware/authenticate.js — Authentication Middleware
 *
 * Protects private endpoints by verifying the client's identity:
 *  1. Extracts the JWT token from Authorization header ('Bearer <token>') or cookie
 *  2. Verifies token integrity & expiration using jsonwebtoken and JWT_ACCESS_SECRET
 *  3. Checks the MongoDB Session collection to ensure user hasn't logged out
 *  4. Fetches the active user from the database and attaches it to `req.user`
 *  5. Checks if `user.isActive` is true (blocks suspended accounts)
 *
 * Provides two exports:
 *  - authenticate: Strict check (returns 401 if not logged in)
 *  - optionalAuthenticate: Permissive check (attaches user if valid token exists, but lets guests pass through)
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. No token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token. Please log in again.');
  }

  // Check if session has been invalidated/logged out
  const session = await Session.findOne({ token });
  if (!session) {
    throw new ApiError(401, 'Session has expired or was logged out. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User associated with this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact an administrator.');
  }

  req.user = user;
  req.token = token;
  next();
});

// Optional authentication: attaches user if token is present, does not fail if unauthenticated
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const session = await Session.findOne({ token });
    if (session) {
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (err) {
    // Silently continue without user
  }

  next();
});

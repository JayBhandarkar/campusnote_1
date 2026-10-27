/**
 * models/Session.js — Active Login Session Schema
 *
 * Tracks every active login token in the database.
 * When a user logs in, a Session document is created storing their JWT token.
 * When a user logs out, or resets their password, the session is deleted.
 *
 * Why store sessions in DB if we already use JWT (which is stateless)?
 *  → So we can INVALIDATE tokens on logout. Without this, a stolen JWT
 *    would remain valid until it expires (7 days). Sessions give us
 *    server-side control to revoke tokens immediately.
 *
 * 'expires: 0' on expiresAt creates a MongoDB TTL (Time-To-Live) index.
 * MongoDB automatically deletes session documents after their expiresAt date,
 * so the sessions collection self-cleans without any extra code.
 */
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // MongoDB TTL index to auto-remove expired sessions
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model('Session', sessionSchema);

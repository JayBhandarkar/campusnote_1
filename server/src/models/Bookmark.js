/**
 * models/Bookmark.js — Bookmark Schema
 *
 * Stores which resources each user has bookmarked (saved for later).
 * Each document is simply a pair: { user, resource }.
 *
 * The compound unique index { user: 1, resource: 1 } ensures a user
 * cannot bookmark the same resource twice (prevents duplicate entries).
 */
import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmark records
bookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

/**
 * models/Resource.js — Resource (Study Material) Database Schema
 *
 * This is the core model of CampusNotes. Each document represents one
 * uploaded study material (PDF, PPT, DOC, etc.).
 *
 * Key design decisions:
 *  - Academic Hierarchy: Every resource must link to Department → Subject → Unit.
 *    This enforces proper categorization so students can filter by their stream.
 *  - fileHash: A SHA-256 cryptographic hash of the file content is stored.
 *    Before saving a new upload, we check if this hash already exists in the DB.
 *    If it does, we reject the upload with HTTP 409 (Conflict) — this prevents duplicate files.
 *  - verificationStatus (Pending/Approved/Rejected): Faculty reviews each upload.
 *    Only 'Approved' resources are shown as "Faculty Verified" on the platform.
 *  - moderationStatus (Active/Flagged/Removed): Admin can remove inappropriate content.
 *  - downloadCount: Tracks how many times a resource has been downloaded.
 *  - Text index on title + description + tags: Enables full-text search across resources.
 *  - Compound index on fileHash + moderationStatus: Speeds up duplicate detection queries.
 */
import mongoose from 'mongoose';

export const RESOURCE_TYPES = [
  'Notes',
  'PPT',
  'Assignment',
  'Lab Manual',
  'Question Bank',
  'Previous Year Paper',
  'Important Questions',
];

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit is required'],
      index: true,
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: RESOURCE_TYPES,
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2024-2025)'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be formatted like 2024-2025'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true,
    },
    file: {
      originalName: { type: String, required: true },
      storageName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true }, // size in bytes
      path: { type: String, required: true },
    },
    fileHash: {
      type: String,
      required: [true, 'SHA-256 file hash is required'],
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Verification note cannot exceed 500 characters'],
      default: '',
    },
    moderationStatus: {
      type: String,
      enum: ['Active', 'Flagged', 'Removed'],
      default: 'Active',
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
resourceSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 2,
    },
    name: 'ResourceTextIndex',
  }
);

// Index for duplicate detection among active resources
resourceSchema.index({ fileHash: 1, moderationStatus: 1 });

export const Resource = mongoose.model('Resource', resourceSchema);

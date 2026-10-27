/**
 * models/Unit.js — Syllabus Unit / Chapter Schema
 *
 * Represents a module/chapter under a subject (e.g., Unit 1: Introduction to Trees).
 *
 * Key fields:
 *  - title: Title of the syllabus unit
 *  - unitNumber: Number of the unit (1 to 20)
 *  - subject: ObjectId reference pointing to the parent Subject
 *  - Compound index: `{ subject: 1, unitNumber: 1 }` prevents duplicate unit numbers in the same subject
 */
import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Unit title is required'],
      trim: true,
      minlength: [2, 'Unit title must be at least 2 characters long'],
      maxlength: [150, 'Unit title cannot exceed 150 characters'],
    },
    unitNumber: {
      type: Number,
      required: [true, 'Unit number is required'],
      min: [1, 'Unit number must be at least 1'],
      max: [20, 'Unit number cannot exceed 20'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate unit numbers within the same subject
unitSchema.index({ subject: 1, unitNumber: 1 }, { unique: true });

export const Unit = mongoose.model('Unit', unitSchema);

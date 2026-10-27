/**
 * models/Department.js — Academic Department Schema
 *
 * Represents an academic branch/department (e.g., Computer Science, Mechanical).
 * Used as the top level of the academic hierarchy:
 * Department -> Subject -> Unit -> Resource (Notes)
 *
 * Key fields:
 *  - name: Full name of the department (e.g., "Computer Science and Engineering")
 *  - code: Unique short code in uppercase (e.g., "CSE")
 *  - isActive: Allows archiving/disabling a department without breaking existing notes
 */
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Code must be at least 2 characters long'],
      maxlength: [10, 'Code cannot exceed 10 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model('Department', departmentSchema);

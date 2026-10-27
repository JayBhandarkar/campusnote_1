/**
 * models/User.js — User Database Schema & Model
 *
 * Defines the structure of a User document in MongoDB using Mongoose.
 * Three roles are supported: Student, Faculty, Admin.
 *
 * Key design decisions:
 *  - passwordHash: The raw password is NEVER stored. It is hashed using bcrypt (salt rounds=10)
 *    before saving. bcrypt is a one-way hashing algorithm designed for passwords.
 *  - select: false on passwordHash means it won't be returned in queries by default (security).
 *  - generateAuthToken(): Creates a signed JWT (JSON Web Token) containing the user's
 *    id, email, and role. This token is sent to the client and used for all future requests.
 *  - toJSON transform: Strips sensitive fields (passwordHash, resetPasswordToken) from
 *    API responses automatically so they are never accidentally exposed.
 *  - resetPasswordToken/resetPasswordExpire: Used for the "Forgot Password" flow.
 *    A hashed token is stored in DB and emailed to the user to verify identity.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['Student', 'Faculty', 'Admin'],
      default: 'Student',
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  );
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const User = mongoose.model('User', userSchema);

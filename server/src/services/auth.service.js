import crypto from 'crypto';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Department } from '../models/Department.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  static async register({ name, email, password, department, semester }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    let departmentId = null;
    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        throw new ApiError(400, 'Invalid department specified.');
      }
      departmentId = deptExists._id;
    }

    const passwordHash = await User.hashPassword(password);

    // CRITICAL: Public registration must ALWAYS create a Student account
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'Student',
      department: departmentId,
      semester: semester || null,
      isActive: true,
    });

    const token = user.generateAuthToken();

    // Store active session (expires in 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      token,
      expiresAt,
    });

    const populatedUser = await User.findById(user._id).populate('department', 'name code');

    return { user: populatedUser, token };
  }

  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select('+passwordHash')
      .populate('department', 'name code');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = user.generateAuthToken();

    // Store active session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      token,
      expiresAt,
    });

    const userObj = user.toJSON();

    return { user: userObj, token };
  }

  static async logout(token) {
    if (token) {
      await Session.deleteOne({ token });
    }
    return true;
  }

  static async getMe(userId) {
    const user = await User.findById(userId).populate('department', 'name code');
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return user;
  }

  static async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't disclose whether email exists for security
      return { message: 'If an account exists with that email, a password reset link has been generated.' };
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
    await user.save({ validateBeforeSave: false });

    return {
      message: 'If an account exists with that email, a password reset link has been generated.',
      // Expose reset token in dev/demo response so user can test the flow immediately
      devResetToken: resetToken,
    };
  }

  static async resetPassword({ token, password }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired.');
    }

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Invalidate any existing sessions for this user
    await Session.deleteMany({ userId: user._id });

    return { message: 'Password has been successfully reset. Please log in with your new credentials.' };
  }
}

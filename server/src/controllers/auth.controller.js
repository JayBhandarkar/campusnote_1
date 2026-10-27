import { AuthService } from '../services/auth.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.register(req.body);

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return apiResponse(res, 201, 'Registration successful. Welcome to CampusNotes!', {
    user,
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.login(req.body);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return apiResponse(res, 200, 'Login successful', {
    user,
    token,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.token);

  res.clearCookie('token');

  return apiResponse(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user._id);
  return apiResponse(res, 200, 'User profile retrieved', { user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  return apiResponse(res, 200, result.message, result.devResetToken ? { devResetToken: result.devResetToken } : null);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  return apiResponse(res, 200, result.message);
});

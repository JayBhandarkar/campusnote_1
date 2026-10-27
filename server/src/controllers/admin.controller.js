import { User } from '../models/User.js';
import { Resource } from '../models/Resource.js';
import { Report } from '../models/Report.js';
import { Subject } from '../models/Subject.js';
import { storageService } from '../services/storage.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalResources, pendingReports, totalSubjects, recentResources, pendingReportsList, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Resource.countDocuments({ moderationStatus: 'Active' }),
      Report.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
      Subject.countDocuments(),
      Resource.find({ moderationStatus: 'Active' })
        .populate('department', 'name code')
        .populate('subject', 'name code')
        .populate('uploadedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find({ status: { $in: ['Pending', 'Under Review'] } })
        .populate('resource', 'title resourceType')
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

  return apiResponse(res, 200, 'Admin dashboard statistics retrieved', {
    stats: {
      totalUsers,
      totalResources,
      pendingReports,
      totalSubjects,
    },
    recentResources,
    pendingReports: pendingReportsList,
    recentUsers,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.role && req.query.role !== 'all') {
    query.role = req.query.role;
  }
  if (req.query.isActive !== undefined && req.query.isActive !== 'all') {
    query.isActive = req.query.isActive === 'true';
  }
  if (req.query.search) {
    const term = req.query.search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '15', 10)));
  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return apiResponse(
    res,
    200,
    'Users retrieved successfully',
    { users },
    {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    }
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return apiResponse(res, 200, 'User retrieved', { user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

  const { role, isActive, name, department, semester } = req.body;

  // SAFEGUARD: Prevent an admin from deactivating themselves
  if (targetUser._id.toString() === req.user._id.toString() && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own administrative account.');
  }

  // SAFEGUARD: Prevent demoting or deactivating the last active Admin
  if (targetUser.role === 'Admin' && (role !== 'Admin' || isActive === false)) {
    const activeAdminsCount = await User.countDocuments({
      role: 'Admin',
      isActive: true,
      _id: { $ne: targetUser._id },
    });
    if (activeAdminsCount === 0) {
      throw new ApiError(400, 'Cannot modify this user: system must have at least one active Administrator.');
    }
  }

  if (role) targetUser.role = role;
  if (isActive !== undefined) targetUser.isActive = isActive;
  if (name) targetUser.name = name;
  if (department !== undefined) targetUser.department = department || null;
  if (semester !== undefined) targetUser.semester = semester || null;

  await targetUser.save();

  const updated = await User.findById(targetUser._id).populate('department', 'name code');
  return apiResponse(res, 200, 'User updated successfully', { user: updated });
});

export const getAllResources = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.moderationStatus && req.query.moderationStatus !== 'all') {
    query.moderationStatus = req.query.moderationStatus;
  }
  if (req.query.verificationStatus && req.query.verificationStatus !== 'all') {
    query.verificationStatus = req.query.verificationStatus;
  }
  if (req.query.search) {
    query.title = { $regex: req.query.search.trim(), $options: 'i' };
  }

  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '15', 10)));
  const skip = (page - 1) * limit;

  const [resources, totalCount] = await Promise.all([
    Resource.find(query)
      .populate('department', 'name code')
      .populate('subject', 'name code semester')
      .populate('unit', 'title unitNumber')
      .populate('uploadedBy', 'name email role')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(query),
  ]);

  return apiResponse(
    res,
    200,
    'Admin resources retrieved',
    { resources },
    {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    }
  );
});

export const removeResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  resource.moderationStatus = 'Removed';
  await resource.save();

  // Safely cleanup physical file
  if (resource.file && resource.file.storageName) {
    await storageService.deleteFile(resource.file.storageName);
  }

  return apiResponse(res, 200, 'Resource marked as removed and storage cleaned up');
});

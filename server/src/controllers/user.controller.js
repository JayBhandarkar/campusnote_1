import { User } from '../models/User.js';
import { Resource } from '../models/Resource.js';
import { Bookmark } from '../models/Bookmark.js';
import { Report } from '../models/Report.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  return apiResponse(res, 200, 'Profile retrieved', { user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, department, semester } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (department !== undefined) updates.department = department || null;
  if (semester !== undefined) updates.semester = semester || null;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).populate('department', 'name code');

  return apiResponse(res, 200, 'Profile updated successfully', { user });
});

export const getMyResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({
    uploadedBy: req.user._id,
    moderationStatus: { $ne: 'Removed' },
  })
    .populate('department', 'name code')
    .populate('subject', 'name code semester')
    .populate('unit', 'title unitNumber')
    .sort({ createdAt: -1 });

  return apiResponse(res, 200, 'User uploads retrieved', { resources });
});

export const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: 'resource',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'subject', select: 'name code semester' },
        { path: 'unit', select: 'title unitNumber' },
        { path: 'uploadedBy', select: 'name role' },
      ],
    })
    .sort({ createdAt: -1 });

  // Filter out any bookmarks whose resources were removed
  const validResources = bookmarks
    .filter((b) => b.resource && b.resource.moderationStatus === 'Active')
    .map((b) => ({
      ...b.resource.toObject(),
      isBookmarked: true,
      bookmarkedAt: b.createdAt,
    }));

  return apiResponse(res, 200, 'Bookmarks retrieved', { items: validResources });
});

export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reportedBy: req.user._id })
    .populate({
      path: 'resource',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'subject', select: 'name code' },
      ],
    })
    .populate('reviewedBy', 'name role')
    .sort({ createdAt: -1 });

  return apiResponse(res, 200, 'User reports retrieved', { reports });
});

export const getMyVerifiedResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({
    verifiedBy: req.user._id,
    verificationStatus: 'Approved',
  })
    .populate('department', 'name code')
    .populate('subject', 'name code semester')
    .populate('unit', 'title unitNumber')
    .populate('uploadedBy', 'name role')
    .sort({ verifiedAt: -1 });

  return apiResponse(res, 200, 'Faculty verified resources retrieved', { resources });
});

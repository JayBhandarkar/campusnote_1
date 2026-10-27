import { Bookmark } from '../models/Bookmark.js';
import { Resource } from '../models/Resource.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const addBookmark = asyncHandler(async (req, res) => {
  const resourceId = req.params.id;

  const resource = await Resource.findById(resourceId);
  if (!resource || resource.moderationStatus === 'Removed') {
    throw new ApiError(404, 'Resource not found');
  }

  // Use findOneAndUpdate with upsert to prevent race conditions
  const bookmark = await Bookmark.findOneAndUpdate(
    { user: req.user._id, resource: resourceId },
    { $setOnInsert: { user: req.user._id, resource: resourceId } },
    { upsert: true, new: true }
  );

  return apiResponse(res, 200, 'Resource bookmarked successfully', { bookmark });
});

export const removeBookmark = asyncHandler(async (req, res) => {
  const resourceId = req.params.id;

  await Bookmark.findOneAndDelete({
    user: req.user._id,
    resource: resourceId,
  });

  return apiResponse(res, 200, 'Bookmark removed successfully');
});


import fs from 'fs';
import path from 'path';
import { ResourceService } from '../services/resource.service.js';
import { Resource } from '../models/Resource.js';
import { storageService } from '../services/storage.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const createResource = asyncHandler(async (req, res) => {
  const resource = await ResourceService.createResource({
    resourceData: req.body,
    file: req.file,
    user: req.user,
  });

  return apiResponse(res, 201, 'Resource uploaded successfully', { resource });
});

export const getResources = asyncHandler(async (req, res) => {
  const { items, meta } = await ResourceService.getResources(req.query, req.user);
  return apiResponse(res, 200, 'Resources retrieved successfully', { items }, meta);
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await ResourceService.getResourceById(req.params.id, req.user);
  return apiResponse(res, 200, 'Resource retrieved', { resource });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await ResourceService.updateResource(req.params.id, req.body, req.user);
  return apiResponse(res, 200, 'Resource updated successfully', { resource });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const result = await ResourceService.deleteResource(req.params.id, req.user);
  return apiResponse(res, 200, result.message);
});

export const previewFile = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.moderationStatus === 'Removed') {
    throw new ApiError(404, 'Resource not found');
  }

  const storageName = resource.file?.storageName;
  if (!storageName || !storageService.fileExists(storageName)) {
    throw new ApiError(404, 'Physical file not found in storage');
  }

  const filePath = storageService.getFilePath(storageName);
  const fileSize = storageService.getFileSize(storageName);
  const mimeType = resource.file.mimeType || 'application/pdf';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', fileSize);
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(resource.file.originalName)}"`
  );

  const stream = storageService.getFileStream(storageName);
  stream.pipe(res);
});

export const downloadFile = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.moderationStatus === 'Removed') {
    throw new ApiError(404, 'Resource not found');
  }

  const storageName = resource.file?.storageName;
  if (!storageName || !storageService.fileExists(storageName)) {
    throw new ApiError(404, 'Physical file not found in storage');
  }

  // Increment download count
  await ResourceService.incrementDownloadCount(resource._id);

  const fileSize = storageService.getFileSize(storageName);
  const mimeType = resource.file.mimeType || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', fileSize);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(resource.file.originalName)}"`
  );

  const stream = storageService.getFileStream(storageName);
  stream.pipe(res);
});

export const verifyResource = asyncHandler(async (req, res) => {
  const resource = await ResourceService.verifyResource(req.params.id, req.body, req.user);
  return apiResponse(
    res,
    200,
    `Resource ${req.body.status.toLowerCase()} successfully`,
    { resource }
  );
});

export const getVerificationQueue = asyncHandler(async (req, res) => {
  const query = {
    verificationStatus: 'Pending',
    moderationStatus: 'Active',
  };

  if (req.query.department) {
    query.department = req.query.department;
  }

  const resources = await Resource.find(query)
    .populate('department', 'name code')
    .populate('subject', 'name code semester')
    .populate('unit', 'title unitNumber')
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 });

  return apiResponse(res, 200, 'Verification queue retrieved', {
    items: resources,
    count: resources.length,
  });
});

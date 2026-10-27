import { Report } from '../models/Report.js';
import { Resource } from '../models/Resource.js';
import { storageService } from './storage.service.js';
import { ApiError } from '../utils/ApiError.js';

export class ReportService {
  static async createReport(resourceId, { reason, details }, user) {
    const resource = await Resource.findById(resourceId);
    if (!resource || resource.moderationStatus === 'Removed') {
      throw new ApiError(404, 'Resource not found or already removed');
    }

    // Check if user already has an active pending report for this resource
    const existing = await Report.findOne({
      resource: resourceId,
      reportedBy: user._id,
      status: { $in: ['Pending', 'Under Review'] },
    });

    if (existing) {
      throw new ApiError(400, 'You already have a pending report for this resource.');
    }

    const report = await Report.create({
      resource: resourceId,
      reportedBy: user._id,
      reason,
      details: details || '',
      status: 'Pending',
    });

    return await Report.findById(report._id)
      .populate('resource', 'title resourceType file')
      .populate('reportedBy', 'name email');
  }

  static async getUserReports(userId) {
    return await Report.find({ reportedBy: userId })
      .populate('resource', 'title resourceType file department subject')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });
  }

  static async getAllReports(filters = {}) {
    const query = {};
    if (filters.status && filters.status !== 'all') query.status = filters.status;
    if (filters.reason && filters.reason !== 'all') query.reason = filters.reason;

    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .populate({
          path: 'resource',
          populate: [
            { path: 'department', select: 'name code' },
            { path: 'subject', select: 'name code' },
            { path: 'uploadedBy', select: 'name email role' },
          ],
        })
        .populate('reportedBy', 'name email role')
        .populate('reviewedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query),
    ]);

    return {
      items: reports,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  static async updateReportStatus(reportId, { status, resolutionNote, removeResource }, adminUser) {
    const report = await Report.findById(reportId).populate('resource');
    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    report.status = status;
    report.reviewedBy = adminUser._id;
    report.resolutionNote = resolutionNote || '';
    await report.save();

    // If admin requested removal of the reported resource
    if (removeResource && report.resource) {
      const resource = await Resource.findById(report.resource._id);
      if (resource) {
        resource.moderationStatus = 'Removed';
        await resource.save();

        // Safe file cleanup
        if (resource.file && resource.file.storageName) {
          await storageService.deleteFile(resource.file.storageName);
        }
      }
    }

    return await Report.findById(report._id)
      .populate('resource', 'title resourceType moderationStatus')
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name role');
  }
}

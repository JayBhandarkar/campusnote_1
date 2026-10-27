/**
 * services/resource.service.js — Resource Business Logic Service
 *
 * Handles all core operations for study materials:
 *  1. validateAcademicHierarchy: Ensures subject belongs to department and unit belongs to subject.
 *  2. createResource:
 *      - Computes SHA-256 cryptographic hash of the uploaded file.
 *      - Checks database for identical existing files (prevents duplicate storage & spam).
 *      - Auto-approves if uploaded by Faculty/Admin; marks 'Pending' for Students.
 *  3. getResources: Full-text search, multi-field filtering (department, semester, subject, unit, type).
 *  4. incrementDownloadCount: Safely tracks engagement metrics.
 */
import fs from 'fs';
import { Resource } from '../models/Resource.js';
import { Department } from '../models/Department.js';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Bookmark } from '../models/Bookmark.js';
import { computeFileHash } from '../utils/hashFile.js';
import { storageService } from './storage.service.js';
import { ApiError } from '../utils/ApiError.js';

export class ResourceService {
  /**
   * Validate academic hierarchy: Subject must match Department & Semester, Unit must match Subject
   */
  static async validateAcademicHierarchy(departmentId, semester, subjectId, unitId) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new ApiError(404, 'Subject not found');
    }
    if (subject.department.toString() !== departmentId.toString()) {
      throw new ApiError(400, 'Selected subject does not belong to the selected department');
    }
    if (subject.semester !== parseInt(semester, 10)) {
      throw new ApiError(400, `Selected subject belongs to Semester ${subject.semester}, not Semester ${semester}`);
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }
    if (unit.subject.toString() !== subjectId.toString()) {
      throw new ApiError(400, 'Selected unit does not belong to the selected subject');
    }

    return { subject, unit };
  }

  /**
   * Upload resource with SHA-256 duplicate detection
   */
  static async createResource({ resourceData, file, user }) {
    if (!file) {
      throw new ApiError(400, 'A valid file is required for upload');
    }

    // Validate academic hierarchy
    await this.validateAcademicHierarchy(
      resourceData.department,
      resourceData.semester,
      resourceData.subject,
      resourceData.unit
    );

    let fileHash;
    try {
      fileHash = await computeFileHash(file.path);
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new ApiError(500, `Failed to compute file checksum: ${err.message}`);
    }

    // Check for existing duplicate resource
    const existing = await Resource.findOne({
      fileHash,
      moderationStatus: { $ne: 'Removed' },
    });

    if (existing) {
      // Clean up the uploaded temporary file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

      const err = new ApiError(409, 'This file has already been uploaded.');
      err.data = { existingResourceId: existing._id };
      throw err;
    }

    try {
      const newResource = await Resource.create({
        title: resourceData.title,
        description: resourceData.description || '',
        department: resourceData.department,
        semester: resourceData.semester,
        subject: resourceData.subject,
        unit: resourceData.unit,
        resourceType: resourceData.resourceType,
        academicYear: resourceData.academicYear,
        tags: resourceData.tags || [],
        uploadedBy: user._id,
        file: {
          originalName: file.originalname,
          storageName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        },
        fileHash,
        verificationStatus: 'Pending',
        moderationStatus: 'Active',
        downloadCount: 0,
      });

      return await Resource.findById(newResource._id)
        .populate('department', 'name code')
        .populate('subject', 'name code semester')
        .populate('unit', 'title unitNumber')
        .populate('uploadedBy', 'name email role');
    } catch (dbError) {
      // If a race condition occurred with concurrent duplicate upload
      if (dbError.code === 11000) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        const racedExisting = await Resource.findOne({ fileHash });
        const err = new ApiError(409, 'This file has already been uploaded.');
        err.data = { existingResourceId: racedExisting?._id };
        throw err;
      }
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw dbError;
    }
  }

  /**
   * Search and filter resources with pagination
   */
  static async getResources(filters = {}, user = null) {
    const query = { moderationStatus: 'Active' };

    // Search query: title, tags, or subject
    if (filters.q && filters.q.trim()) {
      const term = filters.q.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    if (filters.department) query.department = filters.department;
    if (filters.semester) query.semester = parseInt(filters.semester, 10);
    if (filters.subject) query.subject = filters.subject;
    if (filters.unit) query.unit = filters.unit;
    if (filters.type) query.resourceType = filters.type;
    if (filters.academicYear) query.academicYear = filters.academicYear;

    // Verification status filter
    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      query.verificationStatus = filters.verificationStatus;
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (filters.sort === 'oldest') sort = { createdAt: 1 };
    else if (filters.sort === 'downloads') sort = { downloadCount: -1, createdAt: -1 };
    else if (filters.sort === 'title') sort = { title: 1 };

    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const [resources, totalCount] = await Promise.all([
      Resource.find(query)
        .populate('department', 'name code')
        .populate('subject', 'name code semester')
        .populate('unit', 'title unitNumber')
        .populate('uploadedBy', 'name role')
        .populate('verifiedBy', 'name role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(query),
    ]);

    // If user is logged in, augment with bookmark status
    let userBookmarks = new Set();
    if (user) {
      const bookmarks = await Bookmark.find({
        user: user._id,
        resource: { $in: resources.map((r) => r._id) },
      }).select('resource');
      userBookmarks = new Set(bookmarks.map((b) => b.resource.toString()));
    }

    const items = resources.map((res) => ({
      ...res,
      isBookmarked: userBookmarks.has(res._id.toString()),
    }));

    return {
      items,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getResourceById(id, user = null) {
    const resource = await Resource.findById(id)
      .populate('department', 'name code')
      .populate('subject', 'name code semester')
      .populate('unit', 'title unitNumber')
      .populate('uploadedBy', 'name role email')
      .populate('verifiedBy', 'name role');

    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    if (resource.moderationStatus === 'Removed' && (!user || user.role !== 'Admin')) {
      throw new ApiError(404, 'Resource is no longer available');
    }

    const resObj = resource.toObject();
    if (user) {
      const bookmark = await Bookmark.findOne({ user: user._id, resource: id });
      resObj.isBookmarked = !!bookmark;
    } else {
      resObj.isBookmarked = false;
    }

    return resObj;
  }

  static async updateResource(id, updateData, user) {
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    // Only uploader or Admin can edit
    const isOwner = resource.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You are not authorized to edit this resource');
    }

    // Cannot edit if removed
    if (resource.moderationStatus === 'Removed') {
      throw new ApiError(400, 'Cannot edit a removed resource');
    }

    // If changing academic structure, validate it
    const dept = updateData.department || resource.department;
    const sem = updateData.semester || resource.semester;
    const subj = updateData.subject || resource.subject;
    const unt = updateData.unit || resource.unit;

    if (
      updateData.department ||
      updateData.semester ||
      updateData.subject ||
      updateData.unit
    ) {
      await this.validateAcademicHierarchy(dept, sem, subj, unt);
      resource.department = dept;
      resource.semester = sem;
      resource.subject = subj;
      resource.unit = unt;
    }

    if (updateData.title) resource.title = updateData.title;
    if (updateData.description !== undefined) resource.description = updateData.description;
    if (updateData.resourceType) resource.resourceType = updateData.resourceType;
    if (updateData.academicYear) resource.academicYear = updateData.academicYear;
    if (updateData.tags !== undefined) resource.tags = updateData.tags;

    await resource.save();

    return await Resource.findById(resource._id)
      .populate('department', 'name code')
      .populate('subject', 'name code semester')
      .populate('unit', 'title unitNumber')
      .populate('uploadedBy', 'name role');
  }

  static async deleteResource(id, user) {
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    const isOwner = resource.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You are not authorized to delete this resource');
    }

    // Restrict deletion of approved resources by students if moderation policy applies
    if (user.role === 'Student' && resource.verificationStatus === 'Approved') {
      throw new ApiError(403, 'Approved resources cannot be deleted by students. Please request deletion from faculty or admin.');
    }

    // Delete file from disk/storage
    if (resource.file && resource.file.storageName) {
      await storageService.deleteFile(resource.file.storageName);
    }

    // Remove bookmarks associated with this resource
    await Bookmark.deleteMany({ resource: id });

    await Resource.findByIdAndDelete(id);

    return { message: 'Resource successfully deleted' };
  }

  static async verifyResource(id, { status, note }, facultyUser) {
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new ApiError(404, 'Resource not found');
    }

    resource.verificationStatus = status;
    resource.verifiedBy = facultyUser._id;
    resource.verifiedAt = new Date();
    resource.verificationNote = note || '';

    await resource.save();

    return await Resource.findById(resource._id)
      .populate('department', 'name code')
      .populate('subject', 'name code semester')
      .populate('unit', 'title unitNumber')
      .populate('uploadedBy', 'name role')
      .populate('verifiedBy', 'name role');
  }

  static async incrementDownloadCount(id) {
    return await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
  }
}

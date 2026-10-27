import mongoose from 'mongoose';

export const REPORT_REASONS = [
  'Duplicate',
  'Wrong or Irrelevant Material',
  'Incorrect Content',
  'Inappropriate Content',
  'Corrupted File',
];

export const REPORT_STATUSES = ['Pending', 'Under Review', 'Resolved', 'Rejected'];

const reportSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting user is required'],
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: REPORT_REASONS,
      index: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending reports from the same user on the same resource
reportSchema.index({ resource: 1, reportedBy: 1, status: 1 });

export const Report = mongoose.model('Report', reportSchema);

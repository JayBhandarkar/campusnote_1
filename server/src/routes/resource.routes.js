import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  previewFile,
  downloadFile,
  verifyResource,
  getVerificationQueue,
} from '../controllers/resource.controller.js';
import { addBookmark, removeBookmark } from '../controllers/bookmark.controller.js';
import { createReport } from '../controllers/report.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  createResourceSchema,
  updateResourceSchema,
  verifyResourceSchema,
  queryResourceSchema,
} from '../validators/resource.validator.js';
import { createReportSchema } from '../validators/report.validator.js';

const router = Router();

// Resources list with search & filters
router.get('/', optionalAuthenticate, validate(queryResourceSchema), getResources);

// Verification queue (Faculty & Admin only)
router.get(
  '/queue',
  authenticate,
  authorizeRoles('Faculty', 'Admin'),
  getVerificationQueue
);

// Upload resource
router.post(
  '/',
  authenticate,
  upload.single('file'),
  validate(createResourceSchema),
  createResource
);

// Resource details
router.get('/:id', optionalAuthenticate, getResourceById);

// Update resource metadata
router.patch('/:id', authenticate, validate(updateResourceSchema), updateResource);

// Delete resource
router.delete('/:id', authenticate, deleteResource);

// Preview and Download streams
router.get('/:id/preview', optionalAuthenticate, previewFile);
router.get('/:id/download', optionalAuthenticate, downloadFile);

// Faculty verification
router.patch(
  '/:id/verification',
  authenticate,
  authorizeRoles('Faculty', 'Admin'),
  validate(verifyResourceSchema),
  verifyResource
);

// Bookmarks on resource
router.post('/:id/bookmark', authenticate, addBookmark);
router.delete('/:id/bookmark', authenticate, removeBookmark);

// Report resource
router.post(
  '/:id/reports',
  authenticate,
  validate(createReportSchema),
  createReport
);

export default router;

import { Router } from 'express';
import {
  getAllReports,
  updateReportStatus,
  getMyReports,
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import { updateReportSchema } from '../validators/report.validator.js';

const router = Router();

router.use(authenticate);

// User's own reports
router.get('/my', getMyReports);

// Admin reports management
router.get('/', authorizeRoles('Admin'), getAllReports);
router.patch(
  '/:id',
  authorizeRoles('Admin'),
  validate(updateReportSchema),
  updateReportStatus
);

export default router;

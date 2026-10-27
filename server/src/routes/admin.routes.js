import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  getAllResources,
  removeResource,
} from '../controllers/admin.controller.js';
import { getAllReports, updateReportStatus } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import { updateReportSchema } from '../validators/report.validator.js';

const router = Router();

// Enforce authentication and Admin role for all admin routes
router.use(authenticate, authorizeRoles('Admin'));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);

// Resource management
router.get('/resources', getAllResources);
router.delete('/resources/:id', removeResource);

// Reports management
router.get('/reports', getAllReports);
router.patch('/reports/:id', validate(updateReportSchema), updateReportStatus);

export default router;

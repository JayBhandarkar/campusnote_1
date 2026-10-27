import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import academicRoutes from './academic.routes.js';
import resourceRoutes from './resource.routes.js';
import reportRoutes from './report.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusNotes API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/', academicRoutes); // provides /departments, /subjects, /units
router.use('/resources', resourceRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;

import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMyResources,
  getMyBookmarks,
  getMyReports,
  getMyVerifiedResources,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.get('/me/resources', getMyResources);
router.get('/me/bookmarks', getMyBookmarks);
router.get('/me/reports', getMyReports);
router.get('/me/verified', authorizeRoles('Faculty', 'Admin'), getMyVerifiedResources);

export default router;

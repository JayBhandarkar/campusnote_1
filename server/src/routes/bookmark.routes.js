import { Router } from 'express';
import { getBookmarks } from '../controllers/bookmark.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/', getBookmarks);

export default router;

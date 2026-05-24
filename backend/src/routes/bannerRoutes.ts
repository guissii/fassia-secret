import { Router } from 'express';
import { getBanners, createOrUpdateBanner } from '../controllers/bannerController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public route for frontend
router.get('/', getBanners);

// Protected route for admin
router.post('/', authenticateAdmin, createOrUpdateBanner);

export default router;
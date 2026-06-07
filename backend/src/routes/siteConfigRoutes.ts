import { Router } from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getSiteConfig);
router.put('/', authenticateAdmin, updateSiteConfig);

export default router;

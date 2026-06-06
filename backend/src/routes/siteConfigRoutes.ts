import { Router } from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController';

const router = Router();

router.get('/', getSiteConfig);
router.put('/', updateSiteConfig);

export default router;

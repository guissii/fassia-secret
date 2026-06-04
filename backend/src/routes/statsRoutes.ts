import { Router } from 'express';
import { trackView, getStats } from '../controllers/statsController';

const router = Router();

router.post('/track-view', trackView);
router.get('/admin/stats', getStats);

export default router;

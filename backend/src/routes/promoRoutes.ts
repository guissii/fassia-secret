import { Router } from 'express';
import { getPromos, createPromo, updatePromo, deletePromo } from '../controllers/promoController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protected admin routes for promos
router.get('/', authenticateAdmin, getPromos);
router.post('/', authenticateAdmin, createPromo);
router.put('/:id', authenticateAdmin, updatePromo);
router.delete('/:id', authenticateAdmin, deletePromo);

export default router;

import { Router } from 'express';
import { getPromos, createPromo, updatePromo, deletePromo, validatePromo } from '../controllers/promoController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protected admin routes for promos
router.get('/', authenticateAdmin, getPromos);
router.post('/', authenticateAdmin, createPromo);
router.put('/:id', authenticateAdmin, updatePromo);
router.delete('/:id', authenticateAdmin, deletePromo);

// Public route for cart promo validation (no auth required)
router.post('/validate', validatePromo);

export default router;

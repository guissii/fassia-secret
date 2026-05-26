import { Router } from 'express';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public route for frontend
router.get('/', getCollections);

// Protected routes for admin
router.post('/', authenticateAdmin, createCollection);
router.put('/:id', authenticateAdmin, updateCollection);
router.delete('/:id', authenticateAdmin, deleteCollection);

export default router;

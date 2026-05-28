import { Router } from 'express';
import { getCollections, getCollectionProducts, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public routes for frontend
router.get('/', getCollections);
router.get('/:slug/products', getCollectionProducts);

// Protected routes for admin
router.post('/', authenticateAdmin, createCollection);
router.put('/:id', authenticateAdmin, updateCollection);
router.delete('/:id', authenticateAdmin, deleteCollection);

export default router;

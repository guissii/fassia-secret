import { Router } from 'express';
import { getCategories, getCategoryProducts, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { categorySchema } from '../validators';

const router = Router();

// Public routes for frontend
router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);

// Protected routes for admin
router.post('/', authenticateAdmin, validate(categorySchema), createCategory);
router.put('/:id', authenticateAdmin, updateCategory);
router.delete('/:id', authenticateAdmin, deleteCategory);

export default router;
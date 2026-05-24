import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { categorySchema } from '../validators';

const router = Router();

// Public route for frontend
router.get('/', getCategories);

// Protected route for admin (Security Fix applied)
router.post('/', authenticateAdmin, validate(categorySchema), createCategory);

export default router;
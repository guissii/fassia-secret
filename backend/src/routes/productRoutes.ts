import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleVisibility, toggleArchive } from '../controllers/productController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { productSchema } from '../validators';

const router = Router();

// Public route for frontend
router.get('/', getProducts);

// Protected routes for admin
router.post('/', authenticateAdmin, validate(productSchema), createProduct);
router.put('/:id', authenticateAdmin, updateProduct);
router.delete('/:id', authenticateAdmin, deleteProduct);
router.patch('/:id/visibility', authenticateAdmin, toggleVisibility);
router.patch('/:id/archive', authenticateAdmin, toggleArchive);

export default router;
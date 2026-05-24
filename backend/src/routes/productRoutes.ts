import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { productSchema } from '../validators';

const router = Router();

// Public route for frontend
router.get('/', getProducts);

// Protected route for admin (Security Fix applied)
router.post('/', authenticateAdmin, validate(productSchema), createProduct);

export default router;
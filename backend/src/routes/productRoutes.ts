import { Router } from 'express';
import { getProducts, searchProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleVisibility, toggleArchive, toggleEssential, importScrapedProducts } from '../controllers/productController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { productSchema } from '../validators';

const router = Router();

// Public route for frontend
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes for admin
router.post('/', authenticateAdmin, validate(productSchema), createProduct);
router.post('/import-scraped', authenticateAdmin, importScrapedProducts);
router.put('/:id', authenticateAdmin, updateProduct);
router.delete('/:id', authenticateAdmin, deleteProduct);
router.patch('/:id/visibility', authenticateAdmin, toggleVisibility);
router.patch('/:id/archive', authenticateAdmin, toggleArchive);
router.patch('/:id/essential', authenticateAdmin, toggleEssential);

export default router;
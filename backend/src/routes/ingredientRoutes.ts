import { Router } from 'express';
import { getIngredients, getActiveIngredients, createIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public route for frontend
router.get('/active', getActiveIngredients);

// Protected routes for admin
router.get('/', authenticateAdmin, getIngredients);
router.post('/', authenticateAdmin, createIngredient);
router.put('/:id', authenticateAdmin, updateIngredient);
router.delete('/:id', authenticateAdmin, deleteIngredient);

export default router;

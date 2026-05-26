import { Router } from 'express';
import { login, logout, createAdmin, getAdmins, deleteAdmin } from '../controllers/authController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);

// Protected admin management routes
router.get('/admins', authenticateAdmin, getAdmins);
router.post('/register', authenticateAdmin, createAdmin);
router.delete('/admins/:id', authenticateAdmin, deleteAdmin);

export default router;
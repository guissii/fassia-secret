import { Router } from 'express';
import { getOrders, createOrder } from '../controllers/orderController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { orderSchema } from '../validators';

const router = Router();

// Public route for customers to create orders
router.post('/', validate(orderSchema), createOrder);

// Protected route for admin to view orders (Security Fix applied)
router.get('/', authenticateAdmin, getOrders);

export default router;
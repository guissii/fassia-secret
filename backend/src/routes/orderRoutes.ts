import { Router } from 'express';
import { getOrders, createOrder, deleteOrder, updateOrderStatus } from '../controllers/orderController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { orderSchema } from '../validators';

const router = Router();

// Public route for customers to create orders
router.post('/', validate(orderSchema), createOrder);

// Protected route for admin to view orders (Security Fix applied)
router.get('/', authenticateAdmin, getOrders);

// Protected route for admin to delete orders
router.delete('/:id', authenticateAdmin, deleteOrder);

// Protected route for admin to update order status
router.put('/:id/status', authenticateAdmin, updateOrderStatus);

export default router;
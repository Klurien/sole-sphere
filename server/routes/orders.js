import express from 'express';
import * as ordersController from '../controllers/ordersController.js';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create order (optional auth: guests can order too, but we track users if logged in)
router.post('/', optionalAuthMiddleware, ordersController.createOrder);

// User retrieves their own orders
router.get('/my-orders', authMiddleware, ordersController.getUserOrders);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, ordersController.getAllOrders);
router.patch('/:id/status', authMiddleware, adminMiddleware, ordersController.updateOrderStatus);

export default router;

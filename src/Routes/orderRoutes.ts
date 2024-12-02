import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getAllOrders, 
  updateOrderStatus 
} from '../Controllers/orderController';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes for customers
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getUserOrders);

// Admin-only routes
router.get('/', authenticate, isAdmin, getAllOrders);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);

export default router;
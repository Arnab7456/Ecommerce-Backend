import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, listUsers } from '../Controllers/userController';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Admin-only routes
router.get('/', authenticate, isAdmin, listUsers);

export default router;
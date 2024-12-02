import express from 'express';
import { 
  createProduct, 
  listProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../Controllers/productController';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', listProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

export default router;
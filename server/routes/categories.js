import express from 'express';
import { getCategories, addCategory, deleteCategory } from '../controllers/categoryController.js';
import { authMiddleware as authenticateToken, adminMiddleware as isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticateToken, isAdmin, addCategory);
router.delete('/:id', authenticateToken, isAdmin, deleteCategory);

export default router;

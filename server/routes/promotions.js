import express from 'express';
import * as promotionsController from '../controllers/promotionsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/', promotionsController.getPromotions);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), promotionsController.createPromotion);
router.patch('/:id', authMiddleware, adminMiddleware, upload.single('image'), promotionsController.updatePromotion);
router.delete('/:id', authMiddleware, adminMiddleware, promotionsController.deletePromotion);

export default router;

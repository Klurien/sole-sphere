import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as productController from '../controllers/productController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // Removed restrictive fileFilter, increased size to 20MB

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes - accept up to 10 images at once
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 10), productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 10), productController.updateProduct);
router.delete('/reset', authMiddleware, adminMiddleware, productController.resetCatalog);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.delete('/:productId/images/:imageId', authMiddleware, adminMiddleware, productController.deleteProductImage);

export default router;

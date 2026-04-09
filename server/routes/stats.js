import express from 'express';
import { getDashboardStats, getSalesChart, getTopCategories, incrementVisitors, getCustomers, getRecentActivity, getSiteConfig, updateSiteConfig } from '../controllers/statsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/sales-chart', authMiddleware, adminMiddleware, getSalesChart);
router.get('/top-categories', authMiddleware, adminMiddleware, getTopCategories);
router.get('/customers', authMiddleware, adminMiddleware, getCustomers);
router.get('/recent-activity', authMiddleware, adminMiddleware, getRecentActivity);
router.get('/config', getSiteConfig); // Public for customers to get the WhatsApp link
router.post('/config', authMiddleware, adminMiddleware, updateSiteConfig);
router.post('/visitor', incrementVisitors); // This can be public

export default router;

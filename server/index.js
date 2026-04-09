import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import promotionRoutes from './routes/promotions.js';
import ordersRoutes from './routes/orders.js';
import sitemapRoutes from './routes/sitemap.js';
import statsRoutes from './routes/stats.js';
import categoryRoutes from './routes/categories.js';
// The db module already starts initDB() internally and its default export waits for it.
import db from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true, // Allow all origins during dev to avoid 5173 vs 5174 conflicts
    credentials: true
}));

// Visitor Tracker
app.use(async (req, res, next) => {
    // Basic rate limiting for visitor increment (once per session/cookie)
    if (!req.cookies?.has_visited && !req.path.startsWith('/api') && !req.path.includes('.')) {
        try {
            await db.execute('UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_name = "visitors"');
            res.cookie('has_visited', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        } catch (err) {
            console.error('Visitor tracking error:', err.message);
        }
    }
    next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/', sitemapRoutes); // Mounts /sitemap.xml (will match /api/sitemap.xml under Vercel)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        message: 'A serious server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Conditionally listen if not deployed on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
    });
}

// Export the Express app for Vercel serverless functions
export default app;

import express from 'express';
import db from '../db/db.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        const [products] = await db.query('SELECT id, created_at FROM products ORDER BY created_at DESC');

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.get('host');
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/products</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        for (const product of products) {
            // Prefer updated_at, fallback to created_at or current date if somehow null
            const dateStr = product.created_at || new Date();
            const date = new Date(dateStr).toISOString().split('T')[0];

            xml += `
    <url>
        <loc>${baseUrl}/products/${product.id}</loc>
        <lastmod>${date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        xml += `\n</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;

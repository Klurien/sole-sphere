import db from '../db/db.js';
import { uploadFile, deleteFile } from '../utils/upload.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPromotions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM promotions ORDER BY sort_order ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching promotions' });
    }
};

export const createPromotion = async (req, res) => {
    const { title, subtitle, link } = req.body;
    const image_url = req.file ? await uploadFile(req.file) : null;

    try {
        const [result] = await db.execute(
            'INSERT INTO promotions (title, subtitle, image_url, link) VALUES (?, ?, ?, ?)',
            [title, subtitle, image_url, link]
        );
        const [rows] = await db.query('SELECT * FROM promotions WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error creating promotion' });
    }
};

export const updatePromotion = async (req, res) => {
    const { title, subtitle, link, active, sort_order } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
        const promotion = rows[0];
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });

        let image_url = promotion.image_url;
        if (req.file) {
            if (image_url) {
                await deleteFile(image_url);
            }
            image_url = await uploadFile(req.file);
        }

        await db.execute(`
            UPDATE promotions
            SET title = ?, subtitle = ?, image_url = ?, link = ?, active = ?, sort_order = ?
            WHERE id = ?
        `, [
            title || promotion.title,
            subtitle || promotion.subtitle,
            image_url,
            link || promotion.link,
            active !== undefined ? parseInt(active) : promotion.active,
            sort_order !== undefined ? parseInt(sort_order) : promotion.sort_order,
            req.params.id
        ]);

        const [updated] = await db.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating promotion' });
    }
};

export const deletePromotion = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
        const promotion = rows[0];
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });

        if (promotion.image_url) {
            await deleteFile(promotion.image_url);
        }

        await db.execute('DELETE FROM promotions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting promotion' });
    }
};

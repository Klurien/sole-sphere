import db from '../db/db.js';

export const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching categories' });
    }
};

export const addCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    try {
        const [result] = await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: error.message || 'Error adding category' });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting category' });
    }
};

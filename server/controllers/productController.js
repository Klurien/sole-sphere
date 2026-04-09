import db from '../db/db.js';
import { uploadFile, deleteFile } from '../utils/upload.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: get all images for a product
const getProductImages = async (productId) => {
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
    return images;
};

// Helper: attach images[] to a product row
const attachImages = async (product) => {
    if (!product) return null;
    product.images = await getProductImages(product.id);
    if (!product.image_url && product.images.length > 0) {
        product.image_url = product.images[0].url;
    }
    return product;
};

export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            make,
            q,
            minPrice,
            maxPrice,
            condition,
            transmission,
            sort = 'newest'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const params = [];
        let whereClauses = [];

        if (category && category !== 'All') {
            whereClauses.push('category = ?');
            params.push(category);
        }
        if (make && make !== 'All') {
            whereClauses.push('make = ?');
            params.push(make);
        }
        if (condition && condition !== 'All') {
            whereClauses.push('`condition` = ?');
            params.push(condition);
        }
        if (transmission && transmission !== 'All') {
            whereClauses.push('transmission = ?');
            params.push(transmission);
        }
        if (q) {
            whereClauses.push('(name LIKE ? OR description LIKE ? OR make LIKE ?)');
            const searchPattern = `%${q}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        if (minPrice !== undefined && minPrice !== '') {
            whereClauses.push('price >= ?');
            params.push(parseFloat(minPrice));
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            whereClauses.push('price <= ?');
            params.push(parseFloat(maxPrice));
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Sorting
        let orderBy = 'created_at DESC';
        if (sort === 'price-asc') orderBy = 'price ASC';
        if (sort === 'price-desc') orderBy = 'price DESC';
        if (sort === 'year-desc') orderBy = 'year DESC';
        if (sort === 'name-asc') orderBy = 'name ASC';

        // Count Query
        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM products ${whereSql}`, params);
        const total = countResult[0].total;

        // Data Query
        const dataSql = `SELECT * FROM products ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const [products] = await db.query(dataSql, [...params, parseInt(limit), offset]);

        const withImages = await Promise.all(products.map(attachImages));

        res.json({
            products: withImages,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error fetching products' });
    }
};

export const getProduct = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        const product = products[0];
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(await attachImages(product));
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching product' });
    }
};

export const createProduct = async (req, res) => {
    const { name, description, price, category, stock, make, year, condition, transmission, engine_capacity, fuel_type, mileage, auction_grade, features } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });

    let image_url = req.body.image_url || null;
    let newImageUrls = [];
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length > 0) {
        newImageUrls = await Promise.all(files.map(f => uploadFile(f)));
        image_url = newImageUrls[0];
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO products (name, description, price, category, stock, image_url, make, year, condition, transmission, engine_capacity, fuel_type, mileage, auction_grade, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name,
                description,
                parseFloat(price),
                category,
                parseInt(stock) || 0,
                image_url,
                make,
                parseInt(year) || null,
                condition,
                transmission,
                engine_capacity,
                fuel_type,
                parseInt(mileage) || null,
                auction_grade || null,
                features || null
            ]
        );
        const productId = result.insertId;

        for (let i = 0; i < newImageUrls.length; i++) {
            await db.execute(
                'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
                [productId, newImageUrls[i], i]
            );
        }

        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        res.status(201).json(await attachImages(products[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error creating product' });
    }
};

export const updateProduct = async (req, res) => {
    const { name, description, price, category, stock, make, year, condition, transmission, engine_capacity, fuel_type, mileage, auction_grade, features } = req.body;
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        const product = products[0];
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let image_url = product.image_url;
        const newFiles = req.files || (req.file ? [req.file] : []);

        if (newFiles.length > 0) {
            const uploadedUrls = await Promise.all(newFiles.map(f => uploadFile(f)));
            const [stats] = await db.query('SELECT COUNT(*) as c FROM product_images WHERE product_id = ?', [req.params.id]);
            const existingCount = stats[0].c;
            for (let i = 0; i < uploadedUrls.length; i++) {
                await db.execute(
                    'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
                    [req.params.id, uploadedUrls[i], existingCount + i]
                );
            }
            if (!image_url) image_url = uploadedUrls[0];
        }

        if (req.body.deleted_image_ids) {
            let ids;
            try { ids = JSON.parse(req.body.deleted_image_ids); } catch { ids = []; }
            for (const imgId of ids) {
                const [images] = await db.query('SELECT * FROM product_images WHERE id = ?', [imgId]);
                const img = images[0];
                if (img) {
                    await deleteFile(img.url);
                    await db.execute('DELETE FROM product_images WHERE id = ?', [imgId]);
                }
            }
            const remaining = await getProductImages(req.params.id);
            image_url = remaining.length > 0 ? remaining[0].url : null;
        }

        if (req.body.image_order) {
            let order;
            try { order = JSON.parse(req.body.image_order); } catch { order = []; }
            for (let i = 0; i < order.length; i++) {
                await db.execute(
                    'UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?',
                    [i, order[i], req.params.id]
                );
            }
            const [first] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1', [req.params.id]);
            if (first[0]) image_url = first[0].url;
        }

        await db.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ?, make = ?, year = ?, condition = ?, transmission = ?, engine_capacity = ?, fuel_type = ?, mileage = ?, auction_grade = ?, features = ? WHERE id = ?',
            [
                name,
                description,
                parseFloat(price),
                category,
                parseInt(stock) || 0,
                image_url,
                make,
                parseInt(year) || null,
                condition,
                transmission,
                engine_capacity,
                fuel_type,
                parseInt(mileage) || null,
                auction_grade || null,
                features || null,
                req.params.id
            ]
        );

        const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.json(await attachImages(updated[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const images = await getProductImages(req.params.id);
        await Promise.all(images.map(img => deleteFile(img.url)));

        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};

export const deleteProductImage = async (req, res) => {
    const { productId, imageId } = req.params;
    try {
        const [images] = await db.query('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
        const img = images[0];
        if (!img) return res.status(404).json({ message: 'Image not found' });

        await deleteFile(img.url);
        await db.execute('DELETE FROM product_images WHERE id = ?', [imageId]);

        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        const product = products[0];
        if (product.image_url === img.url) {
            const [next] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1', [productId]);
            await db.execute('UPDATE products SET image_url = ? WHERE id = ?', [next[0]?.url || null, productId]);
        }
        res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image' });
    }
};

export const resetCatalog = async (req, res) => {
    try {
        // Cascade handles product_images when products are deleted, but deleting both is safer 
        await db.execute('DELETE FROM product_images');
        await db.execute('DELETE FROM products');
        await db.execute('DELETE FROM promotions');

        try {
            const upldDir = path.join(__dirname, '../uploads');
            if (fs.existsSync(upldDir)) {
                fs.readdirSync(upldDir).forEach(f => {
                    const fp = path.join(upldDir, f);
                    if (fs.statSync(fp).isFile()) fs.unlinkSync(fp);
                });
            }
        } catch (fileErr) {
            console.error('Failed clearing uploads:', fileErr);
        }

        res.json({ message: 'Catalog reset successfully' });
    } catch (error) {
        console.error('Catalog reset error:', error);
        res.status(500).json({ message: 'Error completely resetting catalog' });
    }
};

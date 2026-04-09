import db from '../db/db.js';

export const createOrder = async (req, res) => {
    const { items, total_amount, shipping_address, payment_intent_id } = req.body;
    const user_id = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO orders (user_id, total_amount, shipping_address, payment_intent_id) VALUES (?, ?, ?, ?)',
            [user_id, total_amount, JSON.stringify(shipping_address), payment_intent_id || 'mock_intent']
        );

        const orderId = result.insertId;

        for (const item of items) {
            await db.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );

            // Optional: Decrease product stock
            await db.execute('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
        }

        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

export const getUserOrders = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [user_id]);

        for (const order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Fetch user orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, u.username, u.role
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        for (const order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Fetch all orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

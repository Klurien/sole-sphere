import express from 'express';
import db from '../db/db.js';

const router = express.Router();

/**
 * REGISTER NEW MERCHANT
 */
router.post('/register', async (req, res) => {
    const { ownerEmail, storeName, tenantId } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO merchants (owner_email, store_name, tenant_id) VALUES (?, ?, ?)',
            [ownerEmail, storeName, tenantId]
        );
        res.status(201).json({ success: true, merchantId: result.insertId });
    } catch (error) {
        console.error('Merchant Registration Error:', error);
        res.status(500).json({ error: 'Failed to register merchant' });
    }
});

/**
 * RECORD TRANSACTION (The "Money" Guard)
 */
router.post('/transaction', async (req, res) => {
    const { merchantId, amount, type, externalRef } = req.body;
    
    const conn = await db.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [result] = await conn.execute(
            'INSERT INTO transactions (merchant_id, amount, transaction_type, external_ref, status) VALUES (?, ?, ?, ?, ?)',
            [merchantId, amount, type, externalRef, 'completed']
        );

        if (type === 'setup_fee') {
            await conn.execute(
                'UPDATE merchants SET setup_fee_paid = TRUE, status = "building" WHERE id = ?',
                [merchantId]
            );
        }

        await conn.query('COMMIT');
        res.json({ success: true, transactionId: result.insertId });
    } catch (error) {
        await conn.query('ROLLBACK');
        console.error('Transaction Error:', error);
        res.status(500).json({ error: 'Financial transaction failed' });
    } finally {
        conn.release();
    }
});

/**
 * GET MERCHANT STATUS
 */
router.get('/:tenantId/status', async (req, res) => {
    const { tenantId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM merchants WHERE tenant_id = ?', [tenantId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Merchant not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

export default router;

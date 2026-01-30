const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// CREATE Order (Public)
router.post('/', (req, res) => {
    const { customerName, customerPhone, customerAddress, items, total, notes } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress) {
        return res.status(400).json({ message: 'Customer information is required' });
    }

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    const orderId = `ORD-${Date.now()}`;

    db.serialize(() => {
        // Insert Order
        const stmtOrder = db.prepare(`
            INSERT INTO orders (id, customer_name, customer_phone, customer_address, total_amount, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `);

        stmtOrder.run(orderId, customerName, customerPhone, customerAddress, total, notes, function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Insert Items
            const stmtItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color, image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            items.forEach(item => {
                stmtItem.run(
                    orderId,
                    item.product.id,
                    item.product.name,
                    item.product.price,
                    item.quantity,
                    item.size,
                    item.color,
                    item.product.image
                );
            });
            stmtItem.finalize();

            res.status(201).json({
                message: 'Order placed successfully',
                id: orderId
            });
        });
        stmtOrder.finalize();
    });
});

// GET All Orders (Protected - Admin Only)
router.get('/', verifyToken, (req, res) => {
    const sql = `
        SELECT 
            o.*,
            json_group_array(
                json_object(
                    'productId', oi.product_id,
                    'name', oi.product_name,
                    'price', oi.price,
                    'quantity', oi.quantity,
                    'size', oi.size,
                    'color', oi.color,
                    'image', oi.image
                )
            ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const orders = rows.map(row => ({
            id: row.id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerAddress: row.customer_address,
            total: row.total_amount,
            status: row.status,
            notes: row.notes,
            createdAt: row.created_at,
            items: JSON.parse(row.items || '[]')
        }));

        res.json(orders);
    });
});

// UPDATE Order Status (Protected - Admin Only)
router.put('/:id/status', verifyToken, (req, res) => {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated successfully' });
    });
});

module.exports = router;

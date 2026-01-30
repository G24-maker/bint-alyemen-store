const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// GET all products (Public)
router.get('/', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Parse JSON fields
        const products = rows.map(p => ({
            ...p,
            sizes: JSON.parse(p.sizes || '[]'),
            colors: JSON.parse(p.colors || '[]'),
            inStock: !!p.in_stock,
            isNew: !!p.is_new,
            isSale: !!p.is_sale,
            originalPrice: p.original_price,
            category: p.category_id
        }));
        res.json(products);
    });
});

// GET single product (Public)
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Product not found' });

        const product = {
            ...row,
            sizes: JSON.parse(row.sizes || '[]'),
            colors: JSON.parse(row.colors || '[]'),
            inStock: !!row.in_stock,
            isNew: !!row.is_new,
            isSale: !!row.is_sale,
            originalPrice: row.original_price,
            category: row.category_id
        };
        res.json(product);
    });
});

// CREATE Product (Protected - Admin Only)
router.post('/', verifyToken, (req, res) => {
    const { name, price, originalPrice, image, category, sizes, colors, description, inStock, isNew, isSale } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const stmt = db.prepare(`
        INSERT INTO products (name, price, original_price, image, category_id, sizes, colors, description, in_stock, is_new, is_sale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        name,
        price,
        originalPrice,
        image,
        category,
        JSON.stringify(sizes),
        JSON.stringify(colors),
        description,
        inStock ? 1 : 0,
        isNew ? 1 : 0,
        isSale ? 1 : 0,
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Product created successfully' });
        }
    );
    stmt.finalize();
});

// UPDATE Product (Protected - Admin Only)
router.put('/:id', verifyToken, (req, res) => {
    const { name, price, originalPrice, image, category, sizes, colors, description, inStock, isNew, isSale } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const stmt = db.prepare(`
        UPDATE products SET 
            name = ?, price = ?, original_price = ?, image = ?, category_id = ?, 
            sizes = ?, colors = ?, description = ?, in_stock = ?, is_new = ?, is_sale = ?
        WHERE id = ?
    `);

    stmt.run(
        name,
        price,
        originalPrice,
        image,
        category,
        JSON.stringify(sizes),
        JSON.stringify(colors),
        description,
        inStock ? 1 : 0,
        isNew ? 1 : 0,
        isSale ? 1 : 0,
        req.params.id,
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated successfully' });
        }
    );
    stmt.finalize();
});

// DELETE Product (Protected - Admin Only)
router.delete('/:id', verifyToken, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;
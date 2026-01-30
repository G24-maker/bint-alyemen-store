const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database/store.db');
const db = new sqlite3.Database(dbPath);

const CATEGORIES = [
    { id: 'dresses', name: 'فساتين' },
    { id: 'abayas', name: 'عبايات' },
    { id: 'tops', name: 'بلوزات' },
    { id: 'pants', name: 'بناطيل' },
    { id: 'skirts', name: 'تنانير' },
    { id: 'hijabs', name: 'طرح' },
];

const PRODUCTS = [
    {
        name: 'فستان سهرة أنيق',
        price: 450,
        original_price: 600,
        image: '/images/products/dress1.jpg',
        category_id: 'dresses',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['أسود', 'navy', 'ذهبي']),
        description: 'فستان سهرة فاخر بتصميم أنيق يناسب المناسبات الخاصة',
        in_stock: 1,
        is_sale: 1,
    },
    {
        name: 'عباية يمنية تقليدية',
        price: 380,
        image: '/images/products/abaya1.jpg',
        category_id: 'abayas',
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['أسود', 'كحلي', 'زيتوني']),
        description: 'عباية يمنية أصيلة بتطريز يدوي رائع',
        in_stock: 1,
        is_new: 1,
    },
    {
        name: 'بلوزة صيفية أنيقة',
        price: 120,
        image: '/images/products/top1.jpg',
        category_id: 'tops',
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['أبيض', 'وردي', 'أزرق فاتح']),
        description: 'بلوزة صيفية خفيفة ومريحة للإطلالة اليومية',
        in_stock: 1,
        is_new: 0,
    },
    {
        name: 'فستان كاجوال',
        price: 280,
        image: '/images/products/dress2.jpg',
        category_id: 'dresses',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['أخضر', 'بيج', 'رمادي']),
        description: 'فستان كاجوال مريح للخروجات اليومية',
        in_stock: 1,
        is_new: 1,
    },
    {
        name: 'عباية رياضية عصرية',
        price: 220,
        image: '/images/products/abaya2.jpg',
        category_id: 'abayas',
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify(['أسود', 'رمادي', 'بني']),
        description: 'عباية رياضية عصرية للإطلالة الشبابية',
        in_stock: 1,
    },
    {
        name: 'تنورة طويلة أنيقة',
        price: 180,
        image: '/images/products/skirt1.jpg',
        category_id: 'skirts',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['أسود', 'كحلي', 'زيتوني']),
        description: 'تنورة طويلة أنيقة مناسبة للمناسبات',
        in_stock: 1,
    },
    {
        name: 'بنطلون كلاسيكي',
        price: 200,
        image: '/images/products/pants1.jpg',
        category_id: 'pants',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['أسود', 'بيج', 'رمادي']),
        description: 'بنطلون كلاسيكي أنيق للعمل والمناسبات',
        in_stock: 1,
    },
    {
        name: 'طرحة حرير فاخرة',
        price: 85,
        image: '/images/products/hijab1.jpg',
        category_id: 'hijabs',
        sizes: JSON.stringify(['موحد']),
        colors: JSON.stringify(['أسود', 'بيج', 'وردي', 'أزرق']),
        description: 'طرحة حرير طبيعي 100% فاخرة وناعمة',
        in_stock: 1,
        is_new: 1,
    },
    {
        name: 'فستان زفاف يمني',
        price: 1200,
        image: '/images/products/dress3.jpg',
        category_id: 'dresses',
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['أبيض', 'عاجي', 'ذهبي']),
        description: 'فستان زفاف يمني تقليدي بتطريز فاخر',
        in_stock: 1,
        is_new: 1,
    },
    {
        name: 'بلوزة مطرزة',
        price: 150,
        original_price: 200,
        image: '/images/products/top2.jpg',
        category_id: 'tops',
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['أبيض', 'أسود', 'أحمر']),
        description: 'بلوزة مطرزة يدوياً بتصاميم يمنية أصيلة',
        in_stock: 1,
        is_sale: 1,
    },
    {
        name: 'عباية سوداء كلاسيكية',
        price: 300,
        image: '/images/products/abaya3.jpg',
        category_id: 'abayas',
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['أسود']),
        description: 'عباية سوداء كلاسيكية أنيقة للمناسبات الرسمية',
        in_stock: 1,
    },
    {
        name: 'تنورة قصيرة كاجوال',
        price: 140,
        image: '/images/products/skirt2.jpg',
        category_id: 'skirts',
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['أزرق', 'وردي', 'أصفر']),
        description: 'تنورة قصيرة كاجوال للإطلالة الشبابية',
        in_stock: 1,
        is_new: 1,
    },
];

async function seed() {
    console.log('Reading schema...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing schema:', err);
                return;
            }
            console.log('Schema initialized. Seeding database...');

            // 1. Seed Admin
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@bintalyemen.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(adminPassword, salt);

            db.serialize(() => {
                // Admins
                const stmtAdmin = db.prepare("INSERT OR IGNORE INTO admins (username, email, password) VALUES (?, ?, ?)");
                stmtAdmin.run('admin', adminEmail, hash);
                stmtAdmin.finalize();

                // Categories
                const stmtCat = db.prepare("INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)");
                CATEGORIES.forEach(cat => {
                    stmtCat.run(cat.id, cat.name);
                });
                stmtCat.finalize();

                // Products
                const stmtProd = db.prepare(`
                    INSERT OR IGNORE INTO products 
                    (name, price, original_price, image, category_id, sizes, colors, description, in_stock, is_new, is_sale)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                PRODUCTS.forEach(p => {
                    stmtProd.run(
                        p.name,
                        p.price,
                        p.original_price || null,
                        p.image,
                        p.category_id,
                        p.sizes,
                        p.colors,
                        p.description,
                        p.in_stock ? 1 : 0,
                        p.is_new ? 1 : 0,
                        p.is_sale ? 1 : 0
                    );
                });
                stmtProd.finalize();

                console.log('Seeding completed.');
            });
        });
    } catch (err) {
        console.error("Error reading schema file:", err);
    }
}

seed();

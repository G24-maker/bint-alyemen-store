const path = require('path');
const fs = require('fs');

/* 
 * Database Connection Strategy:
 * 1. If DATABASE_URL is present in env, use PostgreSQL (Production/Cloud).
 * 2. If not, use SQLite (Local Development).
 */

let db;
const isPostgres = !!process.env.DATABASE_URL;

if (isPostgres) {
    const { Pool } = require('pg');
    console.log('Connecting to PostgreSQL database...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for many cloud providers (Render, Neon, etc.)
        }
    });

    // Wrapper to ensure compatibility with existing callback-style sqlite code if possible,
    // process.env.DATABASE_URL but we might need to adjust queries slightly if syntax differs significantly.
    // However, for this project, we will standardise on a simple query interface.
    // Note: This is a minimal adapter. For a larger app, an ORM like Prisma or Sequelize is recommended.

    db = {
        query: (text, params) => pool.query(text, params),
        exec: (text, callback) => {
            pool.query(text)
                .then(() => callback(null))
                .catch(err => callback(err));
        },
        // Adapter for sqlite 'get' (single row)
        get: (text, params, callback) => {
            // If params is callback (no params case)
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(text, params)
                .then(res => callback(null, res.rows[0]))
                .catch(err => callback(err));
        },
        // Adapter for sqlite 'run' (insert/update)
        run: function (text, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(text, params)
                .then(function (res) {
                    // simulate 'this.lastID' if needed, but standard PG doesn't return it easily without RETURNING id
                    // modifying queries to 'RETURNING id' is best practice for PG.
                    // For now, we will assume the caller handles logic that doesn't strictly depend on `this.lastID` 
                    // or we will patch critical queries.
                    if (callback) callback.call({ changes: res.rowCount }, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        },
        // Adapter for sqlite 'all' (multiple rows)
        all: (text, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(text, params)
                .then(res => callback(null, res.rows))
                .catch(err => callback(err));
        },
        close: () => pool.end()
    };

    // Auto-init schema for PG
    initDb(db, isPostgres);

} else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'store.db');

    console.log('Connecting to SQLite database (Local)...');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
            initDb(db, isPostgres);
        }
    });
}

function initDb(database, isPg) {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Simple compatibility fix for schema if needed
    if (isPg) {
        // SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT
        // Postgres uses SERIAL PRIMARY KEY
        // We do a naive replace for this simple schema
        schema = schema
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
            .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/TEXT/g, 'VARCHAR'); // Postgres prefers VARCHAR or TEXT is fine, but let's be safe. Actuall TEXT is fine in PG.
        // Let's keep TEXT for PG, it's efficient.
    }

    database.exec(schema, (err) => {
        if (err) {
            // Ignore error if table exists (simple approach) or log it
            // In a real app we'd use migrations.
            // console.warn('Schema init message (might be already exists):', err.message);
        } else {
            console.log('Database schema initialized.');
        }
        checkAndSeed(database);
    });
}

function checkAndSeed(database) {
    database.get("SELECT count(*) as count FROM admins", [], (err, row) => {
        if (err) return console.error('Error checking admins:', err.message);

        // Postgres returns string for count sometimes, ensure number comparison
        const count = row ? parseInt(row.count) : 0;

        if (count === 0) {
            console.log("No admins found. Please run 'npm run seed' to create the default admin.");
        }
    });
}

module.exports = db;

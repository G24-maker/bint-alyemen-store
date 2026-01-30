const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const db = require('./database/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const { performBackup, ensureBackupDirExists } = require('./backup');
// const uploadRoutes = require('./routes/upload'); 

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SECURITY: CORS Configuration
// ============================================
const corsOptions = {
    origin: (origin, callback) => {
        // Allowed origins
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3001',
            process.env.CORS_ORIGIN,
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        // In production, check origin
        if (process.env.NODE_ENV === 'production') {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('CORS not allowed'));
            }
        } else {
            // Development: allow all
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE BACKUP: Automatic Daily Backup
// ============================================
// Initialize backup directory
ensureBackupDirExists();

// Schedule automatic backup every day at 2:00 AM (02:00)
// Cron expression: '0 2 * * *' means at 02:00 every day
cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Starting automatic daily backup...');
    await performBackup();
    console.log('✅ Daily backup scheduled successfully');
});

// Optional: Run backup on server startup (uncomment if needed)
// performBackup();

console.log('📅 Automatic backup scheduled for 2:00 AM daily');

// Serve static files from the 'public' directory (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/upload', uploadRoutes);

// ============================================
// PRODUCTION: Serve Frontend Static Files
// ============================================
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');
    
    // Serve static files from dist
    app.use(express.static(distPath, {
        maxAge: '1d',
        etag: false
    }));
    
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Base route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

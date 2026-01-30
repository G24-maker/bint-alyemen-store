const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const TOKEN_EXPIRY = '2h'; // 2 hours as per security requirements

// ============================================
// Login Route with bcrypt validation
// ============================================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email and password are required',
            code: 'INVALID_INPUT'
        });
    }

    db.get('SELECT * FROM admins WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ 
                error: err.message,
                code: 'DB_ERROR'
            });
        }
        
        if (!user) {
            // Generic error message to prevent user enumeration
            return res.status(401).json({ 
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Compare password with hashed password using bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ 
                    error: err.message,
                    code: 'HASH_ERROR'
                });
            }

            if (!isMatch) {
                // Generic error message to prevent user enumeration
                return res.status(401).json({ 
                    message: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Generate JWT token with 2-hour expiry
            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            res.json({
                message: 'Login successful',
                accessToken: token,
                email: user.email,
                username: user.username,
                expiresIn: TOKEN_EXPIRY
            });
        });
    });
});

// ============================================
// Verify Token Route
// ============================================
router.get('/verify', verifyToken, (req, res) => {
    res.status(200).json({ 
        message: 'Token is valid',
        userId: req.userId,
        email: req.admin.email
    });
});

// ============================================
// Logout Route (frontend will clear token)
// ============================================
router.post('/logout', verifyToken, (req, res) => {
    // Token validation happens in verifyToken middleware
    // Frontend should clear token from localStorage
    res.status(200).json({ 
        message: 'Logged out successfully',
        code: 'LOGOUT_SUCCESS'
    });
});

module.exports = router;

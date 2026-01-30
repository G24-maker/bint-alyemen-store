const jwt = require('jsonwebtoken');

/**
 * Verify JWT Token Middleware
 * Extracts and validates JWT from Authorization header
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ 
                message: 'No token provided',
                code: 'NO_TOKEN' 
            });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        message: 'Token expired',
                        code: 'TOKEN_EXPIRED',
                        expiredAt: err.expiredAt
                    });
                }
                return res.status(401).json({ 
                    message: 'Invalid token',
                    code: 'INVALID_TOKEN'
                });
            }
            
            req.userId = decoded.id;
            req.admin = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

module.exports = {
    verifyToken
};

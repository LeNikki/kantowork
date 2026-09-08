const {verifyToken} = require('../config/jwt');

// Reads `Authorization: Bearer <token>`, verifies the signature, and puts the
// decoded payload on req.user for the handlers behind it.
const requireAuth = (req, res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({error: 'Not authenticated'});
    }

    try {
        req.user = verifyToken(token);   // {id, role, iat, exp}
        next();
    } catch (err) {
        const expired = err.name === 'TokenExpiredError';
        return res.status(401).json({error: expired ? 'Token expired' : 'Invalid token'});
    }
};

module.exports = requireAuth;

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware: allow anonymous requests by mapping them to a guest user ID
module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    const guestId = parseInt(process.env.GUEST_USER_ID, 10) || 1;

    if (!token) {
        // No token — treat as guest
        req.user = { id: guestId };
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        // If token invalid, fall back to guest instead of erroring
        req.user = { id: guestId };
        next();
    }
};
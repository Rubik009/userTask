const jwt = require('jsonwebtoken');
require('dotenv').config()

const authenticatToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'User not autorized' });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw new Error('invalid token');
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(403).json({ message: 'User not autorized' });
    }
}

module.exports = authenticatToken;
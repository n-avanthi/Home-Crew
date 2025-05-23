const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Expects-- Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(400).json({ message: 'Access denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // jwt.sign -> jwt.verify
        req.user = decoded; // user's ID is attached to the request
        next(); // middleware functions must call 'next()' to pass control to the next function in the request-response cycle else the request will hang
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = verifyToken;
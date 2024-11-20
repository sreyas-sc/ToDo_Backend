// middlewares/auth.js
import jwt from 'jsonwebtoken';

const userSecretKey = 'USERSECRETKEY'; // User secret key


// Middleware for verifying user token
export const verifyUserToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], userSecretKey); // Assuming token is sent as "Bearer <token>"
        req.userId = decoded.id; // Attach the decoded user ID to the request
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

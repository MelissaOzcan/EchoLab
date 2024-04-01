import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

export const authorizeToken = (req, res, next) => {
    const token = req.headers.authorization;
    console.log("\nToken: ", token);
    const tokenPart = token && token.split(' ')[1];
    if (!tokenPart) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(tokenPart, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

/**
 * @file middleware/rateLimiter.js
 * @description Rate Limiting user requests.
 */

import rateLimit from 'express-rate-limit';

/**
 * @function apiLimiter
 * @description Initializes rate limiting function, limiting users to 500 requests per 15 minutes.
 */

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
});

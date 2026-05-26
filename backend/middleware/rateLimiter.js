const rateLimit = require('express-rate-limit');

// ─── Helper: standard rate limit response ──────────────────────────────────
const rateLimitResponse = (req, res) => {
    const retryAfter = Math.ceil(res.getHeader('Retry-After') || 60);
    res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
    });
};

// ─── 1. Global Limiter — all routes ────────────────────────────────────────
// 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,   // Return RateLimit-* headers
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'Too many requests from this IP, please try again later.',
});

// ─── 2. Auth Limiter — login / register / forgot-password ──────────────────
// 20 requests per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'Too many authentication attempts, please try again later.',
});

// ─── 3. Upload Limiter — image upload routes ───────────────────────────────
// 30 requests per hour per IP
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'Too many upload requests, please try again later.',
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };

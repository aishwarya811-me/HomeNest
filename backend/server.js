require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { globalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('./uploads')));

// ─── Rate Limiters ─────────────────────────────────────────────────────────
app.use(globalLimiter);                    // 200 req / 15 min  — all routes
app.use('/api/auth', authLimiter);         // 20  req / 15 min  — auth routes (brute-force protection)
app.use('/api/properties', uploadLimiter); // 30 req / hr — property/image upload routes

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/properties', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HomeNest v2.0 running on http://localhost:${PORT} [Worker PID: ${process.pid}]`));
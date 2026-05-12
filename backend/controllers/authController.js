const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ── OTP Helper ────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const saveOTP = async (email, type) => {
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    await db.runAsync('DELETE FROM otp_tokens WHERE email=? AND type=?', [email, type]);
    await db.runAsync('INSERT INTO otp_tokens (email,otp,type,expires_at) VALUES (?,?,?,?)',
        [email, otp, type, expires]);
    // DEV MODE — print OTP to console
    console.log(`\n🔑 OTP for ${email} [${type}]: ${otp}\n`);
    return otp;
};

const verifyOTP = async (email, otp, type) => {
    const record = await db.getAsync(
        'SELECT * FROM otp_tokens WHERE email=? AND otp=? AND type=? AND used=0',
        [email, otp, type]);
    if (!record) return { valid: false, error: 'Invalid OTP' };
    if (new Date(record.expires_at) < new Date()) return { valid: false, error: 'OTP expired' };
    await db.runAsync('UPDATE otp_tokens SET used=1 WHERE id=?', [record.id]);
    return { valid: true };
};

// ── Register ──────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role)
            return res.status(400).json({ error: 'All fields required' });
        if (!['owner', 'renter'].includes(role))
            return res.status(400).json({ error: 'Invalid role' });
        const existing = await db.getAsync('SELECT id FROM users WHERE email=?', [email]);
        if (existing) return res.status(409).json({ error: 'Email already registered' });
        const password_hash = bcrypt.hashSync(password, 10);
        const result = await db.runAsync(
            'INSERT INTO users (name,email,password_hash,role,phone,is_verified) VALUES (?,?,?,?,?,0)',
            [name, email, password_hash, role, phone || null]);
        const otp = await saveOTP(email, 'verify');
        res.status(201).json({
            message: 'Registered! Please verify your email.',
            otp, // shown on screen in dev mode
            userId: result.lastInsertRowid
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Verify Email ──────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await verifyOTP(email, otp, 'verify');
        if (!result.valid) return res.status(400).json({ error: result.error });
        await db.runAsync('UPDATE users SET is_verified=1 WHERE email=?', [email]);
        const user = await db.getAsync('SELECT * FROM users WHERE email=?', [email]);
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Resend OTP ─────────────────────────────────────────────────
const resendOTP = async (req, res) => {
    try {
        const { email, type } = req.body;
        const user = await db.getAsync('SELECT id FROM users WHERE email=?', [email]);
        if (!user) return res.status(404).json({ error: 'Email not found' });
        const otp = await saveOTP(email, type || 'verify');
        res.json({ message: 'OTP sent!', otp });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        const user = await db.getAsync('SELECT * FROM users WHERE email=?', [email]);
        if (!user || !bcrypt.compareSync(password, user.password_hash))
            return res.status(401).json({ error: 'Invalid credentials' });
        if (!user.is_verified)
            return res.status(403).json({ error: 'Please verify your email first', needsVerification: true, email });
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Get Me ────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await db.getAsync(
            'SELECT id,name,email,role,phone,is_verified,created_at FROM users WHERE id=?', [req.user.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Update Profile ────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        await db.runAsync('UPDATE users SET name=?, phone=? WHERE id=?',
            [name, phone || null, req.user.id]);
        const user = await db.getAsync(
            'SELECT id,name,email,role,phone,is_verified FROM users WHERE id=?', [req.user.id]);
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Change Password ───────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const user = await db.getAsync('SELECT * FROM users WHERE id=?', [req.user.id]);
        if (!bcrypt.compareSync(current_password, user.password_hash))
            return res.status(400).json({ error: 'Current password is incorrect' });
        const hash = bcrypt.hashSync(new_password, 10);
        await db.runAsync('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
        res.json({ message: 'Password updated!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Forgot Password ───────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.getAsync('SELECT id FROM users WHERE email=?', [email]);
        if (!user) return res.status(404).json({ error: 'Email not found' });
        const otp = await saveOTP(email, 'reset');
        res.json({ message: 'OTP sent to your email!', otp });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Reset Password ────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;
        const result = await verifyOTP(email, otp, 'reset');
        if (!result.valid) return res.status(400).json({ error: result.error });
        const hash = bcrypt.hashSync(new_password, 10);
        await db.runAsync('UPDATE users SET password_hash=? WHERE email=?', [hash, email]);
        res.json({ message: 'Password reset successful! Please login.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { register, verifyEmail, resendOTP, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
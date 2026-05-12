const db = require('../config/database');

const paginate = (page, limit) => {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit) || 5));
    return { page: p, limit: l, offset: (p - 1) * l };
};

const getReviews = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: p, limit: l, offset } = paginate(page, limit);

        const [countRow, rows, avg] = await Promise.all([
            db.getAsync('SELECT COUNT(*) as total FROM reviews WHERE property_id=?', [req.params.id]),
            db.allAsync(`
        SELECT r.*, u.name as renter_name
        FROM reviews r JOIN users u ON r.renter_id=u.id
        WHERE r.property_id=?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.params.id, l, offset]),
            db.getAsync(
                'SELECT ROUND(AVG(rating),1) as avg_rating, COUNT(*) as total FROM reviews WHERE property_id=?',
                [req.params.id]
            ),
        ]);

        res.json({
            reviews: rows,
            avg_rating: avg.avg_rating || 0,
            total: avg.total,
            pagination: {
                total: countRow.total,
                page: p,
                limit: l,
                totalPages: Math.ceil(countRow.total / l),
                hasNext: p * l < countRow.total,
                hasPrev: p > 1,
            },
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        const existing = await db.getAsync(
            'SELECT id FROM reviews WHERE renter_id=? AND property_id=?',
            [req.user.id, req.params.id]
        );
        if (existing) return res.status(409).json({ error: 'You already reviewed this property' });

        const r = await db.runAsync(
            'INSERT INTO reviews (renter_id,property_id,rating,comment) VALUES (?,?,?,?)',
            [req.user.id, req.params.id, rating, comment || null]
        );
        const prop = await db.getAsync('SELECT owner_id,title FROM properties WHERE id=?', [req.params.id]);
        if (prop) {
            await db.runAsync(
                'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
                [prop.owner_id, 'New Review',
                `${req.user.name} left a ${rating}★ review on "${prop.title}"`, 'review']
            );
        }
        res.status(201).json({ id: r.lastInsertRowid, message: 'Review added!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const replyToReview = async (req, res) => {
    try {
        const review = await db.getAsync('SELECT * FROM reviews WHERE id=?', [req.params.reviewId]);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        const prop = await db.getAsync('SELECT owner_id FROM properties WHERE id=?', [review.property_id]);
        if (prop.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        await db.runAsync('UPDATE reviews SET owner_reply=? WHERE id=?', [req.body.reply, review.id]);
        res.json({ message: 'Reply added!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteReview = async (req, res) => {
    try {
        const review = await db.getAsync('SELECT * FROM reviews WHERE id=?', [req.params.reviewId]);
        if (!review) return res.status(404).json({ error: 'Not found' });
        if (review.renter_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        await db.runAsync('DELETE FROM reviews WHERE id=?', [review.id]);
        res.json({ message: 'Review deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const reportProperty = async (req, res) => {
    try {
        const existing = await db.getAsync(
            'SELECT id FROM reported_properties WHERE reporter_id=? AND property_id=?',
            [req.user.id, req.params.id]
        );
        if (existing) return res.status(409).json({ error: 'Already reported' });
        await db.runAsync(
            'INSERT INTO reported_properties (reporter_id,property_id,reason) VALUES (?,?,?)',
            [req.user.id, req.params.id, req.body.reason || 'Inappropriate content']
        );
        res.json({ message: 'Property reported. We will review it shortly.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getReviews, addReview, replyToReview, deleteReview, reportProperty };
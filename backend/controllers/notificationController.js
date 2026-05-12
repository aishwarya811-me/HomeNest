const db = require('../config/database');

const getNotifications = async (req, res) => {
    try {
        const rows = await db.allAsync(
            'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]);
        const unread = await db.getAsync(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0', [req.user.id]);
        res.json({ notifications: rows, unread_count: unread.count });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const markAllRead = async (req, res) => {
    try {
        await db.runAsync('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
        res.json({ message: 'All marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const markOneRead = async (req, res) => {
    try {
        await db.runAsync('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]);
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteNotification = async (req, res) => {
    try {
        await db.runAsync('DELETE FROM notifications WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getNotifications, markAllRead, markOneRead, deleteNotification };
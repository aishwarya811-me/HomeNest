const express = require('express');
const router = express.Router();
const { getReviews, addReview, replyToReview, deleteReview, reportProperty } = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authenticate, requireRole('renter'), addReview);
router.put('/:id/reviews/:reviewId/reply', authenticate, requireRole('owner'), replyToReview);
router.delete('/:id/reviews/:reviewId', authenticate, deleteReview);
router.post('/:id/report', authenticate, reportProperty);

module.exports = router;
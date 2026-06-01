const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propertyController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getProperties);
router.get('/owner/mine', authenticate, requireRole('owner'), ctrl.getOwnerProperties);
router.get('/owner/contacts', authenticate, requireRole('owner'), ctrl.getContactRequests);
router.get('/renter/bookmarks', authenticate, requireRole('renter'), ctrl.getBookmarks);
router.get('/:id', ctrl.getProperty);

router.post('/', authenticate, requireRole('owner'), ctrl.createProperty);
router.put('/:id', authenticate, requireRole('owner'), ctrl.updateProperty);
router.delete('/:id', authenticate, requireRole('owner'), ctrl.deleteProperty);

router.post('/:id/images', authenticate, requireRole('owner'), upload.array('images', 10), ctrl.uploadImages);
router.delete('/:id/images/:imageId', authenticate, requireRole('owner'), ctrl.deleteImage);

router.post('/:id/bookmark', authenticate, requireRole('renter'), ctrl.toggleBookmark);
router.post('/:id/contact', authenticate, requireRole('renter'), ctrl.contactOwner);

module.exports = router;
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const cmsController = require('../controllers/cmsController');
const router = express.Router();

// Public routes
router.get('/pages', cmsController.getPublishedPages);
router.get('/page/:slug', cmsController.getPageBySlug);

// Admin routes
router.get('/admin/pages', protect, restrictTo('admin'), cmsController.getAllPages);
router.get('/admin/page/:id', protect, restrictTo('admin'), cmsController.getPageById);
router.post('/admin/page', protect, restrictTo('admin'), cmsController.createPage);
router.put('/admin/page/:id', protect, restrictTo('admin'), cmsController.updatePage);
router.delete('/admin/page/:id', protect, restrictTo('admin'), cmsController.deletePage);
router.put('/admin/page/:id/publish', protect, restrictTo('admin'), cmsController.publishPage);
router.put('/admin/page/:id/unpublish', protect, restrictTo('admin'), cmsController.unpublishPage);

module.exports = router;

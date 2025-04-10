const express = require('express');
const cmsController = require('../controllers/cmsController');
const router = express.Router();

// Public routes
router.get('/pages', cmsController.getPublishedPages);
router.get('/page/:slug', cmsController.getPageBySlug);

// Admin routes
router.get('/admin/pages', cmsController.getAllPages);
router.get('/admin/page/:id', cmsController.getPageById);
router.post('/admin/page', cmsController.createPage);
router.put('/admin/page/:id', cmsController.updatePage);
router.delete('/admin/page/:id', cmsController.deletePage);
router.put('/admin/page/:id/publish', cmsController.publishPage);
router.put('/admin/page/:id/unpublish', cmsController.unpublishPage);

module.exports = router;

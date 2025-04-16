const express = require('express');
const moduleController = require('../controllers/moduleController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Module CRUD routes - restricted to admin and educator roles
router.post('/', restrictTo('admin', 'educator'), moduleController.createModule);
router.get('/course/:courseId', moduleController.getModules);
router.get('/:moduleId', moduleController.getModule);
router.put('/:moduleId', restrictTo('admin', 'educator'), moduleController.updateModule);
router.delete('/:moduleId', restrictTo('admin', 'educator'), moduleController.deleteModule);

// Module content management
router.post('/content', restrictTo('admin', 'educator'), moduleController.addContentToModule);
router.delete('/:moduleId/content/:contentId', restrictTo('admin', 'educator'), moduleController.removeContentFromModule);

// Module ordering
router.put('/course/:courseId/reorder', restrictTo('admin', 'educator'), moduleController.reorderModules);

module.exports = router;

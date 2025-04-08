const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// University routes
router.get('/universities', protect, restrictTo('admin'), adminController.getUniversities);
router.post('/university', protect, restrictTo('admin'), adminController.createUniversity);
router.put('/university/:id', protect, restrictTo('admin'), adminController.updateUniversity);

// Content routes
router.get('/content', protect, restrictTo('admin'), adminController.getContent);
router.post('/content', protect, restrictTo('admin'), upload.single('file'), adminController.createContent);
router.put('/content/:id', protect, restrictTo('admin'), adminController.updateContent);
router.put('/content/approve/:id', protect, restrictTo('admin'), adminController.approveContent);
router.put('/content/reject/:id', protect, restrictTo('admin'), adminController.rejectContent);
router.delete('/content/:id', protect, restrictTo('admin'), adminController.deleteContent);

// Course route
router.get('/courses', protect, restrictTo('admin'), adminController.getCourses);

// Profile and password update routes
router.put('/profile', protect, restrictTo('admin'), adminController.updateProfile);
router.put('/password', protect, restrictTo('admin'), adminController.updatePassword);

module.exports = router;

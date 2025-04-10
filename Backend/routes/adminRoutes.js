const express = require('express');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');
const router = express.Router();

// University routes
router.get('/universities', adminController.getUniversities);
router.post('/university', adminController.createUniversity);
router.put('/university/:id', adminController.updateUniversity);

// Content routes
router.get('/content', adminController.getContent);
router.post('/content', upload.single('file'), adminController.createContent);
router.put('/content/:id', adminController.updateContent);
router.put('/content/approve/:id', adminController.approveContent);
router.put('/content/reject/:id', adminController.rejectContent);
router.delete('/content/:id', adminController.deleteContent);

// Course route
router.get('/courses', adminController.getCourses);

// Profile and password update routes
router.put('/profile', adminController.updateProfile);
router.put('/password', adminController.updatePassword);

module.exports = router;

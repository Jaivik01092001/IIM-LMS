const express = require('express');
const educatorController = require('../controllers/educatorController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/courses', protect, educatorController.getCourses);
router.post('/enroll/:id', protect, educatorController.enrollCourse);
router.get('/my-courses', protect, educatorController.getMyCourses);
router.get('/course/:id', protect, educatorController.getCourseDetail);
router.get('/resume/:id', protect, educatorController.resumeCourse);
router.put('/course/:id/progress', protect, educatorController.updateProgress);
router.get('/content', protect, educatorController.getContent);
router.post('/content/:id/comment', protect, educatorController.addComment);
router.get('/my-content', protect, educatorController.getMyContent);
router.post('/content', protect, upload.single('file'), educatorController.createContent);
router.post('/quiz/:id', protect, educatorController.submitQuiz);
router.put('/profile', protect, educatorController.updateProfile);
router.put('/password', protect, educatorController.updatePassword);

module.exports = router;
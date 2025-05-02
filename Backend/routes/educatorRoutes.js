const express = require('express');
const educatorController = require('../controllers/educatorController');
const upload = require('../middleware/upload');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');

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
router.post('/courses/:id/quizzes/:quizId/submit', protect, educatorController.submitQuiz);
router.get('/courses/:id/quizzes/:quizId/attempts', protect, educatorController.getQuizAttempts);
router.put('/profile', protect, educatorController.updateProfile);
router.put('/password', protect, educatorController.updatePassword);

module.exports = router;
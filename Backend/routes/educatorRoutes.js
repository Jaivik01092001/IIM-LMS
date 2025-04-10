const express = require('express');
const educatorController = require('../controllers/educatorController');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/courses', educatorController.getCourses);
router.post('/enroll/:id', educatorController.enrollCourse);
router.get('/my-courses', educatorController.getMyCourses);
router.get('/course/:id', educatorController.getCourseDetail);
router.get('/resume/:id', educatorController.resumeCourse);
router.put('/course/:id/progress', educatorController.updateProgress);
router.get('/content', educatorController.getContent);
router.post('/content/:id/comment', educatorController.addComment);
router.get('/my-content', educatorController.getMyContent);
router.post('/content', upload.single('file'), educatorController.createContent);
router.post('/quiz/:id', educatorController.submitQuiz);
router.put('/profile', educatorController.updateProfile);
router.put('/password', educatorController.updatePassword);

module.exports = router;
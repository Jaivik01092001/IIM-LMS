const express = require('express');
const {
  getCourses, enrollCourse, getMyCourses, resumeCourse,
  getCourseDetail, getContent, addComment, getMyContent,
  createContent, submitQuiz, updateProfile, updatePassword,
} = require('../controllers/educatorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/courses', auth, getCourses);
router.post('/enroll/:id', auth, enrollCourse);
router.get('/my-courses', auth, getMyCourses);
router.get('/course/:id', auth, getCourseDetail);
router.get('/resume/:id', auth, resumeCourse);
router.get('/content', auth, getContent);
router.post('/content/:id/comment', auth, addComment);
router.get('/my-content', auth, getMyContent);
router.post('/content', auth, upload.single('file'), createContent);
router.post('/quiz/:id', auth, submitQuiz);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

module.exports = router;
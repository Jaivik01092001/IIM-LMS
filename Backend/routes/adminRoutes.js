const express = require('express');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploads'); // For file uploads
const router = express.Router();
const { protect } = require('../middleware/auth');

// Apply authentication and authorization middleware to all routes
router.use(protect);
//router.use(restrictTo('admin'));

// User routes
router.get('/users', adminController.getAllUsers);
router.get('/educators', adminController.getAllEducators);
router.post('/educators', upload.single('profileImage'), adminController.createEducator);
router.get('/educator/:id', adminController.getEducatorById);
router.put('/educator/:id', upload.single('profileImage'), adminController.updateEducator);

// University routes
router.get('/universities', adminController.getUniversities);
router.get('/university/:id', adminController.getUniversityById);
router.post('/university', adminController.createUniversity);
router.put('/university/:id', adminController.updateUniversity);
router.delete('/university/:id', adminController.deleteUniversity);

// Content routes
router.get('/content', adminController.getContent);
router.post('/content', upload.single('file'), adminController.createContent);
router.put('/content/:id', adminController.updateContent);
router.put('/content/approve/:id', adminController.approveContent);
router.put('/content/reject/:id', adminController.rejectContent);
router.delete('/content/:id', adminController.deleteContent);

// Course routes
router.get('/courses', adminController.getCourses);
router.post('/course', upload.any(), adminController.createCourse);
router.get('/course/:id', adminController.getCourse);
router.put('/course/:id', upload.any(), adminController.updateCourse);
router.delete('/course/:id', adminController.deleteCourse);
router.post('/course/content', adminController.addContentToCourse);
router.post('/course/quiz', adminController.addQuizToCourse);

// Quiz routes
router.post('/quiz', adminController.createQuiz);
router.get('/quizzes', adminController.getQuizzes);
router.get('/quiz/:quizId', adminController.getQuiz);
router.put('/quiz/:quizId', adminController.updateQuiz);

// Profile and password update routes
router.put('/profile', adminController.updateProfile);
router.put('/password', adminController.updatePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} = require('../controllers/quizController');

// Apply authentication middleware to all routes
router.use(protect);

// Quiz CRUD routes - restricted to admin and educator roles
router.post('/:courseId', restrictTo('admin', 'educator'), createQuiz);
router.get('/:quizId', getQuiz); // All authenticated users can view quizzes
router.put('/:quizId', restrictTo('admin', 'educator'), updateQuiz);
router.delete('/:quizId', restrictTo('admin', 'educator'), deleteQuiz);

// Quiz attempt routes - all authenticated users can submit and view results
router.post('/:quizId/submit', submitQuiz);
router.get('/:quizId/results', getQuizResults);

module.exports = router;
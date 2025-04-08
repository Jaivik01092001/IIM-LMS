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

// Quiz CRUD routes
router.post('/:courseId', protect, restrictTo('educator', 'admin'), createQuiz);
router.get('/:quizId', protect, getQuiz);
router.put('/:quizId', protect, restrictTo('educator', 'admin'), updateQuiz);
router.delete('/:quizId', protect, restrictTo('educator', 'admin'), deleteQuiz);

// Quiz attempt routes
router.post('/:quizId/submit', protect, submitQuiz);
router.get('/:quizId/results', protect, getQuizResults);

module.exports = router; 
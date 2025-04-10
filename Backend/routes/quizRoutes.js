const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} = require('../controllers/quizController');

// Quiz CRUD routes
router.post('/:courseId', createQuiz);
router.get('/:quizId', getQuiz);
router.put('/:quizId', updateQuiz);
router.delete('/:quizId', deleteQuiz);

// Quiz attempt routes
router.post('/:quizId/submit', submitQuiz);
router.get('/:quizId/results', getQuizResults);

module.exports = router;
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new quiz
exports.createQuiz = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to create quiz for this course', 403));
  }

  const quiz = await Quiz.create({
    ...req.body,
    course: courseId
  });

  course.quizzes.push(quiz._id);
  await course.save();

  res.status(201).json({
    status: 'success',
    data: quiz
  });
});

// Get a quiz
exports.getQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId)
    .populate('course', 'title');

  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: quiz
  });
});

// Update a quiz
exports.updateQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);
  
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const course = await Course.findById(quiz.course);
  if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this quiz', 403));
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(
    req.params.quizId,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedQuiz
  });
});

// Delete a quiz
exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);
  
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const course = await Course.findById(quiz.course);
  if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this quiz', 403));
  }

  await Quiz.findByIdAndDelete(req.params.quizId);
  
  // Remove quiz reference from course
  course.quizzes = course.quizzes.filter(q => q.toString() !== quiz._id.toString());
  await course.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Submit quiz attempt
exports.submitQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);
  
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const { answers } = req.body;
  let score = 0;
  const evaluatedAnswers = answers.map((answer, index) => {
    const isCorrect = answer === quiz.questions[index].correctAnswer;
    if (isCorrect) score += quiz.questions[index].points;
    return {
      questionIndex: index,
      selectedAnswer: answer,
      isCorrect
    };
  });

  const finalScore = (score / quiz.questions.reduce((acc, q) => acc + q.points, 0)) * 100;

  quiz.attempts.push({
    user: req.user._id,
    score: finalScore,
    answers: evaluatedAnswers
  });

  await quiz.save();

  res.status(200).json({
    status: 'success',
    data: {
      score: finalScore,
      passed: finalScore >= quiz.passingScore,
      answers: evaluatedAnswers
    }
  });
});

// Get quiz results
exports.getQuizResults = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId)
    .populate('attempts.user', 'name email');

  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const userAttempt = quiz.attempts.find(
    attempt => attempt.user._id.toString() === req.user._id.toString()
  );

  if (!userAttempt) {
    return next(new AppError('No attempt found for this quiz', 404));
  }

  res.status(200).json({
    status: 'success',
    data: userAttempt
  });
}); 
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // Changed from String to Number to match frontend
    explanation: { type: String },
    points: { type: Number, default: 1 }
  }],
  timeLimit: { type: Number }, // in minutes
  passingScore: { type: Number, default: 60 }, // percentage
  attempts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    answers: [{
      questionIndex: { type: Number },
      selectedAnswer: { type: String },
      isCorrect: { type: Boolean }
    }],
    completedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
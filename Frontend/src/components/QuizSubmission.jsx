import React, { useState, useEffect } from 'react';
import './QuizSubmission.css';

const QuizSubmission = ({ quiz, onSubmit, existingAttempt = null }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if this quiz has existing attempts when the component mounts or quiz changes
  useEffect(() => {
    // Reset state when the component mounts or quiz changes
    setSubmitted(false);
    setResults(null);
    setAnswers({});

    // Only if there's an existing attempt for the current user, show the results
    if (existingAttempt) {
      console.log("Found existing attempt:", existingAttempt);
      setSubmitted(true);
      setResults(existingAttempt);

      // Reconstruct answers from the attempt data if available
      if (existingAttempt.answers && Array.isArray(existingAttempt.answers)) {
        const reconstructedAnswers = {};
        existingAttempt.answers.forEach(answer => {
          if (answer.questionId) {
            reconstructedAnswers[answer.questionId] = answer.selectedAnswer;
          }
        });
        setAnswers(reconstructedAnswers);
      }
    }
  }, [existingAttempt, quiz._id]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex.toString()
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined);

    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      setLoading(true);
      const result = await onSubmit(answers);
      setResults(result);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Only reset the local state, don't delete the attempt from the database
    setAnswers({});
    setSubmitted(false);
    setResults(null);
  };

  // Add debug logging
  console.log("QuizSubmission render - existingAttempt:", existingAttempt);
  console.log("QuizSubmission render - submitted:", submitted);

  return (
    <div className="quiz-submission-container">
      {!submitted ? (
        <>
          <div className="quiz-header">
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
            <div className="quiz-meta">
              <span>Time Limit: {quiz.timeLimit} minutes</span>
              <span>Passing Score: {quiz.passingScore}%</span>
            </div>
          </div>

          <div className="quiz-questions">
            {quiz.questions.map((question, qIndex) => (
              <div key={question._id} className="quiz-question">
                <h3>Question {qIndex + 1}: {question.question}</h3>
                <div className="quiz-options">
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="quiz-option">
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        checked={answers[question._id] === oIndex.toString()}
                        onChange={() => handleAnswerSelect(question._id, oIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <button
              className="quiz-submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </>
      ) : (
        <div className="quiz-results">
          <div className="quiz-result-header">
            <h2>{results.passed ? 'Congratulations!' : 'Quiz Results'}</h2>
            <div className="quiz-score">
              <div className={`score-circle ${results.passed ? 'passed' : 'failed'}`}>
                {results.percentage}%
              </div>
              <p>You {results.passed ? 'passed' : 'did not pass'} the quiz.</p>
              <p>Score: {results.score}/{results.totalPoints}</p>
            </div>
          </div>

          <div className="quiz-answers-review">
            <h3>Review Your Answers</h3>
            {quiz.questions.map((question, qIndex) => {
              const userAnswer = answers[question._id];
              const correctAnswer = question.correctAnswer;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={question._id} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <h4>Question {qIndex + 1}: {question.question}</h4>
                  <div className="review-options">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`review-option ${userAnswer === oIndex.toString() ? 'selected' : ''
                          } ${correctAnswer === oIndex.toString() ? 'correct-answer' : ''
                          }`}
                      >
                        <span className="option-text">{option}</span>
                        {userAnswer === oIndex.toString() && userAnswer !== correctAnswer && (
                          <span className="wrong-indicator">✗</span>
                        )}
                        {correctAnswer === oIndex.toString() && (
                          <span className="correct-indicator">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!isCorrect && (
                    <div className="correct-answer-note">
                      <p>Correct answer: {question.options[parseInt(correctAnswer)]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="quiz-actions">
            <button className="quiz-retry-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSubmission;

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseDetailThunk, submitQuizThunk } from '../redux/educator/educatorSlice';

function CourseQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseDetail, loading } = useSelector((state) => state.educator);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getCourseDetailThunk(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Log the course detail when it changes
    if (courseDetail) {
      console.log('Course detail loaded:', courseDetail);
      console.log('Quizzes available:', courseDetail.quizzes);
    }
  }, [courseDetail]);

  // Get quiz data from courseDetail
  const quizQuestions = courseDetail?.quizzes && courseDetail.quizzes.length > 0
    ? courseDetail.quizzes[0].questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      answer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points
    }))
    : [];

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    quizQuestions.forEach(question => {
      totalPoints += question.points || 1;
      if (selectedAnswers[question._id] === question.answer) {
        score += question.points || 1;
      }
    });

    const result = {
      score,
      total: quizQuestions.length,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
      passed: score >= (courseDetail?.quizzes?.[0]?.passingScore || totalPoints)
    };

    // Submit quiz to backend
    if (courseDetail?.quizzes?.[0]?._id) {
      dispatch(submitQuizThunk({
        id: courseDetail.quizzes[0]._id,
        answers: Object.values(selectedAnswers)
      }));
    }

    setQuizResult(result);
    setQuizSubmitted(true);
  };

  if (loading || !courseDetail) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {!quizSubmitted ? (
          <>
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">
                  {courseDetail.title} - {courseDetail?.quizzes?.[0]?.title || 'Quiz'}
                </h1>
                <div className="text-white text-sm">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-white h-2.5 rounded-full"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
              {courseDetail?.quizzes?.[0]?.timeLimit && (
                <div className="text-white text-xs mt-2">
                  Time Limit: {courseDetail.quizzes[0].timeLimit} minutes
                </div>
              )}
            </div>

            {/* Quiz Content */}
            <div className="p-6">
              {quizQuestions.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {currentQuestion + 1}. {quizQuestions[currentQuestion]?.question}
                  </h2>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion]?.options?.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          id={`option-${index}`}
                          name={`question-${quizQuestions[currentQuestion]?._id}`}
                          type="radio"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedAnswers[quizQuestions[currentQuestion]?._id] === option}
                          onChange={() => handleAnswerSelect(quizQuestions[currentQuestion]?._id, option)}
                        />
                        <label htmlFor={`option-${index}`} className="ml-3 block text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                    {quizQuestions[currentQuestion]?.points && (
                      <div className="mt-4 text-sm text-gray-500">
                        Points: {quizQuestions[currentQuestion].points}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">No Quiz Questions Available</h2>
                  <p className="text-gray-600 mb-4">This course doesn't have any quiz questions yet.</p>
                  <Link
                    to={`/course/${id}/learn`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Return to Course
                  </Link>
                </div>
              )}
            </div>

            <div className="flex justify-between p-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {quizQuestions.length > 0 && (
                currentQuestion === quizQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <>
            {/* Quiz Results */}
            <div className="p-8 text-center">
              {quizResult.passed ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    You've successfully completed the quiz with a perfect score!
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg inline-block mb-8">
                    <div className="text-4xl font-bold text-green-600 mb-1">{quizResult.percentage}%</div>
                    <div className="text-gray-500">Score: {quizResult.score}/{quizResult.total}</div>
                  </div>


                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost There!</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    You need to answer all questions correctly to pass the quiz.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg inline-block mb-8">
                    <div className="text-4xl font-bold text-yellow-600 mb-1">{quizResult.percentage}%</div>
                    <div className="text-gray-500">Score: {quizResult.score}/{quizResult.total}</div>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to={`/course/${id}/learn`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                >
                  Return to Course
                </Link>
                {!quizResult.passed && (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setCurrentQuestion(0);
                      setSelectedAnswers({});
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Retry Quiz
                  </button>
                )}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CourseQuiz;

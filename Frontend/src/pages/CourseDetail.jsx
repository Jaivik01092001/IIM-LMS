import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaBook, FaUserGraduate, FaStar, FaChevronDown, FaFileAlt } from 'react-icons/fa';
import './CourseDetail.css';
import { useDispatch, useSelector } from 'react-redux';
import { getCourse } from '../redux/admin/adminApi';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('information');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleContent, setShowModuleContent] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const courseData = await getCourse(id);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course details:', error);
        // Keep course as null to show error state
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handlePreviewClick = (module) => {
    // Check if the module already has a quiz reference
    if (module.quiz) {
      // If it's just an ID, find the full quiz object
      if (typeof module.quiz === 'string') {
        const moduleQuiz = course.quizzes?.find(quiz => quiz._id === module.quiz);
        if (moduleQuiz) {
          // Module already has the correct quiz ID
          console.log('Module already has quiz reference:', module.quiz);
          setSelectedModule(module);
          setShowModuleContent(true);
          return;
        }
      } else {
        // Module already has the quiz object
        console.log('Module already has quiz object:', module.quiz);
        setSelectedModule(module);
        setShowModuleContent(true);
        return;
      }
    }

    // If no quiz reference or invalid reference, try to find a matching quiz
    const moduleQuiz = course.quizzes?.find(quiz =>
      quiz.title.includes(module.title) ||
      quiz.description.includes(module.title)
    );

    // Create an enhanced module object with the quiz ID
    const enhancedModule = {
      ...module,
      quiz: moduleQuiz ? moduleQuiz._id : null
    };

    console.log('Enhanced module with quiz:', enhancedModule);
    setSelectedModule(enhancedModule);
    setShowModuleContent(true);
  };

  const closeModulePreview = () => {
    setShowModuleContent(false);
    setSelectedModule(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const handleQuizAnswerChange = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuizSubmit = async () => {
    if (!selectedModule || !selectedModule.quiz) return;

    try {
      // Find the quiz object
      const quizObject = course.quizzes?.find(q => q._id === selectedModule.quiz._id);
      if (!quizObject) return;

      // Check if all questions have been answered
      const allQuestionsAnswered = quizObject.questions.every(q =>
        quizAnswers[q._id] !== undefined
      );

      if (!allQuestionsAnswered) {
        alert('Please answer all questions before submitting.');
        return;
      }

      // Submit quiz answers to the backend
      const response = await fetch(`/api/courses/${course._id}/quizzes/${quizObject._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: quizAnswers, quizId: quizObject._id })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const results = await response.json();
      setQuizResults(results);
      setQuizSubmitted(true);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <h2>Course not found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      {/* Course Header */}
      <div className="course-detail-header">
        <div className="course-header-content">
          <h1 className="course-title">{course.title}</h1>
          <div className="course-meta-info">
            <span className="course-category">Category: {course.category}</span>
            <span className="course-language">Language: {course.language}</span>
            <div className="course-rating">
              <FaStar className="star-icon" />
              <span>{course.rating || "New"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content Preview Modal */}
      {showModuleContent && selectedModule && (
        <div className="module-preview-modal">
          <div className="module-preview-content">
            <button className="close-preview" onClick={closeModulePreview}>×</button>
            <h2>{selectedModule.title}</h2>
            <div className="module-content-display">
              {/* Content Section */}
              <div className="preview-section">
                <h3>Content</h3>
                {selectedModule.content && selectedModule.content.length > 0 ? (
                  <div className="module-content-items">
                    {/* Check if content items are already populated objects or just IDs */}
                    {Array.isArray(selectedModule.content) && selectedModule.content.map((contentItem, index) => {
                      // If contentItem is just an ID, we need to find the actual content object
                      const contentObject = typeof contentItem === 'string' || contentItem instanceof String
                        ? course.content.find(c => c._id === contentItem) || { title: `Content ${index + 1}`, description: 'Content details not available' }
                        : contentItem;

                      return (
                        <div key={contentObject._id || index} className="content-preview-item">
                          <div className="content-preview-header">
                            <h4>{contentObject.title}</h4>
                            <span className="content-type-badge">{contentObject.type || 'Document'}</span>
                          </div>
                          <p className="content-description">{contentObject.description}</p>

                          {/* Display content based on type */}
                          {contentObject.fileUrl && (
                            <div className="content-preview">
                              {contentObject.type === 'video' || contentObject.mediaType === 'video' ? (
                                <div className="video-preview">
                                  <video controls className="preview-video">
                                    <source src={contentObject.fileUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              ) : contentObject.type === 'image' || contentObject.mediaType === 'image' ? (
                                <div className="image-preview">
                                  <img src={contentObject.fileUrl} alt={contentObject.title} className="preview-image" />
                                </div>
                              ) : (
                                <div className="document-preview">
                                  <a href={contentObject.fileUrl} target="_blank" rel="noopener noreferrer" className="document-link">
                                    <FaFileAlt className="document-icon" />
                                    View Document
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-content-message">No content available for this module.</p>
                )}
              </div>

              {/* Quiz Section */}
              {selectedModule.quiz && (
                <div className="preview-section module-quiz-section">
                  {/* Find the quiz object using the quiz ID */}
                  {(() => {
                    // Get the quiz object
                    const quizId = typeof selectedModule.quiz === 'string' ? selectedModule.quiz : selectedModule.quiz._id;
                    const quizObject = course.quizzes?.find(q => q._id === quizId);

                    if (quizObject) {
                      return (
                        <>
                          <h3>Quiz: {quizObject.title || 'Module Quiz'}</h3>

                          {quizObject.questions?.length > 0 ? (
                            <div className="quiz-preview">
                              <p className="quiz-description">
                                {quizObject.description || 'Test your knowledge of this module'}
                              </p>

                              {!quizSubmitted ? (
                                // Quiz Questions Form
                                <div className="quiz-questions-form">
                                  {quizObject.questions.map((question, qIndex) => (
                                    <div key={question._id || qIndex} className="quiz-question">
                                      <h4>Question {qIndex + 1}: {question.question}</h4>
                                      <div className="quiz-options">
                                        {question.options.map((option, oIndex) => (
                                          <div key={oIndex} className="quiz-option">
                                            <input
                                              type="radio"
                                              id={`question-${question._id}-option-${oIndex}`}
                                              name={`question-${question._id}`}
                                              value={option}
                                              onChange={() => handleQuizAnswerChange(question._id, option)}
                                              checked={quizAnswers[question._id] === option}
                                            />
                                            <label htmlFor={`question-${question._id}-option-${oIndex}`}>{option}</label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}

                                  <div className="quiz-submit-container">
                                    <button
                                      className="quiz-submit-button"
                                      onClick={handleQuizSubmit}
                                    >
                                      Submit Quiz
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // Quiz Results
                                <div className="quiz-results">
                                  <div className="quiz-result-header">
                                    <h4 className={quizResults.passed ? "result-passed" : "result-failed"}>
                                      {quizResults.passed ? "Congratulations! You passed the quiz." : "You didn't pass the quiz. Try again."}
                                    </h4>
                                  </div>

                                  <div className="quiz-score-summary">
                                    <div className="score-item">
                                      <span className="score-label">Score:</span>
                                      <span className="score-value">{quizResults.score} / {quizResults.totalPoints}</span>
                                    </div>
                                    <div className="score-item">
                                      <span className="score-label">Percentage:</span>
                                      <span className="score-value">{quizResults.percentage}%</span>
                                    </div>
                                    <div className="score-item">
                                      <span className="score-label">Passing Score:</span>
                                      <span className="score-value">{quizObject.passingScore}%</span>
                                    </div>
                                  </div>

                                  <button
                                    className="quiz-retry-button"
                                    onClick={() => {
                                      setQuizAnswers({});
                                      setQuizSubmitted(false);
                                      setQuizResults(null);
                                    }}
                                  >
                                    Try Again
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="no-questions-message">This quiz has no questions yet.</p>
                          )}
                        </>
                      );
                    } else {
                      console.log('Quiz not found:', selectedModule.quiz);
                      return <p className="no-questions-message">Quiz information not available.</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className="course-detail-body">
        <div className="course-main-content">
          {/* Tabs Navigation */}
          <div className="course-tabs">
            <button
              className={`tab-button ${activeTab === 'information' ? 'active' : ''}`}
              onClick={() => setActiveTab('information')}
            >
              Information
            </button>
            <button
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content ({course.modules?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({course.enrolledUsers?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'information' && (
              <div className="information-tab">
                <div className="course-description">
                  <p>{course.description}</p>

                  {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                    <div className="learning-outcomes">
                      <h3>Learning Outcomes</h3>
                      <ul>
                        {course.learningOutcomes.map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.requirements && course.requirements.length > 0 && (
                    <div className="requirements">
                      <h3>Requirements</h3>
                      <ul>
                        {course.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="course-details">
                    <p><strong>Level:</strong> {course.level}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p><strong>Target Audience:</strong> {course.targetAudience}</p>
                  </div>
                </div>

                {course.creator && (
                  <div className="instructor-info">
                    <div className="instructor-profile">
                      <div className="instructor-image">
                        <img src="https://i.pravatar.cc/150?img=32" alt={course.creator.name} />
                      </div>
                      <div className="instructor-details">
                        <h4>{course.creator.name}</h4>
                        <p>Course Creator</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQs section - if we have FAQs data */}
                {course.faqs && course.faqs.length > 0 && (
                  <div className="course-faqs">
                    <h3>FAQ's</h3>
                    <div className="faq-list">
                      {course.faqs.map(faq => (
                        <div key={faq.id} className="faq-item">
                          <div
                            className={`faq-question ${expandedFaq === faq.id ? 'active' : ''}`}
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <h4>{faq.question}</h4>
                            <FaChevronDown className={`faq-arrow ${expandedFaq === faq.id ? 'rotate' : ''}`} />
                          </div>
                          {expandedFaq === faq.id && (
                            <div className="faq-answer">
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="content-tab">
                <div className="content-list">
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((module, index) => (
                      <div key={module._id} className="content-item">
                        <div className="content-info">
                          <h3>{index + 1}. {module.title}</h3>
                          <p>{module.description}</p>
                          <span className="content-duration">
                            <FaClock className="icon" /> {module.duration || "Not specified"}
                          </span>
                          {module.content && module.content.length > 0 && (
                            <div className="content-has-items">
                              <span>{module.content.length} content item(s)</span>
                            </div>
                          )}
                          {module.quiz && (
                            <div className="content-has-quiz">
                              <span>Includes quiz</span>
                            </div>
                          )}
                        </div>
                        {module.isLocked ? (
                          <div className="content-locked">
                            <span className="lock-icon">🔒</span>
                          </div>
                        ) : (
                          <button
                            className="preview-button"
                            onClick={() => handlePreviewClick(module)}
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-content-message">
                      <p>No modules available for this course yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="comments-section">
                  <h3>Comments</h3>
                  <div className="comment-input">
                    <textarea placeholder="Write comment here..."></textarea>
                    <button className="post-comment-button">Post Comments</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Sidebar */}
        <div className="course-sidebar">
          <div className="course-info-card">
            {/* Course Preview */}
            <div className="course-preview">
              <div className="course-preview-placeholder">
                <img
                  src={course.thumbnail ? `http://localhost:5000/${course.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={course.title}
                />
                <button className="play-button">
                  <FaPlay />
                </button>
                <div className="video-duration">{course.duration}</div>
              </div>
            </div>
            <div className="course-price-section">
              <button className="enroll-button">Enroll Now</button>
            </div>
            <div className="course-stats">
              <div className="stat-item">
                <FaBook className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{course.modules?.length || 0}</span>
                  <span className="stat-label">Modules</span>
                </div>
              </div>
              <div className="stat-item">
                <FaUserGraduate className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{course.enrolledUsers?.length || 0}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              <div className="stat-item">
                <FaClock className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{course.duration}</span>
                  <span className="stat-label">Duration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
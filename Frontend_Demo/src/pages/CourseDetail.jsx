import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseDetailThunk, enrollCourseThunk } from '../redux/educator/educatorSlice';

function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { courseDetail, loading, error } = useSelector((state) => state.educator);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Fetching course detail for ID:', id);
      dispatch(getCourseDetailThunk(id))
        .then(response => {
          console.log('Course detail response:', response);
        })
        .catch(error => {
          console.error('Error fetching course detail:', error);
        });
    }
  }, [dispatch, id]);

  const handleEnroll = () => {
    dispatch(enrollCourseThunk(id)).then(() => {
      setEnrollSuccess(true);
      setTimeout(() => setEnrollSuccess(false), 3000);
    });
  };

  // Use the isEnrolled flag directly from the API response if available
  // Otherwise, fall back to checking the enrollment list
  const isEnrolled = courseDetail?.isEnrolled ||
    courseDetail?.enrolledUsers?.some(enrollment => {
      // Handle both string IDs and object references
      const enrollmentUserId = typeof enrollment.user === 'object' ?
        enrollment.user._id : enrollment.user;
      return enrollmentUserId === user?.id || enrollmentUserId === courseDetail?.currentUserId;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading course: {error}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(getCourseDetailThunk(id))}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Course Not Found</h3>
          <p className="mt-1 text-gray-500">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{courseDetail.title}</h1>
              <p className="text-white text-opacity-90 mb-4">
                Created by: {courseDetail.creator?.name || 'IIM Admin'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-500 bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Educational
                </span>
                <span className="bg-blue-500 bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Professional Development
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'content'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'quiz'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Quiz
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'discussion'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Discussion
            </button>
          </nav>
        </div>

        {/* Course Content */}
        <div className="p-8">
          {/* Enrollment Success Message */}
          {enrollSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Successfully enrolled in this course!
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                  <p className="text-gray-700 mb-6">
                    This comprehensive course is designed to provide educators with the knowledge and skills needed to excel in their professional development. Through a series of modules, you'll learn about the latest educational methodologies and best practices.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">What You'll Learn</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                    <li>Understanding the fundamentals of educational psychology</li>
                    <li>Implementing effective teaching strategies in diverse classroom settings</li>
                    <li>Developing assessment methods that accurately measure student progress</li>
                    <li>Creating inclusive learning environments for all students</li>
                    <li>Utilizing technology to enhance the learning experience</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                    <li>Basic understanding of educational principles</li>
                    <li>Willingness to engage in reflective practice</li>
                    <li>Access to a computer with internet connection</li>
                  </ul>
                </div>

                <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">Duration: 4 weeks</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700">Modules: {courseDetail.content?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-700">Quiz: {courseDetail.quizzes[0]?.questions.length || 0} questions</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="text-gray-700">Certificate: Yes, upon completion</span>
                      </div>
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Link
                      to={`/course/${id}/learn`}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

              {courseDetail.content && courseDetail.content.length > 0 ? (
                <div className="space-y-4">
                  {courseDetail.content.map((content, index) => (
                    <div key={content._id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Module {index + 1}: {content.title}</h3>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          {isEnrolled ? 'View' : 'Preview'}
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700">{content.description || 'No description available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No content available yet</h3>
                  <p className="mt-1 text-gray-500">The course content is being prepared and will be available soon.</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Quiz</h2>

              {isEnrolled ? (
                courseDetail.quizzes && courseDetail.quizzes.length > 0 ? (
                  <div className="space-y-6">
                    <p className="text-gray-700 mb-4">
                      Complete the quiz to test your knowledge and earn your certificate. You need to answer all questions correctly to pass.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Quiz Information</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Total Questions: {courseDetail.quizzes.length}</li>
                              <li>Passing Score: 100%</li>
                              <li>Time Limit: None</li>
                              <li>Attempts: Unlimited</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/course/${id}/quiz`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No quiz available yet</h3>
                    <p className="mt-1 text-gray-500">The course quiz is being prepared and will be available soon.</p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Enroll to access the quiz</h3>
                  <p className="mt-1 text-gray-500">You need to enroll in this course to access the quiz and earn your certificate.</p>
                  <button
                    onClick={handleEnroll}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Enroll Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Discussion</h2>

              {isEnrolled ? (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4">
                      <textarea
                        rows="3"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ask a question or share your thoughts..."
                      ></textarea>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No discussions yet</h3>
                    <p className="mt-1 text-gray-500">Be the first to start a discussion about this course.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Enroll to join the discussion</h3>
                  <p className="mt-1 text-gray-500">You need to enroll in this course to participate in discussions.</p>
                  <button
                    onClick={handleEnroll}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Enroll Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;

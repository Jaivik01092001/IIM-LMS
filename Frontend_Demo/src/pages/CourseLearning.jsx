import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseDetailThunk, updateProgressThunk, generateCertificateThunk } from '../redux/educator/educatorSlice';
import MediaViewer from '../components/MediaViewer';
import { useTranslation } from 'react-i18next';
import { showSuccessToast } from '../utils/toast';

function CourseLearning() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { courseDetail, loading } = useSelector((state) => state.educator);
  const [activeModule, setActiveModule] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const { t } = useTranslation();

  const handleGenerateCertificate = () => {
    dispatch(generateCertificateThunk(id));
  };

  const setActiveModuleAndTrackProgress = (index) => {
    setActiveModule(index);

    // Calculate progress based on viewed modules
    if (courseDetail && courseDetail._id) {
      const totalModules = modules ? modules.length : 0;
      if (totalModules > 0) {
        // Calculate progress dynamically based on the number of modules
        // Each module represents an equal percentage of the course
        const modulePercentage = 100 / totalModules;

        // Calculate progress based on the current module index (0-indexed)
        // We add 1 to count the current module as viewed
        const modulesViewed = index + 1;

        // Calculate the progress percentage (rounded to nearest integer)
        const progress = Math.round(modulesViewed * modulePercentage);

        // Get current progress from state
        const currentProgress = courseDetail.enrolledUsers && courseDetail.enrolledUsers.length > 0
          ? courseDetail.enrolledUsers[0].progress || 0
          : 0;

        // Only update if progress has increased
        if (progress > currentProgress) {
          console.log(`Updating progress: ${progress}% (Module ${index + 1}/${totalModules})`);

          // Update progress in the backend
          dispatch(updateProgressThunk({ courseId: courseDetail._id, progress }));

          // If this is the last module, show a completion message
          if (index === totalModules - 1) {
            // Show a toast notification that the course is completed
            showSuccessToast('Congratulations! You have completed this course. You can now take the quiz or get your certificate.');
          }
        }
      }
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getCourseDetailThunk(id));
    }
  }, [dispatch, id]);

  if (loading || !courseDetail) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use modules if available, otherwise fall back to content
  const modules = courseDetail.hasModules && courseDetail.modules && courseDetail.modules.length > 0
    ? courseDetail.modules
    : courseDetail.content && courseDetail.content.length > 0
      ? courseDetail.content
      : [
        {
          _id: 'module1',
          title: 'Introduction to the Course',
          description: 'An overview of what you will learn in this course.',
          content: `
            <h2>Welcome to the Course!</h2>
            <p>This module provides an introduction to the course content and objectives. By the end of this course, you will have a comprehensive understanding of the subject matter and be able to apply your knowledge in practical situations.</p>
            <h3>Learning Objectives</h3>
            <ul>
              <li>Understand the core concepts of the subject</li>
              <li>Develop practical skills for application</li>
              <li>Learn to analyze and solve related problems</li>
              <li>Build a foundation for advanced learning</li>
            </ul>
            <p>Let's begin our learning journey together!</p>
          `
        },
        {
          _id: 'module2',
          title: 'Core Concepts and Principles',
          description: 'Exploring the fundamental concepts that form the foundation of this subject.',
          content: `
            <h2>Core Concepts and Principles</h2>
            <p>In this module, we'll explore the fundamental concepts and principles that form the foundation of our subject. Understanding these core ideas is essential for mastering more advanced topics later in the course.</p>
            <h3>Key Concepts</h3>
            <p>The following concepts are central to our understanding:</p>
            <ol>
              <li>
                <strong>Concept 1:</strong> Description of the first key concept and its importance.
              </li>
              <li>
                <strong>Concept 2:</strong> Explanation of the second key concept and how it relates to the first.
              </li>
              <li>
                <strong>Concept 3:</strong> Details about the third key concept and its practical applications.
              </li>
            </ol>
            <p>Take your time to thoroughly understand these concepts before moving forward.</p>
          `
        },
        {
          _id: 'module3',
          title: 'Practical Applications',
          description: 'Applying what you ve learned to real-world scenarios.',
          content: `
            <h2>Practical Applications</h2>
            <p>Now that we've covered the core concepts, let's explore how to apply them in real-world scenarios. This module focuses on practical applications and case studies.</p>
            <h3>Case Study 1: Educational Setting</h3>
            <p>In this case study, we'll examine how our concepts apply in an educational environment:</p>
            <ul>
              <li>Classroom implementation strategies</li>
              <li>Addressing diverse learning needs</li>
              <li>Assessment and feedback methods</li>
            </ul>
            <h3>Case Study 2: Professional Development</h3>
            <p>This case study explores applications in professional development contexts:</p>
            <ul>
              <li>Training program design</li>
              <li>Mentoring and coaching approaches</li>
              <li>Measuring effectiveness and outcomes</li>
            </ul>
            <p>By working through these case studies, you'll develop a deeper understanding of how to apply theoretical knowledge in practical situations.</p>
          `
        },
        {
          _id: 'module4',
          title: 'Advanced Topics and Future Directions',
          description: 'Exploring cutting-edge developments and future trends in the field.',
          content: `
            <h2>Advanced Topics and Future Directions</h2>
            <p>In this final module, we'll explore advanced topics and emerging trends in the field. Understanding these developments will help you stay current and anticipate future changes.</p>
            <h3>Current Research</h3>
            <p>Recent research has identified several promising areas for development:</p>
            <ul>
              <li>Integration of technology in educational practices</li>
              <li>Neuroscience-informed teaching methods</li>
              <li>Culturally responsive pedagogical approaches</li>
            </ul>
            <h3>Future Directions</h3>
            <p>Based on current trends, we can anticipate these future developments:</p>
            <ol>
              <li>Increased personalization through AI and adaptive learning</li>
              <li>Greater emphasis on social-emotional learning components</li>
              <li>Evolution of assessment practices beyond traditional testing</li>
            </ol>
            <p>As you complete this course, consider how you might incorporate these advanced concepts into your own practice.</p>
          `
        }
      ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 truncate">{courseDetail.title}</h2>
          {courseDetail.enrolledUsers && courseDetail.enrolledUsers.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mt-1">
                Your progress: {courseDetail.enrolledUsers[0].progress || 0}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${courseDetail.enrolledUsers[0].progress || 0}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mt-1">Your progress: 0%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Course Content</h3>
            <div className="space-y-1">
              {modules.map((module, index) => (
                <button
                  key={module._id || index}
                  onClick={() => setActiveModuleAndTrackProgress(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeModule === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-2 ${activeModule === index ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{module.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to={`/course/${id}/quiz`}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('Take Quiz')}
          </Link>

          {courseDetail.enrolledUsers &&
           courseDetail.enrolledUsers.length > 0 &&
           courseDetail.enrolledUsers[0].status === 'completed' && (
            <button
              onClick={handleGenerateCertificate}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('Get Certificate')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none focus:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <Link
                to={`/course/${id}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <span className="text-gray-700 font-medium">Module {activeModule + 1}: {modules[activeModule]?.title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (activeModule > 0) {
                    const prevModuleIndex = Math.max(0, activeModule - 1);
                    setActiveModuleAndTrackProgress(prevModuleIndex);
                  }
                }}
                disabled={activeModule === 0}
                className={`p-2 rounded-full ${activeModule === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (activeModule < modules.length - 1) {
                    const nextModuleIndex = Math.min(modules.length - 1, activeModule + 1);
                    setActiveModuleAndTrackProgress(nextModuleIndex);
                  }
                }}
                disabled={activeModule === modules.length - 1}
                className={`p-2 rounded-full ${activeModule === modules.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-3xl mx-auto">
            {/* Handle different content types */}
            {modules[activeModule]?.content ? (
              <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: modules[activeModule]?.content }}></div>
            ) : modules[activeModule]?.fileUrl ? (
              <div className="mb-8">
                {/* Display media content */}
                <h2 className="text-2xl font-bold mb-4">{modules[activeModule]?.title}</h2>
                <p className="text-gray-700 mb-6">{modules[activeModule]?.description}</p>

                {/* Media preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                  {modules[activeModule]?.type === 'video' || modules[activeModule]?.mediaType === 'video' ||
                    (modules[activeModule]?.fileUrl && /\.(mp4|mov|avi|mkv)$/i.test(modules[activeModule]?.fileUrl)) ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <div className="flex items-center justify-center h-full">
                        <button
                          onClick={() => {
                            setSelectedMedia(modules[activeModule]);
                            setShowMediaViewer(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : modules[activeModule]?.type === 'image' || modules[activeModule]?.mediaType === 'image' ||
                    (modules[activeModule]?.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(modules[activeModule]?.fileUrl)) ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={modules[activeModule]?.fileUrl}
                        alt={modules[activeModule]?.title}
                        className="w-full h-auto cursor-pointer transition-transform duration-300 hover:scale-105"
                        onClick={() => {
                          setSelectedMedia(modules[activeModule]);
                          setShowMediaViewer(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-opacity duration-300">
                        <div className="transform scale-0 hover:scale-100 transition-transform duration-300">
                          <button className="bg-white bg-opacity-75 rounded-full p-3 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">This content is a document or other file type.</p>
                      <a
                        href={modules[activeModule]?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No content available</h3>
                <p className="text-gray-600">This module doesn't have any content yet.</p>
              </div>
            )}

            <div className="mt-12 flex justify-between">
              <button
                onClick={() => {
                  if (activeModule > 0) {
                    const prevModuleIndex = Math.max(0, activeModule - 1);
                    setActiveModuleAndTrackProgress(prevModuleIndex);
                  }
                }}
                disabled={activeModule === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${activeModule === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Module
              </button>

              {activeModule === modules.length - 1 ? (
                <Link
                  to={`/course/${id}/quiz`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Take Quiz
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    const nextModuleIndex = Math.min(modules.length - 1, activeModule + 1);
                    setActiveModuleAndTrackProgress(nextModuleIndex);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Next Module
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {showMediaViewer && selectedMedia && (
        <MediaViewer
          content={selectedMedia}
          onClose={() => {
            setShowMediaViewer(false);
            setSelectedMedia(null);
          }}
        />
      )}
    </div>
  );
}

export default CourseLearning;

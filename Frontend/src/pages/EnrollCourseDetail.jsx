import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import "../assets/styles/EnrollCourseDetail.css";
import {
  FaPlayCircle,
  FaDownload,
  FaPaperclip,
  FaChevronUp,
  FaChevronDown,
  FaUserCircle,
  FaCheck,
  FaTrophy,
  FaFilePdf,
  FaLock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getCourse } from '../redux/admin/adminApi';
import {
  getModuleProgressThunk,
  updateModuleProgressThunk,
  generateCertificateThunk,
  getMyCertificatesThunk,
  updateProgressThunk
} from '../redux/educator/educatorSlice';

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const EnrollCourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { moduleProgress, certificates, loading: certificateLoading } = useSelector((state) => state.educator);

  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState({});
  const [sessionCompleted, setSessionCompleted] = useState({});
  const [moduleCompleted, setModuleCompleted] = useState({});
  const [userProgress, setUserProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [course, setCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  // Get the current user ID from the Redux store
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?.id;

  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Check if certificate exists for this course AND belongs to the current user
  // This is used to determine whether to show the Generate Certificate button
  const certificateExists = certificates?.some(cert =>
    (cert.course === id || (cert.course && cert.course._id === id)) &&
    (cert.user === currentUserId || (cert.user && cert.user._id === currentUserId))
  );

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourse(id);
        setCourse(res);

        // Only first module should be expanded by default
        // Use module IDs as keys instead of titles for consistency
        const defaultExpanded = {};
        res.modules?.forEach((mod, index) => {
          defaultExpanded[mod._id] = index === 0;
        });
        setExpandedSections(defaultExpanded);

        // Initialize session completion status - ALL sessions are NOT completed by default
        const completed = {};
        res.modules?.forEach((mod) => {
          mod.content?.forEach((c) => {
            completed[c._id] = false;
          });
        });
        setSessionCompleted(completed);

        // Initialize module completion status - ONLY first module is unlocked by default
        const moduleStatus = {};
        if (res.modules && res.modules.length > 0) {
          // First module unlocked, rest locked
          res.modules.forEach((mod, index) => {
            moduleStatus[mod._id] = index === 0;
          });
        }
        setModuleCompleted(moduleStatus);

        // Set first content as selected if available
        const firstModule = res.modules?.find((mod) => mod.content?.length);
        if (firstModule) setSelectedContent(firstModule.content[0]);

        // Fetch module progress from the backend
        dispatch(getModuleProgressThunk(id));

        // Fetch certificates to have them ready if needed
        //  dispatch(getMyCertificatesThunk());
      } catch (err) {
        toast.error('Failed to load course');
      }
    };
    fetchCourse();
  }, [id, dispatch]);

  // Update local state when module progress is loaded from the backend
  useEffect(() => {
    if (moduleProgress && course) {
      // Start with all sessions NOT completed
      const newSessionCompleted = {};
      course.modules.forEach(mod => {
        mod.content?.forEach(c => {
          newSessionCompleted[c._id] = false;
        });
      });

      // Update module completion status - create a fresh object
      const newModuleState = {};

      // First, ensure the first module is always unlocked
      if (course.modules && course.modules.length > 0) {
        newModuleState[course.modules[0]._id] = true;
      }

      // Then apply the progress from the backend
      moduleProgress.moduleProgress.forEach(mp => {
        // Get the module ID - handle both object and string formats
        const moduleId = mp.module._id || mp.module;

        // Update module completion status
        newModuleState[moduleId] = mp.isCompleted;

        // If a module is completed, also unlock the next module
        if (mp.isCompleted) {
          const moduleIndex = course.modules.findIndex(m => m._id === moduleId);
          if (moduleIndex !== -1 && moduleIndex < course.modules.length - 1) {
            const nextModuleId = course.modules[moduleIndex + 1]._id;
            newModuleState[nextModuleId] = true;
          }
        }

        // Update ONLY explicitly completed content items
        if (mp.completedContent && mp.completedContent.length > 0) {
          mp.completedContent.forEach(contentId => {
            if (contentId) {
              newSessionCompleted[contentId] = true;
            }
          });
        }
      });

      // Update the module completion state
      setModuleCompleted(newModuleState);

      // Update session completion state
      setSessionCompleted(newSessionCompleted);

      // Calculate overall progress
      const completedCount = Object.values(newSessionCompleted).filter(Boolean).length;
      const totalSessions = Object.keys(newSessionCompleted).length;

      // Check if the course has enrolled users and if the current user is one of them
      if (course.enrolledUsers && course.enrolledUsers.length > 0 && currentUserId) {
        // Find the current user's enrollment
        const userEnrollment = course.enrolledUsers.find(enrollment =>
          enrollment.user === currentUserId ||
          (enrollment.user && enrollment.user._id === currentUserId)
        );

        // If user enrollment exists, use the progress from the backend
        if (userEnrollment) {
          setUserProgress(userEnrollment.progress || 0);
        } else if (totalSessions > 0) {
          // Fallback to calculated progress if no enrollment found
          const newProgress = Math.round((completedCount / totalSessions) * 100);
          setUserProgress(newProgress);
        }
      } else if (totalSessions > 0) {
        // Fallback to calculated progress if no enrollment data
        const newProgress = Math.round((completedCount / totalSessions) * 100);
        setUserProgress(newProgress);
      }

      // If there's a last accessed module, set it as active
      if (moduleProgress.lastAccessedModule) {
        // Find the module index
        const lastModuleId = moduleProgress.lastAccessedModule;
        const moduleIndex = course.modules.findIndex(
          m => m._id === lastModuleId
        );

        if (moduleIndex !== -1) {
          // Reset all expanded sections
          const newExpandedSections = {};

          // Only expand the last accessed module
          course.modules.forEach((mod, idx) => {
            // Always use module ID as the key, not the title
            newExpandedSections[mod._id] = idx === moduleIndex;
          });

          // Update expanded sections state
          setExpandedSections(newExpandedSections);

          // If this module has content, select the first content item
          if (course.modules[moduleIndex].content?.length > 0) {
            setSelectedContent(course.modules[moduleIndex].content[0]);
          }
        }
      }
    }
  }, [moduleProgress, course, currentUserId]);

  // Monitor user progress and automatically generate certificate when course is completed
  useEffect(() => {
    // Check if course is 100% completed
    if (userProgress === 100 && course) {
      // Check if certificate already exists for this user and course
      if (certificateExists) {
        //setActiveTab('certificates');
        return;
      }

      // First, ensure the course status is set to 'completed' in the backend
      dispatch(updateProgressThunk({ courseId: id, progress: 100 }))
        .unwrap()
        .then(() => {
          // After the course status is updated to 'completed', generate the certificate
          dispatch(generateCertificateThunk(id)).unwrap().then(() => {
            // Switch to certificates tab
            setActiveTab('certificates');
            // Fetch certificates to display
            dispatch(getMyCertificatesThunk());
            //toast.success('Course completed! Your certificate has been generated.');
          })
            .catch((error) => {
              console.error('Failed to generate certificate:', error);
              if (error.message === "Certificate already exists") {
                // If certificate already exists, just switch to the certificates tab
                setActiveTab('certificates');
                dispatch(getMyCertificatesThunk());
                toast.info('Certificate already exists.');
              } else {
                toast.error('Failed to generate certificate. Please try again.');
              }
            });
        })
        .catch((error) => {
          console.error('Failed to update course status:', error);
          toast.error('Failed to update course status. Please try again.');
        });
    }
  }, [userProgress, course, id, dispatch, currentUserId, certificateExists]);

  const toggleSection = (moduleId) => {
    setExpandedSections({
      ...expandedSections,
      [moduleId]: !expandedSections[moduleId],
    });
  };

  const handleToggleSession = async (sessionId, moduleId, moduleIndex) => {
    try {
      setIsUpdatingProgress(true);

      // Calculate new session state
      const newSessionState = {
        ...sessionCompleted,
        [sessionId]: !sessionCompleted[sessionId],
      };

      // Calculate progress for all sessions
      const completedCount = Object.values(newSessionState).filter(Boolean).length;
      const totalSessions = Object.keys(newSessionState).length;
      const newProgress = Math.round((completedCount / totalSessions) * 100);

      // Check if all sessions in this module are completed
      const moduleSessionsCompleted =
        course.modules[moduleIndex].content?.every(content =>
          newSessionState[content._id] === true
        ) || false;

      // Update module completion status
      const newModuleState = {
        ...moduleCompleted,
        [moduleId]: moduleSessionsCompleted
      };

      // If this module is completed, unlock the next module if it exists
      if (moduleSessionsCompleted && moduleIndex < course.modules.length - 1) {
        const nextModuleId = course.modules[moduleIndex + 1]._id;
        newModuleState[nextModuleId] = true;
      }

      // Prepare data for backend update
      const completedModules = Object.keys(newModuleState).filter(key => newModuleState[key]);

      // Create a map of completed content by module
      const completedContent = {};
      course.modules.forEach(module => {
        const moduleId = module._id;
        completedContent[moduleId] = module.content
          ?.filter(content => newSessionState[content._id])
          .map(content => content._id) || [];
      });

      // Update backend first
      const result = await dispatch(updateModuleProgressThunk({
        courseId: id,
        progressData: {
          moduleId,
          contentId: sessionId,
          isCompleted: newSessionState[sessionId],
          completedModules,
          completedContent
        }
      })).unwrap();

      // Only update local state after successful backend update
      setSessionCompleted(newSessionState);
      setModuleCompleted(newModuleState);
      setUserProgress(newProgress);

      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress. Please try again.');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSaveNote = () => {
    toast.success('Note saved');
  };

  const handleQuizAnswerChange = (questionId, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    toast.success('Quiz submitted successfully!');
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  // Check if a module is locked (all previous modules must be completed)
  const isModuleLocked = (moduleIndex) => {
    if (!course) return true; // If no course data, consider locked

    // First module is always unlocked
    if (moduleIndex === 0) return false;

    // For all other modules, check moduleCompleted state directly
    const moduleId = course.modules[moduleIndex]._id;
    return !moduleCompleted[moduleId]; // If not explicitly marked as completed, it's locked
  };

  // Handle module click - only allow selection if module is not locked
  const handleModuleClick = (module, moduleIndex) => {
    if (isModuleLocked(moduleIndex)) {
      toast.warning('Complete previous modules first to unlock this module');
      return; // Stop execution here for locked modules
    }

    // If module is not locked, expand it
    toggleSection(module._id);

    // Update last accessed module in the backend
    dispatch(updateModuleProgressThunk({
      courseId: id,
      progressData: {
        lastAccessedModule: module._id
      }
    }));
  };

  // Handle content click - only allow selection if module is not locked
  const handleContentClick = (content, moduleIndex) => {
    // If module is locked, show warning and don't allow content selection
    if (isModuleLocked(moduleIndex)) {
      toast.warning('Complete previous modules first to unlock this content');
      return;
    }

    // If module is not locked, select the content
    setSelectedContent(content);

    // Update last accessed module in the backend
    // dispatch(updateModuleProgressThunk({
    //   courseId: id,
    //   progressData: {
    //     lastAccessedModule: course.modules[moduleIndex]._id
    //   }
    // }));
  };



  // Use certificateExists in the handleGenerateCertificate function to prevent duplicate certificates

  // Handle generate certificate
  const handleGenerateCertificate = () => {
    // Check if certificate already exists for this user and course
    if (certificateExists) {
      toast.info('You already have a certificate for this course.');
      setActiveTab('certificates');
      return;
    }

    // First update course status to completed
    dispatch(updateProgressThunk({ courseId: id, progress: 100 }))
      .unwrap()
      .then(() => {
        // Then generate certificate
        dispatch(generateCertificateThunk(id))
          .unwrap()
          .then(() => {
            // Switch to certificates tab
            setActiveTab('certificates');
            // Refresh certificates list
            dispatch(getMyCertificatesThunk());
            toast.success('Certificate generated successfully!');
          })
          .catch(err => {
            console.error('Certificate generation error:', err);
            if (err.message === "Certificate already exists") {
              // If certificate already exists, just refresh the list
              dispatch(getMyCertificatesThunk());
              setActiveTab('certificates');
              toast.info('Certificate already exists. Refreshing your certificates.');
            } else {
              toast.error('Failed to generate certificate. Please try again.');
            }
          });
      })
      .catch(err => {
        console.error('Course status update error:', err);
        toast.error('Failed to update course status. Please try again.');
      });
  };

  return !course ? (
    <p>Loading...</p>
  ) : (
    <div className="enroll-course-detail">
      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${userProgress}%` }}></div>
          <span className="progress-text">{userProgress}%</span>
        </div>
        <div className="user-profile">
          <FaUserCircle size={40} />
          <span>{course.creator?.name}</span>
        </div>
      </div>

      <div className="course-content-container">
        <div className="video-container">
          <div className="video-wrapper">
            {selectedContent ? (
              selectedContent.mimeType?.startsWith('video/') ? (
                <video
                  className="video-player"
                  controls
                  width="100%"
                  src={`${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                />
              ) : selectedContent.mimeType === 'application/pdf' ? (
                <iframe
                  title="PDF Preview"
                  src={`${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                  width="100%"
                  height="500px"
                  style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                />
              ) : selectedContent.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                <iframe
                  title="DOCX Preview"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    `${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`
                  )}`}
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                />
              ) : selectedContent.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? (
                <iframe
                  title="PPTX Preview"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    `${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`
                  )}`}
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                />
              ) : selectedContent.mimeType?.startsWith('image/') ? (
                <img
                  src={`${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              ) : selectedContent.mimeType === 'text/html' ? (
                <div
                  className="html-content-preview"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-white)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-gray)',
                    maxHeight: '500px',
                    overflowY: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedContent.textContent }}
                />
              ) : (
                <div className="video-placeholder">
                  <p>No preview available for this file type.</p>
                </div>
              )
            ) : (
              <div className="video-placeholder">
                <FaPlayCircle size={60} />
              </div>
            )}
          </div>

          {selectedContent && selectedContent.fileUrl && (
            <div className="download-section">
              <p>Download the file</p>
              <button className="download-button">
                <FaDownload /> Download
              </button>
            </div>
          )}

          <div className="personal-note-section">
            <h3>Personal Course Note</h3>
            <p className="note-description">This note will be displayed for you privately</p>
            <textarea
              placeholder="Write comment here..."
              className="note-textarea"
            ></textarea>
            <div className="attachment-section">
              <h4>Attachment</h4>
              <div className="attachment-input">
                <button className="attachment-button">
                  <FaPaperclip />
                </button>
              </div>
            </div>
            <button className="save-note-button" onClick={handleSaveNote}>
              Save Note
            </button>
          </div>
        </div>

        <div className="course-sidebar">
          <div className="tab-container">
            {['content', 'quizzes', 'certificates'].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <div className="course-sections">
              {course.modules?.map((module, moduleIndex) => (
                <div className="course-section" key={module._id}>
                  <div
                    className={`section-header ${isModuleLocked(moduleIndex) ? 'locked-module' : ''}`}
                    onClick={() => handleModuleClick(module, moduleIndex)}
                  >
                    <div className="section-number">{moduleIndex + 1}</div>
                    <div className="section-title">
                      <h3>{module.title}</h3>
                      <p>{module.content?.length || 0} Topic</p>
                    </div>
                    <div className="section-toggle">
                      {isModuleLocked(moduleIndex) ? (
                        <FaLock />
                      ) : (
                        expandedSections[module._id] ? <FaChevronUp /> : <FaChevronDown />
                      )}
                    </div>
                  </div>

                  {/* Only show content if module is not locked AND it's expanded */}
                  {!isModuleLocked(moduleIndex) && expandedSections[module._id] && (
                    <div className="section-content">
                      {module.content?.length ? module.content.map((content) => (
                        <div
                          className="topic-item"
                          key={content._id}
                          onClick={() => handleContentClick(content, moduleIndex)}
                        >
                          <div className="topic-icon">
                            {content.mimeType?.startsWith('video/') ? (
                              <FaPlayCircle />
                            ) : content.mimeType === 'text/html' ? (
                              <FaFilePdf />
                            ) : (
                              <FaFilePdf />
                            )}
                          </div>
                          <div className="topic-details">
                            <h4>{content.title}</h4>
                            <p>
                              {content.mimeType?.startsWith('video/') ? 'Video' :
                                content.mimeType === 'text/html' ? 'Text' :
                                  content.mimeType?.split('/')[1]?.toUpperCase() || 'Document'}
                              {content.size ? ` | ${(content.size / 1000000).toFixed(2)} MB` : ''}
                            </p>
                            {content.description && (
                              <p className="topic-description">
                                {content.description.length > 100 ? `${content.description.substring(0, 100)}...` : content.description}
                              </p>
                            )}
                            <div className="session-toggle">
                              <p>I passed this session</p>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={!!sessionCompleted[content._id]}
                                  onChange={() => handleToggleSession(content._id, module._id, moduleIndex)}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <p className="no-content-message">No content available for this module.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="quizzes-tab">
              {course.quizzes?.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-header">
                    <h3>{quiz.title}</h3>
                    <p className="quiz-description">{quiz.description}</p>
                  </div>
                  {quiz.questions?.length > 0 ? (
                    <div className="quiz-content">
                      {!quizSubmitted ? (
                        quiz.questions.map((question, index) => (
                          <div key={question._id} className="quiz-question">
                            <h4>Q{index + 1}: {question.question}</h4>
                            {question.options.map((option, i) => (
                              <label key={i}>
                                <input
                                  type="radio"
                                  name={question._id}
                                  value={option}
                                  checked={quizAnswers[question._id] === option}
                                  onChange={() => handleQuizAnswerChange(question._id, option)}
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="quiz-results">
                          <div className="score-message">
                            <FaCheck className="success-icon" />
                            <span>You passed!</span>
                          </div>
                          <button onClick={resetQuiz}>Retake Quiz</button>
                        </div>
                      )}
                      {!quizSubmitted && (
                        <button className="quiz-submit-button" onClick={handleQuizSubmit}>
                          Submit Quiz
                        </button>
                      )}
                    </div>
                  ) : (
                    <p>No questions available</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="certificates-tab">
              {certificateLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : certificates?.length > 0 ? (
                <div className="certificates-list">
                  {certificates
                    .filter(cert => {
                      // Check both formats: when course is an ID string or when it's an object
                      const isCourseMatch = cert.course === id ||
                        (cert.course && cert.course._id === id) ||
                        (cert.course && typeof cert.course === 'object' && cert.course._id === id);

                      // Check if certificate belongs to current user
                      const isUserMatch = cert.user === currentUserId ||
                        (cert.user && cert.user._id === currentUserId);

                      return isCourseMatch && isUserMatch;
                    })
                    .map((certificate) => (
                      <div key={certificate._id} className="certificate-card">
                        <div className="certificate-header">
                          <h3>{certificate.metadata?.courseName || (certificate.course && typeof certificate.course === 'object' ? certificate.course.title : 'Certificate')}</h3>
                          <p>Issued on: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="certificate-actions">
                          <a
                            href={certificate.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-certificate-btn"
                          >
                            View Certificate
                          </a>
                          <a
                            href={certificate.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="verify-certificate-btn"
                          >
                            Verify Certificate
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="no-certificates">
                  <div className="certificate-icon">
                    <FaTrophy size={60} />
                  </div>
                  <h3>No Certificates Yet</h3>
                  <p>
                    Complete this course to earn your certificate.
                    {userProgress === 100 && (
                      <button
                        onClick={handleGenerateCertificate}
                        className="generate-certificate-btn"
                      >
                        Generate Certificate
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollCourseDetail;
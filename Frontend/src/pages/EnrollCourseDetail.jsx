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
  FaTrophy,
  FaFilePdf,
  FaLock,
  FaYoutube
} from 'react-icons/fa';
import ProgressBar from '../components/common/ProgressBar';
import { toast } from 'react-toastify';
import { getCourse } from '../redux/admin/adminApi';
import {
  getModuleProgressThunk,
  updateModuleProgressThunk,
  generateCertificateThunk,
  getMyCertificatesThunk,
  updateProgressThunk,
  submitQuizThunk,
  getQuizAttemptsThunk
} from '../redux/educator/educatorSlice';
import QuizSubmission from '../components/QuizSubmission';

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const EnrollCourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { moduleProgress, certificates, loading: certificateLoading } = useSelector((state) => state.educator);

  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [sessionCompleted, setSessionCompleted] = useState({});
  const [moduleCompleted, setModuleCompleted] = useState({});
  const [userProgress, setUserProgress] = useState(0);
  const [course, setCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  // Get the current user ID from the Redux store
  const { user } = useSelector((state) => state.auth);
  const { quizAttempts: storeQuizAttempts } = useSelector((state) => state.educator);
  const currentUserId = user?.id;

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

        // Initialize quiz accordion state - first quiz expanded by default
        const defaultQuizExpanded = {};
        if (res.quizzes && res.quizzes.length > 0) {
          defaultQuizExpanded[res.quizzes[0]._id] = true;
        }
        setExpandedQuizzes(defaultQuizExpanded);

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
      } catch (error) {
        toast.error('Failed to load course');
        console.error('Error loading course:', error);
      }
    };
    fetchCourse();
  }, [id, dispatch]);

  // Update local state when module progress is loaded from the backend
  useEffect(() => {
    if (moduleProgress && course) {
      console.log('Initializing progress from backend data:', moduleProgress);

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

      // Make sure all optional modules are always unlocked
      course.modules.forEach((module) => {
        if (module.isCompulsory === false) {
          newModuleState[module._id] = true;
        }
      });

      // Then apply the progress from the backend
      moduleProgress.moduleProgress.forEach(mp => {
        // Get the module ID - handle both object and string formats
        const moduleId = typeof mp.module === 'object' ? mp.module._id : mp.module.toString();

        // Update module completion status
        newModuleState[moduleId] = mp.isCompleted;

        // Update ONLY explicitly completed content items
        if (mp.completedContent && mp.completedContent.length > 0) {
          mp.completedContent.forEach(contentId => {
            if (contentId) {
              // Handle both object and string formats for content ID
              const contentIdStr = typeof contentId === 'object' ? contentId._id : contentId.toString();
              newSessionCompleted[contentIdStr] = true;
            }
          });
        }
      });

      // IMPORTANT FIX: Ensure module unlocking is consistent
      // First module is always unlocked
      if (course.modules && course.modules.length > 0) {
        newModuleState[course.modules[0]._id] = true;
      }

      // For each module after the first one, check if all previous compulsory modules are fully completed
      for (let i = 1; i < course.modules.length; i++) {
        const currentModule = course.modules[i];

        // If the module is optional (not compulsory), it should always be unlocked
        if (currentModule.isCompulsory === false) {
          newModuleState[currentModule._id] = true;
          continue; // Skip to the next module
        }

        // For compulsory modules, check if all previous compulsory modules are completed
        const allPreviousCompulsoryModulesCompleted = course.modules
          .slice(0, i) // Get all modules before the current one
          .filter(prevModule => prevModule.isCompulsory !== false) // Only consider compulsory modules
          .every((prevModule) => {
            // For each previous compulsory module, check if it's marked as completed
            // AND check if all its content is completed
            const isPrevModuleCompleted = newModuleState[prevModule._id];
            const isAllPrevModuleContentCompleted = prevModule.content?.every(
              content => newSessionCompleted[content._id] === true
            ) || false;

            return isPrevModuleCompleted && isAllPrevModuleContentCompleted;
          });

        // Only unlock this compulsory module if all previous compulsory modules are fully completed
        if (allPreviousCompulsoryModulesCompleted) {
          newModuleState[currentModule._id] = true;
        } else {
          newModuleState[currentModule._id] = false;
        }
      }

      // Update the module completion state
      setModuleCompleted(newModuleState);

      // Update session completion state
      setSessionCompleted(newSessionCompleted);

      // Calculate overall progress based on completed content in compulsory modules only
      let completedCount = 0;
      let totalSessions = 0;

      // Only count content from compulsory modules
      course.modules.forEach(module => {
        if (module.isCompulsory !== false) { // If module is compulsory
          module.content?.forEach(content => {
            totalSessions++; // Count this content item
            if (newSessionCompleted[content._id]) {
              completedCount++; // Count as completed if marked as such
            }
          });

          // If module has a quiz, count it as a session
          if (module.quiz) {
            totalSessions++;
            // Check if quiz is completed by looking at the module completion status
            // A module is only marked as completed if its quiz is also completed
            if (newModuleState && newModuleState[module._id]) {
              completedCount++;
            }
          }
        }
      });

      const calculatedProgress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

      // Check if the course has enrolled users and if the current user is one of them
      if (course.enrolledUsers && course.enrolledUsers.length > 0 && currentUserId) {
        // Find the current user's enrollment
        const userEnrollment = course.enrolledUsers.find(enrollment =>
          enrollment.user === currentUserId ||
          (enrollment.user && enrollment.user._id === currentUserId)
        );

        // If user enrollment exists, use the progress from the backend
        if (userEnrollment && typeof userEnrollment.progress === 'number') {
          console.log('Setting progress from enrollment:', userEnrollment.progress);
          setUserProgress(userEnrollment.progress);
        } else {
          // Fallback to calculated progress if no enrollment found or progress is not a number
          console.log('Setting calculated progress:', calculatedProgress);
          setUserProgress(calculatedProgress);
        }
      } else {
        // Fallback to calculated progress if no enrollment data
        console.log('No enrollment found, setting calculated progress:', calculatedProgress);
        setUserProgress(calculatedProgress);
      }

      // If there's a last accessed module, set it as active
      if (moduleProgress.lastAccessedModule) {
        // Find the module index
        const lastModuleId = typeof moduleProgress.lastAccessedModule === 'object'
          ? moduleProgress.lastAccessedModule._id
          : moduleProgress.lastAccessedModule.toString();

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
          dispatch(generateCertificateThunk(id))
            .unwrap()
            .then(() => {
              // Switch to certificates tab
              setActiveTab('certificates');
              // Refresh certificates list
              dispatch(getMyCertificatesThunk());
              toast.success('Certificate generated successfully!');
            })
            .catch(error => {
              console.error('Certificate generation error:', error);
              if (error.message === "Certificate already exists") {
                // If certificate already exists, just refresh the list
                dispatch(getMyCertificatesThunk());
                setActiveTab('certificates');
                toast.info('Certificate already exists. Refreshing your certificates.');
              } else {
                toast.error('Failed to generate certificate. Please try again.');
              }
            });
        })
        .catch(error => {
          console.error('Course status update error:', error);
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
      // Calculate new session state
      const newSessionState = {
        ...sessionCompleted,
        [sessionId]: !sessionCompleted[sessionId],
      };

      // Calculate progress for all sessions in compulsory modules only
      let completedCount = 0;
      let totalSessions = 0;

      // Only count content from compulsory modules
      course.modules.forEach(module => {
        if (module.isCompulsory !== false) { // If module is compulsory
          module.content?.forEach(content => {
            totalSessions++; // Count this content item
            if (newSessionState[content._id]) {
              completedCount++; // Count as completed if marked as such
            }
          });

          // If module has a quiz, count it as a session
          if (module.quiz) {
            totalSessions++;
            // Check if quiz is completed by looking at the module completion status
            // A module is only marked as completed if its quiz is also completed
            if (moduleCompleted[module._id]) {
              completedCount++;
            }
          }
        }
      });

      // Store the calculated progress in a variable but don't set it yet
      // We'll use the value returned from the backend instead
      const calculatedProgress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

      // Check if all sessions in this module are completed
      let moduleSessionsCompleted =
        course.modules[moduleIndex].content?.every(content =>
          newSessionState[content._id] === true
        ) || false;

      // Also check if the module has a quiz and if it's been passed
      if (moduleSessionsCompleted && course.modules[moduleIndex].quiz) {
        const quizId = course.modules[moduleIndex].quiz;
        const quizAttempt = storeQuizAttempts[quizId];
        // If there's no passed quiz attempt, the module is not completed
        if (!quizAttempt || !quizAttempt.passed) {
          moduleSessionsCompleted = false;
        }
      }

      // Create a new module state object starting with the current state
      const newModuleState = { ...moduleCompleted };

      // Update the current module's completion status
      newModuleState[moduleId] = moduleSessionsCompleted;

      // IMPORTANT FIX: Ensure all previous modules remain unlocked
      course.modules.forEach((module, idx) => {
        // If this is a previous module or the current module, ensure it's unlocked
        if (idx <= moduleIndex) {
          newModuleState[module._id] = newModuleState[module._id] || true;
        }
      });

      // Only unlock the next compulsory module if this module is completed AND all previous compulsory modules are completed
      if (moduleSessionsCompleted && moduleIndex < course.modules.length - 1) {
        // Get the next module
        const nextModule = course.modules[moduleIndex + 1];

        // If the next module is optional (not compulsory), it should always be unlocked
        if (nextModule.isCompulsory === false) {
          newModuleState[nextModule._id] = true;
        } else {
          // For compulsory modules, check if all previous compulsory modules are completed
          const allPreviousCompulsoryModulesCompleted = course.modules
            .slice(0, moduleIndex + 1) // Get all modules up to and including the current one
            .filter(prevModule => prevModule.isCompulsory !== false) // Only consider compulsory modules
            .every((prevModule) => {
              // For each previous compulsory module, check if it's marked as completed
              // AND check if all its content is completed
              const isPrevModuleCompleted = newModuleState[prevModule._id];
              const isAllPrevModuleContentCompleted = prevModule.content?.every(
                content => newSessionState[content._id] === true
              ) || false;

              return isPrevModuleCompleted && isAllPrevModuleContentCompleted;
            });

          // Only unlock the next compulsory module if all previous compulsory modules are fully completed
          if (allPreviousCompulsoryModulesCompleted) {
            newModuleState[nextModule._id] = true;
          }
        }
      }

      // Make sure all optional modules are always unlocked
      course.modules.forEach((module) => {
        if (module.isCompulsory === false) {
          newModuleState[module._id] = true;
        }
      });

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

      // Log debug information
      console.log('Updating progress with:', {
        moduleId,
        contentId: sessionId,
        isCompleted: newSessionState[sessionId],
        completedModules,
        completedContent,
        moduleSessionsCompleted
      });

      // Update backend first and capture the response
      const response = await dispatch(updateModuleProgressThunk({
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

      // Use the progress value returned from the backend instead of the locally calculated one
      // This ensures we're always in sync with the server's calculation
      console.log('Progress response from backend:', response);

      // First try to use userProgress which comes directly from the course enrollment
      if (typeof response.userProgress === 'number') {
        console.log('Using userProgress from backend:', response.userProgress);
        setUserProgress(response.userProgress);
      }
      // Then try overallProgress which is calculated from module content
      else if (typeof response.overallProgress === 'number') {
        console.log('Using overallProgress from backend:', response.overallProgress);
        setUserProgress(response.overallProgress);
      }
      // Fallback to calculated progress if backend doesn't return a value
      else {
        console.log('Using locally calculated progress:', calculatedProgress);
        setUserProgress(calculatedProgress);
      }

      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress. Please try again.');
    }
  };

  const handleSaveNote = () => {
    toast.success('Note saved');
  };

  const handleQuizSubmit = async (quizId, answers) => {
    try {
      // Use Redux thunk to submit quiz with courseId and quizId
      const result = await dispatch(submitQuizThunk({
        courseId: id, // The course ID from the URL params
        quizId: quizId,
        answers
      })).unwrap();

      // Toast notifications are handled in the thunk, so we don't need to add them here

      return result;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Error toast is already shown in the thunk
      throw error;
    }
  };

  // Check if a module is locked (all previous compulsory modules must be completed)
  const isModuleLocked = (moduleIndex) => {
    if (!course) return true; // If no course data, consider locked

    // First module is always unlocked
    if (moduleIndex === 0) return false;

    // Get the current module
    const currentModule = course.modules[moduleIndex];

    // If the module is optional (not compulsory), it should never be locked
    if (currentModule.isCompulsory === false) return false;

    // For compulsory modules, check moduleCompleted state directly
    const moduleId = currentModule._id;
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

  // Toggle quiz expansion in accordion
  const toggleQuiz = (quizId) => {
    setExpandedQuizzes(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
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

  // Helper function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return '';

    // Extract video ID from different YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[7].length === 11) ? match[7] : '';
  };

  // Helper function to get YouTube URL from content
  const getYoutubeUrl = (content) => {
    // First try textContent, then fallback to fileUrl for backward compatibility
    return content.textContent || content.fileUrl || '';
  };

  // Handle generate certificate
  const handleGenerateCertificate = () => {
    // Check if certificate already exists for this user and course
    if (certificateExists) {
      toast.info('You already have a certificate for this course.');
      setActiveTab('certificates');
      return;
    }

    // Check if all compulsory modules are completed
    const compulsoryModules = course.modules.filter(module => module.isCompulsory !== false);
    const allCompulsoryModulesCompleted = compulsoryModules.every(module =>
      moduleCompleted[module._id] === true
    );

    if (!allCompulsoryModulesCompleted) {
      toast.error('You must complete all compulsory modules before generating a certificate.');
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
          .catch(error => {
            console.error('Certificate generation error:', error);
            if (error.message === "Certificate already exists") {
              // If certificate already exists, just refresh the list
              dispatch(getMyCertificatesThunk());
              setActiveTab('certificates');
              toast.info('Certificate already exists. Refreshing your certificates.');
            } else if (error.message === "You must complete all compulsory modules before generating a certificate") {
              toast.error('You must complete all compulsory modules before generating a certificate.');
            } else {
              toast.error('Failed to generate certificate. Please try again.');
            }
          });
      })
      .catch(error => {
        console.error('Course status update error:', error);
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
          <ProgressBar
            percentage={userProgress}
            size="medium"
            color="warning"
            animated={true}
            className="course-progress-bar custom-progress"
            textPosition="right"
            showText={true}
          />
        </div>

      </div>

      <div className="course-content-container">
        <div className="video-container">
          <div className="video-wrapper">
            {selectedContent ? (
              selectedContent.mimeType?.startsWith('video/') && selectedContent.mimeType !== 'video/youtube' ? (
                <video
                  className="video-player"
                  controls
                  width="100%"
                  src={`${VITE_IMAGE_URL}${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                />
              ) : selectedContent.mimeType === 'video/youtube' ? (
                <div className="youtube-embed-container" style={{
                  position: 'relative',
                  paddingBottom: '56.25%', /* 16:9 aspect ratio */
                  height: '0',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(getYoutubeUrl(selectedContent))}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
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
                onClick={() => {
                  setActiveTab(tab);

                  // If switching to quizzes tab, fetch quiz attempts for all quizzes in the course
                  if (tab === 'quizzes' && course?.quizzes?.length > 0) {
                    setLoadingAttempts(true);

                    // Create an array of promises for all quiz attempt fetches
                    const fetchPromises = course.quizzes.map(quiz =>
                      dispatch(getQuizAttemptsThunk({
                        courseId: id,
                        quizId: quiz._id,
                        userId: currentUserId // Pass the current user ID to ensure we only get attempts for this user
                      }))
                    );

                    // Wait for all fetches to complete
                    Promise.all(fetchPromises)
                      .then(() => {
                        setLoadingAttempts(false);
                      })
                      .catch(error => {
                        console.error("Error fetching quiz attempts:", error);
                        setLoadingAttempts(false);
                      });
                  }
                }}
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
                      <h3>
                        {module.title}
                        {module.isCompulsory === false && (
                          <span className="module-optional-badge">Optional</span>
                        )}
                        {module.isCompulsory !== false && (
                          <span className="module-compulsory-badge">Compulsory</span>
                        )}
                      </h3>
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
                      {/* Display module content */}
                      {module.content?.length ? module.content.map((content) => (
                        <div
                          className="topic-item"
                          key={content._id}
                          onClick={() => handleContentClick(content, moduleIndex)}
                        >
                          <div className="topic-icon">
                            {content.mimeType?.startsWith('video/') && content.mimeType !== 'video/youtube' ? (
                              <FaPlayCircle />
                            ) : content.mimeType === 'video/youtube' ? (
                              <FaYoutube />
                            ) : content.mimeType === 'text/html' ? (
                              <FaFilePdf />
                            ) : (
                              <FaFilePdf />
                            )}
                          </div>
                          <div className="topic-details">
                            <h4>{content.title}</h4>
                            <p>
                              {content.mimeType?.startsWith('video/') && content.mimeType !== 'video/youtube' ? 'Video' :
                                content.mimeType === 'video/youtube' ? 'YouTube Video' :
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

                      {/* Display module quiz if it exists */}
                      {module.quiz && (
                        <div className="module-quiz-container">
                          <div className="topic-item quiz-topic-item">
                            <div className="topic-icon quiz-icon">
                              <FaTrophy />
                            </div>
                            <div className="topic-details">
                              <h4>Module Quiz</h4>
                              <p>Complete this quiz to progress</p>
                              <div className="quiz-action">
                                <button
                                  className="take-quiz-button"
                                  onClick={() => {
                                    // Fetch quiz attempts for this quiz
                                    dispatch(getQuizAttemptsThunk({
                                      courseId: id,
                                      quizId: module.quiz,
                                      userId: currentUserId
                                    }));

                                    // Switch to quizzes tab
                                    setActiveTab('quizzes');

                                    // Expand this quiz in the quizzes tab
                                    setExpandedQuizzes(prev => ({
                                      ...prev,
                                      [module.quiz]: true
                                    }));
                                  }}
                                >
                                  {storeQuizAttempts[module.quiz] ?
                                    (storeQuizAttempts[module.quiz].passed ? 'Quiz Passed' : 'Retry Quiz') :
                                    'Take Quiz'}
                                </button>
                                {storeQuizAttempts[module.quiz] && (
                                  <span className={`quiz-result-badge ${storeQuizAttempts[module.quiz].passed ? 'passed' : 'failed'}`}>
                                    {storeQuizAttempts[module.quiz].passed ? 'Passed' : 'Failed'} ({storeQuizAttempts[module.quiz].percentage}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="quizzes-tab">
              {loadingAttempts ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading quiz data...</p>
                </div>
              ) : (
                <>
                  {course.quizzes?.map((quiz) => (
                    <div key={quiz._id} className="quiz-card accordion-quiz">
                      <div
                        className={`quiz-header ${storeQuizAttempts[quiz._id] ? 'quiz-attempted' : ''}`}
                        onClick={() => toggleQuiz(quiz._id)}
                      >
                        <div className="quiz-title-section">
                          <h3>{quiz.title}</h3>
                          <p className="quiz-description">{quiz.description}</p>
                        </div>
                        <div className="quiz-status">
                          {storeQuizAttempts[quiz._id] && (
                            <span className={`quiz-result-badge ${storeQuizAttempts[quiz._id].passed ? 'passed' : 'failed'}`}>
                              {storeQuizAttempts[quiz._id].passed ? 'Passed' : 'Failed'} ({storeQuizAttempts[quiz._id].percentage}%)
                            </span>
                          )}
                          <span className="toggle-icon">
                            {expandedQuizzes[quiz._id] ? <FaChevronUp /> : <FaChevronDown />}
                          </span>
                        </div>
                      </div>

                      {expandedQuizzes[quiz._id] && (
                        <div className="quiz-content">
                          {quiz.questions?.length > 0 ? (
                            <QuizSubmission
                              quiz={quiz}
                              onSubmit={(answers) => handleQuizSubmit(quiz._id, answers)}
                              existingAttempt={storeQuizAttempts[quiz._id] || null}
                            />
                          ) : (
                            <div className="quiz-empty-state">
                              <p className="no-questions-message">No questions available for this quiz.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {!course.quizzes?.length && (
                    <div className="no-quizzes-message">
                      <p>No quizzes available for this course.</p>
                    </div>
                  )}
                </>
              )}
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
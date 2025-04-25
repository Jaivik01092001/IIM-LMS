// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import "../assets/styles/EnrollCourseDetail.css";
// import { FaPlayCircle, FaDownload, FaPaperclip, FaChevronUp, FaChevronDown, FaUserCircle, FaCheck, FaTrophy, FaFilePdf } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// const EnrollCourseDetail = () => {
//   const { id } = useParams();
//   const [activeTab, setActiveTab] = useState('content');
//   const [expandedSections, setExpandedSections] = useState({
//     'Getting Started with Time Management': true,
//     'Advanced Time Management Techniques': false,
//     'Practical Applications': false
//   });
//   const [sessionCompleted, setSessionCompleted] = useState({
//     'session1': false,
//     'session2': false,
//     'session3': false,
//     'session4': false
//   });
//   const [userProgress, setUserProgress] = useState(50);
//   const [quizAnswers, setQuizAnswers] = useState({});
//   const [quizSubmitted, setQuizSubmitted] = useState(false);

//   // Static data for demo
//   const course = {
//     _id: id,
//     title: "Effective Time Management Courses",
//     creator: { name: "Jaivik Patel" },
//     modules: [
//       {
//         _id: "module1",
//         title: "Getting Started with Time Management",
//         content: [
//           {
//             _id: "session1",
//             title: "Overview",
//             description: "The course content is uniquely customized in a way to give each student who participates in this course the best skill orientation and the tools to master time management.",
//             fileSize: "7.59 MB"
//           },
//           {
//             _id: "session2",
//             title: "Introduction to Time Management",
//             description: "Learn the fundamental concepts and importance of effective time management in personal and professional settings.",
//             fileSize: "6.25 MB"
//           }
//         ]
//       },
//       {
//         _id: "module2",
//         title: "Advanced Time Management Techniques",
//         content: [
//           {
//             _id: "session3",
//             title: "Prioritization Methods",
//             description: "Explore various prioritization techniques including Eisenhower Matrix, ABC Method, and POSEC Method.",
//             fileSize: "8.12 MB"
//           },
//           {
//             _id: "session4",
//             title: "Time Blocking Strategies",
//             description: "Learn how to effectively use time blocking to enhance productivity and focus.",
//             fileSize: "5.36 MB"
//           }
//         ]
//       },
//       {
//         _id: "module3",
//         title: "Practical Applications",
//         content: []
//       }
//     ],
//     // Static quiz data
//     quizzes: [
//       {
//         _id: "quiz1",
//         title: "Time Management Fundamentals",
//         description: "Test your understanding of basic time management concepts",
//         duration: "15 minutes",
//         totalQuestions: 10,
//         passingScore: 70,
//         questions: [
//           {
//             _id: "q1",
//             question: "Which of the following is NOT a time management technique?",
//             options: [
//               "Pomodoro Technique",
//               "Eisenhower Matrix",
//               "Sequential Processing",
//               "Time Blocking"
//             ],
//             correctAnswer: "Sequential Processing"
//           },
//           {
//             _id: "q2",
//             question: "What is the main purpose of the Eisenhower Matrix?",
//             options: [
//               "To schedule your day in 25-minute intervals",
//               "To prioritize tasks based on urgency and importance",
//               "To track time spent on activities",
//               "To delegate tasks to team members"
//             ],
//             correctAnswer: "To prioritize tasks based on urgency and importance"
//           }
//         ]
//       },
//       {
//         _id: "quiz2",
//         title: "Advanced Time Management Quiz",
//         description: "Test your knowledge of advanced time management strategies",
//         duration: "20 minutes",
//         totalQuestions: 15,
//         passingScore: 75,
//         questions: []
//       }
//     ],
//     // Static certificates data
//     certificates: [
//       {
//         _id: "cert1",
//         title: "Time Management Fundamentals",
//         status: "Completed",
//         completionDate: "2023-06-15",
//         downloadUrl: "#"
//       },
//       {
//         _id: "cert2",
//         title: "Advanced Time Management",
//         status: "In Progress",
//         requiredProgress: 80,
//         currentProgress: 50,
//         downloadUrl: null
//       }
//     ]
//   };

//   const toggleSection = (section) => {
//     setExpandedSections({
//       ...expandedSections,
//       [section]: !expandedSections[section]
//     });
//   };

//   const handleToggleSession = (sessionId) => {
//     const newSessionState = {
//       ...sessionCompleted,
//       [sessionId]: !sessionCompleted[sessionId]
//     };
//     setSessionCompleted(newSessionState);

//     // For static demo, just count the completed sessions
//     const completedCount = Object.values(newSessionState).filter(Boolean).length;
//     const totalSessions = 4; // Hard-coded for demo
//     const newProgress = Math.round((completedCount / totalSessions) * 100);
//     setUserProgress(newProgress);

//     // Simulate API success
//     toast.success('Progress updated');
//   };

//   const handleSaveNote = () => {
//     // Static demo version
//     toast.success('Note saved');
//   };

//   const handleQuizAnswerChange = (questionId, answer) => {
//     setQuizAnswers(prev => ({
//       ...prev,
//       [questionId]: answer
//     }));
//   };

//   const handleQuizSubmit = () => {
//     // Simulate quiz submission
//     setQuizSubmitted(true);
//     toast.success('Quiz submitted successfully!');
//   };

//   const resetQuiz = () => {
//     setQuizAnswers({});
//     setQuizSubmitted(false);
//   };

//   const handleCertificateDownload = (certificateId) => {
//     // Simulate certificate download
//     toast.success(`Certificate ${certificateId} download started`);
//   };

//   return (
//     <div className="enroll-course-detail">
//       <div className="course-header">
//         <h1>{course.title}</h1>
//         <div className="progress-container">
//           <div className="progress-bar" style={{ width: '50%' }}></div>
//           <span className="progress-text">{userProgress}%</span>
//         </div>
//         <div className="user-profile">
//           <FaUserCircle size={40} />
//           <span>{course.creator?.name}</span>
//         </div>
//       </div>

//       <div className="course-content-container">
//         <div className="video-container">
//           <div className="video-wrapper">
//             <div className="video-placeholder">
//               <button className="play-button">
//                 <FaPlayCircle />
//               </button>
//               <button className="fullscreen-button">
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zm-2 18h-7v-7h2v5h5v2zm11 0h-7v-2h5v-5h2v7z" fill="currentColor"/>
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <div className="download-section">
//             <p>Download the file</p>
//             <button className="download-button">
//               <FaDownload /> Download
//             </button>
//           </div>
//           <div className="personal-note-section">
//             <h3>Personal Course Note</h3>
//             <p className="note-description">This note will be displayed for you privately</p>
//             <textarea 
//               placeholder="Write comment here..."
//               className="note-textarea"
//             ></textarea>
//             <div className="attachment-section">
//               <h4>Attachment</h4>
//               <div className="attachment-input">
//                 <button className="attachment-button">
//                   <FaPaperclip />
//                 </button>
//               </div>
//             </div>
//             <button className="save-note-button" onClick={handleSaveNote}>
//               Save Note
//             </button>
//           </div>
//         </div>

//         <div className="course-sidebar">
//           <div className="tab-container">
//             <button 
//               className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
//               onClick={() => setActiveTab('content')}
//             >
//               Content
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
//               onClick={() => setActiveTab('quizzes')}
//             >
//               Quizzes
//             </button>
//             <button 
//               className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`}
//               onClick={() => setActiveTab('certificates')}
//             >
//               Certificates
//             </button>
//           </div>

//           {/* Content Tab */}
//           {activeTab === 'content' && (
//             <div className="course-sections">
//               {course.modules.map((module, moduleIndex) => (
//                 <div className="course-section" key={module._id}>
//                   <div 
//                     className="section-header" 
//                     onClick={() => toggleSection(module.title)}
//                   >
//                     <div className="section-number">{moduleIndex + 1}</div>
//                     <div className="section-title">
//                       <h3>{module.title}</h3>
//                       <p>{module.content?.length || 0} Topic</p>
//                     </div>
//                     <div className="section-toggle">
//                       {expandedSections[module.title] ? <FaChevronUp /> : <FaChevronDown />}
//                     </div>
//                   </div>

//                   {expandedSections[module.title] && (
//                     <div className="section-content">
//                       {module.content && module.content.length > 0 ? module.content.map((content) => (
//                         <div className="topic-item" key={content._id}>
//                           <div className="topic-icon">
//                             <FaPlayCircle />
//                           </div>
//                           <div className="topic-details">
//                             <h4>{content.title}</h4>
//                             <p>Video | {content.fileSize}</p>
//                             {content.description && (
//                               <p className="topic-description">
//                                 {content.description.length > 100 
//                                   ? `${content.description.substring(0, 100)}...` 
//                                   : content.description}
//                               </p>
//                             )}
//                             <div className="session-toggle">
//                               <p>I passed this session</p>
//                               <label className="toggle-switch">
//                                 <input 
//                                   type="checkbox" 
//                                   checked={!!sessionCompleted[content._id]}
//                                   onChange={() => handleToggleSession(content._id)}
//                                 />
//                                 <span className="toggle-slider"></span>
//                               </label>
//                             </div>
//                           </div>
//                         </div>
//                       )) : (
//                         <p className="no-content-message">No content available for this module.</p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Quizzes Tab */}
//           {activeTab === 'quizzes' && (
//             <div className="quizzes-tab">
//               {course.quizzes.map((quiz) => (
//                 <div key={quiz._id} className="quiz-card">
//                   <div className="quiz-header">
//                     <h3>{quiz.title}</h3>
//                     <p className="quiz-description">{quiz.description}</p>
//                     <div className="quiz-meta">
//                       <span className="quiz-duration">Duration: {quiz.duration}</span>
//                       <span className="quiz-questions">Questions: {quiz.totalQuestions}</span>
//                       <span className="quiz-passing-score">Passing Score: {quiz.passingScore}%</span>
//                     </div>
//                   </div>

//                   {quiz.questions && quiz.questions.length > 0 ? (
//                     <div className="quiz-content">
//                       {!quizSubmitted ? (
//                         <>
//                           {quiz.questions.map((question, qIndex) => (
//                             <div key={question._id} className="quiz-question">
//                               <h4>Q{qIndex + 1}: {question.question}</h4>
//                               <div className="quiz-options">
//                                 {question.options.map((option, oIndex) => (
//                                   <div key={oIndex} className="quiz-option">
//                                     <input
//                                       type="radio"
//                                       id={`${question._id}-option-${oIndex}`}
//                                       name={question._id}
//                                       value={option}
//                                       onChange={() => handleQuizAnswerChange(question._id, option)}
//                                       checked={quizAnswers[question._id] === option}
//                                     />
//                                     <label htmlFor={`${question._id}-option-${oIndex}`}>{option}</label>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                           <button 
//                             className="quiz-submit-button" 
//                             onClick={handleQuizSubmit}
//                           >
//                             Submit Quiz
//                           </button>
//                         </>
//                       ) : (
//                         <div className="quiz-results">
//                           <div className="quiz-score">
//                             <h4>Quiz Results</h4>
//                             <div className="score-display">
//                               <div className="score-circle">
//                                 <span className="score-value">85%</span>
//                               </div>
//                               <div className="score-message">
//                                 <FaCheck className="success-icon" />
//                                 <span>You passed!</span>
//                               </div>
//                             </div>
//                             <p className="score-details">
//                               You answered 8 out of 10 questions correctly.
//                             </p>
//                             <button 
//                               className="retry-button" 
//                               onClick={resetQuiz}
//                             >
//                               Retake Quiz
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="quiz-empty">
//                       <p>Quiz questions are not available yet.</p>
//                       <button className="check-back-button">Check Back Later</button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Certificates Tab */}
//           {activeTab === 'certificates' && (
//             <div className="certificates-tab">
//               {course.certificates.map((certificate) => (
//                 <div key={certificate._id} className="certificate-card">
//                   <div className="certificate-icon">
//                     {certificate.status === "Completed" ? (
//                       <FaTrophy className="trophy-icon" />
//                     ) : (
//                       <div className="progress-circle">
//                         <svg width="60" height="60" viewBox="0 0 120 120">
//                           <circle 
//                             cx="60" 
//                             cy="60" 
//                             r="54" 
//                             fill="none" 
//                             stroke="#e6e6e6" 
//                             strokeWidth="12" 
//                           />
//                           <circle 
//                             cx="60" 
//                             cy="60" 
//                             r="54" 
//                             fill="none" 
//                             stroke="#1a2e6e" 
//                             strokeWidth="12" 
//                             strokeDasharray="339.3"
//                             strokeDashoffset={339.3 * (1 - certificate.currentProgress / 100)}
//                             transform="rotate(-90 60 60)"
//                           />
//                         </svg>
//                         <span className="progress-percentage">{certificate.currentProgress}%</span>
//                       </div>
//                     )}
//                   </div>
//                   <div className="certificate-details">
//                     <h3>{certificate.title}</h3>
//                     <p className="certificate-status">
//                       Status: <span className={`status-${certificate.status.toLowerCase().replace(' ', '-')}`}>{certificate.status}</span>
//                     </p>
//                     {certificate.completionDate && (
//                       <p className="completion-date">Completed on: {certificate.completionDate}</p>
//                     )}
//                     {certificate.status === "In Progress" && (
//                       <p className="certificate-progress-text">
//                         Complete {certificate.requiredProgress}% of the course to earn this certificate
//                       </p>
//                     )}
//                   </div>
//                   <div className="certificate-actions">
//                     {certificate.status === "Completed" ? (
//                       <button 
//                         className="download-certificate-button"
//                         onClick={() => handleCertificateDownload(certificate._id)}
//                       >
//                         <FaFilePdf /> Download
//                       </button>
//                     ) : (
//                       <button className="view-requirements-button">
//                         View Requirements
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EnrollCourseDetail;





import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getCourse } from '../redux/admin/adminApi';

const EnrollCourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState({});
  const [sessionCompleted, setSessionCompleted] = useState({});
  const [userProgress, setUserProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [course, setCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourse(id);
        setCourse(res);

        const defaultExpanded = {};
        res.modules?.forEach((mod) => {
          defaultExpanded[mod.title || mod._id] = true;
        });
        setExpandedSections(defaultExpanded);

        const completed = {};
        res.modules?.forEach((mod) => {
          mod.content?.forEach((c) => {
            completed[c._id] = false;
          });
        });
        setSessionCompleted(completed);

        // Set first content as selected if available
        const firstModule = res.modules?.find((mod) => mod.content?.length);
        if (firstModule) setSelectedContent(firstModule.content[0]);
      } catch (err) {
        toast.error('Failed to load course');
      }
    };
    fetchCourse();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleToggleSession = (sessionId) => {
    const newSessionState = {
      ...sessionCompleted,
      [sessionId]: !sessionCompleted[sessionId],
    };
    setSessionCompleted(newSessionState);
    const completedCount = Object.values(newSessionState).filter(Boolean).length;
    const totalSessions = Object.keys(newSessionState).length;
    const newProgress = Math.round((completedCount / totalSessions) * 100);
    setUserProgress(newProgress);
    toast.success('Progress updated');
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

  const handleCertificateDownload = (certificateId) => {
    toast.success(`Certificate ${certificateId} download started`);
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
            { /*    {selectedContent?.type === 'video' ? (
              <video
                className="video-player"
                controls
                width="100%"
                src={`http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`}
              />
            ) : (
              <div className="video-placeholder">
                <FaPlayCircle size={60} />
              </div>
            )} */}

            {selectedContent ? (
              selectedContent.mimeType?.startsWith('video/') ? (
                <video
                  className="video-player"
                  controls
                  width="100%"
                  src={`http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                />
              ) : selectedContent.mimeType === 'application/pdf' ? (
                <iframe
                  title="PDF Preview"
                  src={`http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                  width="100%"
                  height="500px"
                  style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                />
              ) : selectedContent.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                <iframe
                  title="DOCX Preview"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    `http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`
                  )}`}
                  width="100%"
                  height="500px"
                  frameBorder="0"
                />
              ) : selectedContent.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? (
                <iframe
                  title="PPTX Preview"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    `http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`
                  )}`}
                  width="100%"
                  height="500px"
                  frameBorder="0"
                />
              ) : selectedContent.mimeType?.startsWith('image/') ? (
                <img
                  src={`http://localhost:5000/${selectedContent.fileUrl.replace(/\\/g, '/')}`}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
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
          <div className="download-section">
            <p>Download the file</p>
            <button className="download-button">
              <FaDownload /> Download
            </button>
          </div>

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
                  <div className="section-header" onClick={() => toggleSection(module.title)}>
                    <div className="section-number">{moduleIndex + 1}</div>
                    <div className="section-title">
                      <h3>{module.title}</h3>
                      <p>{module.content?.length || 0} Topic</p>
                    </div>
                    <div className="section-toggle">
                      {expandedSections[module.title] ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>

                  {expandedSections[module.title] && (
                    <div className="section-content">
                      {module.content?.length ? module.content.map((content) => (
                        <div className="topic-item" key={content._id} onClick={() => setSelectedContent(content)}>
                          <div className="topic-icon">
                            <FaPlayCircle />
                          </div>
                          <div className="topic-details">
                            <h4>{content.title}</h4>
                            <p>Video | {(content.size / 1000000).toFixed(2)} MB</p>
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
                                  onChange={() => handleToggleSession(content._id)}
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
              <p>Certificates feature coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollCourseDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaBook, FaUserGraduate, FaStar, FaChevronDown } from 'react-icons/fa';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    // Mock API call to fetch course details
    // Replace with actual API call when backend is ready
    const fetchCourseDetail = () => {
      setLoading(true);
      setTimeout(() => {
        // Mock data for now
        setCourse({
          id: id,
          title: "Effective Time Management",
          category: "Management",
          language: "English",
          description: "This is because time management is a Myth. What this course will teach you is the concept of Task Management. In other words, it will teach you how to accomplish more high value tasks so that you get a 10X greater return for all of the work you put in every hour.",
          instructor: "Charlie Rawal",
          profession: "Professor",
          lessons: 24,
          students: 59,
          duration: "20:09 hrs",
          rating: 4.8,
          videoUrl: "https://example.com/course-video.mp4",
          image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b",
          content: [
            {
              id: 1,
              title: "Introduction to Time Management",
              description: "Learn the basics of effective time management and why it matters.",
              duration: "45 min",
              isLocked: false
            },
            {
              id: 2,
              title: "The 80/20 Rule and Parkinson's Law",
              description: "Using the principles of the 20/80 Rule and Parkinson's law, you will learn how to increase the value of the things you do within your limited time, so that you can have as much as 200X greater impact from what you do.",
              duration: "1 hour",
              isLocked: true
            },
            {
              id: 3,
              title: "Task Prioritization Techniques",
              description: "Learn how to identify and focus on high-value tasks.",
              duration: "1.5 hours",
              isLocked: true
            }
          ],
          faqs: [
            {
              id: 1,
              question: "How can I get course updates?",
              answer: "You will receive a notification after each update is released so you can download updated files from the course page."
            },
            {
              id: 2,
              question: "What is the course level?",
              answer: "This course is designed for beginners and intermediate learners. No prior knowledge is required."
            }
          ]
        });
        setLoading(false);
      }, 800);
    };

    fetchCourseDetail();
  }, [id]);

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
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
              <span>{course.rating}</span>
            </div>
          </div>
        </div>
      </div>

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
              Content (24)
            </button>
            <button 
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews (1)
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'information' && (
              <div className="information-tab">
                <div className="course-description">
                  <p>
                    If you have ever taken a time management course, you've probably faced the
                    frustration of trying to manage your time better and not succeeding.
                  </p>
                  <p>This is because <strong>time management is a Myth</strong>.</p>
                  <p>
                    What this course will teach you is the concept of <strong>"Task Management"</strong>. In other
                    words, it will teach you how to <strong>accomplish more high value tasks</strong> so that
                    you <strong>get a 10X greater return for all of the work you put in every hour</strong>.
                  </p>
                  <p>
                    Using the principles of the <strong>20/80 Rule and Parkinson's law</strong>, you will learn how to
                    increase the value of the things you do within your limited time, so that you can
                    have as much as <strong>200X greater impact from what you do</strong>.
                  </p>
                </div>
                <div className="instructor-info">
                  <div className="instructor-profile">
                    <div className="instructor-image">
                      <img src="https://i.pravatar.cc/150?img=32" alt={course.instructor} />
                    </div>
                    <div className="instructor-details">
                      <h4>{course.instructor}</h4>
                      <p>{course.profession}</p>
                    </div>
                  </div>
                </div>
                {/* Moved FAQs inside information tab */}
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
              </div>
            )}

            {activeTab === 'content' && (
              <div className="content-tab">
                <div className="content-list">
                  {course.content.map((item, index) => (
                    <div key={item.id} className="content-item">
                      <div className="content-info">
                        <h3>{index + 1}. {item.title}</h3>
                        <p>{item.description}</p>
                        <span className="content-duration">
                          <FaClock className="icon" /> {item.duration}
                        </span>
                      </div>
                      {item.isLocked ? (
                        <div className="content-locked">
                          <span className="lock-icon">🔒</span>
                        </div>
                      ) : (
                        <button className="preview-button">Preview</button>
                      )}
                    </div>
                  ))}
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
              <img src={course.image} alt={course.title} />
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
                  <span className="stat-value">{course.lessons}</span>
                  <span className="stat-label">Lessons</span>
                </div>
              </div>
              <div className="stat-item">
                <FaUserGraduate className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{course.students}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              <div className="stat-item">
                <FaClock className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{course.duration.split(":")[0]}</span>
                  <span className="stat-label">Hours</span>
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
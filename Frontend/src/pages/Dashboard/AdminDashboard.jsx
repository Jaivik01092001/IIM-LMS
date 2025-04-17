import React from 'react';
import { FaBook, FaClock, FaUserGraduate, FaStar } from 'react-icons/fa';
import { LuSchool } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';

import "../../assets/styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Handle click on course card to navigate to course details
  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/admin/courses/${courseId}`);
  };
  // Sample data for courses with diverse content
  const courses = [
    {
      id: 1,
      title: "Effective Time Management",
      category: "Management",
      language: "English",
      description: "Master proven techniques to maximize productivity and achieve work-life balance through effective time management strategies.",
      instructor: "Charlie Rawal",
      lessons: 24,
      students: 82,
      duration: "20:00 hrs",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 2,
      title: "Python for Data Science",
      category: "Programming",
      language: "English",
      description: "Learn Python programming fundamentals and essential libraries for data analysis, visualization, and machine learning.",
      instructor: "David Miller",
      lessons: 36,
      students: 145,
      duration: "32:00 hrs",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      category: "Design",
      language: "English",
      description: "Master the principles of user interface and user experience design to create intuitive and engaging digital products.",
      instructor: "Sarah Johnson",
      lessons: 28,
      students: 96,
      duration: "24:30 hrs",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 4,
      title: "Digital Marketing Masterclass",
      category: "Marketing",
      language: "Hindi",
      description: "Comprehensive guide to digital marketing including SEO, social media, email campaigns, and analytics for business growth.",
      instructor: "Rahul Sharma",
      lessons: 30,
      students: 120,
      duration: "26:00 hrs",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card schools">
          <div className="stat-icon1">
          <LuSchool className='icondesign1' />
            <LuSchool size={24}/>
          </div>
          <div className="stat-count">20</div>
          <div className="stat-title">Total Schools</div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <LiaChalkboardTeacherSolid  size={24} />
            <LiaChalkboardTeacherSolid className='icondesign2'  />
          </div>
          <div className="stat-count">100</div>
          <div className="stat-title">Total Educators</div>
        </div>

        <div className="stat-card courses">
          <div className="stat-icon3">
            <FaBook className='icondesign3'  />
            <FaBook  size={24} />
          </div>
          <div className="stat-count">{courses.length}</div>
          <div className="stat-title">Total Courses</div>
        </div>
      </div>

      {/* All Courses Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">All Courses ({courses.length})</h2>
          <a href="#" className="view-all" onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/admin/courses');
          }}>View All</a>
        </div>

        <div className="course-grid">
          {courses.map(course => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => handleCourseClick(course.id)}
            >
              <img src={course.image} alt={course.title} className="course-image" />
              <div className="course-details">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-category">Category: {course.category} | Language: {course.language}</p>
                <p className="course-description">{course.description}</p>
                <p className="course-category">Educator</p>
                <div className="instructor">

                  <img
                    src={`https://i.pravatar.cc/150?img=${course.id + 30}`}
                    alt={course.instructor}
                    className="instructor-avatar"
                  />
                  <span className="instructor-name">{course.instructor}</span>
                </div>

                <div className="course-meta">
                  <div className="meta-item">
                    <FaBook size={12} />
                    <span>{course.lessons}</span>
                  </div>
                  <div className="meta-item">
                    <FaUserGraduate size={12} />
                    <span>{course.students}</span>
                  </div>
                  <div className="meta-item">
                    <FaClock size={12} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="meta-item">
                    <FaStar size={12} />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <button
                  className="enroll-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    // Enrollment logic here
                  }}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
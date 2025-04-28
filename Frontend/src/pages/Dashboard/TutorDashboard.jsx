import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaClock, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { getCoursesThunk } from '../../redux/admin/adminSlice';
import DataTableComponent from '../../components/DataTable';
import "../../assets/styles/TutorDashboard.css";
const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const TutorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [ongoingCourses, setOngoingCourses] = useState([]);

  // Get courses data from Redux store
  const { courses, loading } = useSelector((state) => state.admin);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getCoursesThunk());
  }, [dispatch]);

  // Process courses data when it changes
  useEffect(() => {
    if (courses && courses.length > 0) {
      const formattedCourses = courses.map(course => {
        // For demo: generate random enrollment status and progress
        const isEnrolled = course._id.toString().charCodeAt(course._id.toString().length - 1) % 2 === 0;
        const progress = isEnrolled ? Math.floor(Math.random() * 100) : 0;
        const status = progress === 100 ? 'completed' : isEnrolled ? 'ongoing' : 'not-enrolled';
        
        return {
          id: course._id,
          title: course.title || 'Untitled Course',
          category: course.category || 'Uncategorized',
          professor: course.creator?.name || 'Unknown',
          duration: course.duration || 'N/A',
          level: course.level || 'N/A',
          description: course.description || 'No description available',
          tags: course.tags?.join(', ') || 'No tags',
          language: course.language || 'English',
          status: course.status === 1,
          thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          hasModules: course.hasModules || false,
          isEnrolled: isEnrolled,
          progress: progress,
          enrollmentStatus: status,
          startDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        };
      });
      
      setCoursesData(formattedCourses);
      
      // Filter for ongoing courses
      const ongoing = formattedCourses.filter(course => 
        course.isEnrolled && course.progress < 100
      );
      setOngoingCourses(ongoing);
    }
  }, [courses]);

  // Count courses by status
  const getCompletedCourses = () => {
    return coursesData.filter(course => course.isEnrolled && course.progress === 100).length;
  };

  const getOngoingCourses = () => {
    return coursesData.filter(course => course.isEnrolled && course.progress < 100).length;
  };

  const getTotalCourses = () => {
    return coursesData.filter(course => course.isEnrolled).length;
  };

  // View course handler
  const handleViewCourse = (row) => {
    navigate(`/dashboard/tutor/courses/${row.id}`);
  };

  // Table columns configuration
  const columns = [
    {
      name: "Course",
      cell: (row) => (
        <div className="course-info">
          <img src={VITE_IMAGE_URL + row.thumbnail} alt={row.title} className="course-thumbnail" />
          <div className="course-details">
            <span className="course-title">{row.title}</span>
            <span className="course-category">{row.category}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Started On",
      selector: (row) => row.startDate,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row) => row.level,
      sortable: true,
    },
    {
      name: "Progress",
      cell: (row) => (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="progress-text">{row.progress}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button className="action-btn view" onClick={() => handleViewCourse(row)} title="View Course">
            <FaEye />
          </button>
        </div>
      ),
      width: "100px",
      center: true,
    },
  ];

  return (
    <div className="tutor-dashboard">
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="dashboard-stats">
            <div className="stat-card ongoing">
              <div className="stat-icon1">
                <FaClock size={24} />
                <FaClock className="icondesign1" />
              </div>
              <div className="stat-count">{getOngoingCourses()}</div>
              <div className="stat-title">Ongoing Courses</div>
            </div>

            <div className="stat-card completed">
              <div className="stat-icon2">
                <FaGraduationCap size={24} />
                <FaGraduationCap className="icondesign2" />
              </div>
              <div className="stat-count">{getCompletedCourses()}</div>
              <div className="stat-title">Completed Courses</div>
            </div>

            <div className="stat-card total">
              <div className="stat-icon3">
                <FaBook size={24} />
                <FaBook className="icondesign3" />
              </div>
              <div className="stat-count">{getTotalCourses()}</div>
              <div className="stat-title">Total Courses</div>
            </div>
          </div>

          {/* Ongoing Courses Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">My Ongoing Courses</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/dashboard/tutor/courses')}
              >
                View All Courses
              </button>
            </div>

            {ongoingCourses.length > 0 ? (
              <div className="courses-table">
                <DataTableComponent
                  columns={columns}
                  data={ongoingCourses}
                  showSearch={false}
                />
              </div>
            ) : (
              <div className="empty-courses">
                <div className="empty-message">
                  <FaBook className="empty-icon" />
                  <h3>No ongoing courses</h3>
                  <p>You don't have any courses in progress right now.</p>
                  <button 
                    className="browse-courses-btn"
                    onClick={() => navigate('/dashboard/tutor/courses')}
                  >
                    Browse Courses
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TutorDashboard;
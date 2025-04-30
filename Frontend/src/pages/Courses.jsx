import React, { useState, useEffect } from "react";
import {
  FaBook,
  FaUserGraduate,
  FaClock,
  FaPencilAlt,
  FaTrashAlt,
  FaEye,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCoursesThunk,
  updateCourseThunk,
  deleteCourseThunk,
  getUsersThunk
} from "../redux/admin/adminSlice";
// No longer needed: import { getEducatorsThunk } from "../redux/university/universitySlice";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "../assets/styles/Courses.css";

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const Courses = ({ userType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { courses, users, loading } = useSelector((state) => state.admin);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Count users by role from users API
  const getCountByRole = (role) => {
    if (!users) return 0;
    return users.filter(user => user.role === role).length;
  };

  // Get counts for each role
  const universityCount = getCountByRole('university');
  const educatorCount = getCountByRole('educator');
  const adminCount = getCountByRole('admin');

  // Log user counts when users data changes
  useEffect(() => {
    if (users) {
      // Only log in development environment
      if (import.meta.env.NODE_ENV === 'development') {
        console.log('University users count:', universityCount);
        console.log('Educator users count:', educatorCount);
        console.log('Admin users count:', adminCount);
      }
    }
  }, [users, universityCount, educatorCount, adminCount]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getCoursesThunk());
    dispatch(getUsersThunk());
  }, [dispatch]);

  // Transform courses data for the table
  const [tableData, setTableData] = useState([]);

  // Extract unique categories from courses
  const [categories, setCategories] = useState([]);

  // Update tableData and categories when courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      const formattedCourses = courses.map(course => {
        // For testing: mock enrollment data 
        // In production, this should come from the API
        const mockEnrollment = userType === 'tutor' && (
          // For demo purposes: every other course is considered "enrolled"
          course._id.toString().charCodeAt(course._id.toString().length - 1) % 2 === 0
        );

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
          // Check if user is enrolled in the course - real implementation would check API data
          isEnrolled: Boolean(course.progress || course.enrolled || course.isEnrolled || mockEnrollment)
        };
      });

      setTableData(formattedCourses);

      // Extract unique categories
      const uniqueCategories = [...new Set(formattedCourses.map(course => course.category))];
      setCategories(uniqueCategories);
    }
  }, [courses, userType]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    dispatch(updateCourseThunk({
      id: row.id,
      status: row.status ? 0 : 1
    }))
      .unwrap()
      .then(() => {
        // Refresh courses data
        dispatch(getCoursesThunk());
      })
      .catch(error => {
        console.error(`Error updating course status:`, error);
      });
  };

  // View handler
  const handleView = (row) => {
    navigate(`/dashboard/${userType}/courses/${row.id}`);
  };

  // Edit handler
  const handleEdit = (row) => {
    navigate(`/dashboard/${userType}/courses/edit-flow/${row.id}`);
  };

  // Delete handler
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.title}"? This action cannot be undone.`)) {
      dispatch(deleteCourseThunk(row.id))
        .unwrap()
        .then(() => {
          // Refresh courses data
          dispatch(getCoursesThunk());
        })
        .catch(error => {
          console.error(`Error deleting course:`, error);
        });
    }
  };

  // Table columns configuration
  const columns = [
    {
      name: "Course Title",
      cell: (row) => (
        <div className="course-info">
          <img src={VITE_IMAGE_URL + row.thumbnail} alt={row.title} className="course-thumbnail" />
          <span>{row.title}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Categories",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Creator",
      cell: (row) => (
        <div className="professor-info">
          <img
            src={`https://i.pravatar.cc/150?img=${row.id + 30}`}
            alt={row.professor}
            className="professor-avatar"
          />
          <span>{row.professor}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Duration",
      selector: (row) => row.duration,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row) => row.level,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="status-cell">
          <div
            className={`status-indicator ${row.status ? "active" : ""}`}
            onClick={() => handleStatusToggle(row)}
            title={row.status ? "Active" : "Inactive"}
          />
          <span className={row.status ? "text-green-600" : "text-red-600"}>
            {row.status ? "Active" : "Inactive"}
          </span>
        </div>
      ),
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="action-buttons">
          <button className="action-btn view" onClick={() => handleView(row)} title="View Details">
            <FaEye />
          </button>
          <button className="action-btn edit" onClick={() => handleEdit(row)} title="Edit Course">
            <FaPencilAlt />
          </button>
          <button
            className="action-btn delete"
            onClick={() => handleDelete(row)}
            title="Delete Course"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "150px",
      center: true,
    },
  ];

  // Filter the data based on search and category filters
  const filteredData = tableData
    // Apply search filter
    .filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    // Apply category filter
    .filter(item =>
      !categoryFilter || item.category === categoryFilter
    )
    // Apply sorting
    .sort((a, b) => {
      if (!sortBy) return 0;

      switch (sortBy) {
        case "title-asc": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
        case "level-asc": return a.level.localeCompare(b.level);
        case "level-desc": return b.level.localeCompare(a.level);
        case "status": return a.status === b.status ? 0 : a.status ? -1 : 1;
        default: return 0;
      }
    });

  // Card view for tutor courses
  const renderCourseCards = () => {
    return (
      <div className="course-cards-container">
        <div className="course-cards-grid">
          {filteredData.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-card-thumbnail">
                <img src={`${VITE_IMAGE_URL}${course.thumbnail}`} alt={course.title} />
              </div>
              <div className="course-card-content">
                <div className="course-card-category">Category: {course.category}</div>
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">
                  {course.description && course.description.length > 100
                    ? `${course.description.substring(0, 100)}...`
                    : course.description}
                </p>
              </div>
              <div className="course-card-footer">
                <div className="course-card-professor">
                  <img
                    src={`https://i.pravatar.cc/150?img=${course.id + 30}`}
                    alt={course.professor}
                    className="professor-avatar-small"
                  />
                  <span>{course.professor}</span>
                </div>
                <div className="course-card-meta">
                  <div className="course-card-meta-item">
                    <FaClock className="meta-icon" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="course-card-meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="course-card-actions">
                  {course.isEnrolled ? (
                    <button
                      className="resume-btn"
                      onClick={() => handleView(course)}
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      className="start-learning-btn"
                      onClick={() => handleView(course)}
                    >
                      Start Learning
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="courses-container admin-dashboard">
      {isLoading && <LoadingSpinner overlay={true} message="Loading courses data..." />}

      {/* Courses Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            {userType === 'tutor' ? 'My Courses' : `All Courses (${tableData.length})`}
          </h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate(`/dashboard/${userType}/courses/create`)}
            >
              Add Course
            </button>
            <button
              className="view-all-btn"
              onClick={() => navigate(`/dashboard/${userType}/courses`)}
            >
              View All Courses
            </button>
          </div>
        </div>

        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search courses..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="level-asc">Level (Beginner-Advanced)</option>
            <option value="level-desc">Level (Advanced-Beginner)</option>
            <option value="status">Status</option>
          </select>
        </div>

        {userType === 'tutor' ? (
          renderCourseCards()
        ) : (
          <div className="table-responsive">
            <DataTableComponent
              columns={columns}
              data={filteredData}
              showSearch={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

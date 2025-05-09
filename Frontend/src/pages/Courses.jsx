import React, { useState, useEffect } from "react";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCoursesThunk, updateCourseThunk } from "../redux/admin/adminSlice";
// No longer needed: import { getEducatorsThunk } from "../redux/university/universitySlice";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ActionButtons from "../components/common/ActionButtons";
import StatusToggle from "../components/common/StatusToggle";
import { hasLocalPermission } from "../utils/localPermissions";
import "../assets/styles/Courses.css";

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const Courses = ({ userType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { courses, loading } = useSelector((state) => state.admin);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getCoursesThunk());
  }, [dispatch]);

  // Transform courses data for the table
  const [tableData, setTableData] = useState([]);

  // Extract unique categories from courses
  const [categories, setCategories] = useState([]);

  // Update tableData and categories when courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      // Get current user ID from localStorage
      let currentUserId = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          currentUserId = userData.id;
          console.log("Current user ID from localStorage:", currentUserId);
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e);
        }
      }
      const formattedCourses = courses.map((course) => {
        // Check if the current user is enrolled in this course
        let isUserEnrolled = false;

        if (
          currentUserId &&
          course.enrolledUsers &&
          course.enrolledUsers.length > 0
        ) {
          isUserEnrolled = course.enrolledUsers.some((enrollment) => {
            // Handle different possible data formats of user id
            const enrollmentUserId =
              typeof enrollment.user === "object"
                ? enrollment.user._id
                : enrollment.user;

            return enrollmentUserId === currentUserId;
          });
        }

        return {
          id: course._id,
          title: course.title || "Untitled Course",
          category: course.category || "Uncategorized",
          professor: course.creator?.name || "Unknown",
          duration: course.duration || "N/A",
          description: course.description || "No description available",
          tags: course.tags?.join(", ") || "No tags",
          language: course.language || "English",
          status: course.status === 1,
          thumbnail:
            course.thumbnail ||
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          hasModules: course.hasModules || false,
          // Use the actual enrollment status based on enrolledUsers array
          isEnrolled:
            isUserEnrolled ||
            Boolean(course.progress || course.enrolled || course.isEnrolled),
        };
      });

      setTableData(formattedCourses);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(formattedCourses.map((course) => course.category)),
      ];
      setCategories(uniqueCategories);
    }
  }, [courses, userType]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    dispatch(
      updateCourseThunk({
        id: row.id,
        formData: { status: row.status ? 0 : 1 },
      })
    )
      .unwrap()
      .then(() => {
        // Refresh courses data
        dispatch(getCoursesThunk());
      })
      .catch((error) => {
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

  // Table columns configuration
  const columns = [
    {
      name: "Course Title",
      cell: (row) => (
        <div className="course-info">
          <img
            src={VITE_IMAGE_URL + row.thumbnail}
            alt={row.title}
            className="course-thumbnail"
          />
          <span>{row.title}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Creator",
      cell: (row) => (
        <div className="professor-info">
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
      name: "Status",
      cell: (row) => (
        <StatusToggle
          status={row.status}
          onToggle={() => handleStatusToggle(row)}
          permission="delete_course"
        />
      ),
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          viewPermission="view_courses"
          editPermission="edit_course"
        />
      ),
      width: "150px",
      center: true,
    },
  ];

  // Filter the data based on search filter
  const filteredData = tableData
    // Apply search filter
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags &&
          item.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    // Apply sorting
    .sort((a, b) => {
      if (!sortBy) return 0;

      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "status":
          return a.status === b.status ? 0 : a.status ? -1 : 1;
        default:
          return 0;
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
                <img
                  src={`${VITE_IMAGE_URL}${course.thumbnail}`}
                  alt={course.title}
                />
              </div>
              <div className="course-card-content">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">
                  {course.description && course.description.length > 100
                    ? `${course.description.substring(0, 100)}...`
                    : course.description}
                </p>
              </div>
              <div className="course-card-footer">
                <div className="course-card-professor">
                  <span>{course.professor}</span>
                </div>
                <div className="course-card-meta">
                  <div className="course-card-meta-item">
                    <FaClock className="meta-icon" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="course-card-actions">
                  {course.isEnrolled ? (
                    <button
                      className="resume-btn"
                      onClick={() => handleView(course)}
                    >
                      Continue Learning
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
      {isLoading && (
        <LoadingSpinner overlay={true} message="Loading courses data..." />
      )}

      {/* Courses Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            {userType === "tutor"
              ? "My Courses"
              : `All Courses (${tableData.length})`}
          </h2>
          <div className="header-actions">
            {hasLocalPermission("create_course") && (
              <button
                className="add-course-btn"
                onClick={() =>
                  navigate(`/dashboard/${userType}/courses/create`)
                }
              >
                Add Course
              </button>
            )}
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="status">Status</option>
          </select>
        </div>

        {userType === "tutor" ? (
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

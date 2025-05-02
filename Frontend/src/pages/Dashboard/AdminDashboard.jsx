import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTrashAlt, FaEye, FaBook } from "react-icons/fa";
import { LuSchool } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getUniversitiesThunk,
  getCoursesThunk,
  updateCourseThunk,
  deleteCourseThunk,
  getUsersThunk,
} from "../../redux/admin/adminSlice";
import DataTableComponent from "../../components/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "../../assets/styles/AdminDashboard.css";
const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { universities, courses, users, loading } = useSelector(
    (state) => state.admin
  );

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Count educators across all universities (legacy method)
  const educatorsCountFromUniversities =
    universities?.reduce((total, university) => {
      return total + (university.educators?.length || 0);
    }, 0) || 0;

  // Count users by role from users API
  const getCountByRole = (role) => {
    if (!users) return 0;
    return users.filter((user) => user.role === role).length;
  };

  // Get counts for each role
  const universityCount = getCountByRole("university");
  const educatorCount = getCountByRole("educator");

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getUniversitiesThunk());
    dispatch(getCoursesThunk());
    dispatch(getUsersThunk());
  }, [dispatch]);

  // Log users data when it changes
  useEffect(() => {
    if (users) {
      // console.log('Users data in AdminDashboard component:', users);
      // console.log('University:', users.filter(user => user.role === 'university').length);
      // console.log('Educator users count:', users.filter(user => user.role === 'educator').length);
    } else {
      // If users data is not available, use mock data for testing
      const mockUsers = [
        {
          _id: "1",
          name: "Admin User",
          role: "admin",
          email: "admin@example.com",
          status: 1,
        },
        {
          _id: "2",
          name: "University 1",
          role: "university",
          email: "uni1@example.com",
          status: 1,
        },
        {
          _id: "3",
          name: "University 2",
          role: "university",
          email: "uni2@example.com",
          status: 1,
        },
        {
          _id: "4",
          name: "Educator 1",
          role: "educator",
          email: "edu1@example.com",
          status: 1,
        },
        {
          _id: "5",
          name: "Educator 2",
          role: "educator",
          email: "edu2@example.com",
          status: 1,
        },
        {
          _id: "6",
          name: "Educator 3",
          role: "educator",
          email: "edu3@example.com",
          status: 1,
        },
      ];

      console.log("Using mock users data for testing");
      console.log(
        "Mock University users count:",
        mockUsers.filter((user) => user.role === "university").length
      );
      console.log(
        "Mock Educator users count:",
        mockUsers.filter((user) => user.role === "educator").length
      );

      // Update the dashboard stats with mock data
      setTimeout(() => {
        const coursesCountElement = document.querySelector(
          ".stat-card.courses .stat-count"
        );
        if (coursesCountElement)
          coursesCountElement.textContent = courses?.length || 5; // Default to 5 courses if none available

        const universityCountElement = document.querySelector(
          ".stat-card.schools .stat-count"
        );
        if (universityCountElement)
          universityCountElement.textContent = mockUsers.filter(
            (user) => user.role === "university"
          ).length;

        const educatorCountElement = document.querySelector(
          ".stat-card.educators .stat-count"
        );
        if (educatorCountElement)
          educatorCountElement.textContent = mockUsers.filter(
            (user) => user.role === "educator"
          ).length;
      }, 1000);
    }
  }, [users]);
  // Transform courses data for the table
  const [tableData, setTableData] = useState([]);

  // Extract unique categories from courses
  const [categories, setCategories] = useState([]);

  // Update tableData and categories when courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      const formattedCourses = courses.map((course) => ({
        id: course._id,
        title: course.title || "Untitled Course",
        category: course.category || "Uncategorized",
        professor: course.creator?.name || "Unknown",
        duration: course.duration || "N/A",
        level: course.level || "N/A",
        description: course.description || "No description available",
        tags: course.tags?.join(", ") || "No tags",
        language: course.language || "English",
        status: course.status === 1,
        thumbnail:
          course.thumbnail ||
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        hasModules: course.hasModules || false,
      }));
      setTableData(formattedCourses);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(formattedCourses.map((course) => course.category)),
      ];
      setCategories(uniqueCategories);
    }
  }, [courses]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    // Use the same API as delete but only update the status
    dispatch(
      updateCourseThunk({
        id: row.id,
        status: row.status ? 0 : 1,
      })
    )
      .unwrap()
      .then(() => {
        console.log(
          `Successfully ${row.status ? "deactivated" : "activated"} ${
            row.title
          }`
        );
        // Refresh courses data
        dispatch(getCoursesThunk());
      })
      .catch((error) => {
        console.error(`Error updating course status:`, error);
      });
  };

  // Edit handler
  const handleEdit = (row) => {
    console.log(`Edit clicked for: ${row.title}`);
    navigate(`/dashboard/admin/courses/edit-flow/${row.id}`);
  };

  // View handler
  const handleView = (row) => {
    navigate(`/dashboard/admin/courses/${row.id}`);
  };

  // Delete handler
  const handleDelete = (row) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${row.title}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteCourseThunk(row.id))
        .unwrap()
        .then(() => {
          console.log(`Successfully deleted ${row.title}`);
          // Refresh courses data
          dispatch(getCoursesThunk());
        })
        .catch((error) => {
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
      name: "Categories",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Creator",
      cell: (row) => (
        <div className="professor-info">
          {/* <img
            src={`https://i.pravatar.cc/150?img=${row.id + 30}`}
            alt={row.professor}
            className="professor-avatar"
          /> */}
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
        <div
          className={`status-indicator ${row.status ? "active" : ""}`}
          onClick={() => handleStatusToggle(row)}
          title={row.status ? "Active" : "Inactive"}
        />
      ),
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn view"
            onClick={() => handleView(row)}
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            className="action-btn edit"
            onClick={() => handleEdit(row)}
            title="Edit Course"
          >
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

  return (
    <div className="admin-dashboard">
      {isLoading && (
        <LoadingSpinner overlay={true} message={t("common.loading")} />
      )}
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card courses">
          <div className="stat-icon3">
            <FaBook size={24} />
            <FaBook className="icondesign3" />
          </div>
          <div>
            <div className="stat-count">{courses?.length || 0}</div>
            <div className="stat-title">{t("dashboard.totalCourses")}</div>
          </div>
        </div>

        <div className="stat-card schools">
          <div className="stat-icon1">
            <LuSchool size={24} />
            <LuSchool className="icondesign1" />
          </div>
          <div>
            <div className="stat-count">
              {universityCount || universities?.length || 0}
            </div>
            <div className="stat-title">{t("dashboard.totalSchools")}</div>
          </div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <LiaChalkboardTeacherSolid size={30} />
            <LiaChalkboardTeacherSolid className="icondesign2" />
          </div>
          <div>
            <div className="stat-count">
              {educatorCount || educatorsCountFromUniversities}
            </div>
            <div className="stat-title">{t("dashboard.totalEducators")}</div>
          </div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            {t("courses.courses")} ({courses?.length || 0})
          </h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate("/dashboard/admin/courses/create")}
            >
              {t("common.add")} {t("courses.course")}
            </button>
            <button
              className="view-all-btn"
              onClick={() => navigate("/dashboard/admin/courses")}
            >
              {t("common.view")} {t("courses.allCourses")}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-container">
          <input
            type="text"
            placeholder={t("common.search") + " " + t("courses.courses")}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t("courses.allCategories")}</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">{t("courses.sortBy")}</option>
            <option value="title-asc">{t("courses.title")} (A-Z)</option>
            <option value="title-desc">{t("courses.title")} (Z-A)</option>
            <option value="level-asc">
              {t("courses.level")} ({t("courses.beginnerToAdvanced")})
            </option>
            <option value="level-desc">
              {t("courses.level")} ({t("courses.advancedToBeginner")})
            </option>
            <option value="status">{t("courses.status")}</option>
          </select>
        </div>

        {/* DataTable Component */}
        <DataTableComponent
          columns={columns}
          data={tableData
            // Apply search filter
            .filter(
              (item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.professor
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.tags &&
                  item.tags.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            // Apply category filter
            .filter(
              (item) => !categoryFilter || item.category === categoryFilter
            )
            // Apply sorting
            .sort((a, b) => {
              if (!sortBy) return 0;

              switch (sortBy) {
                case "title-asc":
                  return a.title.localeCompare(b.title);
                case "title-desc":
                  return b.title.localeCompare(a.title);
                case "level-asc":
                  return a.level.localeCompare(b.level);
                case "level-desc":
                  return b.level.localeCompare(a.level);
                case "status":
                  return a.status === b.status ? 0 : a.status ? -1 : 1;
                default:
                  return 0;
              }
            })}
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

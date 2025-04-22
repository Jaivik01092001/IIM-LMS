import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";
import { LuSchool } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUniversitiesThunk,
  getCoursesThunk,
  updateCourseThunk,
  deleteCourseThunk
} from "../../redux/admin/adminSlice";
import DataTableComponent from "../../components/DataTable";
import "../../assets/styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { universities, courses, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Count educators across all universities
  const educatorsCount = universities?.reduce((total, university) => {
    return total + (university.educators?.length || 0);
  }, 0) || 0;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getUniversitiesThunk());
    dispatch(getCoursesThunk());
  }, [dispatch]);
  // Transform courses data for the table
  const [tableData, setTableData] = useState([]);

  // Extract unique categories from courses
  const [categories, setCategories] = useState([]);

  // Update tableData and categories when courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      const formattedCourses = courses.map(course => ({
        id: course._id,
        title: course.title || 'Untitled Course',
        category: course.category || 'Uncategorized',
        professor: course.creator?.name || 'Unknown',
        duration: course.duration ? `${course.duration} Hours` : 'N/A',
        rating: course.rating || 4.5,
        status: course.status === 1,
        image: course.banner || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      }));
      setTableData(formattedCourses);

      // Extract unique categories
      const uniqueCategories = [...new Set(formattedCourses.map(course => course.category))];
      setCategories(uniqueCategories);
    }
  }, [courses]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    if (window.confirm(`Are you sure you want to ${row.status ? 'deactivate' : 'activate'} "${row.title}"?`)) {
      dispatch(updateCourseThunk({
        id: row.id,
        status: row.status ? 0 : 1
      }))
        .unwrap()
        .then(() => {
          console.log(`Successfully ${row.status ? 'deactivated' : 'activated'} ${row.title}`);
          // Refresh courses data
          dispatch(getCoursesThunk());
        })
        .catch(error => {
          console.error(`Error updating course status:`, error);
        });
    }
  };

  // Edit handler
  const handleEdit = (row) => {
    console.log(`Edit clicked for: ${row.title}`);
    navigate(`/dashboard/admin/courses/${row.id}/edit`);
  };

  // View handler
  const handleView = (row) => {
    console.log(`View clicked for: ${row.title}`);
    navigate(`/dashboard/admin/courses/${row.id}`);
  };

  // Delete handler
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.title}"? This action cannot be undone.`)) {
      dispatch(deleteCourseThunk(row.id))
        .unwrap()
        .then(() => {
          console.log(`Successfully deleted ${row.title}`);
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
          <img src={row.image} alt={row.title} className="course-thumbnail" />
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
      name: "Professor",
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
      name: "Status",
      cell: (row) => (
        <div
          className={`status-indicator ${row.status ? "active" : ""}`}
          onClick={() => handleStatusToggle(row)}
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
          <button className="action-btn view" onClick={() => handleView(row)}>
            <FaEye />
          </button>
          <button className="action-btn edit" onClick={() => handleEdit(row)}>
            <FaPencilAlt />
          </button>
          <button
            className="action-btn delete"
            onClick={() => handleDelete(row)}
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
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card schools">
          <div className="stat-icon1">
            <LuSchool size={24} />
            <LuSchool className="icondesign1" />
          </div>
          <div className="stat-count">{universities?.length || 0}</div>
          <div className="stat-title">Total Schools</div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <LiaChalkboardTeacherSolid size={24} />
            <LiaChalkboardTeacherSolid className="icondesign2" />
          </div>
          <div className="stat-count">{educatorsCount}</div>
          <div className="stat-title">Total Educators</div>
        </div>

        <div className="stat-card courses">
          <div className="stat-icon3">
            <LiaChalkboardTeacherSolid size={24} />
            <LiaChalkboardTeacherSolid className="icondesign3" />
          </div>
          <div className="stat-count">{courses?.length || 0}</div>
          <div className="stat-title">Total Courses</div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">All Courses ({courses?.length || 0})</h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate("/dashboard/admin/courses/add")}
            >
              Add Course
            </button>
            <button
              className="view-all-btn"
              onClick={() => navigate("/dashboard/admin/courses")}
            >
              View All Courses
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search Courses"
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
            <option value="status">Status</option>
          </select>
        </div>

        {/* DataTable Component */}
        <DataTableComponent
          columns={columns}
          data={tableData
            // Apply search filter
            .filter(item =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.professor.toLowerCase().includes(searchTerm.toLowerCase())
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
                case "status": return a.status === b.status ? 0 : a.status ? -1 : 1;
                default: return 0;
              }
            })
          }
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

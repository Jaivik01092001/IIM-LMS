import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPencilAlt, FaTrashAlt, FaEye } from 'react-icons/fa';
import { getEducatorsThunk, updateEducatorThunk, deleteEducatorThunk } from '../../redux/university/universitySlice';
import { getCoursesThunk, updateCourseThunk, deleteCourseThunk, getUsersThunk } from '../../redux/admin/adminSlice';
import DataTableComponent from '../../components/DataTable';
import '../../assets/styles/Courses.css';
import '../../assets/styles/SchoolDashboard.css';

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { educators, loading: educatorsLoading } = useSelector((state) => state.university);
  const { courses, loading: coursesLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  // Update loading state when Redux loading states change
  useEffect(() => {
    setIsLoading(educatorsLoading || coursesLoading);
  }, [educatorsLoading, coursesLoading]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getEducatorsThunk());
    dispatch(getCoursesThunk());
    dispatch(getUsersThunk());
  }, [dispatch]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Transform courses data for the table
  const [courseTableData, setCourseTableData] = useState([]);
  const [educatorTableData, setEducatorTableData] = useState([]);

  // Extract unique categories from courses
  const [categories, setCategories] = useState([]);

  // Update courseTableData and categories when courses change
  useEffect(() => {
    if (courses && courses.length > 0 && user) {
      // Filter courses to only show those created by the current university
      const schoolCourses = courses.filter(course => {
        // Check if the course creator is the current user or an educator from this university
        return course.creator?._id === user.id ||
               (course.creator?.university && course.creator.university === user.id);
      });

      const formattedCourses = schoolCourses.map(course => ({
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
        hasModules: course.hasModules || false
      }));
      setCourseTableData(formattedCourses);

      // Extract unique categories
      const uniqueCategories = [...new Set(formattedCourses.map(course => course.category))];
      setCategories(uniqueCategories);
    }
  }, [courses, user]);

  // Update educatorTableData when educators change
  useEffect(() => {
    if (educators && educators.length > 0 && user) {
      // Filter educators to only show those belonging to the current university
      const universityEducators = educators.filter(educator => {
        return educator.university === user.id;
      });

      const formattedEducators = universityEducators.map((educator, index) => ({
        id: educator._id,
        professor: educator.name || 'Unknown',
        school: user?.name || 'N/A',
        category: 'University',
        avatar: educator.avatar || `https://randomuser.me/api/portraits/men/${(index % 30) + 1}.jpg`,
        mobile: educator.phoneNumber || 'N/A',
        status: educator.status === 1,
        email: educator.email || 'N/A',
        address: educator.profile?.address || 'N/A',
        zipcode: educator.profile?.zipcode || 'N/A',
        state: educator.profile?.state || 'N/A',
      }));

      setEducatorTableData(formattedEducators);
    }
  }, [educators, user]);

  // Course status toggle handler
  const handleCourseStatusToggle = (row) => {
    if (window.confirm(`Are you sure you want to ${row.status ? 'deactivate' : 'activate'} "${row.title}"?`)) {
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
    }
  };

  // Educator status toggle handler
  const handleEducatorStatusToggle = (row) => {
    if (window.confirm(`Are you sure you want to ${row.status ? 'deactivate' : 'activate'} "${row.professor}"?`)) {
      dispatch(updateEducatorThunk({
        id: row.id,
        status: row.status ? 0 : 1
      }))
        .unwrap()
        .then(() => {
          // Refresh educators data
          dispatch(getEducatorsThunk());
        })
        .catch(error => {
          console.error(`Error updating educator status:`, error);
        });
    }
  };

  // Course view handler
  const handleCourseView = (row) => {
    navigate(`/dashboard/school/courses/${row.id}`);
  };

  // Course edit handler
  const handleCourseEdit = (row) => {
    navigate(`/dashboard/school/courses/edit/${row.id}`);
  };

  // Course delete handler
  const handleCourseDelete = (row) => {
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

  // Educator view handler
  const handleEducatorView = (row) => {
    navigate("/dashboard/school/educator-details", {
      state: {
        educator: {
          ...row,
          id: row.id
        }
      }
    });
  };

  // Educator edit handler
  const handleEducatorEdit = (row) => {
    navigate("/dashboard/school/educator-account-form", {
      state: { educator: row },
    });
  };

  // Educator delete handler
  const handleEducatorDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.professor}"? This action cannot be undone.`)) {
      dispatch(deleteEducatorThunk(row.id))
        .unwrap()
        .then(() => {
          // Refresh educators data
          dispatch(getEducatorsThunk());
        })
        .catch(error => {
          console.error(`Error deleting educator:`, error);
        });
    }
  };

  // Course table columns configuration
  const courseColumns = [
    {
      name: "Course Title",
      cell: (row) => (
        <div className="course-info">
          <img src={row.thumbnail} alt={row.title} className="course-thumbnail" />
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
          onClick={() => handleCourseStatusToggle(row)}
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
          <button className="action-btn view" onClick={() => handleCourseView(row)} title="View Details">
            <FaEye />
          </button>
          <button className="action-btn edit" onClick={() => handleCourseEdit(row)} title="Edit Course">
            <FaPencilAlt />
          </button>
          <button
            className="action-btn delete"
            onClick={() => handleCourseDelete(row)}
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

  // Educator table columns configuration
  const educatorColumns = [
    {
      name: "No.",
      selector: (_, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: "Professors",
      cell: (row) => (
        <div className="professor-cell">
          <img src={row.avatar} alt="Professor" className="professor-avatar" />
          <span>{row.professor}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "School/University",
      selector: (row) => row.school,
      sortable: true,
    },
    {
      name: "Categories",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Mobile No.",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div
          className={`status-indicator ${row.status ? "active" : ""}`}
          onClick={() => handleEducatorStatusToggle(row)}
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
          <button className="action-btn view" onClick={() => handleEducatorView(row)} title="View Details">
            <FaEye />
          </button>
          <button className="action-btn edit" onClick={() => handleEducatorEdit(row)} title="Edit Educator">
            <FaPencilAlt />
          </button>
          <button className="action-btn delete" onClick={() => handleEducatorDelete(row)} title="Delete Educator">
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "150px",
      center: true,
    },
  ];

  return (
    <div className="courses-container admin-dashboard">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Our Courses ({courseTableData.length || 0})</h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate("/dashboard/school/courses/add")}
            >
              Add Course
            </button>
            <button
              className="view-all-btn"
              onClick={() => navigate("/dashboard/school/courses")}
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

        <div className="table-responsive">
          <DataTableComponent
            columns={courseColumns}
            data={courseTableData
              // Apply search filter
              .filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              })
            }
            showSearch={false}
          />
        </div>
      </div>

      {/* Educators Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Our Educators ({educatorTableData.length || 0})</h2>
          <div className="header-actions">
            <button
              className="add-educator-btn"
              onClick={() => navigate("/dashboard/school/educator-account-form")}
            >
              Add Educator
            </button>
            <button
              className="view-all-btn"
              onClick={() => navigate("/dashboard/school/educators")}
            >
              View All Educators
            </button>
          </div>
        </div>

        <DataTableComponent
          columns={educatorColumns}
          data={educatorTableData}
          title="Educator List"
          showSearch={true}
          searchPlaceholder="Search educators..."
          pagination={true}
        />
      </div>
    </div>
  );
};

export default SchoolDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPencilAlt, FaEye, FaUserTie, FaBook, FaChalkboardTeacher, FaClock } from 'react-icons/fa';
import { IoBookOutline } from 'react-icons/io5';
import { getEducatorsThunk, updateEducatorThunk, deleteEducatorThunk } from '../../redux/university/universitySlice';
import { getMyCoursesThunk } from '../../redux/educator/educatorSlice';
import { getCoursesThunk, updateCourseThunk, deleteCourseThunk, getUsersThunk } from '../../redux/admin/adminSlice';
import DataTableComponent from '../../components/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusToggle from '../../components/common/StatusToggle';
import ActionButtons from '../../components/common/ActionButtons';
import '../../assets/styles/Courses.css';
import '../../assets/styles/SchoolDashboard.css';
const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [educatorSearchTerm, setEducatorSearchTerm] = useState("");
  const [ongoingCoursesSearchTerm, setOngoingCoursesSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { educators, loading: educatorsLoading } = useSelector((state) => state.university);
  const { courses, loading: coursesLoading } = useSelector((state) => state.admin);
  const { myCourses, loading: myCoursesLoading } = useSelector((state) => state.educator);
  const { user } = useSelector((state) => state.auth);

  // Update loading state when Redux loading states change
  useEffect(() => {
    setIsLoading(educatorsLoading || coursesLoading || myCoursesLoading);
  }, [educatorsLoading, coursesLoading, myCoursesLoading]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getEducatorsThunk());
    dispatch(getCoursesThunk());
    dispatch(getMyCoursesThunk());
    // Only fetch users data if the user has permission to view users
    if (user?.permissions?.view_users) {
      dispatch(getUsersThunk());
    }
  }, [dispatch, user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Transform courses data for the table
  const [courseTableData, setCourseTableData] = useState([]);
  const [educatorTableData, setEducatorTableData] = useState([]);
  const [ongoingCourses, setOngoingCourses] = useState([]);

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

      // Format educators data for display
      const formattedEducators = universityEducators.map((educator, index) => {
        // Get university name from populated university field or use current user's name
        let universityName = user?.name || 'N/A';
        let universityCategory = 'University';

        // First try to get from populated university field
        if (educator.university && typeof educator.university === 'object') {
          universityName = educator.university.name || user?.name || 'N/A';
          universityCategory = educator.university.category || 'University';
        }

        // Use schoolName from profile if available, otherwise use university name
        const schoolName = educator.profile?.schoolName || universityName;

        return {
          id: educator._id,
          professor: educator.name || 'Unknown',
          school: schoolName,
          category: educator.profile?.category || universityCategory,
          avatar: educator.avatar || `https://randomuser.me/api/portraits/men/${(index % 30) + 1}.jpg`,
          mobile: educator.phoneNumber || 'N/A',
          status: educator.status === 1,
          email: educator.email || 'N/A',
          address: educator.profile?.address || 'N/A',
          zipcode: educator.profile?.zipcode || 'N/A',
          state: educator.profile?.state || 'N/A'
        };
      });

      setEducatorTableData(formattedEducators);
    }
  }, [educators, user]);

  // Process myCourses data for ongoing courses
  useEffect(() => {
    if (myCourses && myCourses.length > 0) {
      // Format the ongoing courses data
      const formattedOngoingCourses = myCourses
        .filter(course => {
          // Check if the course has enrolled users with in_progress status
          return course.enrolledUsers && course.enrolledUsers.some(
            enrollment => enrollment.status === "in_progress"
          );
        })
        .map(course => {
          // Get only the in_progress enrollments
          const ongoingEnrollments = course.enrolledUsers.filter(
            enrollment => enrollment.status === "in_progress"
          );

          return {
            id: course._id,
            title: course.title || "Untitled Course",
            description: course.description || "No description available",
            thumbnail: course.thumbnail || "",
            creator: {
              id: course.creator?._id || "",
              name: course.creator?.name || "Unknown",
              avatar: course.creator?.profile?.avatar || ""
            },
            enrolledCount: ongoingEnrollments.length,
            enrolledUsers: ongoingEnrollments.map(enrollment => {
              const user = typeof enrollment.user === 'object'
                ? enrollment.user
                : { _id: enrollment.user, name: "Unknown", email: "" };

              return {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.profile?.avatar || "",
                progress: enrollment.progress || 0,
                enrolledAt: enrollment.enrolledAt || new Date()
              };
            })
          };
        });

      setOngoingCourses(formattedOngoingCourses);
    } else {
      setOngoingCourses([]);
    }
  }, [myCourses]);

  // Course status toggle handler
  const handleCourseStatusToggle = (row) => {
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

  // Educator status toggle handler
  const handleEducatorStatusToggle = (row) => {
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
        <StatusToggle
          status={row.status}
          onToggle={() => handleCourseStatusToggle(row)}
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
          onView={handleCourseView}
          onEdit={handleCourseEdit}
          viewPermission="view_courses"
          editPermission="edit_course"
        />
      ),
      width: "150px",
      center: true,
    },
  ];

  // Handle ongoing course view
  const handleOngoingCourseView = (row) => {
    navigate(`/dashboard/school/courses/${row.id}`);
  };

  // Ongoing courses table columns configuration
  const ongoingCoursesColumns = [
    {
      name: "Course",
      cell: (row) => (
        <div className="course-info">
          <img
            src={VITE_IMAGE_URL + row.thumbnail}
            alt={row.title}
            className="course-thumbnail"
          />
          <div className="course-details">
            <span className="course-title">{row.title}</span>
            <span className="course-description">{row.description?.substring(0, 50)}...</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Instructor",
      cell: (row) => (
        <div className="professor-info">
          <img
            src={row.creator?.avatar ? VITE_IMAGE_URL + row.creator.avatar : `https://i.pravatar.cc/150?img=${row.id + 30}`}
            alt={row.creator?.name || "Unknown"}
            className="professor-avatar"
          />
          <span>{row.creator?.name || "Unknown"}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Enrolled Students",
      selector: (row) => row.enrolledCount || 0,
      sortable: true,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="action-btn view"
          onClick={() => handleOngoingCourseView(row)}
          title="View Course"
        >
          <FaEye />
        </button>
      ),
      width: "100px",
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
        <StatusToggle
          status={row.status}
          onToggle={() => handleEducatorStatusToggle(row)}
          permission="delete_educator"
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
          onView={handleEducatorView}
          onEdit={handleEducatorEdit}
          viewPermission="view_educators"
          editPermission="edit_educator"
        />
      ),
      width: "150px",
      center: true,
    },
  ];

  return (
    <div className="courses-container admin-dashboard">
      {isLoading && <LoadingSpinner overlay={true} message="Loading dashboard data..." />}

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card courses">
          <div className="stat-icon3">
            <FaBook size={24} />
          </div>
          <div className="stat-count">{courseTableData.length || 0}</div>
          <div className="stat-title">Our Courses</div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <FaChalkboardTeacher size={24} />
          </div>
          <div className="stat-count">{educatorTableData.length || 0}</div>
          <div className="stat-title">Our Educators</div>
        </div>

        <div className="stat-card ongoing">
          <div className="stat-icon1">
            <FaClock size={24} />
          </div>
          <div className="stat-count">{ongoingCourses?.length || 0}</div>
          <div className="stat-title">Ongoing Courses</div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Our Courses ({courseTableData.length || 0})</h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate("/dashboard/school/courses/create")}
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
              className="add-course-btn"
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

        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search educators..."
            className="search-input"
            value={educatorSearchTerm}
            onChange={(e) => setEducatorSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <DataTableComponent
            columns={educatorColumns}
            data={educatorTableData
              // Apply search filter
              .filter(item =>
                item.professor.toLowerCase().includes(educatorSearchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(educatorSearchTerm.toLowerCase()) ||
                item.mobile?.toLowerCase().includes(educatorSearchTerm.toLowerCase())
              )
            }
            showSearch={false}
            pagination={true}
          />
        </div>
      </div>

      {/* Ongoing Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Ongoing Courses ({ongoingCourses?.length || 0})</h2>
          <div className="header-actions">
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
            placeholder="Search ongoing courses..."
            className="search-input"
            value={ongoingCoursesSearchTerm}
            onChange={(e) => setOngoingCoursesSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          {ongoingCourses?.length > 0 ? (
            <DataTableComponent
              columns={ongoingCoursesColumns}
              data={ongoingCourses
                // Apply search filter
                .filter(item =>
                  item.title?.toLowerCase().includes(ongoingCoursesSearchTerm.toLowerCase()) ||
                  item.description?.toLowerCase().includes(ongoingCoursesSearchTerm.toLowerCase()) ||
                  item.creator?.name?.toLowerCase().includes(ongoingCoursesSearchTerm.toLowerCase())
                )
              }
              showSearch={false}
              pagination={true}
            />
          ) : (
            <div className="empty-courses">
              <div className="empty-message">
                <FaClock className="empty-icon" />
                <h3>No ongoing courses</h3>
                <p>There are no courses currently in progress.</p>
                <p>Create courses and encourage students to enroll to see ongoing courses here.</p>
                <button
                  className="browse-courses-btn"
                  onClick={() => navigate("/dashboard/school/courses/create")}
                >
                  Create a Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
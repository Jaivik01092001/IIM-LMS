import React, { useState } from "react";
import {
  FaBook,
  FaUserGraduate,
  FaClock,
  FaStar,
  FaSearch,
  FaPencilAlt,
  FaTrashAlt,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DataTableComponent from "../components/DataTable";
import "../assets/styles/Courses.css";

const Courses = ({ userType }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([
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
      status: true,
      createdAt: "2023-10-15",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 2,
      title: "Introduction to Python Programming",
      category: "Programming",
      language: "English",
      description: "Learn Python programming from scratch with hands-on exercises and real-world projects to build a solid foundation in coding.",
      instructor: "Emma Watson",
      lessons: 36,
      students: 124,
      duration: "28:30 hrs",
      rating: 4.8,
      status: true,
      createdAt: "2023-09-28",
      image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80"
    },
    {
      id: 3,
      title: "Digital Marketing Fundamentals",
      category: "Marketing",
      language: "English",
      description: "Discover essential digital marketing strategies including SEO, social media, email marketing, and analytics to grow your online presence.",
      instructor: "John Doe",
      lessons: 18,
      students: 95,
      duration: "15:45 hrs",
      rating: 4.7,
      status: false,
      createdAt: "2023-11-05",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a70d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 4,
      title: "UI/UX Design Principles",
      category: "Design",
      language: "English",
      description: "Master the principles of user interface and user experience design to create intuitive, engaging, and user-friendly digital products.",
      instructor: "Sarah Johnson",
      lessons: 22,
      students: 78,
      duration: "18:20 hrs",
      rating: 4.9,
      status: true,
      createdAt: "2023-10-20",
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 5,
      title: "Financial Planning and Investment",
      category: "Finance",
      language: "English",
      description: "Learn how to create a solid financial plan, understand investment options, and build wealth through strategic financial management.",
      instructor: "Michael Brown",
      lessons: 30,
      students: 65,
      duration: "25:15 hrs",
      rating: 4.6,
      status: true,
      createdAt: "2023-09-15",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80"
    },
    {
      id: 6,
      title: "Advanced JavaScript Development",
      category: "Programming",
      language: "English",
      description: "Take your JavaScript skills to the next level with advanced concepts, frameworks, and modern development practices.",
      instructor: "David Miller",
      lessons: 40,
      students: 112,
      duration: "32:40 hrs",
      rating: 4.8,
      status: false,
      createdAt: "2023-08-30",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80"
    },
    {
      id: 7,
      title: "Content Creation Masterclass",
      category: "Marketing",
      language: "English",
      description: "Learn to create compelling content across various platforms to engage audiences and drive conversions for your brand.",
      instructor: "Jennifer Lee",
      lessons: 25,
      students: 89,
      duration: "21:30 hrs",
      rating: 4.7,
      status: true,
      createdAt: "2023-11-10",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 8,
      title: "Data Science Essentials",
      category: "Data Science",
      language: "English",
      description: "Explore the fundamentals of data science including data analysis, visualization, machine learning, and statistical modeling.",
      instructor: "Robert Chen",
      lessons: 32,
      students: 105,
      duration: "27:15 hrs",
      rating: 4.9,
      status: true,
      createdAt: "2023-10-05",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 9,
      title: "Leadership and Management Skills",
      category: "Management",
      language: "English",
      description: "Develop essential leadership and management skills to effectively lead teams, manage projects, and drive organizational success.",
      instructor: "Amanda Wilson",
      lessons: 28,
      students: 72,
      duration: "23:45 hrs",
      rating: 4.8,
      status: false,
      createdAt: "2023-09-20",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 10,
      title: "Graphic Design for Beginners",
      category: "Design",
      language: "Hindi",
      description: "Start your graphic design journey with this comprehensive course covering design principles, tools, and practical techniques.",
      instructor: "Rajesh Kumar",
      lessons: 20,
      students: 68,
      duration: "16:30 hrs",
      rating: 4.6,
      status: true,
      createdAt: "2023-11-15",
      image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
  ]);

  // Handle status toggle
  const handleStatusToggle = (row) => {
    const updatedData = tableData.map((item) =>
      item.id === row.id ? { ...item, status: !item.status } : item
    );
    setTableData(updatedData);
  };

  // Handle view course details
  const handleView = (row) => {
    navigate(`/dashboard/${userType}/courses/${row.id}`);
  };

  // Handle edit course
  const handleEdit = (row) => {
    navigate(`/dashboard/${userType}/courses/edit/${row.id}`);
  };

  // Handle delete course
  const handleDelete = (row) => {
    const updatedData = tableData.filter((item) => item.id !== row.id);
    setTableData(updatedData);
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
            alt={row.instructor}
            className="professor-avatar"
          />
          <span>{row.instructor}</span>
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
    <div className="courses-container admin-dashboard">
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card schools">
          <div className="stat-icon1">
            <FaBook size={24} />
            <FaBook className="icondesign1" />
          </div>
          <div className="stat-count">{tableData.length}</div>
          <div className="stat-title">Total Courses</div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <FaUserGraduate size={24} />
            <FaUserGraduate className="icondesign2" />
          </div>
          <div className="stat-count">100</div>
          <div className="stat-title">Total Students</div>
        </div>

        <div className="stat-card courses">
          <div className="stat-icon3">
            <FaClock size={24} />
            <FaClock className="icondesign3" />
          </div>
          <div className="stat-count">8</div>
          <div className="stat-title">Hours of Content</div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">All Courses ({tableData.length})</h2>
          <div className="header-actions">
            <button
              className="add-course-btn"
              onClick={() => navigate(`/dashboard/${userType}/courses/add`)}
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

          <select className="filter-select">
            <option>Select Category</option>
            <option>Management</option>
            <option>Programming</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>

          <select className="filter-select">
            <option>Select Language</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
          </select>

          <select className="filter-select">
            <option>Sort By</option>
            <option>Newest</option>
            <option>Most Popular</option>
            <option>Highest Rated</option>
          </select>
        </div>

        <div className="table-responsive">
          <DataTableComponent
            columns={columns}
            data={tableData}
            showSearch={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Courses;

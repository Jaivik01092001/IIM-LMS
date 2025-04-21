import React, { useState } from "react";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";
import { LuSchool } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import DataTableComponent from "../../components/DataTable";
import "../../assets/styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([
    {
      id: 1,
      title: "Effective Time Management",
      category: "Management",
      professor: "Charlie Rawal",
      duration: "20:00 Hours",
      rating: 4.8,
      status: true,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
    {
      id: 2,
      title: "Python Programming Basics",
      category: "Technology",
      professor: "David Miller",
      duration: "25:00 Hours",
      rating: 4.7,
      status: false,
      image:
        "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      category: "Marketing",
      professor: "Sarah Wilson",
      duration: "18:00 Hours",
      rating: 4.9,
      status: true,
      image:
        "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
  ]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    const updatedData = tableData.map((item) =>
      item.id === row.id ? { ...item, status: !item.status } : item
    );
    setTableData(updatedData);
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
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card schools">
          <div className="stat-icon1">
            <LuSchool size={24} />
            <LuSchool className="icondesign1" />
          </div>
          <div className="stat-count">20</div>
          <div className="stat-title">Total Organizers</div>
        </div>

        <div className="stat-card educators">
          <div className="stat-icon2">
            <LiaChalkboardTeacherSolid size={24} />
            <LiaChalkboardTeacherSolid className="icondesign2" />
          </div>
          <div className="stat-count">100</div>
          <div className="stat-title">Total Professors</div>
        </div>

        <div className="stat-card courses">
          <div className="stat-icon3">
            <LiaChalkboardTeacherSolid size={24} />
            <LiaChalkboardTeacherSolid className="icondesign3" />
          </div>
          <div className="stat-count">8</div>
          <div className="stat-title">Total Courses</div>
        </div>
      </div>

      {/* Courses Table Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">All Courses (8)</h2>
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
          <select className="filter-select">
            <option value="">Select Category</option>
            <option value="management">Management</option>
            <option value="technology">Technology</option>
            <option value="marketing">Marketing</option>
          </select>
          <select className="filter-select">
            <option value="">Sort by</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* DataTable Component */}
        <DataTableComponent
          columns={columns}
          data={tableData}
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

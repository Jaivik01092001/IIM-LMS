import React, { useState } from "react";
import DataTableComponent from "../components/DataTable";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import "../assets/styles/Educators.css";

const Educators = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      professor: "Jackson Christian",
      school: "Udgam School for Children",
      category: "CBSE school",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      mobile: "+91 9587543210",
      status: false,
    },
    {
      id: 2,
      professor: "Smita Agrawal",
      school: "Greenwood High",
      category: "International school",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      mobile: "+91 9876543210",
      status: true,
    },
    {
      id: 3,
      professor: "John Doe",
      school: "Delhi Public School",
      category: "CBSE school",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      mobile: "+91 9123456780",
      status: true,
    },
    {
      id: 4,
      professor: "Mark Zuckerberg",
      school: "Stanford University",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      mobile: "+91 9988776655",
      status: false,
    },
    {
      id: 5,
      professor: "Bill Gates",
      school: "Harvard University",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      mobile: "+91 9876543211",
      status: true,
    },
    {
      id: 6,
      professor: "Elon Musk",
      school: "MIT",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      mobile: "+91 9876543212",
      status: true,
    },
    {
      id: 7,
      professor: "Tim Cook",
      school: "Oxford University",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      mobile: "+91 9876543213",
      status: false,
    },
    {
      id: 8,
      professor: "Sundar Pichai",
      school: "Cambridge University",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
      mobile: "+91 9876543214",
      status: true,
    },
    {
      id: 9,
      professor: "Satya Nadella",
      school: "IIT Bombay",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      mobile: "+91 9876543215",
      status: false,
    },
    {
      id: 10,
      professor: "Jeff Bezos",
      school: "IIT Delhi",
      category: "University",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      mobile: "+91 9876543216",
      status: true,
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
    console.log(`Edit clicked for: ${row.professor}`);
    // Here you would implement edit functionality
  };

  // Delete handler
  const handleDelete = (row) => {
    const updatedData = tableData.filter((item) => item.id !== row.id);
    setTableData(updatedData);
  };

  // Table columns configuration
  const columns = [
    {
      name: "No.",
      selector: (row) => row.id,
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
          <button
            className="action-button edit"
            onClick={() => handleEdit(row)}
          >
            <FaPencilAlt />
          </button>
          <button
            className="action-button delete"
            onClick={() => handleDelete(row)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "100px",
      center: true,
    },
  ];

  return (
    <div className="educators-container">
      <div className="educators-header">
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search Educators"
            className="search-input"
          />

          <select className="filter-select">
            <option>Select Category</option>
            <option>CBSE school</option>
            <option>International school</option>
            <option>University</option>
          </select>
          <select className="filter-select">
            <option>Sort by</option>
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
            <option>Status</option>
          </select>

          <button className="create-account-btn">Create Account</button>
        </div>
      </div>

      <DataTableComponent
        columns={columns}
        data={tableData}
        showSearch={false}
      />
    </div>
  );
};

export default Educators;

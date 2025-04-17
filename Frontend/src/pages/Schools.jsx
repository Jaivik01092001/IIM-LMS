import React, { useState } from 'react';
import DataTableComponent from '../components/DataTable';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import "../assets/styles/Schools.css";

const Schools = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      school: 'Udgam School for Children',
      category: 'CBSE school',
      owner: 'Charlie Rawal',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      mobile: '+91 9587543210',
      status: false,
    },
    {
      id: 2,
      school: 'Greenwood High',
      category: 'International school',
      owner: 'Emma Watson',
      ownerAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      mobile: '+91 9876543210',
      status: true,
    },
    {
      id: 3,
      school: 'Delhi Public School',
      category: 'CBSE school',
      owner: 'John Doe',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      mobile: '+91 9123456780',
      status: true,
    },
    {
      id: 4,
      school: 'Stanford University',
      category: 'University',
      owner: 'Mark Zuckerberg',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      mobile: '+91 9988776655',
      status: false,
    },
    {
      id: 5,
      school: 'Harvard University',
      category: 'University',
      owner: 'Bill Gates',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      mobile: '+91 9876543211',
      status: true,
    },
    {
      id: 6,
      school: 'MIT',
      category: 'University',
      owner: 'Elon Musk',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      mobile: '+91 9876543212',
      status: true,
    },
    {
      id: 7,
      school: 'Oxford University',
      category: 'University',
      owner: 'Tim Cook',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      mobile: '+91 9876543213',
      status: false,
    },
    {
      id: 8,
      school: 'Cambridge University',
      category: 'University',
      owner: 'Sundar Pichai',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/8.jpg',
      mobile: '+91 9876543214',
      status: true,
    },
    {
      id: 9,
      school: 'IIT Bombay',
      category: 'University',
      owner: 'Satya Nadella',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/9.jpg',
      mobile: '+91 9876543215',
      status: false,
    },
    {
      id: 10,
      school: 'IIT Delhi',
      category: 'University',
      owner: 'Jeff Bezos',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/10.jpg',
      mobile: '+91 9876543216',
      status: true,
    },
    {
      id: 11,
      school: 'IIT Madras',
      category: 'University',
      owner: 'Warren Buffet',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/11.jpg',
      mobile: '+91 9876543217',
      status: false,
    },
    {
      id: 12,
      school: 'IIT Kanpur',
      category: 'University',
      owner: 'Larry Page',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      mobile: '+91 9876543218',
      status: true,
    },
    {
      id: 13,
      school: 'IIT Kharagpur',
      category: 'University',
      owner: 'Sergey Brin',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/13.jpg',
      mobile: '+91 9876543219',
      status: false,
    },
    {
      id: 14,
      school: 'IIT Roorkee',
      category: 'University',
      owner: 'Jack Ma',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/14.jpg',
      mobile: '+91 9876543220',
      status: true,
    },
    {
      id: 15,
      school: 'IIT Guwahati',
      category: 'University',
      owner: 'Masayoshi Son',
      ownerAvatar: 'https://randomuser.me/api/portraits/men/15.jpg',
      mobile: '+91 9876543221',
      status: false,
    }
  ]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    const updatedData = tableData.map(item => 
      item.id === row.id ? { ...item, status: !item.status } : item
    );
    setTableData(updatedData);
  };

  // Edit handler
  const handleEdit = (row) => {
    console.log(`Edit clicked for: ${row.school}`);
    // Here you would implement edit functionality
  };

  // Delete handler
  const handleDelete = (row) => {
    const updatedData = tableData.filter(item => item.id !== row.id);
    setTableData(updatedData);
  };

  // Table columns configuration
  const columns = [
    {
      name: 'No.',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'School/University',
      selector: row => row.school,
      sortable: true,
    },
    {
      name: 'Categories',
      selector: row => row.category,
      sortable: true,
    },
    {
      name: 'Owner',
      cell: row => (
        <div className="owner-cell">
          <img src={row.ownerAvatar} alt="Owner" className="owner-avatar" />
          <span>{row.owner}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Mobile No.',
      selector: row => row.mobile,
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        <div 
          className={`status-indicator ${row.status ? 'active' : ''}`}
          onClick={() => handleStatusToggle(row)}
        />
      ),
      sortable: true,
      width: '100px',
      center: true,
    },
    {
      name: 'Action',
      cell: row => (
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
      width: '100px',
      center: true,
    },
  ];

  return (
    <div className="schools-container">
      <div className="schools-header">
        <div className="search-filter-container">
          <input 
            type="text" 
            placeholder="Search Educators" 
            className="search-input" 
          />
          <div className="filters">
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
          </div>
        </div>
        <button className="create-account-btn">Create Account</button>
      </div>
      
      <DataTableComponent 
        columns={columns} 
        data={tableData}
        showSearch={false}
      />
    </div>
  );
};

export default Schools;
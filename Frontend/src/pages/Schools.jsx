import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  getUniversitiesThunk, 
  deleteUniversityThunk 
} from "../redux/admin/adminSlice";
import DataTableComponent from "../components/DataTable";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa";
import "../assets/styles/Schools.css";

const Schools = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { universities, loading } = useSelector((state) => state.admin);
  
  // Local state
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    sortBy: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getUniversitiesThunk());
  }, [dispatch]);

  // Transform API data to table format
  useEffect(() => {
    if (!universities?.length) return;
    
    const formattedData = universities.map((uni, index) => ({
      id: uni._id || index + 1,
      school: uni.name || "N/A",
      category: "University",
      owner: uni.creator?.name || "N/A",
      ownerAvatar: uni.creator?.profile?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
      mobile: uni.creator?.phoneNumber || "N/A",
      status: true,
      educators: uni.educators || []
    }));
    
    setTableData(formattedData);
  }, [universities]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Status toggle handler
  const handleStatusToggle = (row) => {
    // We'll handle this in a future implementation
    setTableData(tableData.map(item => 
      item.id === row.id ? { ...item, status: !item.status } : item
    ));
  };

  // Row action handlers
  const handleView = (row) => {
    navigate("/dashboard/admin/school-details", { state: { school: row } });
  };

  const handleEdit = (row) => {
    // Store the school data in localStorage instead of router state
    localStorage.setItem('editSchool', JSON.stringify(row));
    navigate("/dashboard/admin/school-account-form");
  };

  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.school}"?`)) {
      const id = row.id;
      dispatch(deleteUniversityThunk(id))
        .unwrap()
        .then(() => {
          // Only update local state if API call succeeded
          setTableData(tableData.filter(item => item.id !== row.id));
        })
        .catch(error => {
          console.error("Error deleting university:", error);
        });
    }
  };

  // Handle create new school/university
  const handleCreateAccount = () => {
    // Clear any existing school data
    localStorage.removeItem('editSchool');
    navigate("/dashboard/admin/school-account-form");
  };

  // Apply filters and sorting
  const getFilteredData = () => {
    const { searchTerm, category, sortBy } = filters;
    
    return tableData
      .filter(item => 
        // Apply search filter
        !searchTerm || item.school.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item => 
        // Apply category filter
        !category || item.category === category
      )
      .sort((a, b) => {
        // Apply sorting
        if (!sortBy) return 0;
        
        switch (sortBy) {
          case "Name (A-Z)": return a.school.localeCompare(b.school);
          case "Name (Z-A)": return b.school.localeCompare(a.school);
          case "Status": return a.status === b.status ? 0 : a.status ? -1 : 1;
          default: return 0;
        }
      });
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
      name: "Owner",
      cell: (row) => (
        <div className="owner-cell">
          <img src={row.ownerAvatar} alt="Owner" className="owner-avatar" />
          <span>{row.owner}</span>
        </div>
      ),
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
          <button className="action-button view" onClick={() => handleView(row)}>
            <FaEye />
          </button>
          <button className="action-button edit" onClick={() => handleEdit(row)}>
            <FaPencilAlt />
          </button>
          <button className="action-button delete" onClick={() => handleDelete(row)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "150px",
      center: true,
    },
  ];

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="schools-container">
      <div className="schools-header">
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search Educators"
            className="search-input"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />

          <select 
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="CBSE school">CBSE school</option>
            <option value="International school">International school</option>
            <option value="University">University</option>
          </select>
          
          <select 
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="Name (A-Z)">Name (A-Z)</option>
            <option value="Name (Z-A)">Name (Z-A)</option>
            <option value="Status">Status</option>
          </select>

          <button
            className="create-account-btn"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <DataTableComponent
          columns={columns}
          data={getFilteredData()}
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default Schools;

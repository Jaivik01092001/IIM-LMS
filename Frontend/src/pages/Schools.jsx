import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUniversitiesThunk,
  deleteUniversityThunk,
  updateUniversityThunk
} from "../redux/admin/adminSlice";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
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
    status: "", // Add status filter
    sortBy: ""
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getUniversitiesThunk());
  }, [dispatch]);

  // Transform API data to table format
  useEffect(() => {
    if (!universities?.length) return;

    const formattedData = universities.map((uni) => ({
      id: uni._id,
      school: uni.name || "N/A",
      category: "University",
      owner: uni.contactPerson || "N/A",
      email: uni.email || "N/A",
      mobile: uni.phone || "N/A",
      ownerAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
      status: uni.status === 1,
      address: uni.address || "N/A",
      zipcode: uni.zipcode || "N/A",
      state: uni.state || "N/A",
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
    const newStatus = row.status ? 0 : 1;
    const statusText = newStatus === 1 ? "activate" : "deactivate";

    console.log(`Toggling status for ${row.school} to ${newStatus}`);

    dispatch(updateUniversityThunk({
      id: row.id,
      status: newStatus
    }))
      .unwrap()
      .then(() => {
        console.log(`Successfully ${statusText}d ${row.school}`);
        // Get fresh data from the server to ensure state is in sync with backend
        dispatch(getUniversitiesThunk());
      })
      .catch(error => {
        console.error(`Error ${statusText}ing university:`, error);
      });
  };

  // Row action handlers
  const handleView = (row) => {
    navigate(`/dashboard/admin/school-details/${row.id}`);
  };

  const handleEdit = (row) => {
    // Pass the ID via router params instead of using localStorage
    navigate(`/dashboard/admin/school-account-form/${row.id}`);
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
    // Navigate to create form without an ID
    navigate("/dashboard/admin/school-account-form");
  };

  // Apply filters and sorting
  const getFilteredData = () => {
    const { searchTerm, category, status, sortBy } = filters;

    return tableData
      .filter(item =>
        // Apply search filter
        !searchTerm || item.school.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item =>
        // Apply category filter
        !category || item.category === category
      )
      .filter(item => {
        // Apply status filter
        if (!status) return true; // Show all if no status filter
        if (status === "active") return item.status === true;
        if (status === "inactive") return item.status === false;
        return true;
      })
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
      selector: (row, index) => index + 1,
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
        <div className="status-cell">
          <div
            className={`status-indicator ${row.status ? "active" : ""}`}
            onClick={() => handleStatusToggle(row)}
            title={row.status ? "Click to deactivate" : "Click to activate"}
          />
          <span className={row.status ? "text-green-600" : "text-red-600"}>
            {row.status ? "Active" : "Inactive"}
          </span>
        </div>
      ),
      sortable: true,
      width: "120px",
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
    return <LoadingSpinner size="large" message="Loading schools data..." />;
  }


  return (
    <div className="schools-container">
      <div className="schools-header">

        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search Schools"
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
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

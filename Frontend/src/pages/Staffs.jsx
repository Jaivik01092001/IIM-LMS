import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getStaffMembersThunk,
    deleteStaffMemberThunk,
    updateStaffMemberThunk
} from "../redux/admin/staffSlice";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { FaPencilAlt, FaTrashAlt, FaEye, FaUserCircle } from "react-icons/fa";
import "../assets/styles/Staffs.css";

const Staffs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Get data from Redux store
    const { staffMembers, loading } = useSelector((state) => state.staff);

    // Update loading state when Redux loading state changes
    useEffect(() => {
        setIsLoading(loading);
    }, [loading]);

    // Local state
    const [tableData, setTableData] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(getStaffMembersThunk());
    }, [dispatch]);

    // Transform API data to table format
    useEffect(() => {
        if (!staffMembers?.length) return;

        const formattedData = staffMembers.map((staff) => {
            // Get the profile object or empty object if it doesn't exist
            const profile = staff.profile || {};

            // Format the avatar URL correctly
            let avatarUrl = null;
            if (profile.avatar) {
                // If avatar starts with http, use it directly, otherwise prepend the base URL
                avatarUrl = profile.avatar.startsWith('http')
                    ? profile.avatar
                    : `${import.meta.env.VITE_API_URL.replace('/api', '')}${profile.avatar}`;
            }

            return {
                id: staff._id,
                name: staff.name || "N/A",
                department: profile.department || "N/A",
                designation: profile.designation || "N/A",
                email: staff.email || "N/A",
                mobile: staff.phoneNumber || "N/A",
                avatar: avatarUrl,
                status: staff.status === 1,
                address: profile.address || "N/A",
                zipcode: profile.zipcode || "N/A",
                state: profile.state || "N/A"
            };
        });

        setTableData(formattedData);
    }, [staffMembers]);

    // Extract unique departments for filter
    const departments = [...new Set(tableData.map(item => item.department))].filter(Boolean);

    // Status toggle handler
    const handleStatusToggle = (row) => {
        const newStatus = row.status ? 0 : 1;
        const statusText = newStatus === 1 ? "activate" : "deactivate";

        console.log(`Toggling status for ${row.name} to ${newStatus}`);

        // Create FormData object for consistency with form updates
        const formData = new FormData();
        formData.append("status", newStatus);

        dispatch(updateStaffMemberThunk({
            id: row.id,
            formData
        }))
            .unwrap()
            .then(() => {
                console.log(`Successfully ${statusText}d ${row.name}`);
                // Get fresh data from the server to ensure state is in sync with backend
                dispatch(getStaffMembersThunk());
            })
            .catch(error => {
                console.error(`Error ${statusText}ing staff:`, error);
            });
    };

    // Row action handlers
    const handleView = (row) => {
        navigate(`/dashboard/admin/staff-details/${row.id}`);
    };

    const handleEdit = (row) => {
        navigate(`/dashboard/admin/staff-account-form/${row.id}`);
    };

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
            const id = row.id;
            dispatch(deleteStaffMemberThunk(id))
                .unwrap()
                .then(() => {
                    console.log(`Successfully deleted ${row.name}`);
                    // Get fresh data from the server
                    dispatch(getStaffMembersThunk());
                })
                .catch(error => {
                    console.error("Error deleting staff:", error);
                });
        }
    };

    // Handle create new staff
    const handleCreateAccount = () => {
        navigate("/dashboard/admin/staff-account-form");
    };

    // Apply filters and sorting
    const getFilteredData = () => {
        return tableData
            .filter(item =>
                !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(item =>
                !departmentFilter || item.department === departmentFilter
            )
            .filter(item => {
                if (!statusFilter) return true;
                if (statusFilter === "active") return item.status === true;
                if (statusFilter === "inactive") return item.status === false;
                return true;
            })
            .sort((a, b) => {
                if (!sortBy) return 0;

                switch (sortBy) {
                    case "Name (A-Z)": return a.name.localeCompare(b.name);
                    case "Name (Z-A)": return b.name.localeCompare(a.name);
                    case "Department": return a.department.localeCompare(b.department);
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
            name: "Staff Name",
            cell: (row) => (
                <div className="staff-cell">
                    {row.avatar ? (
                        <img src={row.avatar} alt="Staff" className="staff-avatar" />
                    ) : (
                        <FaUserCircle className="staff-avatar-placeholder" />
                    )}
                    <span>{row.name}</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Department",
            selector: (row) => row.department,
            sortable: true,
        },
        {
            name: "Designation",
            selector: (row) => row.designation,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: "Phone",
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
            name: "Actions",
            cell: (row) => (
                <div className="action-buttons">
                    <button
                        onClick={() => handleView(row)}
                        className="action-button view"
                        title="View Details"
                    >
                        <FaEye />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="action-button edit"
                        title="Edit"
                    >
                        <FaPencilAlt />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="action-button delete"
                        title="Delete"
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div className="staffs-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading staff accounts...</p>
                </div>
            )}

            <div className="staffs-header">
                <h1 className="page-title">Staff Management</h1>
                <button
                    className="create-account-btn"
                    onClick={handleCreateAccount}
                >
                    Create Staff Account
                </button>
            </div>

            <div className="search-filter-container">
                <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <select
                        className="filter-select"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map((department, index) => (
                            <option key={index} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort By</option>
                        <option value="Name (A-Z)">Name (A-Z)</option>
                        <option value="Name (Z-A)">Name (Z-A)</option>
                        <option value="Department">Department</option>
                        <option value="Status">Status</option>
                    </select>
                </div>
            </div>

            <DataTableComponent
                columns={columns}
                data={getFilteredData()}
                progressPending={loading}
                pagination
                highlightOnHover
                pointerOnHover
                striped
            />
        </div>
    );
};

export default Staffs; 
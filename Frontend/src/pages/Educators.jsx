import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getEducatorsThunk as getUniversityEducatorsThunk,
  deleteEducatorThunk,
  updateEducatorThunk,
} from "../redux/university/universitySlice";
import {
  getUniversitiesThunk,
  getEducatorsThunk as getAdminEducatorsThunk,
} from "../redux/admin/adminSlice";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ActionButtons from "../components/common/ActionButtons";
import StatusToggle from "../components/common/StatusToggle";
import { hasLocalPermission } from "../utils/localPermissions";
import { FaPencilAlt, FaUserCircle } from "react-icons/fa";
import "../assets/styles/Educators.css";

const Educators = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const { educators: universityEducators, loading: universityLoading } =
    useSelector((state) => state.university);
  const {
    educators: adminEducators,
    universities,
    loading: adminLoading,
  } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "admin";
  const educators = isAdmin ? adminEducators : universityEducators;
  const loading = isAdmin ? adminLoading : universityLoading;

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Fetch data on component mount
  useEffect(() => {
    // Use the appropriate thunk based on user role
    if (isAdmin) {
      dispatch(getAdminEducatorsThunk());
    } else {
      dispatch(getUniversityEducatorsThunk());
    }
    dispatch(getUniversitiesThunk());
  }, [dispatch, isAdmin]);

  // Transform educators data for the table
  const [tableData, setTableData] = useState([]);

  // Extract unique categories
  const [categories, setCategories] = useState([]);

  // Update tableData when educators change
  useEffect(() => {
    if (educators && educators.length > 0) {
      // Find university name for each educator
      const formattedEducators = educators.map((educator) => {
        // Get university name from populated university field or find it in universities array
        let universityName = "N/A";
        let universityCategory = "University";

        // First try to get from populated university field
        if (educator.university && typeof educator.university === "object") {
          universityName = educator.university.name || "N/A";
          universityCategory = educator.university.category || "University";
        }
        // Fallback to finding in universities array
        else if (educator.university && universities) {
          const university = universities.find(
            (uni) =>
              uni._id === educator.university ||
              uni.educators?.includes(educator._id)
          );
          if (university) {
            universityName = university.name || "N/A";
            universityCategory = university.category || "University";
          }
        }

        // Use schoolName from profile if available, otherwise use university name
        const schoolName = educator.profile?.schoolName || universityName;

        return {
          id: educator._id,
          professor: educator.name || "Unknown",
          school: schoolName,
          category: educator.profile?.category || universityCategory,
          avatar: educator.profile?.avatar
            ? `${import.meta.env.VITE_IMAGE_URL}${
                educator.profile.avatar
              }`
            : null,
          mobile: educator.phoneNumber || "N/A",
          status: educator.status === 1,
          email: educator.email || "N/A",
          address: educator.profile?.address || "N/A",
          zipcode: educator.profile?.zipcode || "N/A",
          state: educator.profile?.state || "N/A",
          roleId: educator.roleRef || "",
        };
      });

      setTableData(formattedEducators);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(formattedEducators.map((edu) => edu.category)),
      ];
      setCategories(uniqueCategories);
    }
  }, [educators, universities]);

  // Status toggle handler
  const handleStatusToggle = (row) => {
    // Only send the id and status to avoid issues with socialLinks
    dispatch(
      updateEducatorThunk({
        id: row.id,
        status: row.status ? 0 : 1,
      })
    )
      .unwrap()
      .then(() => {
        console.log(
          `Successfully ${row.status ? "deactivated" : "activated"} ${
            row.professor
          }`
        );
        // Refresh educators data based on user role
        if (isAdmin) {
          dispatch(getAdminEducatorsThunk());
        } else {
          dispatch(getUniversityEducatorsThunk());
        }
      })
      .catch((error) => {
        console.error(`Error updating educator status:`, error);
      });
  };

  // View handler
  const handleView = (row) => {
    // Pass the educator data to the details page
    // Make sure we're passing the correct ID for API call
    navigate("/dashboard/admin/educator-details", {
      state: {
        educator: {
          ...row,
          // Ensure we're using the MongoDB _id for API calls
          id: row.id,
        },
      },
    });
  };

  // Edit handler
  const handleEdit = (row) => {
    navigate("/dashboard/admin/educator-account-form", {
      state: { educator: row },
    });
  };

  // Delete handler
  const handleDelete = (row) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${row.professor}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteEducatorThunk(row.id))
        .unwrap()
        .then(() => {
          console.log(`Successfully deleted ${row.professor}`);
          // Refresh educators data based on user role
          if (isAdmin) {
            dispatch(getAdminEducatorsThunk());
          } else {
            dispatch(getUniversityEducatorsThunk());
          }
        })
        .catch((error) => {
          console.error(`Error deleting educator:`, error);
        });
    }
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
      name: "Professors",
      cell: (row) => (
        <div className="professor-cell">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt="Professor"
              className="professor-avatar"
            />
          ) : (
            <FaUserCircle className="professor-avatar-placeholder" />
          )}
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
          onToggle={() => handleStatusToggle(row)}
          permission="delete_educator"
        />
      ),
      sortable: true,
      width: "120px",
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onView={handleView}
          onEdit={handleEdit}
          viewPermission="view_educators"
          editPermission="edit_educator"
        />
      ),
      width: "150px",
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
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="status">Status</option>
          </select>

          {hasLocalPermission("create_educator") && (
            <button
              className="create-account-btn"
              onClick={() => navigate("/dashboard/admin/educator-account-form")}
            >
              Create Account
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <LoadingSpinner overlay={true} message="Loading educators data..." />
      )}

      <DataTableComponent
        columns={columns}
        data={tableData
          // Apply search filter
          .filter(
            (item) =>
              item.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.mobile.toLowerCase().includes(searchTerm.toLowerCase())
          )
          // Apply category filter
          .filter((item) => !categoryFilter || item.category === categoryFilter)
          // Apply sorting
          .sort((a, b) => {
            if (!sortBy) return 0;

            switch (sortBy) {
              case "name-asc":
                return a.professor.localeCompare(b.professor);
              case "name-desc":
                return b.professor.localeCompare(a.professor);
              case "status":
                return a.status === b.status ? 0 : a.status ? -1 : 1;
              default:
                return 0;
            }
          })}
        showSearch={false}
      />
    </div>
  );
};

export default Educators;

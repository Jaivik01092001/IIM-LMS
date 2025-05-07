import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../assets/styles/RolePermission.css";
import { FaPencilAlt, FaTrashAlt, FaArrowLeft } from "react-icons/fa";
import DataTableComponent from "../components/DataTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  getRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  getPermissionsByCategoryThunk
} from "../redux/role/roleSlice";
import { showErrorToast } from "../utils/toast";

const RolePermission = () => {
  const dispatch = useDispatch();
  const { roles, permissionsByCategory, loading } = useSelector((state) => state.role);

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState({ view_courses: true });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);

  // Fetch roles and permissions when component mounts
  useEffect(() => {
    dispatch(getRolesThunk());
    dispatch(getPermissionsByCategoryThunk());
  }, [dispatch]);

  // Check if user is super admin
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Check if user is super admin
        setIsSuperAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  // For demo purposes, set to true to always show the page
  // Remove this in production
  useEffect(() => {
    setIsSuperAdmin(true);
  }, []);

  // Handle permission toggle - now using permissions from API

  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    // Don't allow toggling view_courses - it should always be true
    if (permissionId === 'view_courses') {
      console.log('view_courses permission cannot be changed - it is always enabled');
      return;
    }

    // Get the current value of the permission (default to false if undefined)
    const currentValue = Boolean(permissions[permissionId]);
    const newValue = !currentValue;

    console.log(`Toggling permission ${permissionId}: ${currentValue} -> ${newValue}`);

    // Create a new permissions object with the toggled value
    const updatedPermissions = {
      ...permissions,
      [permissionId]: newValue
    };

    // Update the state with the new permissions object
    setPermissions(updatedPermissions);
    console.log("Updated permissions:", updatedPermissions);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      showErrorToast("Role name is required");
      return;
    }

    // Create role data object with name, description and permissions
    // Ensure view_courses is always set to true
    const roleData = {
      name: roleName,
      description: roleDescription,
      permissions: {
        ...permissions,
        view_courses: true // Always ensure view_courses is true
      }
    };

    if (editMode && currentRoleId) {
      // Update existing role
      dispatch(updateRoleThunk({ id: currentRoleId, roleData }))
        .unwrap()
        .then(() => {
          // Reset form and go back to list view
          resetForm();
        })
        .catch((error) => {
          console.error("Error updating role:", error);
        });
    } else {
      // Create new role
      dispatch(createRoleThunk(roleData))
        .unwrap()
        .then(() => {
          // Reset form and go back to list view
          resetForm();
        })
        .catch((error) => {
          console.error("Error creating role:", error);
        });
    }
  };

  // Reset form and return to list view
  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setPermissions({ view_courses: true }); // Always ensure view_courses is true
    setShowForm(false);
    setEditMode(false);
    setCurrentRoleId(null);
  };

  // Handle edit role
  const handleEditRole = (role) => {
    console.log("Editing role:", role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");

    // Convert permissions object from API response to state
    // The API returns permissions as an object with boolean values
    const permissionsObj = role.permissions || {};
    console.log("Role permissions from API:", permissionsObj);

    // Ensure we're setting the permissions state correctly and view_courses is always true
    setPermissions({
      ...permissionsObj,
      view_courses: true // Always ensure view_courses is true
    });
    setCurrentRoleId(role._id);
    setEditMode(true);
    setShowForm(true);
  };

  // Handle delete role
  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRoleThunk(roleId))
        .unwrap()
        .then(() => {
          // Role deleted successfully, no need to update local state as it's handled by the reducer
        })
        .catch((error) => {
          console.error("Error deleting role:", error);
        });
    }
  };

  // If not super admin, redirect or show access denied
  if (!isSuperAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="role-permission-container">


      {loading ? (
        // Loading spinner
        <LoadingSpinner size="large" message="Loading roles and permissions..." />
      ) : !showForm ? (
        // List view of roles
        <div className="roles-list-container">
          <div className="roles-list-header">
            <h2>All Roles</h2>
            <button
              className="add-role-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Add New Role
            </button>
          </div>

          <div className="table-responsive">
            <DataTableComponent
              columns={[
                {
                  name: "#",
                  selector: (_, index) => index + 1,
                  sortable: true,
                  width: "70px",
                },
                {
                  name: "Name",
                  selector: (row) => row.name,
                  sortable: true,
                  maxWidth: "200px", // Limit maximum width

                },
                {
                  name: "Description",
                  selector: (row) => row.description || "N/A",
                  sortable: true,
                  wrap: true,
                  grow: 2, // Give this column more space
                },
                {
                  name: "Options",
                  cell: (row) => (
                    <div className="action-buttons">
                      <button className="action-button edit" onClick={() => handleEditRole(row)} title="Edit">
                        <FaPencilAlt />
                      </button>
                      <button className="action-button delete" onClick={() => handleDeleteRole(row._id)} title="Delete">
                        <FaTrashAlt />
                      </button>
                    </div>
                  ),
                  width: "150px",
                  center: true,
                },
              ]}
              data={roles || []}
              showSearch={false}
            />
          </div>
        </div>
      ) : (
        // Role form view
        <div className="role-permission-content">
          <div className="role-info-section">
            <div className="role-info-header">
              <h2>{editMode ? 'Edit Role' : 'Role Information'}</h2>
              <button
                className="back-to-list-btn"
                onClick={resetForm}
                title="Back to Role List"
              >
                <FaArrowLeft /> Back to List
              </button>
            </div>
            <div className="role-name-input">
              <label htmlFor="roleName">Name</label>
              <input
                type="text"
                id="roleName"
                placeholder="Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="role-description-input">
              <label htmlFor="roleDescription">Description</label>
              <textarea
                id="roleDescription"
                placeholder="Role description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <div className="permissions-section">
            <h2>Permissions</h2>

            {Object.keys(permissionsByCategory || {}).length > 0 ? (
              Object.entries(permissionsByCategory || {}).map(([category, categoryPermissions]) => (
                <div key={category} className="permission-category">
                  <h3>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                  <div className="permission-grid">
                    {categoryPermissions.map((permission) => {
                      // The permission key from the API response
                      // In the API, permissions are stored with keys like 'view_courses', 'create_course', etc.
                      const permissionKey = permission.name;

                      // Get the permission value from the permissions object
                      // This checks if the permission is enabled in the role
                      const isChecked = Boolean(permissions[permissionKey]);

                      const isViewCourses = permissionKey === 'view_courses';

                      return (
                        <div key={permissionKey} className={`permission-item ${isViewCourses ? 'view-courses-permission' : ''}`}>
                          <label htmlFor={permissionKey}>
                            {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {isViewCourses && <span className="required-permission"> (Always enabled)</span>}
                          </label>
                          <div className="permission-toggle">
                            <div
                              className={`status-indicator ${isChecked ? "active" : ""} ${isViewCourses ? "disabled" : ""}`}
                              onClick={() => handlePermissionToggle(permissionKey)}
                              title={isViewCourses ? "This permission is always enabled and cannot be changed" : (isChecked ? "Click to deactivate" : "Click to activate")}
                              style={isViewCourses ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-permissions-message">
                <p>Loading permissions or no permissions available. Please try again later.</p>
              </div>
            )}

            {/* You can add more permission categories here */}

            <div className="form-actions">
              <button
                type="button"
                className="save-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : (editMode ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermission;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEducatorThunk,
  updateEducatorThunk as updateUniversityEducatorThunk,
  getEducatorsThunk as getUniversityEducatorsThunk,
  getEducatorByIdThunk as getUniversityEducatorByIdThunk,
} from "../redux/university/universitySlice";
import {
  getEducatorsThunk as getAdminEducatorsThunk,
  getEducatorByIdThunk as getAdminEducatorByIdThunk,
  updateEducatorThunk as updateAdminEducatorThunk,
} from "../redux/admin/adminSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "../assets/styles/EducatorDetails.css";

import { LuSchool } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";

const EducatorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [educatorData, setEducatorData] = useState(null);

  // Get user and educator data from Redux store
  const { user } = useSelector((state) => state.auth);
  const { loading: universityLoading, currentEducator: universityEducator } =
    useSelector((state) => state.university);
  const { loading: adminLoading, currentEducator: adminEducator } = useSelector(
    (state) => state.admin
  );

  // Determine if user is admin
  const isAdmin = user?.role === "admin";

  // Use the appropriate loading and currentEducator based on user role
  const loading = isAdmin ? adminLoading : universityLoading;
  const currentEducator = isAdmin ? adminEducator : universityEducator;

  // Get educator from router state for initial ID
  const educatorFromState = location.state?.educator;

  // Fetch educator data from API when component mounts
  useEffect(() => {
    if (educatorFromState && educatorFromState.id) {
      // Use the appropriate thunk based on user role
      if (isAdmin) {
        dispatch(getAdminEducatorByIdThunk(educatorFromState.id));
      } else {
        dispatch(getUniversityEducatorByIdThunk(educatorFromState.id));
      }
    }
  }, [dispatch, educatorFromState, isAdmin]);

  // Format API data for UI display
  useEffect(() => {
    if (currentEducator) {
      console.log("Current educator data:", currentEducator);

      // Get university name if available
      let universityName = "N/A";
      let universityId = "N/A";

      if (currentEducator.university) {
        // If university is an object with name property
        if (
          typeof currentEducator.university === "object" &&
          currentEducator.university.name
        ) {
          universityName = currentEducator.university.name;
          universityId = currentEducator.university._id;
        }
        // If university is just the ID
        else if (typeof currentEducator.university === "string") {
          universityId = currentEducator.university;
          // Use the school name from state if available
          universityName = educatorFromState?.school || universityId;
        }
      } else if (educatorFromState?.school) {
        universityName = educatorFromState.school;
      } else if (currentEducator.profile?.schoolName) {
        // Use schoolName from profile if available
        universityName = currentEducator.profile.schoolName;
      }

      // Format dates for better readability
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // Format the avatar URL correctly
      let avatarUrl = null;
      if (currentEducator.profile?.avatar) {
        // If avatar starts with http, use it directly, otherwise prepend the base URL
        avatarUrl = currentEducator.profile.avatar.startsWith("http")
          ? currentEducator.profile.avatar
          : `${import.meta.env.VITE_API_URL.replace("/api", "")}${
              currentEducator.profile.avatar
            }`;
      }

      // Format the data from the API response
      setEducatorData({
        id: currentEducator._id,
        professor: currentEducator.name || "N/A",
        school: universityName,
        category:
          currentEducator.profile?.category ||
          educatorFromState?.category ||
          "University",
        avatar: avatarUrl,
        mobile: currentEducator.phoneNumber || "N/A",
        email: currentEducator.email || "N/A",
        status: currentEducator.status === 1,
        address: currentEducator.profile?.address || "N/A",
        zipcode: currentEducator.profile?.zipcode || "N/A",
        state: currentEducator.profile?.state || "N/A",
        role: currentEducator.role || "N/A",
        roleRef: currentEducator.roleRef || "N/A",
        university: universityId,
        universityName: universityName,
        createdAt: formatDate(currentEducator.createdAt),
        updatedAt: formatDate(currentEducator.updatedAt),
        __v: currentEducator.__v || 0,
        // Additional fields from the profile
        schoolName:
          currentEducator.profile?.schoolName || universityName || "N/A",
      });
    } else if (educatorFromState && !loading) {
      // Format dates for better readability
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
          const date = new Date(dateString);
          return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          return dateString;
        }
      };

      // Fallback to router state if API data is not available yet
      setEducatorData({
        id: educatorFromState.id,
        professor: educatorFromState.professor || "N/A",
        school: educatorFromState.school || "N/A",
        category: educatorFromState.category || "N/A",
        avatar: educatorFromState.avatar || null,
        mobile: educatorFromState.mobile || "N/A",
        email: educatorFromState.email || "N/A",
        status: educatorFromState.status,
        address: educatorFromState.address || "N/A",
        zipcode: educatorFromState.zipcode || "N/A",
        state: educatorFromState.state || "N/A",
        role: educatorFromState.role || "N/A",
        roleRef: educatorFromState.roleRef || "N/A",
        university: educatorFromState.university || "N/A",
        universityName: educatorFromState.school || "N/A",
        createdAt: formatDate(educatorFromState.createdAt),
        updatedAt: formatDate(educatorFromState.updatedAt),
        __v: educatorFromState.__v || 0,
        // Additional fields from the profile
        schoolName:
          educatorFromState.schoolName || educatorFromState.school || "N/A",
      });
    }
  }, [currentEducator, educatorFromState, loading]);

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${educatorData.professor}? This action cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      dispatch(deleteEducatorThunk(educatorData.id))
        .unwrap()
        .then(() => {
          // Navigate back to educators list
          navigate("/dashboard/admin/educators");
        })
        .catch((error) => {
          console.error("Error deleting educator:", error);
          setIsDeleting(false);
        });
    }
  };

  const handleStatusToggle = () => {
    const newStatus = educatorData.status ? 0 : 1;
    const statusText = newStatus === 1 ? "activate" : "deactivate";

    // Use the appropriate thunk based on user role
    const updateThunk = isAdmin
      ? updateAdminEducatorThunk
      : updateUniversityEducatorThunk;

    dispatch(
      updateThunk({
        id: educatorData.id,
        status: newStatus,
      })
    )
      .unwrap()
      .then(() => {
        console.log(`Successfully ${statusText}d ${educatorData.professor}`);
        // Refresh educator data to ensure UI is in sync with backend
        if (isAdmin) {
          dispatch(getAdminEducatorByIdThunk(educatorData.id));
          dispatch(getAdminEducatorsThunk());
        } else {
          dispatch(getUniversityEducatorByIdThunk(educatorData.id));
          dispatch(getUniversityEducatorsThunk());
        }
      })
      .catch((error) => {
        console.error(`Error updating educator status:`, error);
      });
  };

  if (loading && !educatorData) {
    return (
      <LoadingSpinner size="large" message="Loading educator details..." />
    );
  }

  if (!educatorData) {
    return (
      <div className="educator-details-error">Educator details not found</div>
    );
  }

  return (
    <div className="educator-details-page">
      <div className="educator-header">
        <div className="educator-info">
          {educatorData.avatar ? (
            <img
              src={educatorData.avatar}
              alt={educatorData.professor}
              className="educator-avatar"
            />
          ) : (
            <FaUserCircle className="educator-avatar-placeholder" size={80} />
          )}
          <div className="educator-text">
            <h1>{educatorData.professor}</h1>
            <span className="category">
              Role:{" "}
              {educatorData.role.charAt(0).toUpperCase() +
                educatorData.role.slice(1)}
            </span>
          </div>
        </div>
        <div className="school-badge">
          <LuSchool size={34} />
          <div className="school-text">
            <div className="school-name">{educatorData.school}</div>
            <div className="school-type">Category: {educatorData.category}</div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h2>Basic Information</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Email:</label>
              <span>{educatorData.email}</span>
            </div>
            <div className="info-row">
              <label>Phone:</label>
              <span>{educatorData.mobile}</span>
            </div>
            <div className="info-row">
              <label>Role:</label>
              <span>
                {educatorData.role
                  ? educatorData.role.charAt(0).toUpperCase() +
                    educatorData.role.slice(1)
                  : "N/A"}
              </span>
            </div>
            <div className="info-row">
              <label>ID:</label>
              <span>{educatorData.id}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Address Information</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Address:</label>
              <span>{educatorData.address}</span>
            </div>
            <div className="info-row">
              <label>Zipcode:</label>
              <span>{educatorData.zipcode}</span>
            </div>
            <div className="info-row">
              <label>State:</label>
              <span>{educatorData.state}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>University Information</h2>
          <div className="info-content">
            <div className="info-row">
              <label>University:</label>
              <span title="Associated university/school">
                {educatorData.universityName}
              </span>
            </div>
            <div className="info-row">
              <label>University ID:</label>
              <span>{educatorData.university}</span>
            </div>
            <div className="info-row">
              <label>Category:</label>
              <span>{educatorData.category}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Status Information</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Current Status:</label>
              <div className="status-toggle-container">
                <span
                  className={
                    educatorData.status ? "text-green-600" : "text-red-600"
                  }
                >
                  {educatorData.status ? "Active" : "Inactive"}
                </span>
                <button
                  className={`status-toggle-btn ${
                    educatorData.status ? "deactivate" : "activate"
                  }`}
                  onClick={handleStatusToggle}
                >
                  {educatorData.status ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
            <div className="info-row">
              <label>Created At:</label>
              <span>{educatorData.createdAt}</span>
            </div>
            <div className="info-row">
              <label>Updated At:</label>
              <span>{educatorData.updatedAt}</span>
            </div>
            <div className="info-row">
              <label>Version:</label>
              <span>{educatorData.__v}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
        <button
          className="edit-btn"
          onClick={() =>
            navigate("/dashboard/admin/educator-account-form", {
              state: { educator: educatorData },
            })
          }
          disabled={isDeleting}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default EducatorDetails;

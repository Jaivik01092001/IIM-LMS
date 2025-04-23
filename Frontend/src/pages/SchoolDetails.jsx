import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUniversityByIdThunk, deleteUniversityThunk, updateUniversityThunk } from "../redux/admin/adminSlice";
import "../assets/styles/SchoolDetails.css";
import { LuSchool } from "react-icons/lu";

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUniversity, loading } = useSelector((state) => state.admin);

  // State to hold formatted school data
  const [schoolData, setSchoolData] = useState(null);

  // Fetch university data using ID from URL params
  useEffect(() => {
    if (id) {
      dispatch(getUniversityByIdThunk(id));
    }
  }, [dispatch, id]);

  // Format API data for UI display when it's loaded
  useEffect(() => {
    if (currentUniversity) {
      console.log('Current university data:', currentUniversity);
      setSchoolData({
        id: currentUniversity._id,
        school: currentUniversity.name || "N/A",
        category: "University",
        owner: currentUniversity.contactPerson || "N/A",
        ownerAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
        mobile: currentUniversity.phone || "N/A",
        email: currentUniversity.email || "N/A",
        status: currentUniversity.status === 1,
        address: currentUniversity.address || "N/A",
        zipcode: currentUniversity.zipcode || "N/A",
        state: currentUniversity.state || "N/A",
        educators: currentUniversity.educators || []
      });
    }
  }, [currentUniversity]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${schoolData.school}"?`)) {
      dispatch(deleteUniversityThunk(schoolData.id))
        .unwrap()
        .then(() => {
          navigate("/dashboard/admin/schools");
        })
        .catch(error => {
          console.error("Error deleting university:", error);
        });
    }
  };

  const handleStatusToggle = () => {
    const newStatus = schoolData.status ? 0 : 1;
    const statusText = newStatus === 1 ? "activate" : "deactivate";

    if (window.confirm(`Are you sure you want to ${statusText} "${schoolData.school}"?`)) {
      console.log(`Toggling status for ${schoolData.school} to ${newStatus}`);

      dispatch(updateUniversityThunk({
        id: schoolData.id,
        status: newStatus
      }))
        .unwrap()
        .then(() => {
          console.log(`Successfully ${statusText}d ${schoolData.school}`);
          // Refresh data from server to ensure UI is in sync with backend
          dispatch(getUniversityByIdThunk(schoolData.id));
        })
        .catch(error => {
          console.error(`Error ${statusText}ing university:`, error);
        });
    }
  };

  if (loading && !schoolData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!schoolData) {
    return <div className="school-details-error">School details not found</div>;
  }

  return (
    <div className="school-details-page">
      <div className="educator-header">
        <div className="educator-info">
          <img
            src={schoolData.ownerAvatar}
            alt={schoolData.owner}
            className="educator-avatar"
          />
          <div className="educator-text">
            <h1>{schoolData.owner}</h1>
            <span className="category">Category: {schoolData.category}</span>
          </div>
        </div>
        <div className="school-badge">
          <LuSchool size={34} />
          <div className="school-text">
            <div className="school-name">{schoolData.school}</div>
            <div className="school-type">School/University</div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h2>Information</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Email:</label>
              <span>{schoolData.email}</span>
            </div>
            <div className="info-row">
              <label>Phone:</label>
              <span>{schoolData.mobile}</span>
            </div>
            <div className="info-row">
              <label>Address:</label>
              <span>{schoolData.address}</span>
            </div>
            <div className="info-row">
              <label>Zipcode:</label>
              <span>{schoolData.zipcode}</span>
            </div>
            <div className="info-row">
              <label>State:</label>
              <span>{schoolData.state}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Status</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Current Status:</label>
              <div className="status-toggle-container">
                <span className={schoolData.status ? "text-green-600" : "text-red-600"}>
                  {schoolData.status ? "Active" : "Inactive"}
                </span>
                <button
                  className={`status-toggle-btn ${schoolData.status ? 'deactivate' : 'activate'}`}
                  onClick={handleStatusToggle}
                >
                  {schoolData.status ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
        <button
          className="edit-btn"
          onClick={() => {
            // Navigate to edit form with ID in URL
            navigate(`/dashboard/admin/school-account-form/${schoolData.id}`);
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default SchoolDetails;

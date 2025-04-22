import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUniversityByIdThunk, deleteUniversityThunk } from "../redux/admin/adminSlice";
import "../assets/styles/SchoolDetails.css";
import { LuSchool } from "react-icons/lu";

const SchoolDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUniversity, loading } = useSelector((state) => state.admin);
  
  // State to hold formatted school data
  const [schoolData, setSchoolData] = useState(null);
  
  // Get school from router state initially to display something immediately
  const schoolFromState = location.state?.school;
  
  // Extract ID from router state or URL
  useEffect(() => {
    const fetchUniversityData = async () => {
      if (schoolFromState && schoolFromState.id) {
        dispatch(getUniversityByIdThunk(schoolFromState.id));
      }
    };
    
    fetchUniversityData();
  }, [dispatch, schoolFromState]);
  
  // Format API data for UI display when it's loaded
  useEffect(() => {
    if (currentUniversity) {
      setSchoolData({
        id: currentUniversity._id,
        school: currentUniversity.name || "N/A",
        category: "University",
        owner: currentUniversity.creator?.name || "N/A",
        ownerAvatar: currentUniversity.creator?.profile?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
        mobile: currentUniversity.creator?.phoneNumber || "N/A",
        email: currentUniversity.creator?.email || "jacksonchristian@gmail.com",
        status: true,
        educators: currentUniversity.educators || []
      });
    } else if (schoolFromState) {
      // Fallback to router state if API data is not available yet
      setSchoolData(schoolFromState);
    }
  }, [currentUniversity, schoolFromState]);
  
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
              <span>
                Jay Ambenagar Rd, opp. Sardar Patel Institute,
                <br />
                Patel Society, Jai Ambe Nagar, Thaltej, Ahmedabad
              </span>
            </div>
            <div className="info-row">
              <label>Zipcode:</label>
              <span>380054</span>
            </div>
            <div className="info-row">
              <label>State:</label>
              <span>Gujarat</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Credentials</h2>
          <div className="info-content">
            <div className="info-row">
              <label>Phone:</label>
              <span>+91 98765 43210</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>udgamschoolforchildren@gmail.com</span>
            </div>
            <div className="info-row">
              <label>Password:</label>
              <span>Udgamschool@43210</span>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
        <button 
          className="edit-btn" 
          onClick={() => {
            // Store the school data in localStorage for the edit form
            localStorage.setItem('editSchool', JSON.stringify(schoolData));
            navigate("/dashboard/admin/school-account-form");
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default SchoolDetails;

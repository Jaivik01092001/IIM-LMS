import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/EducatorDetails.css";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { LuSchool } from "react-icons/lu";

const EducatorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const educator = location.state?.educator;

  if (!educator) {
    return <div className="educator-details-error">Educator details not found</div>;
  }

  return (
    <div className="educator-details-page">
      <div className="educator-header">
        <div className="educator-info">
          <img
            src={educator.avatar}
            alt={educator.professor}
            className="educator-avatar"
          />
          <div className="educator-text">
            <h1>{educator.professor}</h1>
            <span className="category">Category: {educator.category}</span>
          </div>
        </div>
        <div className="school-badge">
          <LuSchool size={34} />
          <div className="school-text">
            <div className="school-name">{educator.school}</div>
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
              <span>jacksonchristian@gmail.com</span>
            </div>
            <div className="info-row">
              <label>Phone:</label>
              <span>{educator.mobile}</span>
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
        <button className="delete-btn">Delete</button>
        <button 
          className="edit-btn" 
          onClick={() => navigate("/dashboard/admin/educator-account-form", { state: { educator } })}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default EducatorDetails;

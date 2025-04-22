import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUniversityThunk, updateUniversityThunk, getUniversitiesThunk } from "../redux/admin/adminSlice";
import "../assets/styles/SchoolAccountForm.css";
import { FaArrowLeft } from "react-icons/fa";

const SchoolAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get school data from localStorage instead of location state
  const storedSchoolData = localStorage.getItem('editSchool');
  const schoolData = storedSchoolData ? JSON.parse(storedSchoolData) : null;
  const isEditMode = !!schoolData;

  const [formData, setFormData] = useState({
    schoolName: "",
    category: "",
    ownerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipcode: "",
    state: "",
    loginPhone: "",
    loginEmail: "",
    password: "",
    profileImage: null,
    profileImageUrl: "",
  });

  useEffect(() => {
    if (isEditMode && schoolData) {
      setFormData({
        schoolName: schoolData.school || "",
        category: schoolData.category || "",
        ownerName: schoolData.owner || "",
        email: schoolData.email || "jacksonchristian@gmail.com", // Using default from SchoolDetails
        phoneNumber: schoolData.mobile || "",
        address:
          "Jay Ambenagar Rd, opp. Sardar Patel Institute, Patel Society, Jai Ambe Nagar, Thaltej, Ahmedabad", // Default from SchoolDetails
        zipcode: "380054", // Default from SchoolDetails
        state: "Gujarat", // Default from SchoolDetails
        loginPhone: "+91 98765 43210", // Default from SchoolDetails
        loginEmail: "udgamschoolforchildren@gmail.com", // Default from SchoolDetails
        password: "Udgamschool@43210", // Default from SchoolDetails
        profileImageUrl: schoolData.ownerAvatar || "",
      });
    }
  }, [isEditMode, schoolData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data for API
    const apiData = {
      name: formData.schoolName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      // Add other fields as needed
    };

    if (isEditMode) {
      // Call update API 
      dispatch(updateUniversityThunk({
        id: schoolData.id,
        ...apiData
      }))
        .unwrap()
        .then(() => {
          // Clear localStorage
          localStorage.removeItem('editSchool');
          // Refresh data and navigate back
          dispatch(getUniversitiesThunk());
          navigate("/dashboard/admin/schools");
        })
        .catch(error => {
          console.error("Error updating university:", error);
        });
    } else {
      // Call create API
      dispatch(createUniversityThunk(apiData))
        .unwrap()
        .then(() => {
          // Refresh data and navigate back
          dispatch(getUniversitiesThunk());
          navigate("/dashboard/admin/schools");
        })
        .catch(error => {
          console.error("Error creating university:", error);
        });
    }
  };

  const handleCancel = () => {
    // Clean up localStorage
    localStorage.removeItem('editSchool');
    navigate(-1);
  };

  return (
    <div className="school-form-container">
      <div className="form-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <h1>
          {isEditMode
            ? "Edit School/University Account"
            : "Create School/University Account"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="school-form">
        <div className="form-section">
          <h2>General Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="schoolName">School/University Account Name</label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                placeholder="Enter School/University Account Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="CBSE school">CBSE school</option>
                <option value="International school">
                  International school
                </option>
                <option value="University">University</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email Address"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Phone Number"
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="zipcode">Zipcode</label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    placeholder="Enter Zipcode"
                    required
                  />
                </div>
              </div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="ownerName">School/University Name</label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Enter School/University Name"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="form-group profile-image-container">
                <label>Owner Profile Image</label>
                <div className="profile-image-upload">
                  <div className="profile-image">
                    {formData.profileImageUrl ? (
                      <img src={formData.profileImageUrl} alt="Profile" />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="upload-photo-btn"
                    onClick={() =>
                      document.getElementById("profileImage").click()
                    }
                  >
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Credentials</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="loginPhone">Phone Number</label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  id="loginPhone"
                  name="loginPhone"
                  value={formData.loginPhone}
                  onChange={handleInputChange}
                  placeholder="Enter Phone Number"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <input
                type="email"
                id="loginEmail"
                name="loginEmail"
                value={formData.loginEmail}
                onChange={handleInputChange}
                placeholder="Enter Email Address"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolAccountForm;

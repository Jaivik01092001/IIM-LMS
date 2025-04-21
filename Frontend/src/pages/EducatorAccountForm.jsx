import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/EducatorAccountForm.css";
import { FaArrowLeft } from "react-icons/fa";

const EducatorAccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const educatorData = location.state?.educator || null;
  const isEditMode = !!educatorData;

  const [formData, setFormData] = useState({
    professorName: "",
    schoolName: "",
    category: "",
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
    if (isEditMode && educatorData) {
      setFormData({
        professorName: educatorData.professor || "",
        schoolName: educatorData.school || "",
        category: educatorData.category || "",
        email: "jacksonchristian@gmail.com", // Default value
        phoneNumber: educatorData.mobile?.replace("+91 ", "") || "",
        address:
          "Jay Ambenagar Rd, opp. Sardar Patel Institute, Patel Society, Jai Ambe Nagar, Thaltej, Ahmedabad", // Default value
        zipcode: "380054", // Default value
        state: "Gujarat", // Default value
        loginPhone: "98765 43210", // Default value
        loginEmail: "udgamschoolforchildren@gmail.com", // Default value
        password: "Udgamschool@43210", // Default value
        profileImageUrl: educatorData.avatar || "",
      });
    }
  }, [isEditMode, educatorData]);

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
    console.log("Form submitted:", formData);

    // Here you would typically send the data to your backend
    // For now, we'll just navigate back

    if (isEditMode) {
      // If editing, go back to educator details
      navigate(-1);
    } else {
      // If creating new, go back to educators list
      navigate("/dashboard/admin/educators");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="educator-form-container">
      <div className="form-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <h1>
          {isEditMode ? "Edit Educator Account" : "Create Educator Account"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="educator-form">
        <div className="form-section">
          <h2>General Information</h2>
          <div className="form-grid">
            <div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="professorName">Educator Name</label>
                  <input
                    type="text"
                    id="professorName"
                    name="professorName"
                    value={formData.professorName}
                    onChange={handleInputChange}
                    placeholder="Enter Educator Name"
                    required
                  />
                </div>
              </div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="schoolName">School/University</label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter School/University Name"
                    required
                  />
                </div>
              </div>
              <div className="grid-row">
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
            </div>
            <div>
              <div className="form-group profile-image-container">
                <label>Profile Image</label>
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

          <div className="form-row">
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
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducatorAccountForm;

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
    status: 1,
    profileImage: null,
    profileImageUrl: "",
  });

  // Debugging to check if schoolData is correctly loaded
  console.log("SchoolData from localStorage:", schoolData);

  useEffect(() => {
    if (isEditMode && schoolData) {
      // Strip the '+91' prefix from phone number if exists
      const phoneNumber = schoolData.mobile ?
                          schoolData.mobile.replace(/^\+91\s*/, '').trim() :
                          "";

      console.log("Setting form data in edit mode:", {
        schoolName: schoolData.school || "",
        category: schoolData.category || "",
        ownerName: schoolData.owner || "",
        email: schoolData.email || "",
        phoneNumber: phoneNumber,
        address: schoolData.address || "",
        zipcode: schoolData.zipcode || "",
        state: schoolData.state || "",
        status: schoolData.status ? 1 : 0,
      });

      // Set form data immediately without setTimeout
      setFormData({
        schoolName: schoolData.school || "",
        category: schoolData.category || "",
        ownerName: schoolData.owner || "",
        email: schoolData.email || "",
        phoneNumber: phoneNumber,
        address: schoolData.address || "",
        zipcode: schoolData.zipcode || "",
        state: schoolData.state || "",
        status: schoolData.status ? 1 : 0,
        profileImageUrl: schoolData.ownerAvatar || "",
      });
    }
  }, [isEditMode, schoolData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to: ${value}`);

    // Force update the form data
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Log form data before submission
    console.log("Form data to be submitted:", formData);

    // Prepare form data for API
    const apiData = {
      name: formData.schoolName,
      email: formData.email,
      phone: "+91 " + formData.phoneNumber.trim(),
      address: formData.address,
      zipcode: formData.zipcode,
      state: formData.state,
      contactPerson: formData.ownerName,
      status: Number(formData.status) // Ensure status is a number
    };

    console.log("API data to be sent:", apiData);

    if (isEditMode) {
      // Call update API
      dispatch(updateUniversityThunk({
        id: schoolData.id,
        ...apiData
      }))
        .unwrap()
        .then(() => {
          localStorage.removeItem('editSchool');
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
          dispatch(getUniversitiesThunk());
          navigate("/dashboard/admin/schools");
        })
        .catch(error => {
          console.error("Error creating university:", error);
        });
    }
  };

  const handleCancel = () => {
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
                <option value="International school">International school</option>
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
                  <label htmlFor="ownerName">Contact Person</label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Enter Contact Person Name"
                    required
                  />
                </div>
              </div>
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="profile-image-container">
              <label>Profile Image</label>
              <div className="profile-image-upload">
                <div className="profile-image">
                  {formData.profileImageUrl ? (
                    <img src={formData.profileImageUrl} alt="Profile" />
                  ) : (
                    <div className="upload-icon">+</div>
                  )}
                </div>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
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

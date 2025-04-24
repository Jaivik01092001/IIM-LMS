import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createEducatorThunk, updateEducatorThunk, getEducatorsThunk } from "../redux/university/universitySlice";
import { getRolesThunk } from "../redux/role/roleSlice";
import "../assets/styles/EducatorAccountForm.css";
import { FaArrowLeft } from "react-icons/fa";

const EducatorAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const educatorData = location.state?.educator || null;
  const isEditMode = !!educatorData;

  // Get roles from Redux store
  const { roles } = useSelector((state) => state.role);

  // Fetch roles on component mount
  useEffect(() => {
    dispatch(getRolesThunk());
  }, [dispatch]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    professorName: "",
    schoolName: "",
    category: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipcode: "",
    state: "",
    password: "",
    roleId: "",
    profileImage: null,
    profileImageUrl: "",
    status: 1,
  });

  useEffect(() => {
    if (isEditMode && educatorData) {
      // Strip the '+91' prefix from phone number if exists
      const phoneNumber = educatorData.mobile ?
                        educatorData.mobile.replace(/^\+91\s*/, '').trim() :
                        "";

      setFormData({
        professorName: educatorData.professor || "",
        schoolName: educatorData.school || "",
        category: educatorData.category || "",
        email: educatorData.email || "",
        phoneNumber: phoneNumber,
        address: educatorData.address || "",
        zipcode: educatorData.zipcode || "",
        state: educatorData.state || "",
        password: "", // Don't populate password in edit mode
        roleId: educatorData.roleId || "",
        profileImageUrl: educatorData.avatar || "",
        status: educatorData.status ? 1 : 0,
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
    setFormErrors({});
    setIsSubmitting(true);

    // Create FormData object for file upload
    const formDataObj = new FormData();
    
    // Append text data
    formDataObj.append('name', formData.professorName);
    formDataObj.append('email', formData.email);
    formDataObj.append('phoneNumber', "+91 " + formData.phoneNumber.trim());
    formDataObj.append('address', formData.address);
    formDataObj.append('zipcode', formData.zipcode);
    formDataObj.append('state', formData.state);
    formDataObj.append('status', Number(formData.status));

    // Add password only for new educators or if changed
    if (!isEditMode || formData.password) {
      formDataObj.append('password', formData.password);
    }

    // Add roleId if selected
    if (formData.roleId) {
      formDataObj.append('roleId', formData.roleId);
    }

    // Add profile image if selected
    if (formData.profileImage) {
      formDataObj.append('profileImage', formData.profileImage);
    }

    if (isEditMode) {
      // Update existing educator
      dispatch(updateEducatorThunk({
        id: educatorData.id,
        formData: formDataObj
      }))
        .unwrap()
        .then(() => {
          // Refresh educators list
          dispatch(getEducatorsThunk());
          // Navigate back
          navigate(-1);
        })
        .catch(error => {
          setFormErrors(error.errors || {});
          setIsSubmitting(false);
        });
    } else {
      // Create new educator
      dispatch(createEducatorThunk(formDataObj))
        .unwrap()
        .then(() => {
          // Refresh educators list
          dispatch(getEducatorsThunk());
          // Navigate back to educators list
          navigate("/dashboard/admin/educators");
        })
        .catch(error => {
          setFormErrors(error.errors || {});
          setIsSubmitting(false);
        });
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
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
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
              <div className="grid-row">
                <div className="form-group">
                  <label htmlFor="roleId">Role</label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Role</option>
                    {roles && roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.roleId && <div className="error-message">{formErrors.roleId}</div>}
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
              {formErrors.email && <div className="error-message">{formErrors.email}</div>}
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
                required={!isEditMode} // Only required for new educators
              />
              {formErrors.password && <div className="error-message">{formErrors.password}</div>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="loading-spinner-small"></span>
            ) : (
              isEditMode ? "Update" : "Submit"
            )}
          </button>
        </div>

        {/* General error message */}
        {formErrors.general && (
          <div className="error-message general-error">{formErrors.general}</div>
        )}
      </form>
    </div>
  );
};

export default EducatorAccountForm;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaSave, FaArrowLeft, FaUserCircle, FaSchool, FaGraduationCap } from 'react-icons/fa';
import '../assets/styles/UserProfile.css';
import { getLoggedInUserThunk, updateLoggedInUserThunk } from '../redux/user/userSlice';

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL || '';

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const Settings = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profileImage: null,
    profileImageUrl: '',
    profile: {
      address: '',
      zipcode: '',
      state: '',
      bio: '',
      category: '',
      schoolName: '',
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getLoggedInUserThunk());
  }, [dispatch]);

  // Update form data when profile is loaded from Redux
  useEffect(() => {
    if (profile) {
      // For debugging
      console.log('Profile data:', profile);

      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        profileImage: null,
        profileImageUrl: profile.profile?.avatar
          ? `${VITE_IMAGE_URL}${profile.profile.avatar.startsWith('/') ? profile.profile.avatar : `${profile.profile.avatar}`}`
          : '',
        profile: {
          address: profile.profile?.address || '',
          zipcode: profile.profile?.zipcode || '',
          state: profile.profile?.state || '',
          // Remove bio field
          category: profile.profile?.category || (profile.role === 'university' ? 'University' :
                   profile.role === 'educator' ? 'School' : ''),
          schoolName: profile.profile?.schoolName || '',
          // Add any other profile fields that might be in the response
        }
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      // Prepare data for API
      const updateData = {
        name: formData.name,
        address: formData.profile.address,
        zipcode: formData.profile.zipcode,
        state: formData.profile.state,
        // Remove bio field
        // Include category and schoolName if they exist in the form
        ...(formData.profile.category && { category: formData.profile.category }),
        ...(formData.profile.schoolName && { schoolName: formData.profile.schoolName }),
      };

      // Add profile image if changed
      if (formData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      dispatch(updateLoggedInUserThunk(updateData));
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="user-profile-container">
      <div className="form-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <h1>My Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Image Section */}
        <div className="profile-section">
          <div className="profile-preview">
            {formData.profileImageUrl ? (
              <img
                src={formData.profileImageUrl}
                alt="Profile"
                className="profile-preview-image"
              />
            ) : (
              <div className="profile-placeholder">
                <FaUserCircle className="placeholder-icon" />
              </div>
            )}
          </div>
          <div className="profile-actions">
            <button
              type="button"
              className="upload-photo-btn"
              onClick={() => document.getElementById("profileImage").click()}
            >
              Upload Photo
            </button>
            <p className="upload-hint">
              Recommended size: 300x300px. Max file size: 5MB
            </p>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden-input"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* General Information Section */}
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                <FaUser className="field-icon" /> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={formErrors.name && submitted ? "error" : ""}
              />
              {formErrors.name && submitted && (
                <span className="error-message">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="field-icon" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                disabled
                className="disabled-field"
                readOnly
              />
              <span className="field-hint">Email cannot be changed</span>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                <FaPhone className="field-icon" /> Mobile Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Enter your phone number"
                disabled
                className="disabled-field"
                readOnly
              />
              <span className="field-hint">Phone number cannot be changed</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile.category">
                <FaGraduationCap className="field-icon" /> Category
              </label>
              <select
                id="profile.category"
                name="profile.category"
                value={formData.profile.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="School">School</option>
                <option value="University">University</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profile.schoolName">
                <FaSchool className="field-icon" /> School/University
              </label>
              <input
                type="text"
                id="profile.schoolName"
                name="profile.schoolName"
                value={formData.profile.schoolName}
                onChange={handleChange}
                placeholder="Enter school/university name"
              />
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="form-section">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="profile.address">
                <FaMapMarkerAlt className="field-icon" /> Address
              </label>
              <input
                type="text"
                id="profile.address"
                name="profile.address"
                value={formData.profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile.state">State</label>
              <select
                id="profile.state"
                name="profile.state"
                value={formData.profile.state}
                onChange={handleChange}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profile.zipcode">Zipcode</label>
              <input
                type="text"
                id="profile.zipcode"
                name="profile.zipcode"
                value={formData.profile.zipcode}
                onChange={handleChange}
                placeholder="Enter your zipcode"
              />
            </div>
          </div>
        </div>

        {/* Removed About Me Section */}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
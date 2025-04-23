import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createUniversityThunk, updateUniversityThunk, getUniversitiesThunk, getUniversityByIdThunk } from "../redux/admin/adminSlice";
import "../assets/styles/SchoolAccountForm.css";
import { FaArrowLeft } from "react-icons/fa";

const SchoolAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentUniversity, loading } = useSelector((state) => state.admin);

  // Determine if we're in edit mode based on the presence of an ID parameter
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    schoolName: "",
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

  // Fetch university data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getUniversityByIdThunk(id));
    }
  }, [dispatch, isEditMode, id]);

  // Update form when university data is loaded
  useEffect(() => {
    if (isEditMode && currentUniversity) {
      // Strip the '+91' prefix from phone number if exists
      const phoneNumber = currentUniversity.phone ?
        currentUniversity.phone.replace(/^\+91\s*/, '').trim() :
        "";

      console.log("Setting form data from API:", {
        schoolName: currentUniversity.name || "",
        ownerName: currentUniversity.contactPerson || "",
        email: currentUniversity.email || "",
        phoneNumber: phoneNumber,
        address: currentUniversity.address || "",
        zipcode: currentUniversity.zipcode || "",
        state: currentUniversity.state || "",
        status: currentUniversity.status === 1 ? 1 : 0,
      });

      // Set form data from API response
      setFormData({
        schoolName: currentUniversity.name || "",
        ownerName: currentUniversity.contactPerson || "",
        email: currentUniversity.email || "",
        phoneNumber: phoneNumber,
        address: currentUniversity.address || "",
        zipcode: currentUniversity.zipcode || "",
        state: currentUniversity.state || "",
        status: currentUniversity.status === 1 ? 1 : 0,
        profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg", // Default avatar or from API if available
      });
    }
  }, [isEditMode, currentUniversity]);

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
        id: id, // Use ID from URL params
        ...apiData
      }))
        .unwrap()
        .then(() => {
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
    navigate(-1);
  };

  // Show loading spinner when in edit mode and data is being fetched
  if (isEditMode && loading && !currentUniversity) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            <div className="form-group full-width">
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

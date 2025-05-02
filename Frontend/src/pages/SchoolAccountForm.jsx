import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createUniversityThunk,
  updateUniversityThunk,
  getUniversitiesThunk,
  getUniversityByIdThunk,
} from "../redux/admin/adminSlice";
import { getRolesThunk } from "../redux/role/roleSlice";
import "../assets/styles/SchoolAccountForm.css";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

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

const SchoolAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentUniversity, loading } = useSelector((state) => state.admin);
  const { roles } = useSelector((state) => state.role);

  const isEditMode = !!id;

  const predefinedRoles = [
    "admin",
    "staff",
    "university",
    "educator",
    "super admin",
    "iim staff",
    "school admin",
    "school",
    "super_admin",
    "iim_staff",
    "school_admin",
  ];

  const filteredRoles = roles
    ? roles.filter((role) => {
        if (!role.name) {
          console.log("Role without name property:", role);
          return false;
        }

        const roleLowerCase = role.name.toLowerCase().trim();
        const isExcluded = predefinedRoles.some(
          (predefinedRole) =>
            roleLowerCase === predefinedRole ||
            roleLowerCase.replace(/[_\s-]/g, "") ===
              predefinedRole.replace(/[_\s-]/g, "")
        );

        return !isExcluded;
      })
    : [];

  useEffect(() => {
    dispatch(getRolesThunk());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    schoolName: "",
    ownerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipcode: "",
    state: "",
    status: 1,
    roleId: "",
    profileImage: null,
    profileImageUrl: "",
    loginEmail: "",
    loginPhone: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getUniversityByIdThunk(id));
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentUniversity) {
      const profile = currentUniversity.profile || {};
      const phoneNumber = currentUniversity.phoneNumber
        ? currentUniversity.phoneNumber.replace(/^\+91\s*/, "").trim()
        : "";

      let roleId = "";
      if (currentUniversity.roleRef) {
        roleId =
          typeof currentUniversity.roleRef === "object"
            ? currentUniversity.roleRef._id
            : currentUniversity.roleRef;
      }

      // Fix the image URL by removing any double slashes
      const imageUrl = profile.avatar
        ? `${VITE_IMAGE_URL}${profile.avatar}`.replace(/([^:]\/)\/+/g, "$1")
        : null;

      setFormData({
        schoolName: currentUniversity.name || "",
        ownerName: currentUniversity.contactPerson || "",
        email: currentUniversity.email || "",
        phoneNumber: phoneNumber,
        address: profile.address || "",
        zipcode: profile.zipcode || "",
        state: profile.state || "",
        status: currentUniversity.status === 1 ? 1 : 0,
        roleId: roleId,
        profileImageUrl: imageUrl,
        loginEmail: currentUniversity.email || "",
        loginPhone: phoneNumber,
      });
    }
  }, [isEditMode, currentUniversity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    if (name === "email") {
      updatedFormData.loginEmail = value;
    } else if (name === "phoneNumber") {
      updatedFormData.loginPhone = value;
    }

    setFormData(updatedFormData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.schoolName || !formData.email || !formData.phoneNumber) {
      console.error("Missing required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.schoolName);
    formDataObj.append("schoolName", formData.schoolName);
    formDataObj.append("email", formData.email);
    formDataObj.append("phoneNumber", formData.phoneNumber.trim());
    formDataObj.append("phone", "+91 " + formData.phoneNumber.trim());
    formDataObj.append("address", formData.address);
    formDataObj.append("zipcode", formData.zipcode);
    formDataObj.append("state", formData.state);
    formDataObj.append("contactPerson", formData.ownerName);
    formDataObj.append("ownerName", formData.ownerName);
    formDataObj.append("status", Number(formData.status));

    if (formData.roleId) {
      formDataObj.append("roleId", formData.roleId);
    }

    if (formData.profileImage) {
      formDataObj.append("profileImage", formData.profileImage);
    }

    if (isEditMode && formData.profileImageUrl && !formData.profileImage) {
      formDataObj.append("keepExistingImage", "true");
    }

    try {
      const apiPromise = isEditMode
        ? dispatch(updateUniversityThunk({ id, formData: formDataObj }))
        : dispatch(createUniversityThunk(formDataObj));

      apiPromise
        .unwrap()
        .then(() => {
          dispatch(getUniversitiesThunk());
          navigate("/dashboard/admin/schools");
        })
        .catch((error) => {
          console.error(
            `Error ${isEditMode ? "updating" : "creating"} university:`,
            error
          );
        });
    } catch (error) {
      console.error("Error dispatching action:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
        {/* General Information Section */}
        <div className="form-section">
          <h2>General Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="schoolName">School/University Name</label>
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

            <div className="form-group">
              <label htmlFor="status">Account Status</label>
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

        {/* Contact Information Section */}
        <div className="form-section">
          <h2>Contact Information</h2>
          <div className="form-grid">
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

            {/* Role dropdown - only shows custom roles */}
            {filteredRoles.length >= 1 && (
              <div className="form-group">
                <label htmlFor="roleId">Role</label>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Role</option>
                  {filteredRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Address Information Section */}
        <div className="form-section">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group">
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
                {INDIAN_STATES.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="form-section">
          <h2>School Logo</h2>
          <div className="profile-section">
            <div className="profile-preview">
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="School Logo"
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
                Upload Logo
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
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
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

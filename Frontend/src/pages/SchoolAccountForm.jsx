import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createUniversityThunk, updateUniversityThunk, getUniversitiesThunk, getUniversityByIdThunk } from "../redux/admin/adminSlice";
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
  "Puducherry"
];

const SchoolAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentUniversity, loading } = useSelector((state) => state.admin);
  const { roles } = useSelector((state) => state.role);
  // We don't need the user object anymore since we're always showing the dropdown
  // const { user } = useSelector((state) => state.auth);

  // Determine if we're in edit mode based on the presence of an ID parameter
  const isEditMode = !!id;

  // Filter out predefined roles from the dropdown

  // Predefined roles to exclude from the dropdown
  const predefinedRoles = [
    'admin', 'staff', 'university', 'educator',
    'super admin', 'iim staff', 'school admin', 'school',
    'super_admin', 'iim_staff', 'school_admin'
  ];

  // Filter out predefined roles from the roles list
  const filteredRoles = roles ? roles.filter(role => {
    // Check if the role has a name property
    if (!role.name) {
      console.log('Role without name property:', role);
      return false;
    }

    // Only include roles that are not in the predefined list
    const roleLowerCase = role.name.toLowerCase().trim();

    // Check if this role name (or a variation) is in our exclude list
    const isExcluded = predefinedRoles.some(predefinedRole =>
      roleLowerCase === predefinedRole ||
      roleLowerCase.replace(/[_\s-]/g, '') === predefinedRole.replace(/[_\s-]/g, '')
    );

    console.log(`Role: "${role.name}", lowercase: "${roleLowerCase}", excluded: ${isExcluded}`);

    // Only include custom roles (not in the predefined list)
    return !isExcluded;
  }) : [];

  // Debug check for "New Role"
  const hasNewRole = filteredRoles.some(role =>
    role.name.toLowerCase().includes('new') && role.name.toLowerCase().includes('role')
  );
  console.log('Has New Role:', hasNewRole);

  // Debug
  console.log('All roles:', roles);
  console.log('Predefined roles to exclude:', predefinedRoles);
  console.log('Filtered roles:', filteredRoles);

  // Fetch roles when component mounts
  useEffect(() => {
    dispatch(getRolesThunk());
  }, [dispatch]);

  // Log detailed role information when roles change
  useEffect(() => {
    if (roles && roles.length > 0) {
      console.log('Detailed role information:');
      roles.forEach(role => {
        console.log(JSON.stringify(role, null, 2));
      });
    }
  }, [roles]);

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
    loginPhone: ""
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
      console.log("Current university data:", currentUniversity);

      // Extract profile fields correctly from the nested profile object
      const profile = currentUniversity.profile || {};

      // Strip the '+91' prefix from phone number if exists
      const phoneNumber = currentUniversity.phoneNumber ?
        currentUniversity.phoneNumber.replace(/^\+91\s*/, '').trim() :
        "";

      // Extract roleId from university data
      let roleId = '';
      if (currentUniversity.roleRef) {
        if (typeof currentUniversity.roleRef === 'object') {
          roleId = currentUniversity.roleRef._id;
          console.log('roleRef is an object, extracted _id:', roleId);
        } else {
          roleId = currentUniversity.roleRef;
          console.log('roleRef is a string:', roleId);
        }
      } else {
        console.log('No roleRef found in university data');
      }

      console.log("Setting form data from API:", {
        schoolName: currentUniversity.name || "",
        ownerName: currentUniversity.contactPerson || "",
        email: currentUniversity.email || "",
        phoneNumber: phoneNumber,
        address: profile.address || "",
        zipcode: profile.zipcode || "",
        state: profile.state || "",
        status: currentUniversity.status === 1 ? 1 : 0,
        roleId: roleId,
        avatar: profile.avatar || null,
      });

      // Set form data from API response
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
        profileImageUrl: profile.avatar
          ? `${VITE_IMAGE_URL}${profile.avatar}`
          : null,
        loginEmail: currentUniversity.email || "",
        loginPhone: phoneNumber
      });
    }
  }, [isEditMode, currentUniversity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // Keep login credentials in sync with general information
    if (name === 'email') {
      updatedFormData.loginEmail = value;
    } else if (name === 'phoneNumber') {
      updatedFormData.loginPhone = value;
    }

    setFormData(updatedFormData);
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

    // Make sure we're sending all required fields
    if (!formData.schoolName) {
      console.error("Missing school name");
      return;
    }
    if (!formData.email) {
      console.error("Missing email");
      return;
    }
    if (!formData.phoneNumber) {
      console.error("Missing phone number");
      return;
    }

    console.log("Submitting form data:", formData);

    let apiPromise;

    // Always use FormData for consistency, whether we have a new image or not
    const formDataObj = new FormData();

    // Add all fields to FormData
    formDataObj.append('name', formData.schoolName);
    formDataObj.append('schoolName', formData.schoolName); // Add both for compatibility
    formDataObj.append('email', formData.email);
    formDataObj.append('phoneNumber', formData.phoneNumber.trim()); // Send without +91 prefix
    formDataObj.append('phone', "+91 " + formData.phoneNumber.trim()); // Also send with +91 prefix
    formDataObj.append('address', formData.address);
    formDataObj.append('zipcode', formData.zipcode);
    formDataObj.append('state', formData.state);
    formDataObj.append('contactPerson', formData.ownerName);
    formDataObj.append('ownerName', formData.ownerName); // Add both for compatibility
    formDataObj.append('status', Number(formData.status)); // Ensure status is a number

    // Add roleId if selected
    if (formData.roleId) {
      formDataObj.append('roleId', formData.roleId);
    }

    // Add profile image if selected
    if (formData.profileImage) {
      formDataObj.append('profileImage', formData.profileImage);
    }

    // If we're in edit mode and have an existing profile image URL but no new image,
    // add a flag to keep the existing image
    if (isEditMode && formData.profileImageUrl && !formData.profileImage) {
      formDataObj.append('keepExistingImage', 'true');
    }

    // Debug: Log all entries in the FormData object
    console.log("FormData entries:");
    for (let [key, value] of formDataObj.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      if (isEditMode) {
        console.log(`Updating university with ID: ${id}`);
        apiPromise = dispatch(updateUniversityThunk({ id, formData: formDataObj }));
      } else {
        console.log('Creating new university');
        apiPromise = dispatch(createUniversityThunk(formDataObj));
      }
    } catch (error) {
      console.error('Error dispatching action:', error);
    }

    // Handle the promise
    apiPromise
      .unwrap()
      .then(() => {
        dispatch(getUniversitiesThunk());
        navigate("/dashboard/admin/schools");
      })
      .catch(error => {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} university:`, error);
      });
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

          <div className="form-grid">
            <div className="form-column">
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
                    {filteredRoles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

            <div className="form-column">
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

              <div className="form-row">
                <div className="form-group half-width">
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
                <div className="form-group half-width">
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

              <div className="form-group profile-image-container">
                <label>School Logo</label>
                <div className="profile-image-upload">
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
                  <button type="button" className="upload-photo-btn" onClick={() => document.getElementById('profileImage').click()}>
                    Upload Photo
                  </button>
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

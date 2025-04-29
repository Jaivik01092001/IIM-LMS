import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createEducatorThunk as createUniversityEducatorThunk, updateEducatorThunk as updateUniversityEducatorThunk, getEducatorsThunk as getUniversityEducatorsThunk } from "../redux/university/universitySlice";
import { createEducatorThunk as createAdminEducatorThunk, updateEducatorThunk as updateAdminEducatorThunk, getEducatorsThunk as getAdminEducatorsThunk, getUniversitiesThunk } from "../redux/admin/adminSlice";
import { getRolesThunk } from "../redux/role/roleSlice";
import "../assets/styles/EducatorAccountForm.css";
import { FaArrowLeft } from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";

const EducatorAccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const educatorData = location.state?.educator || null;
  const isEditMode = !!educatorData;

  // Get user, roles, and universities from Redux store
  const { user } = useSelector((state) => state.auth);
  const { roles } = useSelector((state) => state.role);
  const { universities, loading: universitiesLoading } = useSelector((state) => state.admin);

  // Determine if user is admin
  const isAdmin = user?.role === 'admin';

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

  // Fetch roles and universities on component mount
  useEffect(() => {
    dispatch(getRolesThunk());
    dispatch(getUniversitiesThunk());
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

  // Log roles and universities when they change
  useEffect(() => {
    console.log('Available roles:', roles);
    console.log('Available universities:', universities);
  }, [roles, universities]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    professorName: "",
    universityId: "", // Changed from schoolName to universityId for dropdown selection
    category: "",
    email: "",
    phoneNumber: "",
    address: "",
    zipcode: "",
    state: "",
    roleId: "",
    profileImage: null,
    profileImageUrl: "",
    status: 1,
  });

  // Check if roleId matches any role when formData is initialized
  // This useEffect must be placed after formData state initialization
  useEffect(() => {
    // If in edit mode and we have both educatorData and roles, check if roleId matches any role
    if (isEditMode && educatorData && roles && roles.length > 0 && formData.roleId) {
      console.log('Checking if roleId matches any role:', formData.roleId);
      const matchingRole = roles.find(role => role._id === formData.roleId);
      console.log('Matching role:', matchingRole);
    }
  }, [roles, isEditMode, educatorData, formData.roleId]);

  useEffect(() => {
    if (isEditMode && educatorData) {
      // Strip the '+91' prefix from phone number if exists
      const phoneNumber = educatorData.mobile ?
                        educatorData.mobile.replace(/^\+91\s*/, '').trim() :
                        "";

      console.log('Educator data for edit mode:', educatorData);
      console.log('Educator roleRef:', educatorData.roleRef);
      console.log('Educator _id:', educatorData._id);
      console.log('Educator id:', educatorData.id);

      // Log all properties of educatorData
      console.log('All educatorData properties:');
      for (const key in educatorData) {
        console.log(`${key}: ${JSON.stringify(educatorData[key])}`);
      }

      // If roleRef is an object (populated), extract the _id
      let roleId = '';

      if (educatorData.roleRef) {
        if (typeof educatorData.roleRef === 'object') {
          roleId = educatorData.roleRef._id;
          console.log('roleRef is an object, extracted _id:', roleId);
        } else {
          roleId = educatorData.roleRef;
          console.log('roleRef is a string:', roleId);
        }
      } else {
        console.log('No roleRef found in educatorData');
      }

      console.log('Final extracted roleId:', roleId);

      // Check if avatar is directly on the educator object or in the profile object
      let avatarUrl = educatorData.avatar || (educatorData.profile && educatorData.profile.avatar) || "";

      // If the avatar URL is a full URL (starts with http), use it directly for display
      // Otherwise, it's a relative path, so prepend the base URL (without /api)
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}${avatarUrl}`;
      }

      console.log('Avatar URL from educator data:', avatarUrl);

      // Find university ID if we have a school name
      let universityId = "";
      if (educatorData.university) {
        // If university is an object with _id
        if (typeof educatorData.university === 'object' && educatorData.university._id) {
          universityId = educatorData.university._id;
        }
        // If university is just the ID
        else if (typeof educatorData.university === 'string') {
          universityId = educatorData.university;
        }
      }
      // If no direct university reference, try to find by name
      else if (educatorData.school && universities && universities.length > 0) {
        const matchingUniversity = universities.find(
          uni => uni.name.toLowerCase() === educatorData.school.toLowerCase()
        );
        if (matchingUniversity) {
          universityId = matchingUniversity._id;
        }
      }

      console.log('Found university ID:', universityId);

      setFormData({
        professorName: educatorData.professor || "",
        universityId: universityId,
        category: educatorData.category || "",
        email: educatorData.email || "",
        phoneNumber: phoneNumber,
        address: educatorData.address || "",
        zipcode: educatorData.zipcode || "",
        state: educatorData.state || "",
        roleId: roleId, // Use the extracted roleId
        profileImageUrl: avatarUrl,
        status: educatorData.status ? 1 : 0,
      });

      console.log('Form data after initialization:', {
        profileImageUrl: educatorData.avatar || ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, educatorData, universities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    // Format phone number properly - ensure it's not empty
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      setFormErrors({...formErrors, phoneNumber: 'Phone number is required'});
      setIsSubmitting(false);
      return;
    }

    // Add +91 prefix only if it doesn't already have it
    const phoneNumber = formData.phoneNumber.trim();
    const formattedPhoneNumber = phoneNumber.startsWith('+91')
      ? phoneNumber
      : "+91 " + phoneNumber;

    formDataObj.append('phoneNumber', formattedPhoneNumber);
    formDataObj.append('address', formData.address);
    formDataObj.append('zipcode', formData.zipcode);
    formDataObj.append('state', formData.state);
    formDataObj.append('status', Number(formData.status));
    formDataObj.append('category', formData.category); // Add category field

    // Validate that a university is selected
    if (!formData.universityId) {
      setFormErrors({...formErrors, universityId: 'Please select a School/University'});
      setIsSubmitting(false);
      return;
    }

    // Find the selected university to get its name
    const selectedUniversity = universities.find(uni => uni._id === formData.universityId);
    if (selectedUniversity) {
      formDataObj.append('schoolName', selectedUniversity.name); // Add school/university name
      formDataObj.append('university', formData.universityId); // Add university ID
    } else {
      setFormErrors({...formErrors, universityId: 'Selected university not found'});
      setIsSubmitting(false);
      return;
    }

    // No password field needed

    // Add roleId if selected, otherwise set default role to 'educator'
    if (formData.roleId) {
      console.log('Selected roleId:', formData.roleId);
      formDataObj.append('roleId', formData.roleId); // Backend expects roleId in the request
    } else {
      console.log('No roleId selected, using default educator role');
      formDataObj.append('role', 'educator');
    }

    // Log all form data for debugging
    for (let pair of formDataObj.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    // Add profile image if selected
    if (formData.profileImage) {
      console.log('Adding profile image to form data:', formData.profileImage.name);
      formDataObj.append('profileImage', formData.profileImage);
    } else {
      console.log('No profile image selected for upload');
    }

    if (isEditMode) {
      // Update existing educator
      // Use the appropriate thunk based on user role
      const updateThunk = isAdmin ? updateAdminEducatorThunk : updateUniversityEducatorThunk;
      const getEducatorsThunk = isAdmin ? getAdminEducatorsThunk : getUniversityEducatorsThunk;

      dispatch(updateThunk({
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
          console.error('Error updating educator:', error);
          // Handle different error formats
          if (error.errors) {
            setFormErrors(error.errors);
          } else if (error.message) {
            // Handle MongoDB duplicate key errors
            if (error.message.includes('duplicate key error') && error.message.includes('phoneNumber')) {
              setFormErrors({
                ...formErrors,
                phoneNumber: 'This phone number is already in use. Please use a different phone number.'
              });
            } else {
              setFormErrors({
                ...formErrors,
                general: error.message
              });
            }
          } else {
            setFormErrors({
              ...formErrors,
              general: 'An error occurred. Please try again.'
            });
          }
          setIsSubmitting(false);
        });
    } else {
      // Create new educator - use the appropriate thunk based on user role
      const createThunk = isAdmin ? createAdminEducatorThunk : createUniversityEducatorThunk;

      console.log('Using createThunk:', isAdmin ? 'createAdminEducatorThunk' : 'createUniversityEducatorThunk');
      console.log('Form data roleId:', formData.roleId);

      dispatch(createThunk(formDataObj))
        .unwrap()
        .then(() => {
          // Refresh educators list
          // Use the appropriate thunk based on user role
          const getEducatorsThunk = isAdmin ? getAdminEducatorsThunk : getUniversityEducatorsThunk;
          dispatch(getEducatorsThunk());
          // Navigate back to educators list
          navigate("/dashboard/admin/educators");
        })
        .catch(error => {
          console.error('Error creating educator:', error);
          // Handle different error formats
          if (error.errors) {
            setFormErrors(error.errors);
          } else if (error.message) {
            // Handle MongoDB duplicate key errors
            if (error.message.includes('duplicate key error') && error.message.includes('phoneNumber')) {
              setFormErrors({
                ...formErrors,
                phoneNumber: 'This phone number is already in use. Please use a different phone number.'
              });
            } else {
              setFormErrors({
                ...formErrors,
                general: error.message
              });
            }
          } else {
            setFormErrors({
              ...formErrors,
              general: 'An error occurred. Please try again.'
            });
          }
          setIsSubmitting(false);
        });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Show loading spinner when universities are being fetched
  if (universitiesLoading || !universities) {
    return <LoadingSpinner />;
  }

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
                  <label htmlFor="universityId">School/University</label>
                  <select
                    id="universityId"
                    name="universityId"
                    value={formData.universityId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select School/University</option>
                    {universities && universities.length > 0 ? (
                      universities.map((university) => (
                        <option key={university._id} value={university._id}>
                          {university.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading universities...</option>
                    )}
                  </select>
                  {formErrors.universityId && <div className="error-message">{formErrors.universityId}</div>}
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
                    <option value="School">School</option>
                    <option value="University">University</option>
                  </select>
                </div>
              </div>
              {filteredRoles.length >= 1 && (
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
                    {filteredRoles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.roleId && <div className="error-message">{formErrors.roleId}</div>}
                </div>
              </div>
              )}
            </div>
            <div>
              <div className="form-group profile-image-container">
                <label>Profile Image</label>
                <div className="profile-image-upload">
                  <div className="profile-image">
                    {formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile"
                        onError={(e) => {
                          console.error("Error loading image:", e);
                          e.target.onerror = null;
                          e.target.src = "https://randomuser.me/api/portraits/men/1.jpg";
                        }}
                      />
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
              {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
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

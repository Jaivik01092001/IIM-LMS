import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getStaffMemberByIdThunk,
    createStaffMemberThunk,
    updateStaffMemberThunk,
    clearSelectedStaffMember
} from "../redux/admin/staffSlice";
import { FaArrowLeft, FaUpload, FaTrash } from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import "../assets/styles/StaffAccountForm.css";

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

const StaffAccountForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedStaffMember, loading } = useSelector((state) => state.staff);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        status: "1",
        profile: {
            designation: "",
            department: "",
            address: "",
            state: "",
            zipcode: "",
            avatar: null,
        },
    });

    // File handling and UI state
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Fetch staff data if editing
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            dispatch(getStaffMemberByIdThunk(id));
        } else {
            dispatch(clearSelectedStaffMember());
        }

        return () => {
            dispatch(clearSelectedStaffMember());
        };
    }, [dispatch, id]);

    // Populate form with existing data if editing
    useEffect(() => {
        if (selectedStaffMember && isEditing) {
            const profile = selectedStaffMember.profile || {};
            let avatarUrl = null;

            if (profile.avatar) {
                avatarUrl = profile.avatar.startsWith('http')
                    ? profile.avatar
                    : `${import.meta.env.VITE_API_URL.replace('/api', '')}${profile.avatar}`;
                setAvatarPreview(avatarUrl);
            }

            setFormData({
                name: selectedStaffMember.name || "",
                email: selectedStaffMember.email || "",
                phoneNumber: selectedStaffMember.phoneNumber || "",
                status: selectedStaffMember.status?.toString() || "1",
                profile: {
                    designation: profile.designation || "",
                    department: profile.department || "",
                    address: profile.address || "",
                    state: profile.state || "",
                    zipcode: profile.zipcode || "",
                    avatar: avatarUrl, // Store URL string for existing avatar
                },
            });
        }
    }, [selectedStaffMember, isEditing]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            // For profile fields
            const [parent, child] = name.split(".");
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value,
                },
            });
        } else {
            // For root level fields
            setFormData({ ...formData, [name]: value });
        }

        // Clear error for this field if it exists
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Update form data
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    avatar: file,
                },
            });

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Clear avatar
    const handleRemoveAvatar = () => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                avatar: null,
            },
        });
        setAvatarPreview(null);
    };

    // Validation
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Required fields validation
        if (!formData.name) {
            errors.name = "Name is required";
            isValid = false;
        }

        if (!formData.email) {
            errors.email = "Email is required";
            isValid = false;
        } else {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = "Please enter a valid email address";
                isValid = false;
            }
        }

        if (!formData.phoneNumber) {
            errors.phoneNumber = "Phone number is required";
            isValid = false;
        } else {
            // Phone validation - allow only digits
            const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
            if (phoneDigits.length !== 10) {
                errors.phoneNumber = "Please enter a valid 10-digit phone number";
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Create FormData to match backend expected keys
        const apiFormData = new FormData();

        // Direct fields
        apiFormData.append("name", formData.name);
        apiFormData.append("email", formData.email);
        apiFormData.append("phoneNumber", formData.phoneNumber);
        apiFormData.append("status", formData.status);

        // Profile nested fields - using a different approach that might work better with the backend
        if (formData.profile.designation) {
            apiFormData.append("designation", formData.profile.designation);
            apiFormData.append("profile.designation", formData.profile.designation);
            console.log("Adding designation:", formData.profile.designation);
        }
        if (formData.profile.department) {
            apiFormData.append("department", formData.profile.department);
            apiFormData.append("profile.department", formData.profile.department);
            console.log("Adding department:", formData.profile.department);
        }
        if (formData.profile.address) {
            apiFormData.append("address", formData.profile.address);
            apiFormData.append("profile.address", formData.profile.address);
        }
        if (formData.profile.state) {
            apiFormData.append("state", formData.profile.state);
            apiFormData.append("profile.state", formData.profile.state);
        }
        if (formData.profile.zipcode) {
            apiFormData.append("zipcode", formData.profile.zipcode);
            apiFormData.append("profile.zipcode", formData.profile.zipcode);
        }

        // Add debug log for FormData
        console.log("FormData contents:");
        for (let [key, value] of apiFormData.entries()) {
            console.log(key, ":", value);
        }

        // File field (only if user uploaded new file)
        if (formData.profile.avatar instanceof File) {
            apiFormData.append("avatar", formData.profile.avatar);
        }

        try {
            if (isEditing) {
                // Update existing staff
                await dispatch(updateStaffMemberThunk({ id, formData: apiFormData })).unwrap();
                showSuccessToast("Staff updated successfully");
            } else {
                // Create new staff
                await dispatch(createStaffMemberThunk(apiFormData)).unwrap();
                showSuccessToast("Staff created successfully");
            }
            navigate("/dashboard/admin/staffs");
        } catch (error) {
            console.error("Error submitting form:", error);
            showErrorToast(error.message || "Failed to save staff data");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel button click
    const handleCancel = () => {
        navigate("/dashboard/admin/staffs");
    };

    if (loading && isEditing) {
        return <LoadingSpinner size="large" message="Loading staff data..." />;
    }

    return (
        <div className="staff-form-container">
            <div className="form-header">
                <button
                    className="back-button"
                    onClick={handleCancel}
                    aria-label="Go back"
                >
                    <FaArrowLeft />
                </button>
                <h1>{isEditing ? "Edit Staff Account" : "Create New Staff Account"}</h1>
            </div>

            <form className="staff-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2>General Information</h2>
                    <div className="form-grid">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={formErrors.name && submitted ? "error" : ""}
                                />
                                {formErrors.name && submitted && (
                                    <span className="error-message">{formErrors.name}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={formErrors.email && submitted ? "error" : ""}
                                />
                                {formErrors.email && submitted && (
                                    <span className="error-message">{formErrors.email}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number *</label>
                                <div className="phone-input-wrapper">
                                    <div className="phone-prefix">+91</div>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        className={formErrors.phoneNumber && submitted ? "error" : ""}
                                    />
                                </div>
                                {formErrors.phoneNumber && submitted && (
                                    <span className="error-message">{formErrors.phoneNumber}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="profile.designation">Designation</label>
                                <input
                                    type="text"
                                    id="profile.designation"
                                    name="profile.designation"
                                    value={formData.profile.designation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="profile.department">Department</label>
                                <input
                                    type="text"
                                    id="profile.department"
                                    name="profile.department"
                                    value={formData.profile.department}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Account Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="profile.address">Address</label>
                                <input
                                    type="text"
                                    id="profile.address"
                                    name="profile.address"
                                    value={formData.profile.address}
                                    onChange={handleChange}
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
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="profile.zipcode">Zipcode</label>
                                <input
                                    type="text"
                                    id="profile.zipcode"
                                    name="profile.zipcode"
                                    value={formData.profile.zipcode}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <div className="profile-image-upload">
                                    <div className="profile-image">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Profile" />
                                        ) : (
                                            <div className="placeholder-image"></div>
                                        )}
                                    </div>
                                    <div className="upload-actions">
                                        <label htmlFor="avatar" className="upload-photo-btn">
                                            <FaUpload className="mr-2" /> Upload Photo
                                        </label>
                                        <input
                                            type="file"
                                            id="avatar"
                                            name="avatar"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            hidden
                                        />
                                        {avatarPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="remove-photo-btn"
                                            >
                                                <FaTrash className="mr-2" /> Remove
                                            </button>
                                        )}
                                    </div>
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
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner-small"></div>
                                {isEditing ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            isEditing ? "Update Staff" : "Create Staff"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffAccountForm; 
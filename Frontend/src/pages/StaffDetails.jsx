import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStaffMemberByIdThunk, updateStaffMemberThunk } from "../redux/admin/staffSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "../assets/styles/StaffDetails.css";
import DefaultProfilePic from "../assets/images/default-profile.png";

import { FaUserCircle, FaBuilding } from "react-icons/fa";

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedStaffMember: staff, loading } = useSelector((state) => state.staff);
    const [staffDetails, setStaffDetails] = useState(null);
    const [imageFailed, setImageFailed] = useState(false);
    const avatarProcessed = useRef(false);

    // Fetch staff data once
    useEffect(() => {
        if (id) {
            dispatch(getStaffMemberByIdThunk(id));
            avatarProcessed.current = false;
            setImageFailed(false);
        }

        return () => {
            // Reset on unmount
            avatarProcessed.current = false;
            setImageFailed(false);
        };
    }, [dispatch, id]);

    // Prepare staff details
    useEffect(() => {
        if (staff && !avatarProcessed.current) {
            avatarProcessed.current = true;

            // Get profile or empty object
            const profile = staff.profile || {};

            // Process avatar URL correctly
            let avatarUrl = DefaultProfilePic;

            if (profile.avatar) {
                // If avatar starts with http, use as is
                if (profile.avatar.startsWith('http')) {
                    avatarUrl = profile.avatar;
                } else {
                    // Otherwise prepend the API base URL
                    avatarUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}${profile.avatar}`;
                }
            }

            setStaffDetails({
                id: staff._id,
                name: staff.name || "N/A",
                email: staff.email || "N/A",
                phoneNumber: staff.phoneNumber || "N/A",
                department: profile.department || "N/A",
                designation: profile.designation || "N/A",
                address: profile.address || "N/A",
                state: profile.state || "N/A",
                zipcode: profile.zipcode || "N/A",
                avatar: avatarUrl,
                rawAvatar: profile.avatar,
                status: staff.status,
                joinDate: staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "N/A",
                updatedAt: staff.updatedAt ? new Date(staff.updatedAt).toLocaleDateString() : "N/A"
            });
        }
    }, [staff]);

    // Handle edit button click
    const handleEdit = () => {
        navigate(`/dashboard/admin/staff-account-form/${id}`);
    };

    // Handle back button click
    const handleBack = () => {
        navigate("/dashboard/admin/staffs");
    };

    // Handle status toggle
    const handleStatusToggle = () => {
        // Toggle between 1 and 0
        const newStatus = staffDetails.status === 1 ? 0 : 1;

        // Create FormData object for API call
        const formData = new FormData();
        formData.append("status", newStatus);

        dispatch(updateStaffMemberThunk({
            id: staffDetails.id,
            formData
        }))
            .unwrap()
            .then(() => {
                // Reload staff details after update
                dispatch(getStaffMemberByIdThunk(id));
            })
            .catch(error => {
                console.error("Error toggling staff status:", error);
            });
    };

    // Handle image error
    const handleImageError = () => {
        setImageFailed(true);
    };

    if (loading) {
        return <LoadingSpinner size="large" message="Loading staff details..." />;
    }

    if (!staffDetails) {
        return (
            <div className="staff-details-error">Staff not found</div>
        );
    }

    return (
        <div className="staff-details-page">
            <div className="staff-header">
                <div className="staff-info">
                    {imageFailed || !staffDetails.avatar ? (
                        <FaUserCircle className="staff-avatar-placeholder" size={64} />
                    ) : (
                        <img
                            src={staffDetails.avatar}
                            alt={staffDetails.name}
                            className="staff-avatar"
                            onError={handleImageError}
                        />
                    )}
                    <div className="staff-text">
                        <h1>{staffDetails.name}</h1>
                        <span className="category">Role: {staffDetails.designation}</span>
                    </div>
                </div>
                <div className="department-badge">
                    <FaBuilding size={34} />
                    <div className="department-text">
                        <div className="department-name">{staffDetails.department}</div>
                        <div className="department-type">Department</div>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-section">
                    <h2>Information</h2>
                    <div className="info-content">
                        <div className="info-row">
                            <label>Email:</label>
                            <span>{staffDetails.email}</span>
                        </div>
                        <div className="info-row">
                            <label>Phone:</label>
                            <span>{staffDetails.phoneNumber}</span>
                        </div>
                        <div className="info-row">
                            <label>Address:</label>
                            <span>{staffDetails.address}</span>
                        </div>
                        <div className="info-row">
                            <label>Zipcode:</label>
                            <span>{staffDetails.zipcode}</span>
                        </div>
                        <div className="info-row">
                            <label>State:</label>
                            <span>{staffDetails.state}</span>
                        </div>
                        <div className="info-row">
                            <label>Role:</label>
                            <span>{staffDetails.designation}</span>
                        </div>
                        <div className="info-row">
                            <label>Department:</label>
                            <span>{staffDetails.department}</span>
                        </div>
                    </div>
                </div>

                <div className="details-section">
                    <h2>Status</h2>
                    <div className="info-content">
                        <div className="info-row">
                            <label>Current Status:</label>
                            <div className="status-toggle-container">
                                <div
                                    className={`status-indicator ${staffDetails.status === 1 ? "active" : ""}`}
                                    onClick={handleStatusToggle}
                                    title={staffDetails.status === 1 ? "Click to deactivate" : "Click to activate"}
                                />
                                <span className={staffDetails.status === 1 ? "text-green-600" : "text-red-600"}>
                                    {staffDetails.status === 1 ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                        <div className="info-row">
                            <label>Joined:</label>
                            <span>{staffDetails.joinDate}</span>
                        </div>
                        <div className="info-row">
                            <label>Updated:</label>
                            <span>{staffDetails.updatedAt}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button
                    onClick={handleBack}
                    className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition font-medium"
                >
                    Back to Staff List
                </button>
                <button
                    onClick={handleEdit}
                    className="edit-btn"
                >
                    Edit Details
                </button>
            </div>
        </div>
    );
};

export default StaffDetails; 
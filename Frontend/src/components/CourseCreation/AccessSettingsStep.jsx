import React, { useState, useEffect } from "react";
import { FaUser, FaUserPlus, FaTimes, FaLock, FaPencilAlt, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaChartLine } from "react-icons/fa";
import { useSelector } from "react-redux";

const AccessSettingsStep = ({ courseData, updateCourseData }) => {
    const { educators } = useSelector((state) => state.university);

    // Local state for form fields
    const [localData, setLocalData] = useState({
        status: courseData.status ?? 1, // 1 = active, 0 = inactive
        isDraft: courseData.isDraft ?? true,
        enrolledUsers: courseData.enrolledUsers || [],
        userSearchTerm: "",
        filteredUsers: []
    });

    // Filter educators based on search term for adding enrolled users
    useEffect(() => {
        if (localData.userSearchTerm && educators && educators.length > 0) {
            const filtered = educators.filter(
                user =>
                    user.name.toLowerCase().includes(localData.userSearchTerm.toLowerCase()) &&
                    !localData.enrolledUsers.some(enrolled => enrolled.user === user._id)
            );
            setLocalData(prev => ({ ...prev, filteredUsers: filtered }));
        } else {
            setLocalData(prev => ({ ...prev, filteredUsers: [] }));
        }
    }, [localData.userSearchTerm, educators, localData.enrolledUsers]);

    // Toggle course status (active/inactive)
    const toggleStatus = () => {
        const newStatus = localData.status === 1 ? 0 : 1;
        setLocalData(prev => ({ ...prev, status: newStatus }));
        updateCourseData({ status: newStatus });
    };

    // Toggle draft status
    const toggleDraft = () => {
        const newDraft = !localData.isDraft;
        setLocalData(prev => ({ ...prev, isDraft: newDraft }));
        updateCourseData({ isDraft: newDraft });
    };

    // Add user to enrolled users
    const addEnrolledUser = (user) => {
        // Create new enrollment with default values
        const newEnrollment = {
            user: user._id,
            userName: user.name,
            status: 'in_progress',
            enrolledAt: new Date().toISOString(),
            progress: 0
        };

        const updatedEnrolledUsers = [...localData.enrolledUsers, newEnrollment];
        setLocalData(prev => ({
            ...prev,
            enrolledUsers: updatedEnrolledUsers,
            userSearchTerm: "",
            filteredUsers: []
        }));

        updateCourseData({ enrolledUsers: updatedEnrolledUsers });
    };

    // Remove user from enrolled users
    const removeEnrolledUser = (userId) => {
        const updatedEnrolledUsers = localData.enrolledUsers.filter(
            enrollment => enrollment.user !== userId
        );

        setLocalData(prev => ({ ...prev, enrolledUsers: updatedEnrolledUsers }));
        updateCourseData({ enrolledUsers: updatedEnrolledUsers });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setLocalData(prev => ({ ...prev, userSearchTerm: e.target.value }));
    };

    return (
        <div className="access-settings-step">
            <h2>Course Access & Status</h2>
            <p className="step-description">
                Configure who can access your course and its current status.
            </p>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon">
                        <FaEye />
                    </div>
                    <h3 className="settings-card-title">Visibility Settings</h3>
                </div>
                <p className="field-hint">
                    Control the visibility and publication status of your course.
                </p>

                <div className="toggle-group">
                    <div className="toggle-item">
                        <div className="toggle-info">
                            <h3>
                                Course Status
                                <span className={`status-badge ${localData.status === 1 ? 'active' : 'inactive'}`}>
                                    {localData.status === 1
                                        ? <><FaCheckCircle /> Active</>
                                        : <><FaTimesCircle /> Inactive</>
                                    }
                                </span>
                            </h3>
                            <p>
                                {localData.status === 1
                                    ? "Course is active and can be discovered by students."
                                    : "Course is inactive and hidden from students."}
                            </p>
                        </div>
                        <div className="toggle-wrapper">
                            <label className="schooljxs-toggle">
                                <input
                                    type="checkbox"
                                    checked={localData.status === 1}
                                    onChange={toggleStatus}
                                />
                                <span className="slider"></span>
                            </label>
                            <div className="toggle-label-text">
                                {localData.status === 1 ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    </div>

                    <div className="toggle-item">
                        <div className="toggle-info">
                            <h3>
                                Publication Status
                                <span className={`status-badge ${!localData.isDraft ? 'active' : 'inactive'}`}>
                                    {!localData.isDraft
                                        ? <><FaCheckCircle /> Published</>
                                        : <><FaPencilAlt /> Draft</>
                                    }
                                </span>
                            </h3>
                            <p>
                                {localData.isDraft
                                    ? "Course is in draft mode and will not be visible to students."
                                    : "Course is published and available to enrolled students."}
                            </p>
                        </div>
                        <div className="toggle-wrapper">
                            <label className="schooljxs-toggle">
                                <input
                                    type="checkbox"
                                    checked={!localData.isDraft}
                                    onChange={toggleDraft}
                                />
                                <span className="slider"></span>
                            </label>
                            <div className="toggle-label-text">
                                {!localData.isDraft ? 'Published' : 'Draft'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon">
                        <FaLock />
                    </div>
                    <h3 className="settings-card-title">User Access</h3>
                </div>
                <p className="field-hint">
                    Manage who can access this course during development or testing.
                </p>

                <div className="enrolled-users-section">
                    <h3>Enrolled Users</h3>
                    <p className="section-description">
                        Add testers or specific users who need access to this course during development.
                    </p>

                    <div className="user-search">
                        <input
                            type="text"
                            placeholder="Search users to enroll..."
                            value={localData.userSearchTerm}
                            onChange={handleSearchChange}
                        />
                        {localData.userSearchTerm && (
                            <div className="search-results">
                                {localData.filteredUsers.length > 0 ? (
                                    localData.filteredUsers.map(user => (
                                        <div key={user._id} className="user-result" onClick={() => addEnrolledUser(user)}>
                                            <div className="user-icon">
                                                <FaUser />
                                            </div>
                                            <div className="user-info">
                                                <p className="user-name">{user.name}</p>
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="add-user-button"
                                            >
                                                <FaUserPlus />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <p>No matching users found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="enrolled-users-list">
                        <h4>
                            Currently Enrolled ({localData.enrolledUsers.length})
                            <span className="hint">For testing purposes only</span>
                        </h4>

                        {localData.enrolledUsers.length === 0 ? (
                            <div className="no-users">
                                <p>No users enrolled yet.</p>
                            </div>
                        ) : (
                            <ul>
                                {localData.enrolledUsers.map(enrollment => (
                                    <li key={enrollment.user} className="enrolled-user">
                                        <div className="user-icon">
                                            <FaUser />
                                        </div>
                                        <div className="user-info">
                                            <p className="user-name">
                                                {enrollment.userName}
                                                {enrollment.progress > 0 && (
                                                    <span className="progress-badge">
                                                        <FaChartLine /> {enrollment.progress}% Complete
                                                    </span>
                                                )}
                                            </p>
                                            <p className="user-status">
                                                Status: {enrollment.status === 'in_progress' ? 'In Progress' : 'Completed'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="remove-user-button"
                                            onClick={() => removeEnrolledUser(enrollment.user)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessSettingsStep; 
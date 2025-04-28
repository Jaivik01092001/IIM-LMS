import React, { useState, useEffect } from "react";
import { FaToggleOn, FaToggleOff, FaUser, FaUserPlus, FaTimes } from "react-icons/fa";
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

            <div className="form-section">
                <div className="toggle-group">
                    <div className="toggle-item">
                        <div className="toggle-info">
                            <h3>Course Status</h3>
                            <p>
                                {localData.status === 1
                                    ? "Course is active and can be discovered by students."
                                    : "Course is inactive and hidden from students."}
                            </p>
                        </div>
                        <button
                            type="button"
                            className={`toggle-button ${localData.status === 1 ? 'active' : ''}`}
                            onClick={toggleStatus}
                        >
                            {localData.status === 1 ? <FaToggleOn /> : <FaToggleOff />}
                            <span>{localData.status === 1 ? 'Active' : 'Inactive'}</span>
                        </button>
                    </div>

                    <div className="toggle-item">
                        <div className="toggle-info">
                            <h3>Course Publication</h3>
                            <p>
                                {localData.isDraft
                                    ? "Course is in draft mode and will not be visible to students."
                                    : "Course is published and available to enrolled students."}
                            </p>
                        </div>
                        <button
                            type="button"
                            className={`toggle-button ${!localData.isDraft ? 'active' : ''}`}
                            onClick={toggleDraft}
                        >
                            {!localData.isDraft ? <FaToggleOn /> : <FaToggleOff />}
                            <span>{localData.isDraft ? 'Draft' : 'Published'}</span>
                        </button>
                    </div>
                </div>

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
                                            <p className="user-name">{enrollment.userName}</p>
                                            <p className="user-status">
                                                Status: {enrollment.status === 'in_progress' ? 'In Progress' : 'Completed'}
                                                {enrollment.progress > 0 && ` (${enrollment.progress}%)`}
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
import React, { useState } from "react";
import { FaClock, FaCog, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaPencilAlt } from "react-icons/fa";

const CourseSettingsStep = ({ courseData, updateCourseData }) => {
    // Local state for form fields
    const [localData, setLocalData] = useState({
        duration: courseData.duration || "",
        status: courseData.status ?? 1, // 1=active, 0=inactive
        isDraft: courseData.isDraft ?? true // true=draft, false=published
    });

    // Handle simple input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
        updateCourseData({ [name]: value });
    };

    // Toggle course status (active/inactive) and publication status
    const toggleStatus = () => {
        const newStatus = localData.status === 1 ? 0 : 1;
        // When toggling to active, also set isDraft to false (published)
        // When toggling to inactive, set isDraft to true (draft)
        const newIsDraft = newStatus === 0;

        setLocalData(prev => ({
            ...prev,
            status: newStatus,
            isDraft: newIsDraft
        }));

        updateCourseData({
            status: newStatus,
            isDraft: newIsDraft
        });
    };

    // Duration options
    const durationOptions = [
        { value: "", label: "Select duration" },
        { value: "1-2 hours", label: "1-2 hours" },
        { value: "3-5 hours", label: "3-5 hours" },
        { value: "5-10 hours", label: "5-10 hours" },
        { value: "10+ hours", label: "10+ hours" },
        { value: "1 week", label: "1 week" },
        { value: "2 weeks", label: "2 weeks" },
        { value: "3 weeks", label: "3 weeks" },
        { value: "4 weeks", label: "4 weeks" },
        { value: "5+ weeks", label: "5+ weeks" }
    ];

    return (
        <div className="course-settings-step">
            <h2>Course Settings</h2>
            <p className="step-description">
                Configure important settings for your course to help students understand what to expect.
            </p>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon">
                        <FaClock />
                    </div>
                    <h3 className="settings-card-title">Time Commitment</h3>
                </div>
                <p className="field-hint">
                    Help students understand how much time they should set aside to complete this course.
                </p>
                <div className="form-group">
                    <label htmlFor="duration">
                        Course Duration
                    </label>
                    <div className="duration-selector">
                        <select
                            id="duration"
                            name="duration"
                            value={localData.duration}
                            onChange={handleInputChange}
                        >
                            {durationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="field-hint">
                        Approximate time it takes to complete the course.
                    </p>

                    {localData.duration && (
                        <div className="duration-badge">
                            <FaHourglassHalf />
                            <span>Duration: {localData.duration}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon">
                        <FaCog />
                    </div>
                    <h3 className="settings-card-title">Course Visibility & Publication</h3>
                </div>
                <p className="field-hint">
                    Control whether your course is visible to students and its publication status.
                </p>
                <div className="toggle-group">
                    <div className="toggle-item">
                        <div className="toggle-info">
                            <h3>
                                Course Status
                                <span className={`status-badge ${localData.status === 1 ? 'active' : 'inactive'}`}>
                                    {localData.status === 1
                                        ? <><FaCheckCircle /> Active & Published</>
                                        : <><FaPencilAlt /> Inactive & Draft</>
                                    }
                                </span>
                            </h3>
                            <p>
                                {localData.status === 1
                                    ? "Course is active, published, and available to enrolled students."
                                    : "Course is inactive, in draft mode, and hidden from students."}
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
                                {localData.status === 1 ? 'Active & Published' : 'Inactive & Draft'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseSettingsStep;
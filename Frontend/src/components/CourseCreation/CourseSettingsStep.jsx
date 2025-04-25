import React, { useState } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

const CourseSettingsStep = ({ courseData, updateCourseData }) => {
    // Local state for form fields
    const [localData, setLocalData] = useState({
        duration: courseData.duration || "",
        status: courseData.status ?? 1 // 1=active, 0=inactive
    });

    // Handle simple input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
        updateCourseData({ [name]: value });
    };

    // Toggle course status (active/inactive)
    const toggleStatus = () => {
        const newStatus = localData.status === 1 ? 0 : 1;
        setLocalData(prev => ({ ...prev, status: newStatus }));
        updateCourseData({ status: newStatus });
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
                Set the duration and status of your course.
            </p>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="duration">
                        Course Duration
                    </label>
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
                    <p className="field-hint">
                        Approximate time it takes to complete the course.
                    </p>
                </div>

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
                </div>
            </div>
        </div>
    );
};

export default CourseSettingsStep;
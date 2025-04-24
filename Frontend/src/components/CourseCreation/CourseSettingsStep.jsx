import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const CourseSettingsStep = ({ courseData, updateCourseData }) => {
    // Local state for form fields
    const [localData, setLocalData] = useState({
        duration: courseData.duration || "",
        targetAudience: courseData.targetAudience || "",
        learningOutcomes: courseData.learningOutcomes || [],
        requirements: courseData.requirements || [],
        outcomeInput: "",
        requirementInput: ""
    });

    // Handle simple input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));

        // Only update parent for non-temporary input fields
        if (name !== "outcomeInput" && name !== "requirementInput") {
            updateCourseData({ [name]: value });
        }
    };

    // Add learning outcome
    const addLearningOutcome = () => {
        if (!localData.outcomeInput.trim()) return;

        const updatedOutcomes = [...localData.learningOutcomes, localData.outcomeInput.trim()];
        setLocalData(prev => ({
            ...prev,
            learningOutcomes: updatedOutcomes,
            outcomeInput: ""
        }));

        updateCourseData({ learningOutcomes: updatedOutcomes });
    };

    // Remove learning outcome
    const removeLearningOutcome = (index) => {
        const updatedOutcomes = localData.learningOutcomes.filter((_, i) => i !== index);
        setLocalData(prev => ({
            ...prev,
            learningOutcomes: updatedOutcomes
        }));

        updateCourseData({ learningOutcomes: updatedOutcomes });
    };

    // Add requirement
    const addRequirement = () => {
        if (!localData.requirementInput.trim()) return;

        const updatedRequirements = [...localData.requirements, localData.requirementInput.trim()];
        setLocalData(prev => ({
            ...prev,
            requirements: updatedRequirements,
            requirementInput: ""
        }));

        updateCourseData({ requirements: updatedRequirements });
    };

    // Remove requirement
    const removeRequirement = (index) => {
        const updatedRequirements = localData.requirements.filter((_, i) => i !== index);
        setLocalData(prev => ({
            ...prev,
            requirements: updatedRequirements
        }));

        updateCourseData({ requirements: updatedRequirements });
    };

    // Handle enter key press for adding items
    const handleKeyPress = (e, type) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (type === "outcome") {
                addLearningOutcome();
            } else if (type === "requirement") {
                addRequirement();
            }
        }
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
                Provide additional information to help students understand what they'll learn and what prerequisites they need.
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

                <div className="form-group">
                    <label htmlFor="targetAudience">
                        Target Audience
                    </label>
                    <textarea
                        id="targetAudience"
                        name="targetAudience"
                        value={localData.targetAudience}
                        onChange={handleInputChange}
                        placeholder="Who is this course for?"
                        rows={3}
                    />
                    <p className="field-hint">
                        Describe who would benefit most from taking this course.
                    </p>
                </div>

                <div className="form-group">
                    <label>
                        Learning Outcomes <span className="required">*</span>
                    </label>
                    <div className="list-input-container">
                        <div className="input-with-button">
                            <input
                                type="text"
                                name="outcomeInput"
                                value={localData.outcomeInput}
                                onChange={handleInputChange}
                                onKeyPress={(e) => handleKeyPress(e, "outcome")}
                                placeholder="What will students learn? (Press Enter to add)"
                            />
                            <button
                                type="button"
                                className="add-item-button"
                                onClick={addLearningOutcome}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <ul className="items-list">
                            {localData.learningOutcomes.length === 0 ? (
                                <li className="empty-message">No learning outcomes added yet.</li>
                            ) : (
                                localData.learningOutcomes.map((outcome, index) => (
                                    <li key={index} className="item">
                                        <span>{outcome}</span>
                                        <button
                                            type="button"
                                            className="remove-item-button"
                                            onClick={() => removeLearningOutcome(index)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                        <p className="field-hint">
                            List specific skills or knowledge students will gain from this course.
                        </p>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        Requirements/Prerequisites
                    </label>
                    <div className="list-input-container">
                        <div className="input-with-button">
                            <input
                                type="text"
                                name="requirementInput"
                                value={localData.requirementInput}
                                onChange={handleInputChange}
                                onKeyPress={(e) => handleKeyPress(e, "requirement")}
                                placeholder="What should students know before starting? (Press Enter to add)"
                            />
                            <button
                                type="button"
                                className="add-item-button"
                                onClick={addRequirement}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <ul className="items-list">
                            {localData.requirements.length === 0 ? (
                                <li className="empty-message">No requirements added yet.</li>
                            ) : (
                                localData.requirements.map((requirement, index) => (
                                    <li key={index} className="item">
                                        <span>{requirement}</span>
                                        <button
                                            type="button"
                                            className="remove-item-button"
                                            onClick={() => removeRequirement(index)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                        <p className="field-hint">
                            List any prerequisites or technical requirements for taking this course.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseSettingsStep; 
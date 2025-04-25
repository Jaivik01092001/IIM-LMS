import React from "react";
import { FaCheck, FaExclamationTriangle, FaImage } from "react-icons/fa";

const ReviewSubmitStep = ({ courseData, formErrors, thumbnailPreview }) => {
    // Function to check if required fields are filled
    const validateStep = (stepNumber) => {
        switch (stepNumber) {
            case 1: // Course Info + Media
                return !!(
                    courseData.title &&
                    courseData.shortDescription &&
                    courseData.language &&
                    (thumbnailPreview || courseData.thumbnail)
                );
            case 2: // Curriculum
                return courseData.modules && courseData.modules.length > 0;
            case 3: // Course Settings
                return !!courseData.duration;
            default:
                return false;
        }
    };

    // Get validation messages for each step
    const getValidationMessages = (stepNumber) => {
        const messages = [];

        switch (stepNumber) {
            case 1: // Course Info + Media
                if (!courseData.title) {
                    messages.push("Course title is required");
                }
                if (!courseData.shortDescription) {
                    messages.push("Short description is required");
                }
                if (!thumbnailPreview && !courseData.thumbnail) {
                    messages.push("Course thumbnail is required");
                }
                break;
            case 2: // Curriculum
                if (!courseData.modules || courseData.modules.length === 0) {
                    messages.push("At least one module is required");
                }
                break;
            case 3: // Course Settings
                if (!courseData.duration) {
                    messages.push("Course duration is required");
                }
                break;
            default:
                break;
        }

        return messages;
    };

    // Check if the course is ready to publish
    const isReadyToPublish = validateStep(1) && validateStep(2) && validateStep(3);

    return (
        <div className="review-submit-step">
            <h2>Review & Submit</h2>
            <p className="step-description">
                Review your course details before submitting. Make sure all required information is filled out.
            </p>

            <div className="review-sections">
                {/* Step 1: Course Info & Media */}
                <div className={`review-section ${validateStep(1) ? 'valid' : 'invalid'}`}>
                    <div className="review-header">
                        <h3>Course Information</h3>
                        <span className="validation-status">
                            {validateStep(1) ? <FaCheck className="valid-icon" /> : <FaExclamationTriangle className="invalid-icon" />}
                        </span>
                    </div>

                    <div className="review-content">
                        <div className="review-thumbnail">
                            {thumbnailPreview || courseData.thumbnail ? (
                                <img
                                    src={thumbnailPreview || courseData.thumbnail}
                                    alt="Course thumbnail"
                                    className="thumbnail-preview"
                                />
                            ) : (
                                <div className="thumbnail-placeholder">
                                    <FaImage />
                                    <span>No thumbnail</span>
                                </div>
                            )}
                        </div>

                        <div className="review-details">
                            <div className="review-item">
                                <span className="label">Title:</span>
                                <span className="value">{courseData.title || 'Not set'}</span>
                            </div>

                            <div className="review-item">
                                <span className="label">Description:</span>
                                <span className="value">{courseData.shortDescription || 'Not set'}</span>
                            </div>

                            <div className="review-item">
                                <span className="label">Language:</span>
                                <span className="value">{courseData.language || 'Not set'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Validation messages */}
                    {!validateStep(1) && (
                        <div className="validation-messages">
                            {getValidationMessages(1).map((message, index) => (
                                <p key={index} className="validation-message">
                                    <FaExclamationTriangle />
                                    <span>{message}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 2: Curriculum */}
                <div className={`review-section ${validateStep(2) ? 'valid' : 'invalid'}`}>
                    <div className="review-header">
                        <h3>Curriculum</h3>
                        <span className="validation-status">
                            {validateStep(2) ? <FaCheck className="valid-icon" /> : <FaExclamationTriangle className="invalid-icon" />}
                        </span>
                    </div>

                    <div className="review-content">
                        <div className="review-details wide">
                            <div className="review-item">
                                <span className="label">Structure:</span>
                                <span className="value">Module-based</span>
                            </div>

                            <div className="review-item">
                                <span className="label">Modules:</span>
                                <span className="value">{courseData.modules?.length || 0} module(s)</span>

                                {courseData.modules && courseData.modules.length > 0 && (
                                    <ul className="modules-list">
                                        {courseData.modules.map((module, index) => (
                                            <li key={module._id || index}>
                                                <strong>{module.title}</strong>
                                                <span className="content-count">
                                                    {module.content?.length || 0} content item(s)
                                                    {module.quiz && ', 1 quiz'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Validation messages */}
                    {!validateStep(2) && (
                        <div className="validation-messages">
                            {getValidationMessages(2).map((message, index) => (
                                <p key={index} className="validation-message">
                                    <FaExclamationTriangle />
                                    <span>{message}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 3: Course Settings */}
                <div className={`review-section ${validateStep(3) ? 'valid' : 'invalid'}`}>
                    <div className="review-header">
                        <h3>Course Settings</h3>
                        <span className="validation-status">
                            {validateStep(3) ? <FaCheck className="valid-icon" /> : <FaExclamationTriangle className="invalid-icon" />}
                        </span>
                    </div>

                    <div className="review-content">
                        <div className="review-details wide">
                            <div className="review-item">
                                <span className="label">Duration:</span>
                                <span className="value">{courseData.duration || 'Not set'}</span>
                            </div>

                            <div className="review-item">
                                <span className="label">Status:</span>
                                <span className="value status">
                                    {courseData.status === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="review-item">
                                <span className="label">Publication:</span>
                                <span className="value publication">
                                    {courseData.isDraft ? 'Draft' : 'Published'}
                                </span>
                            </div>

                            <div className="review-item">
                                <span className="label">Enrolled Users:</span>
                                <span className="value">
                                    {courseData.enrolledUsers?.length || 0} user(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Validation messages */}
                    {!validateStep(3) && (
                        <div className="validation-messages">
                            {getValidationMessages(3).map((message, index) => (
                                <p key={index} className="validation-message">
                                    <FaExclamationTriangle />
                                    <span>{message}</span>
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Publication status shown in Course Settings section */}

                {/* Overall submission readiness */}
                <div className="submission-readiness">
                    {isReadyToPublish ? (
                        <div className="ready-message">
                            <FaCheck />
                            <span>Your course is ready to be submitted!</span>
                        </div>
                    ) : (
                        <div className="not-ready-message">
                            <FaExclamationTriangle />
                            <span>Please complete all required fields before submitting your course.</span>
                        </div>
                    )}

                    {/* Server-side validation errors */}
                    {formErrors && Object.keys(formErrors).length > 0 && (
                        <div className="server-errors">
                            <h4>Please fix the following errors:</h4>
                            <ul>
                                {Object.entries(formErrors).map(([field, message]) => (
                                    <li key={field} className="error-item">
                                        <strong>{field === 'general' ? 'Error' : field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmitStep;
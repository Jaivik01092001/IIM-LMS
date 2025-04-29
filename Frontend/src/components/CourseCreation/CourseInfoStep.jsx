import React, { useState, useEffect } from "react";
import { FaUpload, FaImage, FaTimes } from "react-icons/fa";

const CourseInfoStep = ({
    courseData,
    updateCourseData,
    thumbnailFile,
    setThumbnailFile,
    thumbnailPreview,
    setThumbnailPreview
}) => {
    // Local state for form fields
    const [localData, setLocalData] = useState({
        title: courseData.title || "",
        shortDescription: courseData.shortDescription || "",
        language: courseData.language || "en"
    });

    // Update local state when courseData changes
    useEffect(() => {
        setLocalData({
            title: courseData.title || "",
            shortDescription: courseData.shortDescription || "",
            language: courseData.language || "en"
        });
    }, [courseData]);

    // Update thumbnail preview when courseData changes
    useEffect(() => {
        if (courseData.thumbnail && !thumbnailPreview) {
            setThumbnailPreview(courseData.thumbnail);
        }
    }, [courseData.thumbnail]);

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({ ...prev, [name]: value }));
        updateCourseData({ [name]: value });
    };

    // Handle thumbnail upload
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith("image/")) {
            setThumbnailFile(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
            updateCourseData({ thumbnail: previewUrl });
        } else {
            alert("Please select an image file for the thumbnail");
        }
    };

    // Remove thumbnail
    const removeThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview("");
        updateCourseData({ thumbnail: "" });
    };

    // Handle language selection
    const languageOptions = [
        { value: "en", label: "English" },
        { value: "hi", label: "Hindi" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
        { value: "zh", label: "Chinese" },
        { value: "ja", label: "Japanese" },
        { value: "de", label: "German" }
    ];

    // No category or subcategory options needed

    return (
        <div className="course-info-step">
            <h2>Course Information</h2>
            <p className="step-description">
                Provide basic information about your course to help students find it.
            </p>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="title">
                        Course Title <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={localData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Complete Web Development Bootcamp"
                        required
                    />
                    <p className="field-hint">
                        A great title clearly explains what the course teaches.
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="shortDescription">
                        Short Description <span className="required">*</span>
                        <span className="char-count">{localData.shortDescription.length}/200</span>
                    </label>
                    <textarea
                        id="shortDescription"
                        name="shortDescription"
                        value={localData.shortDescription}
                        onChange={handleInputChange}
                        placeholder="Briefly describe what students will learn in your course"
                        maxLength={200}
                        rows={3}
                        required
                    />
                    <p className="field-hint">
                        This appears in search results and should highlight the key benefits.
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="language">
                        Language <span className="required">*</span>
                    </label>
                    <select
                        id="language"
                        name="language"
                        value={localData.language}
                        onChange={handleInputChange}
                        required
                    >
                        {languageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group thumbnail-section">
                    <label>
                        Course Thumbnail <span className="required">*</span>
                    </label>

                    <div className="thumbnail-container">
                        {thumbnailPreview ? (
                            <div className="thumbnail-preview">
                                <img src={thumbnailPreview} alt="Course thumbnail preview" />
                                <button
                                    type="button"
                                    className="remove-thumbnail"
                                    onClick={removeThumbnail}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            <div className="thumbnail-upload">
                                <input
                                    type="file"
                                    id="thumbnail"
                                    name="thumbnail"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    style={{ display: "none" }}
                                />
                                <label htmlFor="thumbnail" className="upload-label">
                                    <FaImage className="icon" />
                                    <FaUpload className="upload-icon" />
                                    <span>Upload Thumbnail</span>
                                </label>
                                <p className="upload-hint">
                                    Recommended size: 1280 x 720 pixels (16:9 ratio)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseInfoStep;
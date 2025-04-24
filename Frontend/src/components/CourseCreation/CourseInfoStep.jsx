import React, { useState } from "react";
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
        language: courseData.language || "en",
        category: courseData.category || "",
        subcategory: courseData.subcategory || "",
        tagsInput: courseData.tags?.join(", ") || ""
    });

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalData({ ...localData, [name]: value });

        // Update parent state for all fields except tags (which need special handling)
        if (name !== "tagsInput") {
            updateCourseData({ [name]: value });
        }
    };

    // Handle tags input - convert comma-separated string to array
    const handleTagsChange = (e) => {
        const tagsInput = e.target.value;
        setLocalData({ ...localData, tagsInput });

        // Convert to array and update parent state
        const tagsArray = tagsInput
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag !== "");

        updateCourseData({ tags: tagsArray });
    };

    // Handle thumbnail upload
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith("image/")) {
            setThumbnailFile(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
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

    // Category options
    const categoryOptions = [
        { value: "programming", label: "Programming" },
        { value: "business", label: "Business" },
        { value: "finance", label: "Finance" },
        { value: "design", label: "Design" },
        { value: "marketing", label: "Marketing" },
        { value: "education", label: "Education" },
        { value: "science", label: "Science" },
        { value: "health", label: "Health & Fitness" }
    ];

    // Subcategory options (depending on selected category)
    const getSubcategoryOptions = () => {
        switch (localData.category) {
            case "programming":
                return [
                    { value: "web-development", label: "Web Development" },
                    { value: "mobile-development", label: "Mobile Development" },
                    { value: "game-development", label: "Game Development" },
                    { value: "databases", label: "Databases" },
                    { value: "programming-languages", label: "Programming Languages" }
                ];
            case "business":
                return [
                    { value: "entrepreneurship", label: "Entrepreneurship" },
                    { value: "management", label: "Management" },
                    { value: "strategy", label: "Strategy" },
                    { value: "operations", label: "Operations" }
                ];
            // Add more subcategories for other categories as needed
            default:
                return [];
        }
    };

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

                <div className="form-row">
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

                    <div className="form-group">
                        <label htmlFor="category">
                            Category <span className="required">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={localData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categoryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="subcategory">
                            Subcategory
                        </label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={localData.subcategory}
                            onChange={handleInputChange}
                            disabled={!localData.category}
                        >
                            <option value="">Select a subcategory</option>
                            {getSubcategoryOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tagsInput">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tagsInput"
                            name="tagsInput"
                            value={localData.tagsInput}
                            onChange={handleTagsChange}
                            placeholder="e.g. javascript, react, web development"
                        />
                        <p className="field-hint">
                            Enter comma-separated tags to help students find your course.
                        </p>
                    </div>
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
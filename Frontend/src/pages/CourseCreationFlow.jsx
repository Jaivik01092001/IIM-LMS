import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCourseThunk, updateCourseThunk, getCourseThunk } from "../redux/admin/adminSlice";
import { FaArrowLeft, FaArrowRight, FaCheck, FaUpload, FaImage, FaFileAlt, FaVideo, FaTimes } from "react-icons/fa";
import "../assets/styles/CourseCreationFlow.css";

// Stepper components
import CourseInfoStep from "../components/CourseCreation/CourseInfoStep";
import CurriculumStep from "../components/CourseCreation/CurriculumStep";
import CourseSettingsStep from "../components/CourseCreation/CourseSettingsStep";
import AccessSettingsStep from "../components/CourseCreation/AccessSettingsStep";
import ReviewSubmitStep from "../components/CourseCreation/ReviewSubmitStep";

const CourseCreationFlow = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const isEditMode = !!id;

    // Get data from Redux store
    const { currentCourse, loading } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);

    // State for stepper
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    // Combined form data
    const [courseData, setCourseData] = useState({
        // Step 1: Course Info
        title: "",
        shortDescription: "",
        language: "en",
        category: "",
        subcategory: "",
        tags: [],
        thumbnail: "",

        // Step 2: Curriculum
        hasModules: false,
        modules: [], // Array of { title, description, content: [], quiz: null }
        content: [], // For non-module courses
        quizzes: [], // For non-module courses

        // Step 3: Course Settings
        duration: "",
        targetAudience: "",
        learningOutcomes: [],
        requirements: [],

        // Step 4: Access & Status
        status: 1, // 1=active, 0=inactive
        isDraft: true, // true=draft, false=published
        enrolledUsers: []
    });

    // Fetch course data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            dispatch(getCourseThunk(id));
        }
    }, [dispatch, isEditMode, id]);

    // Populate form with existing course data in edit mode
    useEffect(() => {
        if (isEditMode && currentCourse) {
            // Extract tags as array if stored as string
            const tagsArray = Array.isArray(currentCourse.tags)
                ? currentCourse.tags
                : (currentCourse.tags || "").split(",").filter(tag => tag.trim());

            // Set initial form data from existing course
            setCourseData({
                title: currentCourse.title || "",
                shortDescription: currentCourse.description?.substring(0, 200) || "",
                language: currentCourse.language || "en",
                category: currentCourse.category || "",
                subcategory: currentCourse.subcategory || "",
                tags: tagsArray,
                thumbnail: currentCourse.thumbnail || "",

                hasModules: currentCourse.hasModules || false,
                modules: currentCourse.modules || [],
                content: currentCourse.content || [],
                quizzes: currentCourse.quizzes || [],

                duration: currentCourse.duration || "",
                targetAudience: currentCourse.targetAudience || "",
                learningOutcomes: currentCourse.learningOutcomes || [],
                requirements: currentCourse.requirements || [],

                status: currentCourse.status ?? 1,
                isDraft: currentCourse.isDraft ?? true,
                enrolledUsers: currentCourse.enrolledUsers || []
            });

            // Set thumbnail preview if exists
            if (currentCourse.thumbnail) {
                setThumbnailPreview(currentCourse.thumbnail);
            }
        }
    }, [isEditMode, currentCourse]);

    // Navigate between steps
    const handleNext = () => {
        setActiveStep((prevStep) => Math.min(prevStep + 1, 4));
    };

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    };

    const handleStepClick = (step) => {
        // Only allow clicking on steps that have been completed or are next
        if (step <= activeStep + 1) {
            setActiveStep(step);
        }
    };

    // Handle form data updates from child components
    const updateCourseData = (stepData) => {
        setCourseData(prev => ({
            ...prev,
            ...stepData
        }));
    };

    // Handle course submission
    const handleSubmit = async () => {
        // Validate required fields
        const errors = {};

        // Basic validation for required fields
        if (!courseData.title) errors.title = "Course title is required";
        if (!courseData.shortDescription) errors.shortDescription = "Short description is required";
        if (!courseData.category) errors.category = "Category is required";
        if (!thumbnailFile && !courseData.thumbnail) errors.thumbnail = "Thumbnail is required";

        // Curriculum validation
        if (courseData.hasModules) {
            if (!courseData.modules || courseData.modules.length === 0) {
                errors.modules = "At least one module is required";
            }
        } else {
            if (!courseData.content || courseData.content.length === 0) {
                errors.content = "At least one content item is required";
            }
        }

        // Learning outcomes validation
        if (!courseData.learningOutcomes || courseData.learningOutcomes.length === 0) {
            errors.learningOutcomes = "At least one learning outcome is required";
        }

        // If there are validation errors, display them and stop submission
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveStep(4); // Go to review step to show errors
            return;
        }

        setFormErrors({});
        setIsSubmitting(true);

        try {
            // Prepare form data for API
            const formData = new FormData();

            // Log courseData to identify any issues
            console.log("Course data being submitted:", courseData);

            // Add basic text fields - ensure proper naming for API
            formData.append("title", courseData.title || "");
            formData.append("description", courseData.shortDescription || "");
            formData.append("language", courseData.language || "en");
            formData.append("category", courseData.category || "");
            formData.append("subcategory", courseData.subcategory || "");
            formData.append("duration", courseData.duration || "");
            formData.append("targetAudience", courseData.targetAudience || "");
            formData.append("status", courseData.status !== undefined ? courseData.status : 1);
            formData.append("isDraft", courseData.isDraft !== undefined ? courseData.isDraft : true);
            formData.append("hasModules", courseData.hasModules !== undefined ? courseData.hasModules : false);

            // Add arrays as JSON strings
            // Use a helper function to safely stringify arrays
            const safeStringify = (obj) => {
                try {
                    return JSON.stringify(obj || []);
                } catch (err) {
                    console.error("Error stringifying object:", err);
                    return "[]";
                }
            };

            formData.append("tags", safeStringify(courseData.tags));
            formData.append("learningOutcomes", safeStringify(courseData.learningOutcomes));
            formData.append("requirements", safeStringify(courseData.requirements));

            // Handle modules - we need to process quizzes and remove file objects before stringifying
            const modulesForSubmission = courseData.modules.map(module => {
                // Create a clean copy without file objects
                const { quiz, ...cleanModule } = module;

                // If module has a quiz, add it with proper structure
                if (quiz) {
                    // Extract only the necessary quiz data
                    cleanModule.quiz = {
                        _id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        questions: quiz.questions || [],
                        timeLimit: quiz.timeLimit || 30,
                        passingScore: quiz.passingScore || 60
                    };
                }

                return cleanModule;
            });
            formData.append("modules", safeStringify(modulesForSubmission));

            // Handle content - we need to remove file objects before stringifying
            const contentForSubmission = courseData.content.map(item => {
                // Create a clean copy without file objects
                const { file, ...cleanItem } = item;
                return cleanItem;
            });
            formData.append("content", safeStringify(contentForSubmission));

            // Add content files separately
            courseData.content.forEach((item, index) => {
                if (item.file) {
                    formData.append(`contentFiles[${index}]`, item.file);
                    // Make sure we're sending the temporary ID as is
                    formData.append(`contentFileIds[${index}]`, item._id);
                    console.log(`Adding content file for ID: ${item._id}`);
                }
            });

            // Log content IDs for debugging
            console.log('Content items:', courseData.content.map(item => ({ id: item._id, title: item.title })));

            formData.append("quizzes", safeStringify(courseData.quizzes));

            // Add creator reference
            formData.append("creator", user.id);

            // Add thumbnail file if exists
            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            } else if (courseData.thumbnail) {
                // If using existing thumbnail from edit mode
                formData.append("thumbnailUrl", courseData.thumbnail);
            }

            // Log all formData entries for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (typeof pair[1] === 'object' ? 'File object' : pair[1]));
            }

            if (isEditMode) {
                // Update existing course
                await dispatch(updateCourseThunk({
                    id,
                    formData
                })).unwrap();
            } else {
                // Create new course
                await dispatch(createCourseThunk(formData)).unwrap();
            }

            // Navigate to courses list
            navigate("/dashboard/admin/courses");
        } catch (error) {
            console.error("Error submitting course:", error);
            setFormErrors(error.response?.data?.errors || { general: error.message || "Failed to save course" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render step content based on active step
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <CourseInfoStep
                        courseData={courseData}
                        updateCourseData={updateCourseData}
                        thumbnailFile={thumbnailFile}
                        setThumbnailFile={setThumbnailFile}
                        thumbnailPreview={thumbnailPreview}
                        setThumbnailPreview={setThumbnailPreview}
                    />
                );
            case 1:
                return (
                    <CurriculumStep
                        courseData={courseData}
                        updateCourseData={updateCourseData}
                    />
                );
            case 2:
                return (
                    <CourseSettingsStep
                        courseData={courseData}
                        updateCourseData={updateCourseData}
                    />
                );
            case 3:
                return (
                    <AccessSettingsStep
                        courseData={courseData}
                        updateCourseData={updateCourseData}
                    />
                );
            case 4:
                return (
                    <ReviewSubmitStep
                        courseData={courseData}
                        formErrors={formErrors}
                        thumbnailPreview={thumbnailPreview}
                    />
                );
            default:
                return null;
        }
    };

    // Define step titles
    const steps = [
        "Course Info + Media",
        "Curriculum",
        "Course Settings",
        "Access & Status",
        "Review & Submit"
    ];

    return (
        <div className="course-creation-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                    <span>Back</span>
                </button>
                <h1>{isEditMode ? "Edit Course" : "Create New Course"}</h1>
            </div>

            {/* Stepper UI */}
            <div className="stepper">
                {steps.map((label, index) => (
                    <div
                        key={index}
                        className={`step ${index === activeStep ? "active" : ""} ${index < activeStep ? "completed" : ""}`}
                        onClick={() => handleStepClick(index)}
                    >
                        <div className="step-number">
                            {index < activeStep ? <FaCheck /> : index + 1}
                        </div>
                        <div className="step-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="step-content">
                {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="navigation-buttons">
                {activeStep > 0 && (
                    <button
                        className="back-button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                    >
                        <FaArrowLeft />
                        <span>Previous</span>
                    </button>
                )}

                {activeStep < 4 && (
                    <button
                        className="next-button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                )}

                {activeStep === 4 && (
                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <span>{isEditMode ? "Update Course" : "Create Course"}</span>
                                <FaCheck />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseCreationFlow;
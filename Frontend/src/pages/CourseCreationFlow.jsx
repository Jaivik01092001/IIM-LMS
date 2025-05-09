import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    createCourseThunk,
    updateCourseThunk,
    getCourseThunk,
} from "../redux/admin/adminSlice";
import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
} from "react-icons/fa";
import "../assets/styles/CourseCreationFlow.css";

// Stepper components
import CourseInfoStep from "../components/CourseCreation/CourseInfoStep";
import CurriculumStep from "../components/CourseCreation/CurriculumStep";
import CourseSettingsStep from "../components/CourseCreation/CourseSettingsStep";
import ReviewSubmitStep from "../components/CourseCreation/ReviewSubmitStep";

const CourseCreationFlow = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const isEditMode = !!id;

    // Get data from Redux store
    const { currentCourse } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);

    // State for stepper
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Combined form data
    const [courseData, setCourseData] = useState({
        // Step 1: Course Info
        title: "",
        shortDescription: "",
        language: "en",
        thumbnail: "",

        // Step 2: Curriculum
        hasModules: true,
        modules: [],
        content: [],
        quizzes: [],

        // Step 3: Course Settings & Status
        duration: "",
        status: 1,
        isDraft: true,
        enrolledUsers: [],
    });

    // Fetch course data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            dispatch(getCourseThunk(id))
                .unwrap()
                .then((response) => {
                    console.log("Fetched course data:", response);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching course:", error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [dispatch, isEditMode, id]);

    // Populate form with existing course data in edit mode
    useEffect(() => {
        if (isEditMode && currentCourse && !isLoading) {
            console.log("Populating form with course data:", currentCourse);

            // Process modules to ensure they have the correct structure
            const processedModules = currentCourse.modules.map((module) => {
                // Ensure module has the correct structure with all nested data
                const processedModule = {
                    _id: module._id,
                    title: module.title || "",
                    description: module.description || "",
                    order: module.order || 0,
                    // Process content to ensure it's an array of full objects
                    content: Array.isArray(module.content)
                        ? module.content.map(contentItem => {
                            // If content is already an object, use it directly
                            if (typeof contentItem === 'object' && contentItem !== null) {
                                return {
                                    _id: contentItem._id,
                                    title: contentItem.title || "",
                                    description: contentItem.description || "",
                                    type: contentItem.type || "text",
                                    textContent: contentItem.textContent || "",
                                    fileUrl: contentItem.fileUrl || "",
                                    module: module._id, // Ensure module reference is set
                                    mimeType: contentItem.mimeType || "application/octet-stream"
                                };
                            }
                            // If it's just an ID, find the corresponding content item
                            return contentItem;
                        })
                        : [],
                };

                // If module has a quiz, include it with full structure
                if (module.quiz) {
                    if (typeof module.quiz === 'object' && module.quiz !== null) {
                        processedModule.quiz = {
                            _id: module.quiz._id,
                            title: module.quiz.title || "",
                            description: module.quiz.description || "",
                            timeLimit: module.quiz.timeLimit || 30,
                            passingScore: module.quiz.passingScore || 60,
                            questions: module.quiz.questions || [],
                            module: module._id // Ensure module reference is set
                        };
                    } else {
                        // If quiz is just an ID, keep it as is
                        processedModule.quiz = module.quiz;
                    }
                } else {
                    processedModule.quiz = null;
                }

                return processedModule;
            });

            // Process content items to ensure they have module references
            const processedContent = currentCourse.content.map((item) => {
                // Find which module this content belongs to
                const moduleId = currentCourse.modules.find(module =>
                    Array.isArray(module.content) &&
                    module.content.some(contentId =>
                        contentId === item._id ||
                        (typeof contentId === 'object' && contentId?._id === item._id)
                    )
                )?._id;

                return {
                    _id: item._id,
                    title: item.title || "",
                    description: item.description || "",
                    type: item.type || "text",
                    textContent: item.textContent || "",
                    fileUrl: item.fileUrl || "",
                    mimeType: item.mimeType || "application/octet-stream",
                    module: moduleId || null // Set module reference if found
                };
            });

            // Process quizzes to ensure they have module references
            const processedQuizzes = currentCourse.quizzes.map((quiz) => {
                // Find which module this quiz belongs to
                const moduleId = currentCourse.modules.find(module =>
                    module.quiz === quiz._id ||
                    (typeof module.quiz === 'object' && module.quiz?._id === quiz._id)
                )?._id;

                return {
                    _id: quiz._id,
                    title: quiz.title || "",
                    description: quiz.description || "",
                    timeLimit: quiz.timeLimit || 30,
                    passingScore: quiz.passingScore || 60,
                    questions: quiz.questions || [],
                    module: moduleId || null // Set module reference if found
                };
            });

            // Set initial form data from existing course
            setCourseData({
                title: currentCourse.title || "",
                shortDescription: currentCourse.description || "",
                language: currentCourse.language || "en",
                thumbnail: currentCourse.thumbnail || "",

                hasModules: currentCourse.hasModules ?? true,
                modules: processedModules,
                content: processedContent,
                quizzes: processedQuizzes,

                duration: currentCourse.duration || "",
                status: currentCourse.status ?? 1,
                isDraft: currentCourse.isDraft ?? true,
                enrolledUsers: currentCourse.enrolledUsers || [],
            });

            console.log("Processed course data for editing:", {
                modules: processedModules,
                content: processedContent,
                quizzes: processedQuizzes
            });

            // Set thumbnail preview if exists
            if (currentCourse.thumbnail) {
                setThumbnailPreview(
                    `${import.meta.env.VITE_IMAGE_URL}${currentCourse.thumbnail}`
                );
            }
        }
    }, [isEditMode, currentCourse, isLoading]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading course data...</p>
            </div>
        );
    }

    // Navigate between steps
    const handleNext = () => {
        setActiveStep((prevStep) => Math.min(prevStep + 1, 3));
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
        setCourseData((prev) => ({
            ...prev,
            ...stepData,
        }));
    };

    // Handle course submission
    const handleSubmit = async () => {
        // Validate required fields
        const errors = {};

        // Basic validation for required fields
        if (!courseData.title) errors.title = "Course title is required";
        if (!courseData.shortDescription)
            errors.shortDescription = "Short description is required";
        if (!thumbnailFile && !courseData.thumbnail)
            errors.thumbnail = "Thumbnail is required";

        // Curriculum validation
        if (!courseData.modules || courseData.modules.length === 0) {
            errors.modules = "At least one module is required";
        }

        // If there are validation errors, display them and stop submission
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveStep(3); // Go to review step to show errors
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
            formData.append("duration", courseData.duration || "");
            formData.append(
                "status",
                courseData.status !== undefined ? courseData.status : 1
            );
            formData.append(
                "isDraft",
                courseData.isDraft !== undefined ? courseData.isDraft : true
            );
            formData.append("hasModules", true); // Always use modules

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

            // Handle modules - we need to process quizzes and content references before stringifying
            const modulesForSubmission = courseData.modules.map((module) => {
                console.log("Processing module for submission:", module);

                // Create a clean copy without file objects
                const { quiz, content, ...cleanModule } = module;

                // Process content references - ensure we're only sending IDs, not full objects
                cleanModule.content = Array.isArray(content)
                    ? content.map(contentItem => {
                        // If content is an object, extract just the ID
                        if (typeof contentItem === 'object' && contentItem !== null) {
                            return contentItem._id;
                        }
                        // If it's already an ID, use it directly
                        return contentItem;
                    })
                    : [];

                // Ensure isCompulsory flag is included
                console.log(`Module ${cleanModule.title} isCompulsory:`, cleanModule.isCompulsory);

                // If module has a quiz, add it with proper structure
                if (quiz) {
                    // Extract only the necessary quiz data
                    cleanModule.quiz = {
                        _id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        questions: quiz.questions || [],
                        timeLimit: quiz.timeLimit || 30,
                        passingScore: quiz.passingScore || 60,
                    };
                }

                return cleanModule;
            });
            formData.append("modules", safeStringify(modulesForSubmission));

            // Handle content - we need to remove file objects and ensure module references are IDs
            const contentForSubmission = courseData.content.map((item) => {
                // Create a clean copy without file objects
                const { file, module, ...cleanItem } = item;

                // Ensure module reference is an ID, not an object
                if (module) {
                    cleanItem.module = typeof module === 'object' ? module._id : module;
                }

                return cleanItem;
            });
            formData.append("content", safeStringify(contentForSubmission));

            // Add content files separately
            courseData.content.forEach((item, index) => {
                if (item.file) {
                    formData.append(`contentFiles[${index}]`, item.file);
                    // Make sure we're sending the temporary ID as is
                    formData.append(`contentFileIds[${index}]`, item._id);

                    // For new content items added during edit, also send the module ID
                    if (item.module) {
                        const moduleId = typeof item.module === 'object' ? item.module._id : item.module;
                        formData.append(`contentModules[${index}]`, moduleId);
                    }

                    // If this is an existing content item being updated, send the existing file info
                    if (!item._id.startsWith('temp_') && item.existingFileUrl) {
                        formData.append(`contentExistingFileUrls[${index}]`, item.existingFileUrl);
                    }

                    console.log(`Adding content file for ID: ${item._id}, module: ${item.module}, isExisting: ${!item._id.startsWith('temp_')}`);
                }
            });

            // Log content IDs for debugging
            console.log(
                "Content items:",
                courseData.content.map((item) => ({ id: item._id, title: item.title }))
            );

            // Handle quizzes - ensure module references are IDs
            const quizzesForSubmission = courseData.quizzes.map((quiz) => {
                // Create a clean copy
                const { module, ...cleanQuiz } = quiz;

                // Ensure module reference is an ID, not an object
                if (module) {
                    cleanQuiz.module = typeof module === 'object' ? module._id : module;
                }

                // Ensure questions array is included
                if (!cleanQuiz.questions) {
                    cleanQuiz.questions = [];
                }

                return cleanQuiz;
            });

            console.log("Quizzes for submission:", quizzesForSubmission);
            console.log("Quiz questions count:", quizzesForSubmission.map(q => ({
                id: q._id,
                title: q.title,
                questionsCount: q.questions ? q.questions.length : 0
            })));

            formData.append("quizzes", safeStringify(quizzesForSubmission));

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
                console.log(
                    pair[0] +
                    ": " +
                    (typeof pair[1] === "object" ? "File object" : pair[1])
                );
            }

            if (isEditMode) {
                // Update existing course
                await dispatch(
                    updateCourseThunk({
                        id,
                        formData,
                    })
                ).unwrap();
            } else {
                // Create new course
                await dispatch(createCourseThunk(formData)).unwrap();
            }

            // Navigate to courses list
            navigate("/dashboard/admin/courses");
        } catch (error) {
            console.error("Error submitting course:", error);
            setFormErrors(
                error.response?.data?.errors || {
                    general: error.message || "Failed to save course",
                }
            );
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
        "Review & Submit",
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

            {/* Improved Stepper UI */}
            <div className="stepper-container">
                <div className="stepper">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`step ${index === activeStep ? "active" : ""} ${index < activeStep ? "completed" : ""
                                }`}
                            onClick={() => handleStepClick(index)}
                        >
                            <div className="step-number">
                                {index < activeStep ? (
                                    <FaCheck />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div className="step-label">{step}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="step-content">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
                {activeStep > 0 && (
                    <button
                        type="button"
                        className="back-nav-button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                    >
                        <FaArrowLeft />
                        <span>Previous</span>
                    </button>
                )}

                {activeStep < 3 ? (
                    <button
                        type="button"
                        className="next-button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || Object.keys(formErrors).length > 0}
                    >
                        {isSubmitting ? (
                            <span>Submitting...</span>
                        ) : (
                            <span>Submit Course</span>
                        )}
                        <FaCheck />
                    </button>
                )}
            </div>

            {/* Display form errors */}
            {Object.keys(formErrors).length > 0 && activeStep === 3 && (
                <div className="validation-errors">
                    <h3>Please fix the following errors:</h3>
                    <ul>
                        {Object.keys(formErrors).map((key) => (
                            <li key={key}>{formErrors[key]}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CourseCreationFlow;

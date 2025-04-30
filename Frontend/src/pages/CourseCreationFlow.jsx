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
        enrolledUsers: []
    });

    // Fetch course data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            dispatch(getCourseThunk(id))
                .unwrap()
                .then((response) => {
                    console.log('Fetched course data:', response);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching course:', error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [dispatch, isEditMode, id]);

    // Populate form with existing course data in edit mode
    useEffect(() => {
        if (isEditMode && currentCourse && !isLoading) {
            console.log('Populating form with course data:', currentCourse);

            // Process modules to ensure they have the correct structure
            const processedModules = currentCourse.modules.map(module => {
                return {
                    _id: module._id,
                    title: module.title || "",
                    description: module.description || "",
                    order: module.order || 0,
                    content: module.content || [],
                    quiz: module.quiz || null
                };
            });

            // Process content items
            const processedContent = currentCourse.content.map(item => {
                return {
                    _id: item._id,
                    title: item.title || "",
                    description: item.description || "",
                    type: item.type || "text",
                    textContent: item.textContent || "",
                    fileUrl: item.fileUrl || "",
                };
            });

            // Process quizzes
            const processedQuizzes = currentCourse.quizzes.map(quiz => {
                return {
                    _id: quiz._id,
                    title: quiz.title || "",
                    description: quiz.description || "",
                    timeLimit: quiz.timeLimit || 30,
                    passingScore: quiz.passingScore || 60,
                    questions: quiz.questions || []
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
                enrolledUsers: currentCourse.enrolledUsers || []
            });

            // Set thumbnail preview if exists
            if (currentCourse.thumbnail) {
                setThumbnailPreview(`${import.meta.env.VITE_IMAGE_URL}${currentCourse.thumbnail}`);
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
        if (!thumbnailFile && !courseData.thumbnail) errors.thumbnail = "Thumbnail is required";

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

            // Add basic text fields
            formData.append("title", courseData.title || "");
            formData.append("description", courseData.shortDescription || "");
            formData.append("language", courseData.language || "en");
            formData.append("duration", courseData.duration || "");
            formData.append("status", courseData.status !== undefined ? courseData.status : 1);
            formData.append("isDraft", courseData.isDraft !== undefined ? courseData.isDraft : true);
            formData.append("hasModules", true);

            // Add thumbnail file if it exists
            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            } else if (courseData.thumbnail) {
                // If no new file but existing thumbnail URL, keep the existing thumbnail
                formData.append("thumbnail", courseData.thumbnail);
            }

            // Add arrays as JSON strings
            const safeStringify = (obj) => {
                try {
                    return JSON.stringify(obj || []);
                } catch (err) {
                    console.error("Error stringifying object:", err);
                    return "[]";
                }
            };

            // Handle modules
            const modulesForSubmission = courseData.modules.map(module => {
                const { quiz, ...cleanModule } = module;
                if (quiz) {
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

            // Handle content
            const contentForSubmission = courseData.content.map(item => {
                const { file, ...cleanItem } = item;
                return cleanItem;
            });
            formData.append("content", safeStringify(contentForSubmission));

            // Handle quizzes
            const quizzesForSubmission = courseData.quizzes.map(quiz => {
                return {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    questions: quiz.questions || [],
                    timeLimit: quiz.timeLimit || 30,
                    passingScore: quiz.passingScore || 60
                };
            });
            formData.append("quizzes", safeStringify(quizzesForSubmission));

            // Submit the form
            if (isEditMode) {
                await dispatch(updateCourseThunk({ id, formData })).unwrap();
            } else {
                await dispatch(createCourseThunk(formData)).unwrap();
            }

            // Navigate to course list after successful submission
            navigate("/courses");
        } catch (error) {
            console.error("Error submitting course:", error);
            setFormErrors({ submit: "Failed to submit course. Please try again." });
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

                {activeStep < 3 && (
                    <>
                        <button
                            className="save-draft-button"
                            onClick={() => {
                                // Set isDraft to true and submit
                                updateCourseData({ isDraft: true });
                                handleSubmit();
                            }}
                            disabled={isSubmitting}
                        >
                            <span>Save Draft</span>
                        </button>

                        <button
                            className="next-button"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            <span>Next</span>
                            <FaArrowRight />
                        </button>
                    </>
                )}

                {activeStep === 3 && (
                    <>
                        <button
                            className="save-draft-button"
                            onClick={() => {
                                // Set isDraft to true and submit
                                updateCourseData({ isDraft: true });
                                handleSubmit();
                            }}
                            disabled={isSubmitting}
                        >
                            <span>Save Draft</span>
                        </button>

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
                    </>
                )}
            </div>
        </div>
    );
};

export default CourseCreationFlow;
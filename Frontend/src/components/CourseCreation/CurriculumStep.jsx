import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaGripVertical, FaVideo, FaFileAlt, FaFileUpload, FaQuestionCircle, FaFileAlt as FaFileText, FaYoutube, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SummernoteEditor from "../Editor/SummernoteEditor";

const CurriculumStep = ({ courseData, updateCourseData }) => {
    // Local state for curriculum management
    const [modules, setModules] = useState(courseData.modules || []);
    const [content, setContent] = useState(courseData.content || []);
    const [quizzes, setQuizzes] = useState(courseData.quizzes || []);

    // State for module editing
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleFormData, setModuleFormData] = useState({ title: "", description: "" });

    // State for content editing
    const [editingContentId, setEditingContentId] = useState(null);
    const [contentFormData, setContentFormData] = useState({
        title: "",
        description: "",
        type: "video",
        file: null,
        textContent: ""
    });

    // State for quiz editing
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [quizFormData, setQuizFormData] = useState({ title: "", description: "", questions: [] });
    const [currentQuestion, setCurrentQuestion] = useState({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

    // State for expanded modules (accordion behavior)
    const [expandedModules, setExpandedModules] = useState({});

    // Track if we've updated course data to prevent infinite loop
    const [hasUpdatedCourseData, setHasUpdatedCourseData] = useState(false);

    // Initialize expanded state for all modules
    useEffect(() => {
        if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
            const initialExpandedState = {};
            // Only set the first module to be expanded initially
            modules.forEach((module, index) => {
                initialExpandedState[module._id] = index === 0; // Only first module is expanded
            });
            setExpandedModules(initialExpandedState);
        }
    }, [modules]);

    // Update parent component state when local states change
    useEffect(() => {
        if (hasUpdatedCourseData) {
            // Create a deep copy of modules with all nested data properly structured
            const processedModules = modules.map(module => {
                const moduleData = {
                    _id: module._id,
                    title: module.title,
                    description: module.description,
                    order: module.order || 0,
                    // Process content array to ensure it contains full content objects, not just IDs
                    content: module.content ? module.content.map(contentId => {
                        if (typeof contentId === 'object') {
                            return contentId;
                        } else {
                            // Find the content item in the content array
                            const contentItem = content.find(item => item._id === contentId);
                            return contentItem || contentId; // Return the content item if found, otherwise return the ID
                        }
                    }) : []
                };

                // Process quiz to ensure it contains the full quiz object, not just the ID
                if (module.quiz) {
                    if (typeof module.quiz === 'object') {
                        moduleData.quiz = module.quiz;
                    } else {
                        const quizItem = quizzes.find(q => q._id === module.quiz);
                        if (quizItem) moduleData.quiz = quizItem;
                    }
                }

                return moduleData;
            });

            updateCourseData({
                modules: processedModules,
                content,
                quizzes
            });

            console.log("Updated course data with processed modules:", processedModules);
        } else {
            setHasUpdatedCourseData(true);
        }
    }, [modules, content, quizzes, hasUpdatedCourseData, updateCourseData]);

    // Toggle module expanded state
    const toggleModuleExpanded = (moduleId) => {
        // Close all modules first, then open only the clicked one if it was closed
        const isCurrentlyExpanded = expandedModules[moduleId];

        // Create a new object with all modules closed
        const newExpandedState = {};
        modules.forEach(module => {
            newExpandedState[module._id] = false;
        });

        // If the clicked module was closed, open it (otherwise all stay closed)
        if (!isCurrentlyExpanded) {
            newExpandedState[moduleId] = true;
        }

        setExpandedModules(newExpandedState);
    };

    // ===== MODULE MANAGEMENT =====

    // Add new module
    const addModule = () => {
        const newModule = {
            _id: `temp_${Date.now()}`,
            title: "New Module",
            description: "",
            content: [],
            quiz: null,
            order: modules.length
        };

        setModules([...modules, newModule]);
        setEditingModuleId(newModule._id);
        setModuleFormData({ title: newModule.title, description: newModule.description });

        // Close all other modules and only expand the new one
        const newExpandedState = {};
        modules.forEach(module => {
            newExpandedState[module._id] = false;
        });
        newExpandedState[newModule._id] = true;
        setExpandedModules(newExpandedState);
    };

    // Edit module
    const startEditModule = (module) => {
        setEditingModuleId(module._id);
        setModuleFormData({ title: module.title, description: module.description });
    };

    // Save module
    const saveModule = () => {
        const updatedModules = modules.map(module =>
            module._id === editingModuleId
                ? { ...module, title: moduleFormData.title, description: moduleFormData.description }
                : module
        );

        setModules(updatedModules);
        setEditingModuleId(null);
        setModuleFormData({ title: "", description: "" });
    };

    // Delete module
    const deleteModule = (moduleId) => {
        if (window.confirm("Are you sure you want to delete this module?")) {
            setModules(modules.filter(module => module._id !== moduleId));
        }
    };

    // Reorder modules
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = [...modules];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setModules(updatedItems);
    };

    // ===== CONTENT MANAGEMENT =====

    // Add content to module
    const addContentToModule = (moduleId) => {
        const newContent = {
            _id: `temp_content_${Date.now()}`,
            title: "New Content",
            description: "",
            type: "video",
            textContent: "",
            fileUrl: "",
            module: moduleId
        };

        const updatedModules = modules.map(module =>
            module._id === moduleId
                ? { ...module, content: [...module.content, newContent._id] }
                : module
        );

        setModules(updatedModules);
        setContent([...content, newContent]);
        setEditingContentId(newContent._id);
        setContentFormData({ title: newContent.title, description: newContent.description, type: newContent.type, file: null, textContent: "" });
    };

    // Edit content
    const startEditContent = (contentItem) => {
        setEditingContentId(contentItem._id);
        setContentFormData({
            title: contentItem.title,
            description: contentItem.description,
            type: contentItem.type || "video",
            file: null,
            textContent: contentItem.textContent || ""
        });
    };

    // Save content
    const saveContent = () => {
        const existingContent = content.find(item => item._id === editingContentId);
        const moduleOfEditingContent = existingContent?.module;

        const newContentItem = {
            ...existingContent,
            title: contentFormData.title,
            description: contentFormData.description,
            type: contentFormData.type,
            file: contentFormData.file,
            textContent:
                contentFormData.type === "youtube"
                    ? contentFormData.textContent
                    : contentFormData.type === "text"
                        ? contentFormData.textContent
                        : "",
            fileUrl:
                contentFormData.type === "youtube"
                    ? contentFormData.textContent
                    : contentFormData.file
                        ? URL.createObjectURL(contentFormData.file)
                        : existingContent?.fileUrl || "",
            mimeType:
                contentFormData.type === "youtube"
                    ? "video/youtube"
                    : contentFormData.file?.type || existingContent?.mimeType || "application/octet-stream",
            module: moduleOfEditingContent
        };

        console.log("📤 Saving content item to state:", newContentItem);

        // Update content in the content array
        const updatedContent = content.map(item =>
            item._id === editingContentId ? newContentItem : item
        );
        setContent(updatedContent);

        // Also update the content reference in the module
        if (moduleOfEditingContent) {
            const moduleToUpdate = modules.find(m => m._id === moduleOfEditingContent);
            if (moduleToUpdate) {
                // If the module's content array contains objects, update the object
                // If it contains IDs, no need to update as the ID hasn't changed
                const updatedModules = modules.map(module => {
                    if (module._id === moduleOfEditingContent) {
                        const updatedModuleContent = module.content.map(contentItem => {
                            if (typeof contentItem === 'object' && contentItem._id === editingContentId) {
                                return newContentItem;
                            }
                            return contentItem;
                        });
                        return { ...module, content: updatedModuleContent };
                    }
                    return module;
                });
                setModules(updatedModules);
            }
        }

        // Reset form state
        setEditingContentId(null);
        setContentFormData({
            title: "",
            description: "",
            type: "video",
            file: null,
            textContent: ""
        });

        console.log("✅ Content state updated in both content array and module reference.");
    };

    // Delete content
    const deleteContent = (contentId, moduleId = null) => {
        if (window.confirm("Are you sure you want to delete this content?")) {
            // Remove content from array
            setContent(content.filter(item => item._id !== contentId));

            // If the content is part of a module, update the module's content array
            if (moduleId) {
                const updatedModules = modules.map(module =>
                    module._id === moduleId
                        ? { ...module, content: module.content.filter(id => id !== contentId) }
                        : module
                );

                setModules(updatedModules);
            }
        }
    };

    // ===== QUIZ MANAGEMENT =====

    // Add quiz to module
    const addQuizToModule = (moduleId) => {
        const newQuiz = {
            _id: `temp_quiz_${Date.now()}`,
            title: "Module Quiz",
            description: "Test your knowledge of this module",
            questions: [],
            module: moduleId
        };

        const updatedModules = modules.map(module =>
            module._id === moduleId
                ? { ...module, quiz: newQuiz._id }
                : module
        );

        setModules(updatedModules);
        setQuizzes([...quizzes, newQuiz]);
        setEditingQuizId(newQuiz._id);
        setQuizFormData({ title: newQuiz.title, description: newQuiz.description, questions: [] });
    };

    // Add or update question in quiz
    const addQuestionToQuiz = () => {
        // Validate the current question
        if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
            alert("Please fill in all fields for the question");
            return;
        }

        let updatedQuestions;

        if (editingQuestionIndex !== null) {
            // Update existing question
            updatedQuestions = [...quizFormData.questions];
            updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
        } else {
            // Add new question
            updatedQuestions = [
                ...quizFormData.questions,
                { ...currentQuestion }
            ];
        }

        const updatedFormData = {
            ...quizFormData,
            questions: updatedQuestions
        };

        setQuizFormData(updatedFormData);
        setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
        setEditingQuestionIndex(null);
    };

    // Start editing an existing question
    const startEditQuestion = (index) => {
        const questionToEdit = quizFormData.questions[index];
        setCurrentQuestion({ ...questionToEdit });
        setEditingQuestionIndex(index);
    };

    // Handle question form changes
    const handleQuestionChange = (e) => {
        setCurrentQuestion({
            ...currentQuestion,
            question: e.target.value
        });
    };

    // Handle option changes
    const handleOptionChange = (index, value) => {
        const updatedOptions = [...currentQuestion.options];
        updatedOptions[index] = value;

        setCurrentQuestion({
            ...currentQuestion,
            options: updatedOptions
        });
    };

    // Set correct answer
    const setCorrectAnswer = (index) => {
        setCurrentQuestion({
            ...currentQuestion,
            correctAnswer: index
        });
    };

    // Remove question from quiz
    const removeQuestion = (index) => {
        const updatedQuestions = [...quizFormData.questions];
        updatedQuestions.splice(index, 1);

        setQuizFormData({
            ...quizFormData,
            questions: updatedQuestions
        });
    };

    // Save quiz
    const saveQuiz = () => {
        const existingQuiz = quizzes.find(quiz => quiz._id === editingQuizId);
        const moduleOfEditingQuiz = existingQuiz?.module;

        const updatedQuiz = {
            ...existingQuiz,
            title: quizFormData.title,
            description: quizFormData.description,
            questions: quizFormData.questions
        };

        console.log("Saving quiz with questions:", quizFormData.questions);

        // Update quiz in the quizzes array
        const updatedQuizzes = quizzes.map(quiz =>
            quiz._id === editingQuizId ? updatedQuiz : quiz
        );
        setQuizzes(updatedQuizzes);

        // Also update the quiz reference in the module
        if (moduleOfEditingQuiz) {
            const moduleToUpdate = modules.find(m => m._id === moduleOfEditingQuiz);
            if (moduleToUpdate) {
                const updatedModules = modules.map(module => {
                    if (module._id === moduleOfEditingQuiz) {
                        // If the module's quiz is an object, update the object
                        // If it's an ID, no need to update as the ID hasn't changed
                        if (typeof module.quiz === 'object' && module.quiz?._id === editingQuizId) {
                            return { ...module, quiz: updatedQuiz };
                        }
                        return module;
                    }
                    return module;
                });
                setModules(updatedModules);
            }
        }

        // Reset form state
        setEditingQuizId(null);
        setQuizFormData({ title: "", description: "", questions: [] });
        setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });

        console.log("✅ Quiz state updated in both quizzes array and module reference.");
        console.log("Updated quizzes array:", updatedQuizzes);
    };

    // Delete quiz
    const deleteQuiz = (quizId, moduleId = null) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            // Remove quiz from array
            setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));

            // If the quiz is part of a module, update the module
            if (moduleId) {
                const updatedModules = modules.map(module =>
                    module._id === moduleId
                        ? { ...module, quiz: null }
                        : module
                );

                setModules(updatedModules);
            }
        }
    };

    // Render content item in the list
    const renderContentItem = (contentItem, moduleId = null) => {
        const contentType = contentItem.type || 'video';
        let icon;

        switch (contentType) {
            case 'video':
                icon = <FaVideo className="content-icon" />;
                break;
            case 'document':
                icon = <FaFileAlt className="content-icon" />;
                break;
            case 'text':
                icon = <FaFileText className="content-icon" />;
                break;
            case 'youtube':
                icon = <FaYoutube className="content-icon" />;
                break;
            default:
                icon = <FaFileAlt className="content-icon" />;
        }

        return (
            <div key={contentItem._id} className="content-item">
                <div className="content-info">
                    {icon}
                    <span className="content-title">{contentItem.title}</span>
                    <span className="content-type-badge">{contentType}</span>
                </div>
                <div className="content-actions">
                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => startEditContent(contentItem)}
                    >
                        <FaEdit />
                    </button>
                    <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteContent(contentItem._id, moduleId)}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        );
    };

    // Render quiz item
    const renderQuizItem = (quiz, moduleId = null) => {
        // Only add a simple null check to prevent errors
        if (!quiz) return null;

        // Ensure quiz has the required properties
        const quizTitle = quiz.title || "Untitled Quiz";
        const quizDescription = quiz.description || "";
        const questionsCount = quiz.questions?.length || 0;

        return (
            <div className="quiz-item" key={quiz._id}>
                <div className="quiz-item-header">
                    <div className="quiz-item-icon">
                        <FaQuestionCircle />
                    </div>
                    <div className="quiz-item-info">
                        <h4>{quizTitle}</h4>
                        {quizDescription && <p>{quizDescription}</p>}
                        <span className="quiz-questions-count">
                            {questionsCount} questions
                        </span>
                    </div>
                </div>
                <div className="quiz-item-actions">
                    <button onClick={() => {
                        setEditingQuizId(quiz._id);
                        setQuizFormData({
                            title: quizTitle,
                            description: quizDescription,
                            questions: quiz.questions || []
                        });
                    }}>
                        <FaEdit />
                    </button>
                    <button onClick={() => deleteQuiz(quiz._id, moduleId)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="curriculum-step">
            <h2>Course Curriculum</h2>
            <p className="step-description">
                Structure your course content in a way that's easy for students to follow.
                Create modules first, then add content and quizzes to each module.
            </p>

            <div className="modules-container">
                <div className="section-header">
                    <h3>Modules</h3>
                    <button
                        type="button"
                        className="add-button"
                        onClick={addModule}
                    >
                        <FaPlus />
                        <span>Add Module</span>
                    </button>
                </div>

                {/* Module Editor */}
                {editingModuleId && (
                    <div className="module-editor">
                        <h4>{moduleFormData.title ? `Edit: ${moduleFormData.title}` : 'New Module'}</h4>
                        <div className="form-group">
                            <label htmlFor="moduleTitle">Module Title</label>
                            <input
                                type="text"
                                id="moduleTitle"
                                value={moduleFormData.title}
                                onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                                placeholder="Enter module title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="moduleDescription">Description (Optional)</label>
                            <textarea
                                id="moduleDescription"
                                value={moduleFormData.description}
                                onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                                placeholder="Enter module description"
                                rows={3}
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setEditingModuleId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="save-button"
                                onClick={saveModule}
                            >
                                Save Module
                            </button>
                        </div>
                    </div>
                )}

                {/* Modules List with Drag and Drop */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="modules">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="modules-list"
                            >
                                {modules.length === 0 ? (
                                    <div className="no-modules">
                                        <p>No modules yet. Click "Add Module" to create your first module.</p>
                                    </div>
                                ) : (
                                    modules.map((module, index) => (
                                        <Draggable key={module._id} draggableId={module._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="module-card"
                                                >
                                                    <div className="module-header">
                                                        <div {...provided.dragHandleProps} className="drag-handle">
                                                            <FaGripVertical />
                                                        </div>
                                                        <h4 onClick={() => toggleModuleExpanded(module._id)} className="module-title">
                                                            {index + 1}. {module.title}
                                                        </h4>
                                                        <div className="module-actions">
                                                            <button
                                                                className="toggle-module-btn"
                                                                onClick={() => toggleModuleExpanded(module._id)}
                                                            >
                                                                {expandedModules[module._id] ? <FaChevronUp /> : <FaChevronDown />}
                                                            </button>
                                                            <button onClick={() => startEditModule(module)}>
                                                                <FaEdit />
                                                            </button>
                                                            <button onClick={() => deleteModule(module._id)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {module.description && (
                                                        <p className="module-description">{module.description}</p>
                                                    )}

                                                    {/* Module Content - Shown only when expanded */}
                                                    {expandedModules[module._id] && (
                                                        <>
                                                            <div className="module-content">
                                                                <h5>Content</h5>
                                                                <div className="content-list">
                                                                    {module.content && module.content.length > 0 ? (
                                                                        // First try to find content in the module's content array
                                                                        module.content.map(contentId => {
                                                                            // If contentId is an object, use it directly
                                                                            if (typeof contentId === 'object') {
                                                                                return renderContentItem(contentId, module._id);
                                                                            } else {
                                                                                // Otherwise, find the content in the content array
                                                                                const contentItem = content.find(item => item._id === contentId);
                                                                                return contentItem ? renderContentItem(contentItem, module._id) : null;
                                                                            }
                                                                        }).filter(Boolean) // Remove any null items
                                                                    ) : (
                                                                        <p className="no-items">No content in this module yet.</p>
                                                                    )}

                                                                    {/* Content Editor - Show inside module when editing content for this module */}
                                                                    {editingContentId && content.find(c => c._id === editingContentId)?.module === module._id && (
                                                                        <div className="content-editor in-module">
                                                                            <h4>{contentFormData.title ? `Edit: ${contentFormData.title}` : 'New Content'}</h4>
                                                                            <div className="form-group">
                                                                                <label htmlFor="contentTitle">Content Title</label>
                                                                                <input
                                                                                    type="text"
                                                                                    id="contentTitle"
                                                                                    value={contentFormData.title}
                                                                                    onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                                                                                    placeholder="Enter content title"
                                                                                />
                                                                            </div>
                                                                            <div className="form-group">
                                                                                <label htmlFor="contentType">Content Type</label>
                                                                                <select
                                                                                    id="contentType"
                                                                                    value={contentFormData.type}
                                                                                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value })}
                                                                                >
                                                                                    {/* <option value="video">Video</option> */}
                                                                                    <option value="document">Document/PDF</option>
                                                                                    <option value="text">Text</option>
                                                                                    <option value="youtube">YouTube Link</option>
                                                                                </select>
                                                                            </div>
                                                                            <div className="form-group">
                                                                                <label htmlFor="contentDescription">Description (Optional)</label>
                                                                                <textarea
                                                                                    id="contentDescription"
                                                                                    value={contentFormData.description}
                                                                                    onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                                                                                    placeholder="Enter content description"
                                                                                    rows={3}
                                                                                />
                                                                            </div>
                                                                            {contentFormData.type === 'text' ? (
                                                                                <div className="form-group">
                                                                                    <label htmlFor="textEditor">Text Content</label>
                                                                                    <SummernoteEditor
                                                                                        value={contentFormData.textContent}
                                                                                        onChange={(content) => setContentFormData({ ...contentFormData, textContent: content })}
                                                                                        placeholder="Enter your text content here..."
                                                                                    />
                                                                                </div>
                                                                            ) : contentFormData.type === 'youtube' ? (
                                                                                <div className="form-group">
                                                                                    <label htmlFor="youtubeUrl">YouTube Video URL</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        id="youtubeUrl"
                                                                                        value={contentFormData.textContent || ''}
                                                                                        onChange={(e) => setContentFormData({ ...contentFormData, textContent: e.target.value })}
                                                                                        placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
                                                                                    />
                                                                                    {contentFormData.textContent && (
                                                                                        <div className="youtube-preview">
                                                                                            <p>Preview:</p>
                                                                                            <div className="embed-responsive">
                                                                                                <iframe
                                                                                                    width="100%"
                                                                                                    height="315"
                                                                                                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(contentFormData.textContent)}`}
                                                                                                    title="YouTube video player"
                                                                                                    style={{ border: 0 }}
                                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                    allowFullScreen>
                                                                                                </iframe>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="form-group">

                                                                                    <div className="file-upload">
                                                                                        <input
                                                                                            type="file"
                                                                                            id="contentFile"
                                                                                            onChange={(e) => setContentFormData({ ...contentFormData, file: e.target.files[0] })}
                                                                                            accept={contentFormData.type === 'video' ? 'video/*' : 'application/pdf,application/msword'}
                                                                                        />
                                                                                        <label htmlFor="contentFile" className="file-upload-label">
                                                                                            <FaFileUpload />
                                                                                            Upload {contentFormData.type === 'video' ? 'Video' : 'Document'}
                                                                                        </label>
                                                                                        {contentFormData.file && (
                                                                                            <span className="file-name">{contentFormData.file.name}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className="form-actions">
                                                                                <button
                                                                                    type="button"
                                                                                    className="cancel-button"
                                                                                    onClick={() => setEditingContentId(null)}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="save-button"
                                                                                    onClick={saveContent}
                                                                                >
                                                                                    Save Content
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <button
                                                                        className="add-content-button"
                                                                        onClick={() => addContentToModule(module._id)}
                                                                    >
                                                                        <FaPlus />
                                                                        <span>Add Content</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Module Quiz */}
                                                            <div className="module-quiz">
                                                                <h5>Quiz</h5>
                                                                {module.quiz ? (
                                                                    <div className="quiz-container">
                                                                        {/* Handle both object and ID references */}
                                                                        {(() => {
                                                                            // If quiz is already an object, use it directly
                                                                            if (typeof module.quiz === 'object') {
                                                                                return renderQuizItem(module.quiz, module._id);
                                                                            } else {
                                                                                // Otherwise, find the quiz in the quizzes array
                                                                                const quiz = quizzes.find(q => q._id === module.quiz);
                                                                                return quiz ? renderQuizItem(quiz, module._id) : (
                                                                                    <div className="no-quiz">
                                                                                        <p>Quiz not found. Please add a new quiz.</p>
                                                                                        <button
                                                                                            className="add-quiz-button"
                                                                                            onClick={() => addQuizToModule(module._id)}
                                                                                        >
                                                                                            <FaPlus />
                                                                                            <span>Add Quiz</span>
                                                                                        </button>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </div>
                                                                ) : (
                                                                    <div className="no-quiz">
                                                                        <p className="no-items">No quiz for this module yet.</p>
                                                                        <button
                                                                            className="add-quiz-button"
                                                                            onClick={() => addQuizToModule(module._id)}
                                                                        >
                                                                            <FaPlus />
                                                                            <span>Add Quiz</span>
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Quiz Editor - Show inside module when editing quiz for this module */}
                                                                {editingQuizId && quizzes.find(q => q._id === editingQuizId)?.module === module._id && (
                                                                    <div className="quiz-editor in-module">
                                                                        <h4>{quizFormData.title ? `Edit: ${quizFormData.title}` : 'New Quiz'}</h4>
                                                                        <div className="form-group">
                                                                            <label htmlFor="quizTitle">Quiz Title</label>
                                                                            <input
                                                                                type="text"
                                                                                id="quizTitle"
                                                                                value={quizFormData.title}
                                                                                onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                                                                                placeholder="Enter quiz title"
                                                                            />
                                                                        </div>
                                                                        <div className="form-group">
                                                                            <label htmlFor="quizDescription">Description (Optional)</label>
                                                                            <textarea
                                                                                id="quizDescription"
                                                                                value={quizFormData.description}
                                                                                onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                                                                                placeholder="Enter quiz description"
                                                                                rows={3}
                                                                            />
                                                                        </div>

                                                                        {/* Questions List */}
                                                                        <div className="questions-list">
                                                                            <h5>Questions ({quizFormData.questions.length})</h5>
                                                                            {quizFormData.questions.map((q, index) => (
                                                                                <div key={index} className="question-item">
                                                                                    <h6>Question {index + 1}: {q.question}</h6>
                                                                                    <ul className="options-list">
                                                                                        {q.options.map((option, optIndex) => (
                                                                                            <li key={optIndex} className={optIndex === q.correctAnswer ? 'correct' : ''}>
                                                                                                {option} {optIndex === q.correctAnswer && ' (Correct)'}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                    <div className="question-actions">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="edit-question"
                                                                                            onClick={() => startEditQuestion(index)}
                                                                                        >
                                                                                            <FaEdit />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="remove-question"
                                                                                            onClick={() => removeQuestion(index)}
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Add Question Form */}
                                                                        <div className="add-question-form">
                                                                            <h5>{editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}</h5>
                                                                            <div className="form-group">
                                                                                <label htmlFor="questionText">Question</label>
                                                                                <input
                                                                                    type="text"
                                                                                    id="questionText"
                                                                                    value={currentQuestion.question}
                                                                                    onChange={handleQuestionChange}
                                                                                    placeholder="Enter question"
                                                                                />
                                                                            </div>
                                                                            <div className="options-container">
                                                                                <label>Options (select one as correct)</label>
                                                                                {currentQuestion.options.map((option, index) => (
                                                                                    <div key={index} className="option-row">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={option}
                                                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                                            placeholder={`Option ${index + 1}`}
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            className={`correct-toggle ${index === currentQuestion.correctAnswer ? 'active' : ''}`}
                                                                                            onClick={() => setCorrectAnswer(index)}
                                                                                        >
                                                                                            {index === currentQuestion.correctAnswer ? 'Correct' : 'Mark as Correct'}
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="question-form-actions">
                                                                                {editingQuestionIndex !== null && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="cancel-edit-button"
                                                                                        onClick={() => {
                                                                                            setEditingQuestionIndex(null);
                                                                                            setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
                                                                                        }}
                                                                                    >
                                                                                        Cancel Edit
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    className="add-question-button"
                                                                                    onClick={addQuestionToQuiz}
                                                                                >
                                                                                    {editingQuestionIndex !== null ? (
                                                                                        <>
                                                                                            <FaEdit />
                                                                                            <span>Update Question</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <FaPlus />
                                                                                            <span>Add Question</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="form-actions">
                                                                            <button
                                                                                type="button"
                                                                                className="cancel-button"
                                                                                onClick={() => setEditingQuizId(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="save-button"
                                                                                onClick={saveQuiz}
                                                                            >
                                                                                Save Quiz
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
};

// Helper function to extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
    if (!url) return '';

    // Extract video ID from different YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[7].length === 11) ? match[7] : '';
};

export default CurriculumStep;
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaGripVertical, FaVideo, FaFileAlt, FaFileUpload, FaQuestionCircle, FaFileAlt as FaFileText } from "react-icons/fa";
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

    // Update parent component state when local states change
    useEffect(() => {
        updateCourseData({
            hasModules: true, // Always use modules
            modules: modules.map(module => {
                // Ensure module has the correct structure for backend
                const moduleData = {
                    _id: module._id,
                    title: module.title,
                    description: module.description,
                    content: module.content || [],
                    order: module.order || 0
                };

                // Add quiz if it exists
                if (module.quiz) {
                    const quizItem = quizzes.find(q => q._id === module.quiz);
                    if (quizItem) {
                        moduleData.quiz = quizItem;
                    }
                }

                return moduleData;
            }),
            content, // Keep for legacy support
            quizzes // Keep for legacy support
        });
    }, [modules, content, quizzes, updateCourseData]);

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

    // Add standalone content (when not using modules)
    const addStandaloneContent = () => {
        const newContent = {
            _id: `temp_content_${Date.now()}`,
            title: "New Content",
            description: "",
            type: "video",
            textContent: "",
            fileUrl: "",
            module: null
        };

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
        console.log("🧠 Saving content...");
        console.log("🔧 Editing Content ID:", editingContentId);
        console.log("📝 Content Form Data:", contentFormData);

        const moduleOfEditingContent = content.find(item => item._id === editingContentId)?.module;

        const updatedContent = content.map(item =>
            item._id === editingContentId
                ? {
                    ...item,
                    title: contentFormData.title,
                    description: contentFormData.description,
                    type: contentFormData.type,
                    file: contentFormData.file,
                    textContent: contentFormData.textContent,
                    fileUrl: contentFormData.file ? URL.createObjectURL(contentFormData.file) : item.fileUrl,
                    _id: item._id.startsWith('temp_') ? item._id : item._id,
                    module: moduleOfEditingContent || item.module
                }
                : item
        );

        const savedItem = updatedContent.find(item => item._id === editingContentId);
        console.log("✅ Updated Content Item:", savedItem);
        console.log("✅ Updated Content Item updatedContent:", updatedContent);

        setContent(updatedContent);
        setEditingContentId(null);
        setContentFormData({ title: "", description: "", type: "video", file: null, textContent: "" });
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

    // Add standalone quiz (when not using modules)
    const addStandaloneQuiz = () => {
        const newQuiz = {
            _id: `temp_quiz_${Date.now()}`,
            title: "Course Quiz",
            description: "Test your knowledge of this course",
            questions: [],
            module: null
        };

        setQuizzes([...quizzes, newQuiz]);
        setEditingQuizId(newQuiz._id);
        setQuizFormData({ title: newQuiz.title, description: newQuiz.description, questions: [] });
    };

    // Add question to quiz
    const addQuestionToQuiz = () => {
        // Validate the current question
        if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
            alert("Please fill in all fields for the question");
            return;
        }

        const updatedFormData = {
            ...quizFormData,
            questions: [
                ...quizFormData.questions,
                { ...currentQuestion }
            ]
        };

        setQuizFormData(updatedFormData);
        setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
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
        const updatedQuizzes = quizzes.map(quiz =>
            quiz._id === editingQuizId
                ? {
                    ...quiz,
                    title: quizFormData.title,
                    description: quizFormData.description,
                    questions: quizFormData.questions
                }
                : quiz
        );

        setQuizzes(updatedQuizzes);
        setEditingQuizId(null);
        setQuizFormData({ title: "", description: "", questions: [] });
        setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
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
        return (
            <div className="quiz-item" key={quiz._id}>
                <div className="quiz-item-icon">
                    <FaQuestionCircle />
                </div>
                <div className="quiz-item-info">
                    <h4>{quiz.title}</h4>
                    {quiz.description && <p>{quiz.description}</p>}
                    <span className="quiz-questions-count">
                        {quiz.questions?.length || 0} questions
                    </span>
                </div>
                <div className="quiz-item-actions">
                    <button onClick={() => {
                        setEditingQuizId(quiz._id);
                        setQuizFormData({
                            title: quiz.title,
                            description: quiz.description,
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
            </p>

            {/* Always use modules */}
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

                {/* Content Editor */}
                {editingContentId && (
                    <div className="content-editor">
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
                                <option value="video">Video</option>
                                <option value="document">Document/PDF</option>
                                <option value="text">Text</option>
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
                        ) : (
                            <div className="form-group">
                                <label htmlFor="contentFile">
                                    Upload {contentFormData.type === 'video' ? 'Video' : 'Document'}
                                </label>
                                <div className="file-upload">
                                    <input
                                        type="file"
                                        id="contentFile"
                                        onChange={(e) => setContentFormData({ ...contentFormData, file: e.target.files[0] })}
                                        accept={contentFormData.type === 'video' ? 'video/*' : 'application/pdf,application/msword'}
                                    />
                                    <label htmlFor="contentFile" className="file-upload-label">
                                        <FaFileUpload />
                                        <span>Choose File</span>
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

                {/* Quiz Editor */}
                {editingQuizId && (
                    <div className="quiz-editor">
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
                                    <button
                                        type="button"
                                        className="remove-question"
                                        onClick={() => removeQuestion(index)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Question Form */}
                        <div className="add-question-form">
                            <h5>Add New Question</h5>
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
                            <button
                                type="button"
                                className="add-question-button"
                                onClick={addQuestionToQuiz}
                            >
                                <FaPlus />
                                <span>Add Question</span>
                            </button>
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
                                                        <h4>
                                                            {index + 1}. {module.title}
                                                        </h4>
                                                        <div className="module-actions">
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

                                                    {/* Module Content */}
                                                    <div className="module-content">
                                                        <h5>Content</h5>
                                                        <div className="content-list">
                                                            {module.content && module.content.length > 0 ? (
                                                                content
                                                                    .filter(item => module.content.includes(item._id))
                                                                    .map(item => renderContentItem(item, module._id))
                                                            ) : (
                                                                <p className="no-items">No content in this module yet.</p>
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
                                                                {renderQuizItem(quizzes.find(q => q._id === module.quiz), module._id)}
                                                            </div>
                                                        ) : (
                                                            <div className="no-quiz">
                                                                <p>No quiz for this module yet.</p>
                                                                <button
                                                                    className="add-quiz-button"
                                                                    onClick={() => addQuizToModule(module._id)}
                                                                >
                                                                    <FaPlus />
                                                                    <span>Add Quiz</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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
            ) : (
            // Standalone Content and Quizzes
            <div className="standalone-curriculum">
                {/* Standalone Content */}
                <div className="content-section">
                    <div className="section-header">
                        <h3>Course Content</h3>
                        <button
                            type="button"
                            className="add-button"
                            onClick={addStandaloneContent}
                        >
                            <FaPlus />
                            <span>Add Content</span>
                        </button>
                    </div>

                    <div className="content-list">
                        {content.length === 0 ? (
                            <div className="no-content">
                                <p>No content yet. Click "Add Content" to create your first content item.</p>
                            </div>
                        ) : (
                            content.map(item => renderContentItem(item))
                        )}
                    </div>
                </div>

                {/* Standalone Quizzes */}
                <div className="quizzes-section">
                    <div className="section-header">
                        <h3>Course Quizzes</h3>
                        <button
                            type="button"
                            className="add-button"
                            onClick={addStandaloneQuiz}
                        >
                            <FaPlus />
                            <span>Add Quiz</span>
                        </button>
                    </div>

                    <div className="quizzes-list">
                        {quizzes.length === 0 ? (
                            <div className="no-quizzes">
                                <p>No quizzes yet. Click "Add Quiz" to create your first quiz.</p>
                            </div>
                        ) : (
                            quizzes.map(quiz => renderQuizItem(quiz))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurriculumStep;
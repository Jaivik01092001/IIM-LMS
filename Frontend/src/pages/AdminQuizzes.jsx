import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQuizzesThunk, createQuizThunk } from '../redux/admin/adminSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

function AdminQuizzes() {
    const dispatch = useDispatch();
    const { quizzes, courses, loading } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        courseId: '',
        timeLimit: 30,
        passingScore: 60,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', points: 1 }]
    });
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(getQuizzesThunk());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[index][field] = value;
        setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', points: 1 }]
        }));
    };

    const removeQuestion = (index) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions.splice(index, 1);
        setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleCreateQuiz = () => {
        dispatch(createQuizThunk({
            ...quizData,
            userId: user._id
        })).then(() => {
            setShowCreateModal(false);
            resetForm();
        });
    };

    const resetForm = () => {
        setQuizData({
            title: '',
            description: '',
            courseId: '',
            timeLimit: 30,
            passingScore: 60,
            questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', points: 1 }]
        });
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                        {t('admin.quizManagement')}
                    </h1>
                    <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('admin.createQuiz')}
                        </button>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noQuizzes')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('admin.addQuizToGetStarted')}</p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                {t('admin.createQuiz')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('quiz.title')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('course.title')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('quiz.questions')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('quiz.timeLimit')}
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">{t('common.actions')}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuizzes.map((quiz) => (
                                    <tr key={quiz._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                                            <div className="text-sm text-gray-500">{quiz.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{quiz.course?.title || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{quiz.questions?.length || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {quiz.timeLimit ? `${quiz.timeLimit} ${t('quiz.minutes')}` : t('common.notSet')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/admin/quiz/${quiz._id}`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                {t('common.edit')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Quiz Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('admin.createQuiz')}
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            {t('quiz.title')} *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={quizData.title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            {t('quiz.description')}
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="2"
                            value={quizData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                            {t('course.select')} *
                        </label>
                        <select
                            id="courseId"
                            name="courseId"
                            value={quizData.courseId}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        >
                            <option value="">{t('common.select')}</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
                                {t('quiz.timeLimit')} ({t('quiz.minutes')})
                            </label>
                            <input
                                type="number"
                                id="timeLimit"
                                name="timeLimit"
                                min="5"
                                max="180"
                                value={quizData.timeLimit}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                                {t('quiz.passingScore')} (%)
                            </label>
                            <input
                                type="number"
                                id="passingScore"
                                name="passingScore"
                                min="1"
                                max="100"
                                value={quizData.passingScore}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('quiz.questions')}</h3>

                        {quizData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-md font-medium">{t('quiz.question')} {qIndex + 1}</h4>
                                    {quizData.questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder={t('quiz.questionText')}
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('quiz.options')}
                                    </label>
                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center mb-2">
                                            <input
                                                type="radio"
                                                name={`correctAnswer-${qIndex}`}
                                                checked={q.correctAnswer === option}
                                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', option)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`${t('quiz.option')} ${oIndex + 1}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('quiz.explanation')} ({t('common.optional')})
                                    </label>
                                    <textarea
                                        placeholder={t('quiz.explanationPlaceholder')}
                                        value={q.explanation}
                                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('quiz.points')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={q.points}
                                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value, 10))}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('quiz.addQuestion')}
                        </button>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateQuiz}
                            disabled={!quizData.title || !quizData.courseId}
                            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!quizData.title || !quizData.courseId ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                        >
                            {t('common.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AdminQuizzes; 
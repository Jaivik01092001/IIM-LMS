import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseThunk, updateCourseThunk, getContentThunk, addContentToCourseThunk } from '../redux/admin/adminSlice';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

function AdminCourseDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentCourse, content: allContent, loading } = useSelector((state) => state.admin);
    const { t } = useTranslation();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        duration: '',
        level: 'beginner',
        tags: '',
        thumbnail: ''
    });

    useEffect(() => {
        dispatch(getCourseThunk(id));
        dispatch(getContentThunk());
    }, [dispatch, id]);

    useEffect(() => {
        if (currentCourse) {
            setCourseData({
                title: currentCourse.title || '',
                description: currentCourse.description || '',
                duration: currentCourse.duration || '',
                level: currentCourse.level || 'beginner',
                tags: currentCourse.tags ? currentCourse.tags.join(', ') : '',
                thumbnail: currentCourse.thumbnail || ''
            });
        }
    }, [currentCourse]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCourse = () => {
        const tagsArray = courseData.tags ? courseData.tags.split(',').map(tag => tag.trim()) : [];

        dispatch(updateCourseThunk({
            id,
            ...courseData,
            tags: tagsArray,
        })).then(() => {
            setShowEditModal(false);
        });
    };

    const handleAddContent = (contentId) => {
        dispatch(addContentToCourseThunk({
            courseId: id,
            contentId
        })).then(() => {
            setShowAddContentModal(false);
            dispatch(getCourseThunk(id));
        });
    };

    if (loading || !currentCourse) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Filter content that is not already in the course
    const availableContent = allContent.filter(
        item => !currentCourse.content.some(c => c._id === item._id)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
                    <div>
                        <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
                            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            {t('admin.backToCourses')}
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{currentCourse.title}</h1>
                    </div>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        {t('common.edit')}
                    </button>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('course.description')}</h2>
                            <p className="text-gray-600">{currentCourse.description || t('common.notAvailable')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('course.duration')}</h3>
                                <p className="mt-1 text-base text-gray-900">{currentCourse.duration || t('common.notAvailable')}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('course.level')}</h3>
                                <p className="mt-1 text-base text-gray-900 capitalize">{currentCourse.level}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('course.creator')}</h3>
                                <p className="mt-1 text-base text-gray-900">{currentCourse.creator?.name || t('common.notAvailable')}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">{t('course.enrolledUsers')}</h3>
                                <p className="mt-1 text-base text-gray-900">{currentCourse.enrolledUsers?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        {currentCourse.thumbnail ? (
                            <div className="rounded-lg overflow-hidden border border-gray-200">
                                <img src={currentCourse.thumbnail} alt={currentCourse.title} className="w-full h-auto" />
                            </div>
                        ) : (
                            <div className="rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center p-8 h-full">
                                <svg className="h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Content */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{t('course.content')}</h2>
                        <button
                            onClick={() => setShowAddContentModal(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('admin.addContent')}
                        </button>
                    </div>

                    {currentCourse.content && currentCourse.content.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('content.title')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('content.type')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('content.creator')}
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">{t('common.actions')}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentCourse.content.map((item) => (
                                        <tr key={item._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {item.type || 'document'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.creator?.name || t('common.notAvailable')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    {t('common.view')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noContent')}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t('admin.addContentToGetStarted')}</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddContentModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    {t('admin.addContent')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Course Quizzes */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{t('course.quizzes')}</h2>
                        <Link
                            to={`/admin/quizzes?courseId=${id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('admin.addQuiz')}
                        </Link>
                    </div>

                    {currentCourse.quizzes && currentCourse.quizzes.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('quiz.title')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('quiz.questions')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('quiz.timeLimit')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('quiz.passingScore')}
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">{t('common.actions')}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentCourse.quizzes.map((quiz) => (
                                        <tr key={quiz._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                                                <div className="text-xs text-gray-500">{quiz.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {quiz.questions?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {quiz.timeLimit ? `${quiz.timeLimit} ${t('quiz.minutes')}` : t('common.notSet')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {quiz.passingScore}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/admin/quiz/${quiz._id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {t('common.view')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noQuizzes')}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t('admin.addQuizToGetStarted')}</p>
                            <div className="mt-6">
                                <Link
                                    to={`/admin/quizzes?courseId=${id}`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    {t('admin.addQuiz')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Edit Course Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={t('admin.editCourse')}
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            {t('course.title')} *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={courseData.title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            {t('course.description')}
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={courseData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                            {t('course.duration')}
                        </label>
                        <input
                            type="text"
                            id="duration"
                            name="duration"
                            value={courseData.duration}
                            onChange={handleInputChange}
                            placeholder="e.g. 4 weeks"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                            {t('course.level')}
                        </label>
                        <select
                            id="level"
                            name="level"
                            value={courseData.level}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="beginner">{t('course.beginner')}</option>
                            <option value="intermediate">{t('course.intermediate')}</option>
                            <option value="advanced">{t('course.advanced')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                            {t('course.tags')}
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={courseData.tags}
                            onChange={handleInputChange}
                            placeholder="e.g. programming, javascript, web development"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('admin.tagsHelp')}</p>
                    </div>
                    <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                            {t('course.thumbnailUrl')}
                        </label>
                        <input
                            type="text"
                            id="thumbnail"
                            name="thumbnail"
                            value={courseData.thumbnail}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdateCourse}
                            disabled={!courseData.title}
                            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!courseData.title ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Content Modal */}
            <Modal
                isOpen={showAddContentModal}
                onClose={() => setShowAddContentModal(false)}
                title={t('admin.addContentToCourse')}
            >
                <div className="space-y-4">
                    {availableContent.length > 0 ? (
                        <div className="overflow-y-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('content.title')}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('content.type')}
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">{t('common.actions')}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableContent.map((item) => (
                                        <tr key={item._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {item.type || 'document'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleAddContent(item._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    {t('common.add')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noAvailableContent')}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t('admin.createContentFirst')}</p>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setShowAddContentModal(false)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AdminCourseDetail; 
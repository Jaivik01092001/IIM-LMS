import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoursesThunk, createCourseThunk, deleteCourseThunk } from '../redux/admin/adminSlice';
import Card from '../components/Card';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

function AdminCourses() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    tags: '',
    thumbnail: ''
  });
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getCoursesThunk());
  }, [dispatch]);

  const handleCreateCourse = () => {
    // Convert comma-separated tags to array
    const tagsArray = courseData.tags ? courseData.tags.split(',').map(tag => tag.trim()) : [];
    console.log("useruser", user);
    dispatch(createCourseThunk({
      ...courseData,
      tags: tagsArray,
      userId: user.id
    })).then(() => {
      setShowCreateModal(false);
      setCourseData({
        title: '',
        description: '',
        duration: '',
        level: 'beginner',
        tags: '',
        thumbnail: ''
      });
    });
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm(t('admin.confirmDeleteCourse'))) {
      dispatch(deleteCourseThunk(id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            {t('admin.courseManagement')}
          </h1>
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('admin.createCourse')}
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

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noCourses')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('admin.addCourseToGetStarted')}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('admin.createCourse')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {course.thumbnail && (
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{course.title}</h3>
                    {course.level && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(course.level)}`}>
                        {t(`course.${course.level}`)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-2 text-sm text-gray-500">
                        {course.creator?.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.enrolledUsers?.length || 0} {t('course.enrolledUsers')}
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Link
                      to={`/admin/course/${course._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 bg-white hover:bg-blue-50 focus:outline-none"
                    >
                      {t('admin.manage')}
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-600 text-xs font-medium rounded text-red-600 bg-white hover:bg-red-50 focus:outline-none"
                    >
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('admin.createCourse')}
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
              onClick={() => setShowCreateModal(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleCreateCourse}
              disabled={!courseData.title}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!courseData.title ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {t('common.create')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCourses;
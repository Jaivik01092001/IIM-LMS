import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  createPageThunk,
  getPageThunk,
  updatePageThunk,
  publishPageThunk,
  unpublishPageThunk
} from '../redux/admin/adminSlice';

function CmsBuilder() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentPage, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    title: '',
    content: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    showInNavigation: false,
    order: 0,
    slug: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      dispatch(getPageThunk(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isEditing && currentPage) {
      setForm({
        title: currentPage.title || '',
        content: currentPage.content || '',
        status: currentPage.status || 'draft',
        metaTitle: currentPage.metaTitle || '',
        metaDescription: currentPage.metaDescription || '',
        metaKeywords: currentPage.metaKeywords || '',
        showInNavigation: currentPage.showInNavigation || false,
        order: currentPage.order || 0,
        slug: currentPage.slug || ''
      });
    }
  }, [isEditing, currentPage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updatePageThunk({ id, ...form }))
        .then(() => navigate('/admin/pages'));
    } else {
      dispatch(createPageThunk(form))
        .then(() => navigate('/admin/pages'));
    }
  };

  const handlePublish = () => {
    dispatch(publishPageThunk(id))
      .then(() => navigate('/admin/pages'));
  };

  const handleUnpublish = () => {
    dispatch(unpublishPageThunk(id))
      .then(() => navigate('/admin/pages'));
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? t('admin.editPage') : t('admin.createPage')}
          </h1>
          {isEditing && (
            <div className="flex space-x-2">
              {currentPage?.status === 'draft' ? (
                <button
                  onClick={handlePublish}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  {t('admin.publishPage')}
                </button>
              ) : (
                <button
                  onClick={handleUnpublish}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  {t('admin.unpublishPage')}
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.pageTitle')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {isEditing && (
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.pageSlug')}
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.pageSlugHelp')}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.pageContent')}
            </label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link', 'image'
              ]}
              className="h-64 mb-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.metaTitle')}
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.metaKeywords')}
              </label>
              <input
                type="text"
                id="metaKeywords"
                name="metaKeywords"
                value={form.metaKeywords}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.metaDescription')}
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              rows={2}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.pageOrder')}
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={form.order}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center h-full pt-6">
              <input
                type="checkbox"
                id="showInNavigation"
                name="showInNavigation"
                checked={form.showInNavigation}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showInNavigation" className="ml-2 block text-sm text-gray-900">
                {t('admin.showInNavigation')}
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/pages')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CmsBuilder;

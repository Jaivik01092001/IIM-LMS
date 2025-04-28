import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogByIdThunk, createBlogThunk, updateBlogThunk } from '../redux/blog/blogSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';
import { FaFilePen } from "react-icons/fa6";
import SummernoteEditor from '../components/Editor/SummernoteEditor';
import '../assets/styles/Blog.css';

const BlogForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { currentBlog, loading } = useSelector((state) => state.blog);

  const userRole = user?.role || 'educator';
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: ['Uncategorized'],
    status: false,
    image: null,
    slug: ''
  });

  useEffect(() => {
    if (isEditMode) {
      dispatch(getBlogByIdThunk(id));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentBlog) {
      setFormData({
        title: currentBlog.title || '',
        excerpt: currentBlog.shortDescription || '',
        content: currentBlog.content || '',
        tags: currentBlog.tags?.length > 0 ? currentBlog.tags : ['Uncategorized'],
        status: currentBlog.status === 'published',
        image: null,
        slug: currentBlog.slug || ''
      });

      if (currentBlog.coverImage) {
        setImagePreview(currentBlog.coverImage);
      }

      setIsLoading(false);
    }
  }, [currentBlog, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;
    setIsLoading(loading);
  }, [loading, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      if (files[0]) {
        const fileType = files[0].type;
        if (!fileType.startsWith('image/')) {
          alert('Please select an image file (JPEG, PNG, etc.)');
          return;
        }
        if (files[0].size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }

        setFormData({
          ...formData,
          [name]: files[0]
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);

      } else {
        setImagePreview(null);
        setFormData({
          ...formData,
          [name]: null
        });
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      alert('Short description is required');
      return;
    }
    if (!formData.content.trim()) {
      alert('Content is required');
      return;
    }

    const blogFormData = new FormData();
    blogFormData.append('title', formData.title);
    blogFormData.append('shortDescription', formData.excerpt);
    blogFormData.append('content', formData.content);

    formData.tags.forEach((tag, index) => {
      blogFormData.append(`tags[${index}]`, tag);
    });

    blogFormData.append('status', formData.status ? 'published' : 'draft');

    if (formData.image) {
      blogFormData.append('coverImage', formData.image);
    }

    // Debugging FormData content
    for (let pair of blogFormData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    if (isEditMode) {
      dispatch(updateBlogThunk({
        id,
        formData: blogFormData
      })).then(() => {
        navigate(`/dashboard/${getDashboardPath()}/blogs`);
      });
    } else {
      dispatch(createBlogThunk(blogFormData)).then(() => {
        navigate(`/dashboard/${getDashboardPath()}/blogs`);
      });
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/${getDashboardPath()}/blogs`);
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') {
      return 'admin';
    } else if (userRole === 'university') {
      return 'school';
    } else {
      return 'tutor';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-container">
      <button className="blog-back-button" onClick={handleCancel}>
        <FaArrowLeft /> Back to Blogs
      </button>

      <form className="blog-form" onSubmit={handleSubmit}>
        <h2 className="blog-form-title">
          <FaFilePen className="blog-title-icon" /> {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="blog-form-input"
            required
          />
        </div>

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="excerpt">
            Short Description <span className="required">*</span>
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="blog-form-textarea"
            rows="3"
            required
            placeholder="A brief summary of your blog post"
          />
          <small className="blog-form-help">This will appear in blog listings and search results.</small>
        </div>

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="content">
            Content <span className="required">*</span>
          </label>
          <SummernoteEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Enter your blog content here..."
          />
        </div>

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="tags">
            Tags
          </label>
          <div className="blog-tags-input-container">
            <div className="blog-tags-list">
              {formData.tags.map((tag, index) => (
                <div key={index} className="blog-tag-item">
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="blog-tag-remove"
                    onClick={() => {
                      const newTags = [...formData.tags];
                      newTags.splice(index, 1);
                      setFormData({ ...formData, tags: newTags.length ? newTags : ['Uncategorized'] });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="blog-tags-input-wrapper">
              <input
                type="text"
                id="tagInput"
                className="blog-form-input"
                placeholder="Add a tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newTag = e.target.value.trim();
                    if (newTag && !formData.tags.includes(newTag)) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags.filter(tag => tag !== 'Uncategorized'), newTag]
                      });
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
          <small className="blog-form-help">Press Enter to add a tag. Tags help categorize your blog post.</small>
        </div>

        {isEditMode && formData.slug && (
          <div className="blog-form-group">
            <label className="blog-form-label">Slug</label>
            <div className="blog-slug-preview">
              {formData.slug}
            </div>
            <small className="blog-form-help">This is the URL-friendly version of the title that will appear in the address bar.</small>
          </div>
        )}

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="image">
            Featured Image
          </label>
          <div className="blog-form-file-input">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              className="blog-form-input"
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
            <small className="blog-form-help">
              Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
            </small>
            {imagePreview && (
              <div className="blog-image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className="blog-form-group">
          <label className="blog-form-label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status ? 'published' : 'draft'}
            onChange={(e) => {
              setFormData({
                ...formData,
                status: e.target.value === 'published'
              });
            }}
            className="blog-form-select"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <small className="blog-form-help">
            Draft blogs are only visible to you. Published blogs are visible to all users.
          </small>
        </div>

        <div className="blog-form-actions">
          <button
            type="button"
            className="blog-form-button blog-form-cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="blog-form-button blog-form-submit"
          >
            {isEditMode ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
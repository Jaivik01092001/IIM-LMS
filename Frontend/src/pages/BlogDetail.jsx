import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogByIdThunk, updateBlogThunk } from '../redux/blog/blogSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FaArrowLeft,
  FaUserCircle,
  FaCalendarAlt,
  FaTags,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPencilAlt
} from 'react-icons/fa';
import { FaFilePen } from "react-icons/fa6";
import "../assets/styles/Blog.css";

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get user role and current blog from Redux store
  const { user } = useSelector((state) => state.auth);
  const { currentBlog, loading } = useSelector((state) => state.blog);

  const userRole = user?.role || 'educator'; // Default to educator view if role not found

  // Fetch blog on component mount
  useEffect(() => {
    if (id) {
      dispatch(getBlogByIdThunk(id));
    }
  }, [dispatch, id]);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle status toggle
  const handleStatusToggle = () => {
    if (!currentBlog) return;

    const newStatus = currentBlog.status === 'published' ? 'draft' : 'published';

    dispatch(updateBlogThunk({
      id: currentBlog._id,
      status: newStatus
    }))
      .unwrap()
      .then(() => {
        console.log(`Successfully changed status to ${newStatus}`);
        // Refresh blog data
        dispatch(getBlogByIdThunk(id));
      })
      .catch(error => {
        console.error('Error updating blog status:', error);
      });
  };

  // Handle edit blog
  const handleEditBlog = () => {
    if (!currentBlog) return;
    navigate(`/dashboard/${getDashboardPath()}/blog/edit/${currentBlog._id}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/dashboard/${getDashboardPath()}/blogs`);
  };

  // Get the dashboard path based on user role
  const getDashboardPath = () => {
    if (userRole === 'admin') {
      return 'admin';
    } else if (userRole === 'university') {
      return 'school';
    } else {
      return 'tutor'; // Default for educator
    }
  };

  // Render loading state
  if (isLoading || !currentBlog) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-header">
        <button className="blog-back-button" onClick={handleBack}>
          <FaArrowLeft /> Back to Blogs
        </button>

        <div className="blog-detail-actions">
          <button className="blog-edit-button" onClick={handleEditBlog}>
            <FaPencilAlt /> Edit Blog
          </button>
        </div>
      </div>

      <div className="blog-detail-content">
        {currentBlog.coverImage && (
          <div className="blog-detail-image-container">
            <img
              src={VITE_IMAGE_URL + currentBlog.coverImage}
              alt={currentBlog.title}
              className="blog-detail-image"
            />
          </div>
        )}

        <h1 className="blog-detail-title"><FaFilePen className="blog-title-icon" /> {currentBlog.title}</h1>

        <div className="blog-detail-meta">
          {/* Created Date */}
          <div className="blog-detail-date">
            <FaCalendarAlt className="blog-meta-icon" />
            <span>Created: {formatDate(currentBlog.createdAt)}</span>
          </div>

          {/* Updated Date */}
          {currentBlog.updatedAt && currentBlog.updatedAt !== currentBlog.createdAt && (
            <div className="blog-detail-date">
              <FaClock className="blog-meta-icon" />
              <span>Updated: {formatDate(currentBlog.updatedAt)}</span>
            </div>
          )}

          {/* Tags */}
          <div className="blog-detail-tags">
            <FaTags className="blog-meta-icon" />
            <span>{currentBlog.tags?.join(', ') || 'No tags'}</span>
          </div>

          {/* Status with Toggle */}
          <div className="blog-detail-status">
            <div className="status-toggle-container">
              <span className={currentBlog.status === 'published' ? "text-green-600" : "text-red-600"}>
                {currentBlog.status === 'published' ? "Published" : "Draft"}
              </span>
              <button
                className={`status-toggle-btn ${currentBlog.status === 'published' ? 'deactivate' : 'activate'}`}
                onClick={handleStatusToggle}
              >
                {currentBlog.status === 'published' ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>

          {/* Author */}
          {currentBlog.createdBy && (
            <div className="blog-detail-author">
              <FaUserCircle className="blog-meta-icon" />
              <span>Author: {currentBlog.createdBy.name || 'Unknown'}</span>
            </div>
          )}
        </div>

        {currentBlog.shortDescription && (
          <div className="blog-detail-excerpt">
            {currentBlog.shortDescription}
          </div>
        )}

        <div
          className="blog-detail-body html-content"
          dangerouslySetInnerHTML={{ __html: currentBlog.content }}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
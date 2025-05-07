import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBlogByIdThunk, updateBlogThunk } from "../redux/blog/blogSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  FaArrowLeft,
  FaUserCircle,
  FaCalendarAlt,
  FaTags,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPencilAlt,
} from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { hasLocalPermission } from "../utils/localPermissions";
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

  const userRole = user?.role || "educator"; // Default to educator view if role not found

  // Check if user has permission to edit blogs
  const canEditBlog = hasLocalPermission("edit_blog");

  // Debug log for permission check
  console.debug("Blog Detail - Edit permission check:", {
    canEditBlog,
    userRole: user?.role,
    userId: user?._id,
  });

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle status toggle
  const handleStatusToggle = () => {
    if (!currentBlog) return;

    const newStatus =
      currentBlog.status === "published" ? "draft" : "published";

    dispatch(
      updateBlogThunk({
        id: currentBlog._id,
        status: newStatus,
      })
    )
      .unwrap()
      .then(() => {
        console.log(`Successfully changed status to ${newStatus}`);
        // Refresh blog data
        dispatch(getBlogByIdThunk(id));
      })
      .catch((error) => {
        console.error("Error updating blog status:", error);
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
    if (userRole === "admin") {
      return "admin";
    } else if (userRole === "university") {
      return "school";
    } else {
      return "tutor"; // Default for educator
    }
  };

  // Render loading state
  if (isLoading || !currentBlog) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-detail-container">
      {/* Sticky Header with Actions */}
      <div className="blog-detail-sticky-header">
        <button className="blog-back-button" onClick={handleBack}>
          <FaArrowLeft /> Back to Blogs
        </button>

        {canEditBlog && (
          <div className="blog-detail-actions">
            <button className="blog-edit-button" onClick={handleEditBlog}>
              <FaPencilAlt /> Edit Blog
            </button>
            <button
              className={`blog-status-button ${currentBlog.status === "published" ? "published" : "draft"
                }`}
              onClick={handleStatusToggle}
            >
              {currentBlog.status === "published" ? (
                <>
                  <FaCheckCircle /> Published
                </>
              ) : (
                <>
                  <FaTimesCircle /> Draft
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="blog-detail-layout">
        {/* Main Content */}
        <div className="blog-detail-content">
          {/* Cover Image */}
          {currentBlog.coverImage && (
            <div className="blog-detail-image-container">
              <img
                src={VITE_IMAGE_URL + currentBlog.coverImage}
                alt={currentBlog.title}
                className="blog-detail-image"
              />
            </div>
          )}

          {/* Title and Tags */}
          <div className="blog-detail-header-content">
            <h1 className="blog-detail-title">
              <FaFilePen className="blog-title-icon" /> {currentBlog.title}
            </h1>

            {/* Tags as Pills */}
            {currentBlog.tags && currentBlog.tags.length > 0 && (
              <div className="blog-detail-tags-container">
                {currentBlog.tags.map((tag, index) => (
                  <span key={index} className="blog-detail-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author and Date Info */}
          <div className="blog-detail-author-date">
            {currentBlog.createdBy && (
              <div className="blog-detail-author">
                <FaUserCircle className="blog-meta-icon" />
                <span>{currentBlog.createdBy.name || "Unknown"}</span>
              </div>
            )}
            <div className="blog-detail-date">
              <FaCalendarAlt className="blog-meta-icon" />
              <span>{formatDate(currentBlog.createdAt)}</span>
            </div>
          </div>

          {/* Short Description */}
          {currentBlog.shortDescription && (
            <div className="blog-detail-excerpt">
              {currentBlog.shortDescription}
            </div>
          )}

          {/* Main Content */}
          <div
            className="blog-detail-body html-content"
            dangerouslySetInnerHTML={{ __html: currentBlog.content }}
          />
        </div>

        {/* Sidebar with Metadata */}
        <div className="blog-detail-sidebar">
          <div className="blog-detail-meta-card">
            <h3 className="blog-detail-meta-title">Blog Information</h3>

            <div className="blog-detail-meta-item">
              <span className="blog-detail-meta-label">Status</span>
              <span
                className={`blog-detail-meta-status ${currentBlog.status === "published" ? "published" : "draft"
                  }`}
              >
                {currentBlog.status === "published" ? "Published" : "Draft"}
              </span>
            </div>

            <div className="blog-detail-meta-item">
              <span className="blog-detail-meta-label">Created</span>
              <span className="blog-detail-meta-value">
                {formatDate(currentBlog.createdAt)}
              </span>
            </div>

            {currentBlog.updatedAt &&
              currentBlog.updatedAt !== currentBlog.createdAt && (
                <div className="blog-detail-meta-item">
                  <span className="blog-detail-meta-label">Last Updated</span>
                  <span className="blog-detail-meta-value">
                    {formatDate(currentBlog.updatedAt)}
                  </span>
                </div>
              )}

            {currentBlog.createdBy && (
              <div className="blog-detail-meta-item">
                <span className="blog-detail-meta-label">Author</span>
                <span className="blog-detail-meta-value">
                  {currentBlog.createdBy.name || "Unknown"}
                </span>
              </div>
            )}

            {canEditBlog && (
              <div className="blog-detail-meta-actions">
                <button
                  className={`blog-detail-meta-action-btn ${currentBlog.status === "published" ? "unpublish" : "publish"
                    }`}
                  onClick={handleStatusToggle}
                >
                  {currentBlog.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  className="blog-detail-meta-action-btn edit"
                  onClick={handleEditBlog}
                >
                  Edit Blog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

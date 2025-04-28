import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaEye, FaUserCircle } from 'react-icons/fa';
import { FaFilePen } from "react-icons/fa6";
import DataTableComponent from '../components/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getBlogsThunk, deleteBlogThunk, updateBlogThunk } from '../redux/blog/blogSlice';
import "../assets/styles/Blog.css";

const Blog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get user role and blogs from Redux store
  const { user } = useSelector((state) => state.auth);
  const { blogs, loading } = useSelector((state) => state.blog);

  const userRole = user?.role || 'educator'; // Default to educator view if role not found

  // Fetch blogs on component mount
  useEffect(() => {
    dispatch(getBlogsThunk());
  }, [dispatch]);

  // Update loading state when Redux loading state changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle view blog
  const handleViewBlog = (blog) => {
    navigate(`/dashboard/${getDashboardPath()}/blog/${blog._id || blog.id}`);
  };

  // Handle edit blog
  const handleEditBlog = (blog) => {
    navigate(`/dashboard/${getDashboardPath()}/blog/edit/${blog._id || blog.id}`);
  };

  // Handle delete blog
  const handleDeleteBlog = (blog) => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`)) {
      dispatch(deleteBlogThunk(blog._id || blog.id))
        .unwrap()
        .then(() => {
          // Refresh blogs data
          dispatch(getBlogsThunk());
        })
        .catch(error => {
          console.error('Error deleting blog:', error);
        });
    }
  };

  // Status toggle handler
  const handleStatusToggle = (blog) => {
    // Convert between 'published'/'draft' and boolean/number as needed
    const currentStatus = blog.status === 'published';
    const newStatus = currentStatus ? 'draft' : 'published';

    dispatch(updateBlogThunk({
      id: blog._id || blog.id,
      status: newStatus
    }))
      .unwrap()
      .then(() => {
        console.log(`Successfully changed status to ${newStatus} for "${blog.title}"`);
        // Refresh blogs data
        dispatch(getBlogsThunk());
      })
      .catch(error => {
        console.error('Error updating blog status:', error);
      });
  };

  // Handle create new blog
  const handleCreateBlog = () => {
    navigate(`/dashboard/${getDashboardPath()}/blog/create`);
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

  // Data Table columns for admin and university view
  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: "Blog",
      cell: (row) => (
        <div className="blog-image-cell">
          {row.coverImage ? (
            <img src={row.coverImage} alt={row.title} className="blog-table-image" />
          ) : (
            <div className="blog-table-image" style={{ backgroundColor: 'var(--bg-gray)' }} />
          )}
          <div className="blog-table-title">
            <span className="blog-table-title-text">{row.title}</span>
            <span className="blog-table-excerpt">{row.shortDescription}</span>
          </div>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Tags",
      selector: (row) => row.tags?.join(', ') || 'No tags',
      sortable: true,
    },
    {
      name: "Author",
      cell: (row) => (
        <div className="blog-author-cell">
          <FaUserCircle className="blog-author-icon" />
          <span>{row.createdBy?.name || 'Unknown'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Published Date",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="status-cell">
          <div
            className={`status-indicator ${row.status === 'published' ? "active" : ""}`}
            onClick={() => handleStatusToggle(row)}
            title={row.status === 'published' ? "Click to unpublish" : "Click to publish"}
          />
          <span className={row.status === 'published' ? "text-green-600" : "text-red-600"}>
            {row.status === 'published' ? "Published" : "Draft"}
          </span>
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="blog-actions-cell">
          <button
            className="blog-action-btn blog-view-btn"
            onClick={() => handleViewBlog(row)}
            title="View"
          >
            <FaEye />
          </button>
          <button
            className="blog-action-btn blog-edit-btn"
            onClick={() => handleEditBlog(row)}
            title="Edit"
          >
            <FaPencilAlt />
          </button>
          <button
            className="blog-action-btn blog-delete-btn"
            onClick={() => handleDeleteBlog(row)}
            title="Delete"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "120px",
      center: true,
    },
  ];

  // Transform blogs data for display
  const transformedBlogs = Array.isArray(blogs) ? blogs.map(blog => ({
    id: blog._id,
    title: blog.title || 'Untitled Blog',
    content: blog.content || '',
    shortDescription: blog.shortDescription || '',
    tags: blog.tags || [],
    coverImage: blog.coverImage || null,
    status: blog.status || 'draft',
    createdAt: blog.createdAt || new Date().toISOString(),
    updatedAt: blog.updatedAt || new Date().toISOString(),
    createdBy: blog.createdBy || null,
    slug: blog.slug || '',
    isDeleted: blog.isDeleted || false,
    activeStatus: blog.activeStatus || 1
  })) : [];
  console.log(blogs);
  console.log("transform log",transformedBlogs);


  // Render loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render Educator View (Card Layout)
  if (userRole === 'educator') {
    return (
      <div className="blog-container">
        <div className="blog-header">
          <h1 className="blog-title"><FaFilePen className="blog-title-icon" /> Blogs</h1>
          <div className="blog-actions">
            <button className="btn btn-primary" onClick={handleCreateBlog}>
              <FaPlus /> New Blog
            </button>
          </div>
        </div>

        {transformedBlogs.length === 0 ? (
          <div className="no-blogs-message">
            <p>No blogs found. Create your first blog post!</p>
          </div>
        ) : (
          <div className="blog-cards-container">
            {transformedBlogs.map((blog) => (
              <div
                className="blog-card"
                key={blog.id}
                onClick={() => handleViewBlog(blog)}
              >
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="blog-card-image" />
                ) : (
                  <div className="blog-card-image" style={{ backgroundColor: 'var(--bg-gray)' }} />
                )}
                <div className="blog-card-content">
                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-excerpt">{blog.shortDescription}</p>
                  <div className="blog-card-footer">
                    <div className="blog-card-tags">
                      {blog.tags?.map(tag => (
                        <span key={tag} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="blog-card-meta">
                      <div className="blog-card-author">
                        <FaUserCircle className="blog-author-icon" />
                        <span>{blog.createdBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="blog-card-date">{formatDate(blog.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Admin and University View (Data Table)
  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1 className="blog-title"><FaFilePen className="blog-title-icon" /> Blogs</h1>
        <div className="blog-actions">
          <button className="btn btn-primary" onClick={handleCreateBlog}>
            <FaPlus /> New Blog
          </button>
        </div>
      </div>

      <div className="blog-table-container">
        <DataTableComponent
          columns={columns}
          data={transformedBlogs}
          pagination
          title=""
          searchPlaceholder="Search blogs..."
        />
      </div>
    </div>
  );
};

export default Blog;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getBlogByIdThunk,
  createBlogThunk,
  updateBlogThunk,
} from "../redux/blog/blogSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { FaArrowLeft } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import SummernoteEditor from "../components/Editor/SummernoteEditor";
import "../assets/styles/Blog.css";

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const BlogForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { currentBlog, loading } = useSelector((state) => state.blog);

  const userRole = user?.role || "educator";
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    content: "",
    tags: ["Uncategorized"],
    status: false,
    coverImage: null,
    slug: "",
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
        title: currentBlog.title || "",
        shortDescription: currentBlog.shortDescription || "",
        content: currentBlog.content || "",
        tags:
          currentBlog.tags?.length > 0 ? currentBlog.tags : ["Uncategorized"],
        status: currentBlog.status === "published",
        coverImage: null,
        slug: currentBlog.slug || "",
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
    console.log("handleChange called with:", {
      name,
      value,
      type,
      checked,
      files,
    });

    if (type === "file") {
      if (files[0]) {
        const fileType = files[0].type;
        if (!fileType.startsWith("image/")) {
          alert("Please select an image file (JPEG, PNG, etc.)");
          return;
        }
        if (files[0].size > 5 * 1024 * 1024) {
          alert("Image size should be less than 5MB");
          return;
        }

        console.log("Setting coverImage:", files[0]);
        setFormData((prev) => ({
          ...prev,
          coverImage: files[0],
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else {
        setImagePreview(null);
        setFormData((prev) => ({
          ...prev,
          coverImage: null,
        }));
      }
    } else if (type === "checkbox") {
      console.log("Setting checkbox:", name, checked);
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      console.log("Setting field:", name, value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleContentChange = (content) => {
    console.log("Content changed:", content);
    setFormData((prev) => ({
      ...prev,
      content: content,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Debug current form data
    console.log("Current form data:", formData);

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }
    if (!formData.shortDescription.trim()) {
      alert("Short description is required");
      return;
    }
    if (!formData.content.trim()) {
      alert("Content is required");
      return;
    }

    const blogFormData = new FormData();

    // Debug each field before appending
    console.log("Appending title:", formData.title);
    blogFormData.append("title", formData.title);

    console.log("Appending shortDescription:", formData.shortDescription);
    blogFormData.append("shortDescription", formData.shortDescription);

    console.log("Appending content:", formData.content);
    blogFormData.append("content", formData.content);

    formData.tags.forEach((tag, index) => {
      console.log("Appending tag:", tag);
      blogFormData.append(`tags[${index}]`, tag);
    });

    blogFormData.append("status", formData.status ? "published" : "draft");

    if (formData.coverImage instanceof File) {
      console.log("Appending coverImage:", formData.coverImage);
      blogFormData.append("coverImage", formData.coverImage);
    }

    // Debug FormData content
    console.log("Final FormData contents:");
    for (let pair of blogFormData.entries()) {
      console.log(pair[0], ":", pair[1]);
    }

    if (isEditMode) {
      console.log("Updating blog with ID:", id);
      dispatch(
        updateBlogThunk({
          id,
          formData: blogFormData,
        })
      )
        .then(() => {
          navigate(`/dashboard/${getDashboardPath()}/blogs`);
        })
        .catch((error) => {
          console.error("Error updating blog:", error);
        });
    } else {
      console.log("Creating new blog");
      dispatch(createBlogThunk(blogFormData))
        .then(() => {
          navigate(`/dashboard/${getDashboardPath()}/blogs`);
        })
        .catch((error) => {
          console.error("Error creating blog:", error);
        });
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/${getDashboardPath()}/blogs`);
  };

  const getDashboardPath = () => {
    if (userRole === "admin") {
      return "admin";
    } else if (userRole === "university") {
      return "school";
    } else {
      return "tutor";
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-container">
      <div className="blog-form-header">
        <button className="blog-back-button" onClick={handleCancel}>
          <FaArrowLeft /> Back to Blogs
        </button>
        <h2 className="blog-form-page-title">
          <FaFilePen className="blog-title-icon" />{" "}
          {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>
      </div>

      <form className="blog-form blog-form-horizontal" onSubmit={handleSubmit}>
        <div className="blog-form-main-content">
          {/* Main Content Column */}
          <div className="blog-form-content-column">
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
                placeholder="Enter a compelling title"
                required
              />
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label" htmlFor="shortDescription">
                Short Description <span className="required">*</span>
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="blog-form-textarea"
                rows="3"
                required
                placeholder="A brief summary of your blog post"
              />
              <small className="blog-form-help">
                This will appear in blog listings and search results.
              </small>
            </div>

            <div className="blog-form-group">
              <label className="blog-form-label" htmlFor="content">
                Content <span className="required">*</span>
              </label>
              <SummernoteEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter your blog content here..."
              />
            </div>

            {isEditMode && formData.slug && (
              <div className="blog-form-group">
                <label className="blog-form-label">Slug</label>
                <div className="blog-slug-preview">{formData.slug}</div>
                <small className="blog-form-help">
                  This is the URL-friendly version of the title that will appear
                  in the address bar.
                </small>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="blog-form-sidebar-column">
            <div className="blog-form-sidebar">
              {/* Blog Preview Card */}
              <div className="blog-form-section">
                <h3 className="blog-form-section-title">Blog Preview</h3>
                <div className="blog-preview-card">
                  <div className="blog-preview-image">
                    {imagePreview ? (
                      <img
                        src={
                          isEditMode && !imagePreview.startsWith("data:")
                            ? `${VITE_IMAGE_URL}${imagePreview}`
                            : imagePreview
                        }
                        alt="Preview"
                      />
                    ) : (
                      <div className="blog-preview-placeholder">
                        <span>Featured Image</span>
                      </div>
                    )}
                  </div>
                  <div className="blog-preview-content">
                    <h4 className="blog-preview-title">
                      {formData.title || "Your Blog Title"}
                    </h4>
                    <p className="blog-preview-description">
                      {formData.shortDescription ||
                        "Your blog description will appear here..."}
                    </p>
                    <div className="blog-preview-meta">
                      <span
                        className={`blog-status-badge ${
                          formData.status ? "published" : "draft"
                        }`}
                      >
                        {formData.status ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="blog-form-section">
                <h3 className="blog-form-section-title">Featured Image</h3>
                <div className="blog-form-file-upload">
                  <div
                    className="blog-form-file-dropzone"
                    onClick={() =>
                      document.getElementById("coverImage").click()
                    }
                  >
                    <input
                      type="file"
                      id="coverImage"
                      name="coverImage"
                      onChange={handleChange}
                      className="blog-form-file-input"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                    />
                    <div className="blog-form-file-icon">
                      {imagePreview ? (
                        <img
                          src={
                            isEditMode && !imagePreview.startsWith("data:")
                              ? `${VITE_IMAGE_URL}${imagePreview}`
                              : imagePreview
                          }
                          alt="Preview"
                          className="blog-form-file-preview"
                        />
                      ) : (
                        <div className="blog-form-upload-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="48"
                            height="48"
                          >
                            <path d="M19.5 12c-2.483 0-4.5 2.015-4.5 4.5s2.017 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.017-4.5-4.5-4.5zm2.5 5h-2v2h-1v-2h-2v-1h2v-2h1v2h2v1zm-7.18 4h-14.82v-20h24v10.82c-.638-.478-1.38-.82-2.18-.82-2.76 0-5 2.24-5 5 0 1.95 1.12 3.638 2.75 4.46l-.4.54h-4.75zm-9.32-20h-3v20h3v-20zm19 0h-14v20h6.68c.547.614 1.23 1.124 2 1.5v1.5h-22v-24h22v1zm0 2v-1h-14v18h.765c-.116-.498-.18-1.015-.18-1.54 0-3.58 2.91-6.46 6.5-6.46.954 0 1.856.21 2.676.58l.149.039c1.228.385 2.297 1.129 3.089 2.117v-11.736z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="blog-form-file-text">
                      <span>Click to upload or drag and drop</span>
                      <small>JPEG, PNG, GIF, WebP (Max: 5MB)</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="blog-form-section">
                <h3 className="blog-form-section-title">Tags</h3>
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
                            setFormData({
                              ...formData,
                              tags: newTags.length
                                ? newTags
                                : ["Uncategorized"],
                            });
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
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const newTag = e.target.value.trim();
                          if (newTag && !formData.tags.includes(newTag)) {
                            setFormData({
                              ...formData,
                              tags: [
                                ...formData.tags.filter(
                                  (tag) => tag !== "Uncategorized"
                                ),
                                newTag,
                              ],
                            });
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                  <small className="blog-form-help">
                    Press Enter to add a tag. Tags help categorize your blog
                    post.
                  </small>
                </div>
              </div>

              {/* Status Section */}
              <div className="blog-form-section">
                <h3 className="blog-form-section-title">Publishing</h3>
                <div className="blog-form-status-toggle">
                  <label className="blog-form-label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status ? "published" : "draft"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        status: e.target.value === "published",
                      });
                    }}
                    className="blog-form-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <small className="blog-form-help">
                    Draft: Only you can see this post.
                    <br />
                    Published: This post is visible to everyone.
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="blog-form-sticky-actions">
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
                  {isEditMode ? "Update Blog" : "Create Blog"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;

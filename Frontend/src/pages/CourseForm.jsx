import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCourseThunk, updateCourseThunk, getCourseThunk, getCoursesThunk } from "../redux/admin/adminSlice";
import { getEducatorsThunk } from "../redux/university/universitySlice";
import "../assets/styles/CourseForm.css";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";

const CourseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;

  // Get data from Redux store
  const { currentCourse, loading } = useSelector((state) => state.admin);
  const { educators } = useSelector((state) => state.university);
  const { user } = useSelector((state) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    language: "",
    description: "",
    professor: "",
    totalHours: "",
    attachments: []
  });

  // Fetch educators on component mount
  useEffect(() => {
    dispatch(getEducatorsThunk());
    if (isEditMode) {
      dispatch(getCourseThunk(id));
    }
  }, [dispatch, isEditMode, id]);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && currentCourse) {
      setFormData({
        title: currentCourse.title || "",
        category: currentCourse.category || "",
        language: currentCourse.language || "",
        description: currentCourse.description || "",
        professor: currentCourse.creator?._id || "",
        totalHours: currentCourse.duration || "",
        attachments: []
      });

      // If there are existing attachments, set them
      if (currentCourse.thumbnail) {
        setPreviewUrls([{ id: 'thumbnail', url: currentCourse.thumbnail, type: 'image' }]);
      }
    }
  }, [isEditMode, currentCourse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Add new files to attachments array
    setAttachments([...attachments, ...files]);

    // Create preview URLs for the files
    const newPreviewUrls = files.map(file => {
      const id = Math.random().toString(36).substring(2, 15);
      const isVideo = file.type.startsWith('video/');
      
      return {
        id,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image'
      };
    });

    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeAttachment = (id) => {
    setPreviewUrls(previewUrls.filter(item => item.id !== id));
    
    // If it's a new attachment, also remove from attachments array
    if (id !== 'thumbnail') {
      const index = attachments.findIndex((_, idx) => 
        previewUrls[previewUrls.findIndex(p => p.id === id)].url === URL.createObjectURL(attachments[idx])
      );
      
      if (index !== -1) {
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        setAttachments(newAttachments);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      // Prepare form data for API
      const courseData = new FormData();
      courseData.append("title", formData.title);
      courseData.append("category", formData.category);
      courseData.append("language", formData.language);
      courseData.append("description", formData.description);
      courseData.append("creator", formData.professor || user.id);
      courseData.append("duration", formData.totalHours);
      
      // Add attachments
      attachments.forEach(file => {
        courseData.append("attachments", file);
      });

      if (isEditMode) {
        // Update existing course
        await dispatch(updateCourseThunk({
          id,
          ...Object.fromEntries(courseData)
        })).unwrap();
      } else {
        // Create new course
        await dispatch(createCourseThunk(Object.fromEntries(courseData))).unwrap();
      }

      // Refresh courses list and navigate back
      dispatch(getCoursesThunk());
      navigate("/dashboard/admin/courses");
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormErrors(error.errors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="course-form-container">
      <div className="form-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <h1>{isEditMode ? "Edit Course" : "Add Course"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h2>Add Details About Course</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title of Course</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Educator Name"
                required
              />
              {formErrors.title && <div className="error-message">{formErrors.title}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Education">Education</option>
                <option value="Leadership">Leadership</option>
                <option value="Psychology">Psychology</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
              </select>
              {formErrors.category && <div className="error-message">{formErrors.category}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
              </select>
              {formErrors.language && <div className="error-message">{formErrors.language}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Information/Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write Information/Description of Case Study here..."
                rows={5}
                required
              />
              {formErrors.description && <div className="error-message">{formErrors.description}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="professor">Professor</label>
              <select
                id="professor"
                name="professor"
                value={formData.professor}
                onChange={handleInputChange}
              >
                <option value="">Select Professor</option>
                {educators && educators.map(educator => (
                  <option key={educator._id} value={educator._id}>
                    {educator.professor || educator.name}
                  </option>
                ))}
              </select>
              {formErrors.professor && <div className="error-message">{formErrors.professor}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="totalHours">Total Hours</label>
              <select
                id="totalHours"
                name="totalHours"
                value={formData.totalHours}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="3 weeks">3 weeks</option>
                <option value="4 weeks">4 weeks</option>
                <option value="5 weeks">5 weeks</option>
                <option value="6 weeks">6 weeks</option>
              </select>
              {formErrors.totalHours && <div className="error-message">{formErrors.totalHours}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Attachments (PDF/Doc/Video)</label>
              <div className="attachments-container">
                {previewUrls.map(preview => (
                  <div key={preview.id} className="attachment-preview">
                    {preview.type === 'video' ? (
                      <video src={preview.url} controls className="preview-media" />
                    ) : (
                      <img src={preview.url} alt="Preview" className="preview-media" />
                    )}
                    <button 
                      type="button" 
                      className="remove-attachment"
                      onClick={() => removeAttachment(preview.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                
                <div className="upload-box">
                  <input
                    type="file"
                    id="attachments"
                    name="attachments"
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="attachments" className="upload-label">
                    <FaPlus />
                    <span>Upload</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="loading-spinner-small"></span>
            ) : (
              isEditMode ? "Update" : "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;

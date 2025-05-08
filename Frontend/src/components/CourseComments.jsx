import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaComment, FaEdit, FaTrash, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../assets/styles/CourseComments.css';
import {
  getCourseCommentsThunk,
  addCourseCommentThunk,
  updateCourseCommentThunk,
  deleteCourseCommentThunk,
  addCommentReplyThunk,
  updateCommentReplyThunk,
  deleteCommentReplyThunk
} from '../redux/comment/commentSlice';
import { getUserNotificationsThunk } from '../redux/notification/notificationSlice';
import { toast } from 'react-toastify';

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const CourseComments = ({ courseId }) => {
  const dispatch = useDispatch();
  const { courseComments, loading } = useSelector((state) => state.comment);
  const { user } = useSelector((state) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  // Reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyingToReplyId, setReplyingToReplyId] = useState(null); // For replying to replies
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editingReplyCommentId, setEditingReplyCommentId] = useState(null);

  // State for expanded replies
  const [expandedReplies, setExpandedReplies] = useState({});
  const [expandedComments, setExpandedComments] = useState({}); // For accordion-style UI
  const INITIAL_REPLIES_TO_SHOW = 3;

  // Helper function to check if user can edit a comment
  const canEditComment = (comment) => {
    if (!user || !comment || !comment.user) return false;

    // Admin and staff can edit any comment
    if (user.role === 'admin' || user.role === 'staff') {
      return true;
    }

    // School (university) can edit comments made by educators under their institution
    if (user.role === 'university' && comment.user.role === 'educator' &&
      comment.user.university && String(comment.user.university) === String(user.id)) {
      return true;
    }

    // Users can edit their own comments
    // Convert both IDs to strings for comparison
    return String(user.id) === String(comment.user._id);
  };

  // Helper function to check if user can delete a comment
  const canDeleteComment = (comment) => {
    if (!user || !comment || !comment.user) return false;

    // Admin and staff can delete any comment
    if (user.role === 'admin' || user.role === 'staff') {
      return true;
    }

    // School (university) can delete comments made by educators under their institution
    if (user.role === 'university' && comment.user.role === 'educator' &&
      comment.user.university && String(comment.user.university) === String(user.id)) {
      return true;
    }

    // Users can only delete their own comments
    // Convert both IDs to strings for comparison
    return String(user.id) === String(comment.user._id);
  };

  useEffect(() => {
    if (courseId) {
      dispatch(getCourseCommentsThunk(courseId));
    }
  }, [dispatch, courseId]);

  // Fetch notifications when component mounts
  useEffect(() => {
    if (user) {
      dispatch(getUserNotificationsThunk());
    }
  }, [dispatch, user]);

  const handleSubmitComment = (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty', {
        position: "bottom-right"
      });
      return;
    }

    dispatch(addCourseCommentThunk({ courseId, text: commentText }))
      .unwrap()
      .then(() => {
        setCommentText('');
      });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleUpdateComment = (e) => {
    e.preventDefault();

    if (!editText.trim()) {
      toast.error('Comment cannot be empty', {
        position: "bottom-right"
      });
      return;
    }

    dispatch(updateCourseCommentThunk({
      courseId,
      commentId: editingCommentId,
      text: editText
    }))
      .unwrap()
      .then(() => {
        setEditingCommentId(null);
        setEditText('');
      });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteCourseCommentThunk({ courseId, commentId }));
    }
  };

  // Toggle comment accordion
  const toggleCommentAccordion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Reply handlers
  const handleReplyClick = (commentId, replyId = null) => {
    setReplyingToCommentId(commentId);
    setReplyingToReplyId(replyId);
    setReplyText('');
    // Close any open edit forms
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditingReplyCommentId(null);
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyingToReplyId(null);
    setReplyText('');
  };

  const handleSubmitReply = (e, commentId) => {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error('Reply cannot be empty', {
        position: "bottom-right"
      });
      return;
    }

    // If replying to a reply, include the parent reply ID
    const replyData = {
      courseId,
      commentId,
      text: replyText
    };

    if (replyingToReplyId) {
      replyData.parentReplyId = replyingToReplyId;
    }

    dispatch(addCommentReplyThunk(replyData))
      .unwrap()
      .then(() => {
        setReplyingToCommentId(null);
        setReplyingToReplyId(null);
        setReplyText('');

        // Refresh notifications to show new reply notification
        if (user) {
          dispatch(getUserNotificationsThunk());
        }
      });
  };

  const handleEditReply = (commentId, reply) => {
    setEditingReplyId(reply._id);
    setEditingReplyCommentId(commentId);
    setEditReplyText(reply.text);
    // Close any other open forms
    setEditingCommentId(null);
    setReplyingToCommentId(null);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyCommentId(null);
    setEditReplyText('');
  };

  const handleUpdateReply = (e, commentId, replyId) => {
    e.preventDefault();

    if (!editReplyText.trim()) {
      toast.error('Reply cannot be empty', {
        position: "bottom-right"
      });
      return;
    }

    dispatch(updateCommentReplyThunk({
      courseId,
      commentId,
      replyId,
      text: editReplyText
    }))
      .unwrap()
      .then(() => {
        setEditingReplyId(null);
        setEditingReplyCommentId(null);
        setEditReplyText('');
      });
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      dispatch(deleteCommentReplyThunk({ courseId, commentId, replyId }));
    }
  };

  // Toggle expanded replies for a comment
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Get replies to display based on expanded state
  const getVisibleReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return [];

    // If expanded or fewer than initial count, show all replies
    if (expandedReplies[comment._id] || comment.replies.length <= INITIAL_REPLIES_TO_SHOW) {
      return comment.replies;
    }

    // Otherwise show only initial count
    return comment.replies.slice(0, INITIAL_REPLIES_TO_SHOW);
  };

  // Organize replies into a threaded structure
  const getThreadedReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return [];

    // Create a map of replies by ID for quick lookup
    const replyMap = {};
    comment.replies.forEach(reply => {
      replyMap[reply._id] = {
        ...reply,
        childReplies: []
      };
    });

    // Organize into parent-child relationships
    const topLevelReplies = [];
    comment.replies.forEach(reply => {
      if (reply.parentId) {
        // This is a reply to another reply
        if (replyMap[reply.parentId]) {
          replyMap[reply.parentId].childReplies.push(replyMap[reply._id]);
        } else {
          // If parent doesn't exist (shouldn't happen), treat as top-level
          topLevelReplies.push(replyMap[reply._id]);
        }
      } else {
        // This is a top-level reply
        topLevelReplies.push(replyMap[reply._id]);
      }
    });

    // If expanded or fewer than initial count, show all top-level replies
    if (expandedReplies[comment._id] || topLevelReplies.length <= INITIAL_REPLIES_TO_SHOW) {
      return topLevelReplies;
    }

    // Otherwise show only initial count of top-level replies
    return topLevelReplies.slice(0, INITIAL_REPLIES_TO_SHOW);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Format: Month Day, Year Hour:Minute AM/PM
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };

      return date.toLocaleString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="course-comments-section">
      <h3>
        <FaComment className="comment-icon" />
        Course Reviews & Comments
      </h3>

      {/* Comment Form */}
      <form className="comment-form" onSubmit={handleSubmitComment}>
        <textarea
          placeholder="Share your thoughts about this course..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        />
        <div className="comment-form-actions">
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={!commentText.trim() || loading}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading && !courseComments.length ? (
        <div className="comments-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : courseComments.length > 0 ? (
        <div className="comments-list">
          {courseComments.map((comment) => (
            <div key={comment._id} className="comment-item">
              {editingCommentId === comment._id ? (
                <form onSubmit={handleUpdateComment}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    required
                    className="comment-edit-textarea"
                  />
                  <div className="comment-form-actions">
                    <button type="button" className="comment-cancel-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                    <button type="submit" className="comment-submit-btn" disabled={!editText.trim() || loading}>
                      {loading ? 'Updating...' : 'Update Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="comment-header">
                    <div className="comment-user">
                      <img
                        src={comment.user?.profile?.avatar
                          ? `${VITE_IMAGE_URL}${comment.user.profile.avatar}`
                          : 'https://via.placeholder.com/40?text=User'}
                        alt={comment.user?.name || 'User'}
                        className="comment-avatar"
                      />
                      <div className="comment-user-info">
                        <span className="comment-user-name">
                          {comment.user?.name || 'Anonymous'}
                          {comment.user?.role && (
                            <small style={{ marginLeft: '5px', color: 'var(--text-gray)' }}>
                              ({comment.user.role === 'admin' ? 'Admin' :
                                comment.user.role === 'staff' ? 'Staff' :
                                  comment.user.role === 'university' ? 'School' :
                                    'Educator'})
                            </small>
                          )}
                        </span>
                        <span className="comment-date">{formatDate(comment.date)}</span>
                      </div>
                    </div>

                    {/* Show edit/delete buttons based on role-based permissions */}
                    {user && canEditComment(comment) && (
                      <div className="comment-actions">
                        <button
                          type="button"
                          className="comment-edit-btn"
                          onClick={() => handleEditComment(comment)}
                        >
                          <FaEdit /> Edit
                        </button>
                        {canDeleteComment(comment) && (
                          <button
                            type="button"
                            className="comment-delete-btn"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="comment-content">{comment.text}</div>

                  {/* Reply button */}
                  {user && (
                    <button
                      type="button"
                      className="reply-toggle-btn"
                      onClick={() => handleReplyClick(comment._id)}
                    >
                      <FaReply /> Reply
                    </button>
                  )}

                  {/* Reply form */}
                  {replyingToCommentId === comment._id && (
                    <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, comment._id)}>
                      <textarea
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                        className="comment-edit-textarea"
                      />
                      <div className="comment-form-actions">
                        <button type="button" className="comment-cancel-btn" onClick={handleCancelReply}>
                          Cancel
                        </button>
                        <button type="submit" className="comment-submit-btn" disabled={!replyText.trim() || loading}>
                          {loading ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies list with accordion */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className={`comment-replies-container ${expandedComments[comment._id] ? 'expanded' : ''}`}>
                      {/* Accordion header for replies */}
                      <button
                        type="button"
                        className="comment-replies-accordion-header"
                        onClick={() => toggleCommentAccordion(comment._id)}
                      >
                        <span>
                          {expandedComments[comment._id] ? (
                            <FaChevronUp className="accordion-icon" />
                          ) : (
                            <FaChevronDown className="accordion-icon" />
                          )}
                          {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </button>

                      {/* Replies content - shown when expanded or by default */}
                      <div className={`comment-replies ${expandedComments[comment._id] !== false ? 'show' : 'hide'}`}>
                        {getThreadedReplies(comment).map((reply) => (
                          <div key={reply._id} className="reply-item">
                            {editingReplyId === reply._id && editingReplyCommentId === comment._id ? (
                              <form onSubmit={(e) => handleUpdateReply(e, comment._id, reply._id)}>
                                <textarea
                                  value={editReplyText}
                                  onChange={(e) => setEditReplyText(e.target.value)}
                                  required
                                  className="comment-edit-textarea"
                                />
                                <div className="comment-form-actions">
                                  <button type="button" className="comment-cancel-btn" onClick={handleCancelEditReply}>
                                    Cancel
                                  </button>
                                  <button type="submit" className="comment-submit-btn" disabled={!editReplyText.trim() || loading}>
                                    {loading ? 'Updating...' : 'Update Reply'}
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="comment-header">
                                  <div className="comment-user">
                                    <img
                                      src={reply.user?.profile?.avatar
                                        ? `${VITE_IMAGE_URL}${reply.user.profile.avatar}`
                                        : 'https://via.placeholder.com/40?text=User'}
                                      alt={reply.user?.name || 'User'}
                                      className="comment-avatar"
                                    />
                                    <div className="comment-user-info">
                                      <span className="comment-user-name">
                                        {reply.user?.name || 'Anonymous'}
                                        {reply.user?.role && (
                                          <small style={{ marginLeft: '5px', color: 'var(--text-gray)' }}>
                                            ({reply.user.role === 'admin' ? 'Admin' :
                                              reply.user.role === 'staff' ? 'Staff' :
                                                reply.user.role === 'university' ? 'School' :
                                                  'Educator'})
                                          </small>
                                        )}
                                      </span>
                                      <span className="comment-date">{formatDate(reply.date)}</span>
                                    </div>
                                  </div>

                                  {/* Show edit/delete buttons based on role-based permissions */}
                                  {user && canEditComment(reply) && (
                                    <div className="comment-actions">
                                      <button
                                        type="button"
                                        className="comment-edit-btn"
                                        onClick={() => handleEditReply(comment._id, reply)}
                                      >
                                        <FaEdit /> Edit
                                      </button>
                                      {canDeleteComment(reply) && (
                                        <button
                                          type="button"
                                          className="comment-delete-btn"
                                          onClick={() => handleDeleteReply(comment._id, reply._id)}
                                        >
                                          <FaTrash /> Delete
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="comment-content">{reply.text}</div>

                                {/* Reply to reply button */}
                                {user && (
                                  <button
                                    type="button"
                                    className="reply-toggle-btn"
                                    onClick={() => handleReplyClick(comment._id, reply._id)}
                                  >
                                    <FaReply /> Reply
                                  </button>
                                )}

                                {/* Reply form for replying to this reply */}
                                {replyingToCommentId === comment._id && replyingToReplyId === reply._id && (
                                  <form className="reply-form nested-reply-form" onSubmit={(e) => handleSubmitReply(e, comment._id)}>
                                    <textarea
                                      placeholder={`Reply to ${reply.user?.name || 'Anonymous'}...`}
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      required
                                      className="comment-edit-textarea"
                                    />
                                    <div className="comment-form-actions">
                                      <button type="button" className="comment-cancel-btn" onClick={handleCancelReply}>
                                        Cancel
                                      </button>
                                      <button type="submit" className="comment-submit-btn" disabled={!replyText.trim() || loading}>
                                        {loading ? 'Posting...' : 'Post Reply'}
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {/* Nested replies (replies to this reply) */}
                                {reply.childReplies && reply.childReplies.length > 0 && (
                                  <div className="nested-replies">
                                    {reply.childReplies.map(childReply => (
                                      <div key={childReply._id} className="nested-reply-item">
                                        {editingReplyId === childReply._id && editingReplyCommentId === comment._id ? (
                                          <form onSubmit={(e) => handleUpdateReply(e, comment._id, childReply._id)}>
                                            <textarea
                                              value={editReplyText}
                                              onChange={(e) => setEditReplyText(e.target.value)}
                                              required
                                              className="comment-edit-textarea"
                                            />
                                            <div className="comment-form-actions">
                                              <button type="button" className="comment-cancel-btn" onClick={handleCancelEditReply}>
                                                Cancel
                                              </button>
                                              <button type="submit" className="comment-submit-btn" disabled={!editReplyText.trim() || loading}>
                                                {loading ? 'Updating...' : 'Update Reply'}
                                              </button>
                                            </div>
                                          </form>
                                        ) : (
                                          <>
                                            <div className="comment-header">
                                              <div className="comment-user">
                                                <img
                                                  src={childReply.user?.profile?.avatar
                                                    ? `${VITE_IMAGE_URL}${childReply.user.profile.avatar}`
                                                    : 'https://via.placeholder.com/40?text=User'}
                                                  alt={childReply.user?.name || 'User'}
                                                  className="comment-avatar"
                                                />
                                                <div className="comment-user-info">
                                                  <span className="comment-user-name">
                                                    {childReply.user?.name || 'Anonymous'}
                                                    {childReply.user?.role && (
                                                      <small style={{ marginLeft: '5px', color: 'var(--text-gray)' }}>
                                                        ({childReply.user.role === 'admin' ? 'Admin' :
                                                          childReply.user.role === 'staff' ? 'Staff' :
                                                            childReply.user.role === 'university' ? 'School' :
                                                              'Educator'})
                                                      </small>
                                                    )}
                                                  </span>
                                                  <span className="comment-date">{formatDate(childReply.date)}</span>
                                                </div>
                                              </div>

                                              {/* Show edit/delete buttons based on role-based permissions */}
                                              {user && canEditComment(childReply) && (
                                                <div className="comment-actions">
                                                  <button
                                                    type="button"
                                                    className="comment-edit-btn"
                                                    onClick={() => handleEditReply(comment._id, childReply)}
                                                  >
                                                    <FaEdit /> Edit
                                                  </button>
                                                  {canDeleteComment(childReply) && (
                                                    <button
                                                      type="button"
                                                      className="comment-delete-btn"
                                                      onClick={() => handleDeleteReply(comment._id, childReply._id)}
                                                    >
                                                      <FaTrash /> Delete
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className="comment-content">{childReply.text}</div>

                                            {/* Reply to nested reply button */}
                                            {user && (
                                              <button
                                                type="button"
                                                className="reply-toggle-btn"
                                                onClick={() => handleReplyClick(comment._id, childReply._id)}
                                              >
                                                <FaReply /> Reply
                                              </button>
                                            )}

                                            {/* Reply form for replying to this nested reply */}
                                            {replyingToCommentId === comment._id && replyingToReplyId === childReply._id && (
                                              <form className="reply-form nested-reply-form" onSubmit={(e) => handleSubmitReply(e, comment._id)}>
                                                <textarea
                                                  placeholder={`Reply to ${childReply.user?.name || 'Anonymous'}...`}
                                                  value={replyText}
                                                  onChange={(e) => setReplyText(e.target.value)}
                                                  required
                                                  className="comment-edit-textarea"
                                                />
                                                <div className="comment-form-actions">
                                                  <button type="button" className="comment-cancel-btn" onClick={handleCancelReply}>
                                                    Cancel
                                                  </button>
                                                  <button type="submit" className="comment-submit-btn" disabled={!replyText.trim() || loading}>
                                                    {loading ? 'Posting...' : 'Post Reply'}
                                                  </button>
                                                </div>
                                              </form>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Show "See More" button if there are more than the initial number of replies */}
                      {getThreadedReplies(comment).length < comment.replies.length && (
                        <button
                          type="button"
                          className="replies-toggle-btn"
                          onClick={() => toggleReplies(comment._id)}
                        >
                          {expandedReplies[comment._id] ? (
                            <>
                              <FaChevronUp /> Show Less Replies
                            </>
                          ) : (
                            <>
                              <FaChevronDown /> See {comment.replies.length - getThreadedReplies(comment).length} More {comment.replies.length - getThreadedReplies(comment).length === 1 ? 'Reply' : 'Replies'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-comments">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CourseComments;
